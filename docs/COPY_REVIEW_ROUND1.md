# PR copy review, round 1 — what was applied and what is still open

_2026-09-10. Source: `Saltenna-Website-Copy-REVIEW - Copy.docx` (48 tracked
insertions, 138 deletions). Applied in commit `8cffd2e`._

## Applied — 100 edits across 8 files

| Change | Count |
| --- | --- |
| `Plasmonic` / `Plasmonics` → **`Plasmonix™`** | 23 |
| Trailing full stop removed from headings and claims | ~69 |
| `U.S. Department of Defense` → `U.S. Department of War` | 3 |
| Substantive rewrites | 8 |

Notable individual rewrites:

- Hero h1: *"Communications beyond the limits of legacy radio frequency"* →
  *"…the limits of today's radio technology"*. The h1 is three `.line` spans that
  the load animation decodes one at a time, so the new wording was re-split
  across them rather than dropped into one.
- `Dense Vegetation` → `Jungle` **on the card heading only**. The same string
  appears twice more in the scrolling env-strip, which is held (see below).
- Homepage demonstration claim: *"solid underground facilities, tunnels, and
  through multiple levels of parking garages"* → *"underground facilities,
  tunnels, and through mines"*.
- Communications hero: *"underwater, under ice, through metal and dense
  infrastructure"* → *"underwater, under ice, through dense infrastructure"* —
  **this drops the metal claim** from that sentence.
- `index.p.5`: *"dense jungle canopy"* → *"dense forests"*.

**One typo of PR's was corrected**: `"penetrate ametal wall"` → `"a metal wall"`.
Confirmed present in both their .docx and their .pdf, so it originated with
them, not with the parsing.

## Held back — five items needing a decision

### 1. Stingray's claim contradicts the product ⚠️

PR wrote:

> Contactless data through **breaks in** sealed metal walls, flanges, and pressure barriers

The paragraph directly beneath it says Stingray *"replac[es] wired penetrators
and bulkhead connectors with a fully contactless wireless feedthrough … no
drilling, no leak path"*. "Through breaks in" says the product needs a gap to
work, which is the opposite of its entire premise. **Not applied** — this reads
as a misunderstanding rather than an edit. The original stands until someone
rules on it.

### 2. `products.p.3` was deleted outright

> Each product carries its maturity plainly — from prototype to fielded — so you know exactly what you are evaluating.

PR removed the whole sentence. Deleting copy means removing the `<p>` element
from `products.astro`, not writing an empty string, so it was left in place.
Confirm the intent and it is a one-line change.

### 3–5. Three blocks where PR wrote a question into the copy

These could not be applied verbatim — the text now contains instructions to the
reader. **Two of them are real bugs PR found, and worth fixing:**

| Block | What PR wrote | Verdict |
| --- | --- | --- |
| `index.div.1` | "Redefiningthelimits ofwireless – **glitch with spacing** redefining the limits of wireless" | **Real bug.** The hero sign strip renders with no spaces between words. PR is reporting a rendering fault, not rewriting copy. Needs investigating in the scramble/decode animation. |
| `products.div.1` | "Hardware Maritime Communications **[these buttons are not clickable – please make clickable or remove]**" | **Real issue.** Those `.pp-pill` elements look like buttons but are decorative (`aria-hidden`). Either link them or restyle them so they don't read as controls. |
| `index.div.3` | Added "Structures" to the environment list, plus "**[can these be clickable?]**" | The word addition is applicable; the question needs an answer first. The string also appears twice (the strip is duplicated for the scroll loop), so both copies must change together. |

### Also held: `index.div.2`

PR reduced `Est. 2017 → Beyond` to `Est. 2017`. That removes the `.est-future`
span, which **`main.js` queries and animates** (the year counter decodes into
"→ BEYOND" on load). It is a code and animation change, not a copy edit, so it
needs to be done deliberately.

## Two things worth a second look, applied as instructed

1. **`Plasmonix™` as a trademark claim.** Now on 23 strings site-wide. `™`
   asserts an unregistered mark, which is legal without registration — but if
   the mark is registered, `®` is the correct symbol, and if it is not Saltenna's
   mark at all this should not ship. Presumably PR knows; flagging because it is
   now the product name everywhere.
2. **"Department of War" on historical statements.** Applied to all three
   occurrences, including *"has performed on multiple contracts and demonstrated
   its technology for the U.S. Department of War"* — work that was contracted
   under the Department of Defense name. Naming past work by the department's
   current name is a defensible editorial choice, but it is a choice.
3. **"through mines"** replaces "parking garages" as a demonstration claim. If
   Saltenna has not demonstrated in a mine, this is a factual overstatement —
   the sentence says "has demonstrated".

## Doing the next round

```bash
# regenerate the review document from current copy
python3 share/extract-copy.py share/copy-map.json
# then rebuild the .docx (needs the npm `docx` package)
```

`share/copy-map.json` was regenerated after applying, so the next diff starts
from what is now live. `share/apply-pr-edits.py` holds the applier;
`share/apply-copy-edits.py` is the general-purpose one for a clean .docx return.

Backups of every file touched: `share/copy-backups/20260910-130553/`.
