# Handing the site copy to PR

_Prepared 2026-08-25._

## The three files

| File | Who touches it |
|---|---|
| `Saltenna-Website-Copy-REVIEW.docx` | **Send this to PR.** Every word on the site, 281 items, ~3,050 words. |
| `copy-map.json` | Machine map: id → exact source string + file. Don't edit by hand. |
| `apply-copy-edits.py` | Puts PR's edits back into the site source. |

## The loop

1. **Send** `Saltenna-Website-Copy-REVIEW.docx`. Ask them to use
   **Review → Track Changes** and to leave the small grey `[id]` codes alone.
2. **Get it back** — save it next to the original, e.g.
   `Saltenna-Website-Copy-REVIEW-edited.docx`.
3. **Preview** what would change (writes nothing):
   ```bash
   python3 share/apply-copy-edits.py share/Saltenna-Website-Copy-REVIEW-edited.docx --dry-run
   ```
4. **Apply**, then rebuild:
   ```bash
   python3 share/apply-copy-edits.py share/Saltenna-Website-Copy-REVIEW-edited.docx
   cd webflow-app && npx astro build
   ```
5. **Refresh the map** so the next round starts from current copy:
   ```bash
   python3 share/extract-copy.py share/copy-map.json
   ```

Tracked changes are accepted automatically on read, so you do not need to accept
them in Word first. Every file is backed up to `share/copy-backups/<timestamp>/`
before anything is written. Copy-only edits need **no version bump** — CSS/JS
versions are unrelated.

**Verified end to end**: two edits were made in a returned document, applied, and
confirmed in `products.ts` and `about.astro`, then rolled back from the automatic
backup and the site rebuilt clean.

## What the script refuses to do

It only replaces a string that occurs **exactly once** in its source file.
Anything else is reported and skipped rather than guessed:

- a string appearing more than once in one file → replace by hand
- a string that no longer matches (source edited since the extract) → re-run
  `extract-copy.py` and re-send
- an emptied block → delete it in the code instead

## Repeated copy

62 of the 281 items appear in more than one place — the closing call-to-action
("Saltenna is evolving fast." and its paragraph) is on all seven pages, and the
footer is shared. Those are stored **once**, so one edit changes every page. They
are marked "repeated on other pages" in the document; PR only edits the first
occurrence.

## Copy flagged in the document

The cover page tells PR, in plain language, that:

1. **All Ibex copy is invented** — name, claim, body and all four spec chips came
   from a 3D model's placeholder labels. AN/PRC-163 fit, SMA, 250 mm cannot be
   substantiated. This needs real product data, not a polish.
2. **D2D's "Prototype" status** is not on its spec sheet.
3. **Remora's "Customer engagement ready"** contradicts its own 3D model's note
   calling it a concept study with an unresolved coupling arrangement.
4. **"The Saltenna Waveform"** is a working title.
5. **plasmonic vs Sommerfeld surface wave** — the site says plasmonic throughout;
   the Remora model's physics note says the RF effect is "a bound guided mode, not
   an optical surface plasmon". Needs a physicist's ruling.

Items 1–4 are also `TODO(user)` comments in `products.ts`, and all of them are in
`docs/HANDOFF.md`.

## Regenerating the document

If the copy changes before PR replies, rebuild both:

```bash
python3 share/extract-copy.py share/copy-map.json
node <scratch>/build-copy-doc.js share/copy-map.json share/Saltenna-Website-Copy-REVIEW.docx
```
The doc builder needs the npm `docx` package (`npm install docx`). The extractor
covers `src/layouts/Base.astro`, `src/pages/*.astro` and `src/data/products.ts`;
coverage was checked by diffing against the built HTML — everything on the live
pages is in the extract except the composed arrow in "Maritime →", whose label
("Maritime") is captured on its own.

## If PR would rather not use Word

The script also accepts a plain `.txt` export of the same document, as long as the
`[id]` lines survive. Google Docs works: upload the .docx, edit with suggestions,
then File → Download → Plain text and pass that file instead.
