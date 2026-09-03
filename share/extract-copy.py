#!/usr/bin/env python3
"""Extract every piece of visible copy from the Saltenna site into a structured
JSON map. Each entry carries a stable id plus the exact source string, so PR
edits can be applied back by exact-match replacement.

Sources: src/layouts/Base.astro (nav + footer), src/pages/*.astro, src/data/products.ts

Method: build a light DOM tree, then capture every element that is a COPY LEAF —
it holds text and has no block-level element children. That catches headings,
paragraphs, links, spans, labels and buttons without double-capturing wrappers.
"""
import json, re, sys
from html.parser import HTMLParser
from pathlib import Path

SRC = Path("/Users/piercereisig/Saltenna/webflow-app/src")
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "copy-map.json")

VOID = {"br", "img", "input", "source", "meta", "link", "hr", "use", "path", "circle"}
DROP_TREES = {"style", "script", "svg", "canvas", "video", "iframe", "noscript"}
# inline formatting: part of a copy string, not a container boundary
INLINE = {"strong", "em", "b", "i", "span", "br", "sup", "sub", "small", "code", "u", "abbr"}

PAGE_ORDER = ["index", "products", "maritime", "communications", "sensing", "about", "contact"]
PAGE_TITLES = {"index": "Home", "products": "Products", "maritime": "Maritime",
               "communications": "Communications", "sensing": "Sensing",
               "about": "About", "contact": "Contact"}
# human labels for the css classes that carry meaning to an editor
ROLE_HINTS = {
    "hero-info-desc": "hero description", "hero-info-tag": "hero tagline",
    "product-claim": "product claim", "status-badge": "status badge",
    "spec-chips": "spec chip", "pp-eyebrow": "section kicker",
    "tool-status": "readout line", "uc-model-hint": "3D model caption",
    "role": "job title", "btn": "button", "hero-scroll": "scroll arrow",
    "section-head": "section intro", "cta-band": "call to action",
    "tool-name": "software tool name", "product-domain": "domain link",
    "footer": "footer", "nav": "navigation",
}


class Node:
    __slots__ = ("tag", "attrs", "kids", "parent")
    def __init__(self, tag, attrs=None, parent=None):
        self.tag, self.attrs, self.kids, self.parent = tag, attrs or {}, [], parent


class TreeParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = Node("#root")
        self.cur = self.root
        self.drop = 0

    def handle_starttag(self, tag, attrs):
        if tag in DROP_TREES:
            self.drop += 1
            return
        if self.drop or tag in VOID:
            return
        n = Node(tag, dict(attrs), self.cur)
        self.cur.kids.append(n)
        self.cur = n

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if tag in DROP_TREES:
            self.drop = max(0, self.drop - 1)
            return
        if self.drop or tag in VOID:
            return
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root and n.parent is not None:
            self.cur = n.parent

    def handle_data(self, d):
        if self.drop:
            return
        if d.strip():
            self.cur.kids.append(d)
        elif d:
            self.cur.kids.append(" ")   # keep the boundary between inline tags

    def handle_entityref(self, name):
        if not self.drop:
            self.cur.kids.append(f"&{name};")

    def handle_charref(self, name):
        if not self.drop:
            self.cur.kids.append(f"&#{name};")


def inner_text(n):
    if isinstance(n, str):
        return n
    return "".join(inner_text(k) for k in n.kids)


def is_copy_leaf(n):
    """holds text, and no child element is a block-level container"""
    if isinstance(n, str) or n.tag == "#root":
        return False
    if not inner_text(n).strip():
        return False
    for k in n.kids:
        if not isinstance(k, str) and k.tag not in INLINE:
            return False
    return True


def context(n):
    """nearest id, then meaningful class, walking up"""
    hints, sect = [], ""
    p = n
    while p is not None and p.tag != "#root":
        cls = (p.attrs.get("class") or "").split()
        for c in cls:
            if c in ROLE_HINTS and ROLE_HINTS[c] not in hints:
                hints.append(ROLE_HINTS[c])
        if not sect and p.attrs.get("id"):
            sect = p.attrs["id"]
        p = p.parent
    return sect, hints


def walk(n, out):
    if isinstance(n, str):
        return
    if is_copy_leaf(n):
        out.append(n)
        return
    for k in n.kids:
        walk(k, out)


def collect(path, page, source):
    s = path.read_text(encoding="utf-8")
    s = re.sub(r"(?s)^---.*?---\s*", "", s)
    s = re.sub(r"(?s)\{/\*.*?\*/\}", "", s)
    p = TreeParser()
    p.feed(s)
    leaves = []
    walk(p.root, leaves)
    entries, seen_ids = [], {}
    for n in leaves:
        txt = re.sub(r"\s+", " ", inner_text(n)).strip()
        if not txt or not re.search(r"[A-Za-z]{2}", txt):
            continue
        if txt.startswith("{") and txt.endswith("}"):      # pure astro expression
            continue
        sect, hints = context(n)
        base = f"{source}.{n.tag}"
        seen_ids[base] = seen_ids.get(base, 0) + 1
        loc = sect or "—"
        if hints:
            loc = f"{loc} · {', '.join(hints[:2])}"
        entries.append({
            "id": f"{base}.{seen_ids[base]}", "page": page, "source": str(path.name),
            "location": loc, "kind": n.tag, "text": txt,
        })
    return entries


def main():
    entries = []
    # shared chrome first — it appears on every page
    entries += collect(SRC / "layouts" / "Base.astro", "Every page (shared)", "base")

    for stem in PAGE_ORDER:
        path = SRC / "pages" / f"{stem}.astro"
        if not path.exists():
            continue
        body = path.read_text(encoding="utf-8")
        m = re.search(r'<Base\s+title="([^"]*)"\s+description="([^"]*)"', body)
        if m:
            for k, v in (("title", m.group(1)), ("description", m.group(2))):
                entries.append({"id": f"{stem}.meta.{k}", "page": PAGE_TITLES[stem],
                                "source": f"{stem}.astro", "location": f"SEO {k} (search results)",
                                "kind": "meta", "text": v})
        entries += collect(path, PAGE_TITLES[stem], stem)

    # products.ts
    pt = (SRC / "data" / "products.ts").read_text(encoding="utf-8")
    for block in re.finditer(r"\n  \{\s*\n(.*?)\n  \},", pt, re.S):
        body = block.group(1)
        pid = re.search(r'id:\s*"(prod-[a-z0-9]+)"', body)
        if not pid:
            continue
        pid = pid.group(1)
        label = pid.replace("prod-", "").upper()
        for field, human in (("name", "list name"), ("fullName", "heading"),
                             ("status", "status badge"), ("claim", "one-line claim"),
                             ("body", "body paragraph")):
            m = re.search(rf'^\s+{field}: "((?:[^"\\]|\\.)*)"', body, re.M)
            if m:
                entries.append({"id": f"{pid}.{field}", "page": "Products",
                                "source": "products.ts", "location": f"{label} — {human}",
                                "kind": "product-field", "text": m.group(1)})
        dm = re.search(r'domain:\s*\{\s*label: "([^"]+)"', body)
        if dm:
            entries.append({"id": f"{pid}.domain", "page": "Products",
                            "source": "products.ts", "location": f"{label} — domain link",
                            "kind": "product-field", "text": dm.group(1)})
        specs = re.search(r"specs:\s*\[(.*?)\]", body, re.S)
        if specs:
            for j, chip in enumerate(re.findall(r'"((?:[^"\\]|\\.)*)"', specs.group(1)), 1):
                entries.append({"id": f"{pid}.spec{j}", "page": "Products",
                                "source": "products.ts", "location": f"{label} — spec chip {j}",
                                "kind": "spec-chip", "text": chip})
        for m in re.finditer(r'hint: "((?:[^"\\]|\\.)*)"', body):
            entries.append({"id": f"{pid}.hint{m.start()}", "page": "Products",
                            "source": "products.ts", "location": f"{label} — 3D model caption",
                            "kind": "model-hint", "text": m.group(1)})
    tools = re.search(r"export const tools: Tool\[\] = \[(.*?)\n\];", pt, re.S)
    if tools:
        for field, human in (("name", "tool name"), ("claim", "one-line claim"), ("body", "body paragraph")):
            m = re.search(rf'^\s+{field}: "((?:[^"\\]|\\.)*)"', tools.group(1), re.M)
            if m:
                entries.append({"id": f"tool.{field}", "page": "Products",
                                "source": "products.ts", "location": f"Software tool — {human}",
                                "kind": "product-field", "text": m.group(1)})

    # decode entities + TS unicode escapes for the human-facing doc;
    # `text` stays the exact source string, for write-back
    import html as H
    def unesc(t):
        t = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), t)
        return re.sub(r"\s+", " ", H.unescape(t)).strip()
    for e in entries:
        e["display"] = unesc(e["text"])

    seen = {}
    for e in entries:
        seen.setdefault(e["display"], []).append(e["id"])
    for e in entries:
        ids = seen[e["display"]]
        e["shared"] = len(ids) > 1
        e["shared_with"] = [i for i in ids if i != e["id"]] if len(ids) > 1 else []

    OUT.write_text(json.dumps(entries, indent=2, ensure_ascii=False), encoding="utf-8")
    words = sum(len(e["display"].split()) for e in entries)
    print(f"{len(entries)} copy blocks, {words} words -> {OUT}\n")
    order = ["Every page (shared)", "Home", "Products", "Maritime", "Communications",
             "Sensing", "About", "Contact"]
    for p in order:
        n = [e for e in entries if e["page"] == p]
        if n:
            print(f"  {p:<22} {len(n):>3} blocks  {sum(len(e['display'].split()) for e in n):>4} words")
    dupes = {t: ids for t, ids in seen.items() if len(ids) > 1}
    print(f"\nstrings used in more than one place: {len(dupes)} (edit once, changes everywhere)")


main()
