#!/usr/bin/env python3
"""Apply the parsed PR copy edits to the site source.

Uses copy-map.json's `text` field (the EXACT source string) as the search key,
not the display string, so entity-escaped source matches correctly. Re-applies
the source's own escaping style to the replacement.

    python3 share/apply-pr-edits.py [--dry-run]
"""
import html as H
import json, re, shutil, sys
from datetime import datetime
from pathlib import Path

ROOT = Path("/Users/piercereisig/Saltenna")
SRC = ROOT / "webflow-app" / "src"
SP = Path("/private/tmp/claude-501/-Users-piercereisig-Saltenna/b1159ac6-3037-4601-82fb-dd16041bb44d/scratchpad")

FILES = {"Base.astro": SRC / "layouts" / "Base.astro",
         "products.ts": SRC / "data" / "products.ts"}
for stem in ("index", "products", "maritime", "communications", "sensing", "about", "contact"):
    FILES[f"{stem}.astro"] = SRC / "pages" / f"{stem}.astro"

# held back — need a human decision, see the session notes
HOLD = {
    "prod-stingray.claim",   # "through breaks in" contradicts the product
    "products.p.3",          # PR deleted the block outright
    "index.div.1",           # PR wrote "glitch with spacing" into the copy
    "index.div.3",           # PR wrote "[can these be clickable?]" into the copy
    "products.div.1",        # PR wrote "[these buttons are not clickable...]" into the copy
}

# resolved by hand: their id markers were merged into a neighbouring line
MANUAL = [
    ("index.h3.4", "Jungle"),
    ("index.p.5", "Where radios may fail, Saltenna is working on Plasmonix™ that can carry "
                  "communications within and through dense forests to support commercial, "
                  "military, law enforcement, and intelligence operations"),
    ("sensing.p.1", "Sensing where others can't"),
]

cmap = {e["id"]: e for e in json.loads((ROOT / "share" / "copy-map.json").read_text(encoding="utf-8"))}
parsed = json.loads((SP / "pr-edits.json").read_text(encoding="utf-8"))["changed"]

edits = {c["id"]: c["new"] for c in parsed if c["id"] not in HOLD}
for cid, new in MANUAL:
    if cid not in HOLD:
        edits[cid] = new


def reencode(new: str, old_raw: str) -> str:
    """match the escaping style the source used for this string"""
    s = new
    if "&amp;" in old_raw:
        s = s.replace("&", "&amp;")
    for ch, ent in (("·", "&middot;"), ("−", "&minus;"),
                    ("→", "&rarr;"), ("←", "&larr;"),
                    ("↑", "&uarr;"), ("↓", "&darr;")):
        if ent in old_raw:
            s = s.replace(ch, ent)
    if "\\u00b7" in old_raw:
        s = s.replace("·", "\\u00b7")
    return s


dry = "--dry-run" in sys.argv
plan, skipped = {}, []

for cid, new in sorted(edits.items()):
    e = cmap.get(cid)
    if e is None:
        skipped.append((cid, "not in copy-map"))
        continue
    f = FILES.get(e["source"])
    if f is None or not f.exists():
        skipped.append((cid, f"unknown source {e['source']}"))
        continue
    body = f.read_text(encoding="utf-8")
    old_raw = e["text"]
    n = body.count(old_raw)
    if n == 0:
        alt = H.unescape(old_raw)
        if body.count(alt) == 1:
            old_raw, n = alt, 1
    if n == 0:
        skipped.append((cid, "source string not found (already changed?)"))
        continue
    if n > 1:
        skipped.append((cid, f"appears {n}x in {e['source']} - do by hand"))
        continue
    plan.setdefault(f, []).append((cid, old_raw, reencode(new, old_raw)))

total = sum(len(v) for v in plan.values())
print(f"{total} edits ready across {len(plan)} files")
for f, items in sorted(plan.items(), key=lambda x: str(x[0])):
    print(f"  {f.name:<20} {len(items)}")
print(f"\nheld back (need a decision): {len(HOLD)}  -> {sorted(HOLD)}")
if skipped:
    print(f"\nskipped {len(skipped)}:")
    for cid, why in skipped:
        print(f"  [{cid}] {why}")

if dry:
    print("\n--dry-run: nothing written.")
    sys.exit()

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = ROOT / "share" / "copy-backups" / stamp
backup.mkdir(parents=True, exist_ok=True)
for f, items in plan.items():
    shutil.copy2(f, backup / f.name)
    body = f.read_text(encoding="utf-8")
    for cid, old_raw, new_raw in items:
        body = body.replace(old_raw, new_raw, 1)
    f.write_text(body, encoding="utf-8")
print(f"\napplied {total} edits. backups: share/copy-backups/{stamp}/")
