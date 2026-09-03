#!/usr/bin/env python3
"""Apply PR's edited copy document back onto the site source.

    python3 share/apply-copy-edits.py share/Saltenna-Website-Copy-REVIEW-edited.docx [--dry-run]

Reads the returned .docx (tracked changes are ACCEPTED automatically), pairs each
[id] with its text, diffs against share/copy-map.json, and rewrites the matching
string in src/pages/*.astro, src/layouts/Base.astro or src/data/products.ts.

Safety rules:
  - a string is only replaced if it occurs EXACTLY ONCE in its source file
  - shared strings (footer, closing CTA) are written once and reported
  - nothing is written in --dry-run
  - every file is backed up to share/copy-backups/<timestamp>/ before writing
"""
import html as H
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "webflow-app" / "src"
MAP = ROOT / "share" / "copy-map.json"

SOURCE_FILES = {
    "Base.astro": SRC / "layouts" / "Base.astro",
    "products.ts": SRC / "data" / "products.ts",
}
for stem in ("index", "products", "maritime", "communications", "sensing", "about", "contact"):
    SOURCE_FILES[f"{stem}.astro"] = SRC / "pages" / f"{stem}.astro"


def docx_to_text(path: Path) -> str:
    """plain text with tracked changes accepted and no line wrapping"""
    try:
        return subprocess.run(
            ["pandoc", "--track-changes=accept", "--wrap=none", "-t", "plain", str(path)],
            capture_output=True, text=True, check=True).stdout
    except FileNotFoundError:
        sys.exit("pandoc is required to read the .docx — install it, or export the doc to .txt and pass that instead")
    except subprocess.CalledProcessError as e:
        sys.exit(f"pandoc failed: {e.stderr[:400]}")


def parse_edits(text: str) -> dict:
    """{id: new_text} — an [id] line followed by its (possibly multi-line) block"""
    out, cur, buf = {}, None, []
    for line in text.splitlines():
        m = re.match(r"^\s*\[([A-Za-z0-9_.\-]+)\]", line)
        if m:
            if cur:
                out[cur] = " ".join(buf).strip()
            cur, buf = m.group(1), []
            continue
        if cur is not None:
            if line.strip():
                buf.append(line.strip())
            elif buf:
                out[cur] = " ".join(buf).strip()
                cur, buf = None, []
    if cur and buf:
        out[cur] = " ".join(buf).strip()
    return out


def reencode(new: str, old_raw: str) -> str:
    """put back the escaping style the source used for this string"""
    s = new
    if "&amp;" in old_raw or "&rarr;" in old_raw or "&middot;" in old_raw:
        s = s.replace("&", "&amp;")
    if "\\u00b7" in old_raw:
        s = s.replace("·", "\\u00b7")
    if "&middot;" in old_raw:
        s = s.replace("·", "&middot;")
    if "&minus;" in old_raw:
        s = s.replace("−", "&minus;")
    if "&rarr;" in old_raw:
        s = s.replace("→", "&rarr;")
    return s


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    if not args:
        sys.exit(__doc__)
    doc = Path(args[0])
    if not doc.exists():
        sys.exit(f"not found: {doc}")

    entries = {e["id"]: e for e in json.loads(MAP.read_text(encoding="utf-8"))}
    text = docx_to_text(doc) if doc.suffix.lower() == ".docx" else doc.read_text(encoding="utf-8")
    edits = parse_edits(text)

    changed, skipped, unmatched, done_strings = [], [], [], set()
    for cid, new in edits.items():
        e = entries.get(cid)
        if e is None:
            unmatched.append(cid)
            continue
        if new == e["display"]:
            continue
        if not new:
            skipped.append((cid, "empty after edit — delete it in the code instead"))
            continue
        changed.append((cid, e, new))

    if unmatched:
        print(f"! {len(unmatched)} ids in the document are not in copy-map.json "
              f"(regenerate the map, or the doc is from an older extract): {unmatched[:6]}")

    print(f"{len(changed)} edited string(s) detected\n")
    if not changed:
        print("nothing to apply.")
        return

    # group by file, verify uniqueness before touching anything
    plan = {}
    for cid, e, new in changed:
        f = SOURCE_FILES.get(e["source"])
        if f is None or not f.exists():
            skipped.append((cid, f"unknown source file {e['source']}"))
            continue
        body = f.read_text(encoding="utf-8")
        old_raw = e["text"]
        n = body.count(old_raw)
        if n == 0:
            # entity-decoded variant may be what is actually in the file
            alt = H.unescape(old_raw)
            if body.count(alt) == 1:
                old_raw, n = alt, 1
        if n == 0:
            skipped.append((cid, "original string no longer in the source — file changed since extract"))
            continue
        if n > 1:
            skipped.append((cid, f"appears {n}× in {e['source']} — replace by hand"))
            continue
        plan.setdefault(f, []).append((cid, old_raw, reencode(new, old_raw), e))

    for f, items in plan.items():
        print(f"  {f.relative_to(ROOT)}")
        for cid, old_raw, new_raw, e in items:
            tag = " (shared — changes every page)" if e.get("shared") else ""
            print(f"    [{cid}]{tag}")
            print(f"      - {e['display'][:100]}")
            print(f"      + {H.unescape(new_raw)[:100]}")

    if skipped:
        print(f"\n{len(skipped)} skipped:")
        for cid, why in skipped:
            print(f"    [{cid}] {why}")

    if dry:
        print("\n--dry-run: nothing written.")
        return

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = ROOT / "share" / "copy-backups" / stamp
    backup.mkdir(parents=True, exist_ok=True)
    for f, items in plan.items():
        shutil.copy2(f, backup / f.name)
        body = f.read_text(encoding="utf-8")
        for cid, old_raw, new_raw, e in items:
            body = body.replace(old_raw, new_raw, 1)
        f.write_text(body, encoding="utf-8")
    print(f"\nwritten. backups: share/copy-backups/{stamp}/")
    print("next: cd webflow-app && npx astro build   (bump nothing — copy only)")
    print("      then re-run share/extract-copy.py to refresh copy-map.json")


main()
