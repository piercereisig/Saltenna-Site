# Saltenna Website — Current Status & Remaining Work

_Last updated: 2026-08-24. Versions: CSS `?v=92`, main.js `?v=63`, MODEL_VERSION `5`._

For a session handoff start at `docs/HANDOFF.md`; for anything under `graphics/`
read `docs/MODEL_VIEWERS.md` first.

## Sep 10 — VIDEO IS LIVE ON CLOUDFLARE R2 (task 4 unblocked)

The user created the bucket and ran `scripts/upload-videos.sh`. **All 12
referenced videos are serving from R2**, verified individually:

    https://pub-555801c7c2ae4ca7a0c96f1fac3f953d.r2.dev/videos/<name>.mp4

12/12 return HTTP 206 with `Content-Type: video/mp4` and correct byte lengths —
so the bucket is public, the MIME type is right, and **Range requests work**
(required for seeking, and by Safari). Bucket root 404s: no directory listing,
which is fine. This is the `r2.dev` development subdomain — Cloudflare
rate-limits it and advises against production use; a custom domain
(`media.saltenna.com`) needs saltenna.com's DNS on Cloudflare, which it is not
(the domain points at Webflow), so that is a planned change, not a click.

**The originals were uploaded**, not either set of re-encodes — correct, since
R2 has no per-file cap and zero egress cost, so quality should be maximal there.

### public/videos removed — the bundle no longer carries video

`webflow-app/public/videos/` (77 MB, 12 heavily-compressed copies, added Sep 2
for the self-contained preview folder) was shipping *inside* the deployment,
which is what R2 exists to avoid. Moved to
`videos/bundled-copies-removed-2026-09-10/` (moved, not deleted).

**dist/client: 105 MB → 20 MB, zero .mp4 in the build.**

⚠️ **CONSEQUENCE — `PUBLIC_VIDEO_BASE` is now REQUIRED for video to appear.**
There is no bundled fallback any more. A build without it emits relative
`videos/...` srcs that resolve to nothing, and every hero silently degrades to
its poster still. It must be set in the Webflow Cloud environment:

    PUBLIC_VIDEO_BASE=https://pub-555801c7c2ae4ca7a0c96f1fac3f953d.r2.dev/videos

`astro dev` is unaffected — the dev-only Vite middleware still serves `../videos`.

### Three sets of encodes now exist — know which is which

| Location | hero-montage | maritime-hero | What it is |
| --- | --- | --- | --- |
| `videos/` | 32.5 MB | 33.9 MB | originals — **these are what R2 serves** |
| `videos/reencoded-2026-08-25/` | 21.4 MB | 20.8 MB | for the Netlify static draft (25 MiB cap) |
| `videos/bundled-copies-removed-2026-09-10/` | 17.7 MB | 14.2 MB | the ex-`public/videos` set |

### Video count, settled

**12 referenced, 19 on disk.** Confirmed by grepping every `.mp4` mention across
all of `src/` (not just the `VIDEO_BASE}/` pattern the upload script matches):
exactly 12, all on R2, none missing. The other 7 (54 MB) belong to removed
sections — `about-band-strait`, `band-diver-pair`, `band-jungle-fog`,
`bg-1490262444`, `bg-1729633035`, `saltenna-main`, and `products-hero.mp4`
(orphaned when the products hero became a `data-fx="terrain"` canvas). Not
uploaded, deliberately.

## Aug 24 — Stingray card photo → subsea bubble column

The Stingray spec card now shows the user's underwater bubble-curtain photograph
(`images/products/stingray-subsea.jpg`, 1600×900, 274 KB) instead of the grey
spec-sheet product shot. Set through the `image` field exactly like Remora, so
`poster` still points at `stingray-body.jpg` as a documented fallback (alt:
`stingray-endcap.jpg`) — reverting is deleting one line. Source
`~/Downloads/sarah-lee-QURU8IY-RaI-unsplash.jpg` (6720×4480, 3:2), cropped 3:2 →
16:9 **biased to the top** to keep the light source and the full bubble column;
the discarded band is the dark bottom 16%. JPEG q76 (274 KB vs 329 KB at q82,
no visible artifacts in the bubble detail; `ibex-peak.jpg` at 324 KB is the
existing precedent for this size). No CSS/JS change, so no version bump.

**Not a duplicate of the Remora photo**, though both are underwater: Remora's is
a close-up of large surface bubbles with a visible sun disc, this is a deep,
dark bubble curtain. Checked explicitly because they now sit on the same page.

## Aug 24 — Stingray 3D model added (MODEL_VERSION 5) — all four products have one

Installed the user's new Stingray viewer (`~/Downloads/Website Stingray Model 2/
export/stingray-viewer.html`) as `graphics/stingray.html` and wired it as
Stingray's `models` entry in `products.ts`. Same class and author lineage as
`ibex-radio.html` — a single self-contained HTML file with procedural geometry
(37 KB, no mesh file) — so it got the same direct adaptation, mirroring the
radio viewer's exact values:

- **importmap → vendored `js/vendor/three-0.160/`** (it shipped pulling three
  r160 + OrbitControls/RoomEnvironment/RoundedBoxGeometry from jsdelivr; all
  four were already vendored, nothing new added). Zero CDN refs remain; the
  WebGL-fallback line no longer claims to need internet.
- **Navy/teal recolor**: scene backdrop gradient → `#16233a/#101a2c/#0b1220`,
  tokens → site palette, hemisphere ground → `0x2a3a52`, hover emissive
  `0x2b8fd1` → `0x2ec4b6`, ground ring → teal @ 0.28, shadow opacity 0.18 →
  0.34 (reads on navy), shadow maps 2048² → 1024² (embed budget). **Model
  materials, labels and lights untouched** — the product itself stays as
  authored.
- **`html.embedded` HUD mode** (same `frameElement` idiom): title/hint hidden
  in the card, compact controls, controls dropped ≤340px, tooltip shrunk.
- **Portrait-card framing**: the module lies along X and the model card is
  portrait above 900px, so `frame()` dollies back by `0.92·h/w` (cap 1.8×) when
  embedded and the frame is portrait; landscape/standalone framing untouched.
  `resize()` re-frames until the first user interaction, covering lazy iframes
  that init before the card has its final size.

Kept as shipped: its own cross-document `IntersectionObserver` offscreen pause
(the only viewer with one built in), `ResizeObserver` container sizing, WebGL
context-loss fallback, reduced-motion auto-rotate disable, and
`data-scroll-guard="off"` (wheel zoom live, matching the radio). Hover spec
cards work per part (core / connector cap / sealed cap); per its README the
SPECS numbers come from the Stingray infographic (1 Mbps, 18″–21″ riser OD,
magnetic tool-less, 3000 m, L 310 × W 125 mm, ~15 kg) — consistent with the
site's chips, no Remora-style content conflicts spotted. `MODEL_VERSION` 4 → 5
(no CSS/JS change). Verified on an isolated check page (deleted, confirmed
absent from dist): renders + rotates in both 378×666 and 640×360 embedded
frames, teal hover highlight + dark tooltip, zero console errors. Build clean,
dist/client still 20 MB. Both graphics/ trees updated byte-identical.

## Aug 24 — Remora card photo → subsea shot

The Remora spec card now shows the user's underwater/bubbles photograph
(`images/products/remora-subsea.jpg`, 1600×900, 158 KB) instead of the pipeline
render. Set through the `image` field, so `poster` still points at
`remora-pipelines.jpg` as a documented fallback — reverting is deleting one line.
Cropped 4:3 → 16:9 biased toward the top to keep the sunlit surface and bubble
column. No CSS/JS change, so no version bump.

## Aug 17 — Remora hotspot dots hidden (main.js v63)

Remora was the only viewer painting persistent markers on the model — teal
CSS2D dots on the pod and pipe. The radio and diver reveal specs on hover with
nothing drawn, so the dots were removed for consistency: one rule,
`.hotspot { display: none !important }`, in the per-viewer runtime skin. **No
rebuild and no further source edit** — they are DOM overlays
(`CSS2DRenderer`/`CSS2DObject`), not geometry.

**This also removes their click-to-open annotation cards** (Limpet housing,
Bolted baseplate, Wet-mate connector, Access cover and ribs, Status indicator,
12-inch flanged spool, and the pipe entry) — that was the viewer's labelled
walk-through. Reverting is deleting the one rule.

Diagnostic note for future work: `document.querySelectorAll('.hotspot')` returns
**0 once the rule is live** — three's CSS2DRenderer does not insert elements
whose computed display is none, so absence from the DOM is the expected symptom
of the fix, not evidence it failed. Verified standalone (7 elements present, hit
test lands on `DIV.dot`) versus embedded (0, no dots painted).

## Aug 17 — Remora background matched to the other viewers (rebuilt from source)

Its background was neutral grey while the others are navy. Root cause was NOT
CSS: the viewer builds an **opaque shader backdrop dome** (SphereGeometry,
BackSide) whose `top`/`bottom` uniforms were `0x3a4149` / `0x15171b`, plus a
**lit reflective floor** (`MeshStandardMaterial 0x1b1d21`) that created a visible
horizon. Both sit in front of the `#stage` CSS gradient, so the navy override I'd
injected was never visible. Verified with `elementFromPoint` (canvas at every
sample) and by reading the GLB's node list — **no floor node in the model**, so
it's the viewer's JS.

Nothing is exposed on `window` to reach the scene (only
`window.__REMORA_MODEL_URL`), so there is no runtime fix. Changed the **source**
(`web/src/main.js`, the sanctioned place — the do-not-edit rule is about `dist/`)
and rebuilt with their own Vite:
- backdrop uniforms → `0x16233a` / `0x0b1220`, the same stops the radio and rover
  viewers use.
- floor `MeshStandardMaterial` → `ShadowMaterial({opacity: 0.38})`, i.e. shadow
  only, exactly what the other viewers do. Grounding still comes from the real
  shadow plus the author's painted contact patch, and the horizon is gone.
- **Lights deliberately untouched** — the v1→v2 notes record how hard the neutral
  grey pipe was to win (5400 K key tinted it tan), so I didn't retint anything
  that reaches the product.
Backup at `web/src/main.js.bak-preSaltennaNavy`; that tree is NOT a git repo.

**Two build traps worth recording:**
1. Its `node_modules` was installed on **Windows** — only `rollup-win32-*` and
   `@esbuild/win32-x64` binaries, so vite could not run on this arm64 Mac (also
   why the shipped zip has backslash paths). Fixed with a `--no-save` install of
   `@rollup/rollup-darwin-arm64` + `@esbuild/darwin-arm64`; their `package.json`
   is unchanged.
2. `npm run build` is **not** how the original dist was produced. Plain
   `vite build` emits absolute `/assets/...`, which 404s at
   `/graphics/remora/index.html` and hangs on "Loading model…" — I shipped that
   for one cycle before catching it. The original used relative paths, so the
   correct command is **`vite build --base=./`**.

Asset hash changed (`index-DZ0kCfsp.js`), stale one removed, `MODEL_VERSION`
bumped to 4 to bust cached viewer HTML.

## Aug 17 — Remora 3D model added (main.js v62)

Remora now has a model, so **all four products except Stingray have one.**
Installed `graphics/remora/` from the project's `web/dist` (index.html,
remora.glb 3.1 MB, hashed CSS + 581 KB JS with three bundled). Vite build output
— byte-identical, do NOT hand-edit. `out/remora_viewer_site.zip` is the same
four files; `out/remora_viewer.html` is the standalone. No external deps.

Two things made this different from the rover:
- **It ships as a whole PAGE**, not a viewer: a 3D stage plus a prose readout
  ("What it is", parts list, physics note, caveat). In a card only the stage
  belongs, so the runtime skin hides `.readout` and the page titling, keeps
  `#reset` styled like the radio's button, and stretches `#stage` to the frame.
  Its 3D hotspot markers are KEPT — those are on-demand, like the diver's hover
  specs, not clutter.
- **It was already dark** (`--bg:#0a0b0d`, accent `#29c3d6`), so no theme fight;
  its renderer is `alpha:true`, meaning the `#stage` CSS gradient IS the
  backdrop, now overridden to the site's navy.

**Skins are now per-viewer, keyed on iframe src** (`/rover/`, `/remora/`) rather
than one shared blob — both use a `#stage` id but need opposite rules, and our
own recolored viewers need none. Verified no leakage: only those two report a
`#saltenna-skin`.

**New: a resize nudge.** These viewers size their renderer from the stage and
re-measure on `resize`. Remora's stage is `62vh`, so after the skin stretched it
the canvas sat ~290 px short of the card (measured 475 in a 766 frame). main.js
now dispatches a synthetic `resize` into each model iframe after load, plus a
`ResizeObserver` on the frame — which also covers the card changing height when
switching products, since each product's copy is a different length. Canvas now
measures equal to the frame.

**⚠️ CONTENT FLAGS from the model's own hidden readout** — worth the user's
attention, since the skin hides them:
1. *"Concept study. Geometry and dimensions are plausible but not a validated
   design; no propagation figures are claimed, and the coupling arrangement in
   particular is unresolved."* The site lists Remora as "Customer engagement
   ready" (from its spec sheet).
2. Its physics note says a bare conductor guides a **Sommerfeld surface wave**,
   and that at RF this is *"a bound guided mode, not an optical surface plasmon"*
   — whereas the site describes the technology as plasmonic throughout.

Compression for deploy: remora.glb 3.1 MB → 1.55 MB gzip, its JS 581 → 149 KB.
dist/client is now 20 MB.

## Aug 17 — rover skinned to match the site (main.js v60)

The rover shipped a white studio look with heavy HUD. It's build output we must
not hand-edit, so main.js injects a stylesheet (`#saltenna-skin`) plus
`data-theme="dark"` into the iframe at runtime. The files stay byte-identical
and survive their author regenerating them (verified after every build).

- **Navy 3D backdrop.** Its scene background is a canvas gradient built from
  `--void-1` / `--void-2`, so it IS themeable via CSS — overridden to
  `#16233a → #0b1220`. **Timing is the catch:** it builds that texture ONCE at
  init and only rebuilds on a `prefers-color-scheme` change we can't fire, so
  the variables must land BEFORE its module runs. main.js rAF-polls for the
  iframe document and injects while it's still parsing; its 670 KB three.js
  fetch leaves a wide window. Verified visually: navy backdrop, teal accent.
- **Overlays removed** — `#title`, `#systems`, `#readout`, `#hint`, `#isohint`
  hidden. This deliberately drops its "click to isolate" systems feature, at the
  user's request ("get rid of them").
- **Controls formatted like the radio's**: compact, top-right, hairline, teal
  active state. Needed `#controls .btn { flex: 0 0 auto }` as well — the rover's
  own ≤900px rule stretches them full width via `#controls{left:12px}` +
  `.btn{flex:1}`, so overriding position alone left them spread across the frame.
- Tokens also mapped to the site palette (`--bg`, `--panel`, `--line*`, `--text`,
  `--muted`, `--accent`), which incidentally resolves the contrast debt its own
  style guide flags (`--muted` 3.22:1, `--accent` 3.53:1 on white).

**The durable fix is still a build from its author** with navy tokens and a
compact embed mode — the runtime skin is a wrapper, not a substitute, and the
rAF-poll timing is the one fragile part.

## Aug 17 — ROVER 1 added under Ibex; model card splits (CSS v92)

`products.ts` now takes `models: [{src, hint}]` per product instead of a single
`model`, and the model card renders one `.uc-model-frame` per entry. Above 900px
each frame is `flex: 1 1 0`, so N models split the card into N EQUAL slices with
a hairline between. **Ibex = radio on top, ROVER 1 underneath** (measured 383 /
384 px of a 766 px card). D2D still has one model and fills its card.

ROVER 1 installed as `graphics/rover/` — the 5-file folder from the export
(index.html entry, rover.boot.js, rover.app.js, three.global.js 670 KB,
rover.json 874 KB). `rover-standalone.html` deliberately NOT shipped (the note
says use one or the other) and DEPLOY.md not shipped. **All five verified
byte-identical to the export: they are build output and must not be hand-edited
— send changes to their author instead.**

Because they can't be edited, the two adaptations applied to our other viewers
were NOT possible. Instead:
- **Dark theme via its own documented hook.** It ships a white studio default but
  supports `:root[data-theme="dark"]`; main.js sets that attribute on every model
  iframe on load (same-origin, so it's runtime config, not a file edit). Verified
  both Ibex frames report `data-theme="dark"`.
- **No offscreen render pause** — can't add one without editing. Ibex active =
  2 live WebGL contexts.
- **Its palette is near-black + blue accent**, not our navy + teal. Closer than
  white, but not a match; a true match needs a build from its author.

**Known trade-off at half-card size:** the rover has its own
`@media (max-width: 900px)` rule that hides `#readout` (the LENGTH / WIDTH /
HEIGHT / TRIANGLES panel) and `#hint`. In a 452 px frame that breakpoint is
always active, so **the dimensions readout — arguably the viewer's payload — is
never visible on the products page.** Nothing overflows; it degrades by design.
To get the readout back the rover needs ≥901 px of frame width, i.e. its own
full-width band rather than half a card.

## Aug 17 — hairline card borders (CSS v90)

Products-page cards and media frames dropped from 1px to **0.5px** in one scoped
block: `#products .uc-detail`, `#products .uc-detail-media`, `.uc-model-card`,
`.uc-model-frame`, `#software .tool-card`. 0.5px is a true half-pixel at DPR 2
(where these are mostly seen); 1x displays round it up to a single device pixel
rather than dropping the edge, so it never vanishes. The gradient border-box
technique is unaffected — the gradient just paints in a thinner band.
**Left at 1px on purpose:** spec chips, status badges, pills, and all
non-products-page borders. Verified computed widths 0.5px on the five, 1px on
chips/badges.

## Aug 17 — model CARD matched to the spec card (CSS v89)

The user wanted the whole box equal, not just the media. `.uc-models` now
`align-self: stretch` (overriding the explorer's `align-items: start`), the card
is `height: 100%` as a flex column, and `.uc-model-frame` flexes with
`aspect-ratio: auto` above 900px. Measured at 1400px: both cards **452 × 768.6,
tops aligned** — the taller spec card sets the grid row and the model card fills
it.

Upside: the viewer becomes a **tall portrait window** (378 × 666, 0.57 aspect),
which suits a standing diver far better than a letterbox. Aspect-ratio still
governs the ≤900px stacked case. Both viewers already listen for resize, so the
per-product height differences (copy lengths vary) are handled.

Note for future measuring: `.uc-model-card.is-active` runs the `uc-fade`
keyframe, which starts at `translateY(8px)` — measuring mid-animation shows a
spurious 8px top offset. Call `document.getAnimations().forEach(a => a.finish())`
before asserting alignment.

## Aug 17 — model window sized to match the photo (CSS v88)

The two media boxes are now **pixel-identical**: measured 378 × 212.6 with tops
aligned at 1400px. Done as an invariant rather than tuned numbers —
**equal grid tracks** (`minmax(200px, 0.42fr) 1fr 1fr`, was `1fr 1.12fr`) plus
**equal card padding** (`.uc-model-card` 20px → 36px, matching `.uc-detail`),
so equal tracks necessarily yield equal inner widths at any viewport. Aspect
went back to 16/9 to match the photograph; the embedded camera dolly-back keeps
the diver inside the slightly shorter frame (verified). A CSS comment records
that padding and tracks must be changed together.

## Aug 17 — new diver model installed (CSS v87)

Replaced `graphics/d2d-diver.html` + `male_base.glb` with the user's new DIVER
build. Big visual upgrade: full drysuit, vest, tank, regulator + corrugated hose,
mask/helmet, flag patch — the old one was a bare mannequin. All four hoverable
Saltenna products verified attached in-scene (`product:antenna`, `:radio`,
`:cable`, `:earpiece`) with their SPECS entries.

Sizes: HTML 2.82 MB (gear all base64-inline) + GLB 2.65 MB ≈ 5.5 MB, up from
~3.5 MB. Lazy behind the card iframe. dist/client 13 MB.

**Its dist/ folder and README-DEPLOY.txt were NOT in the download** — the folder
is flat. Used the root copies, which the user's note says are identical. The
"two open items" were recovered from `HANDOFF-v4.md` instead (see below).

This build is better engineered than the last and already had things I'd have
added, so they were LEFT ALONE: a named `tick` loop, tab-visibility pause,
WebGL context-loss/restore recovery, and a mobile shadow budget
(`innerWidth < 768` → 1024² shadows + pixel-ratio cap) that fires automatically
inside our ~400px card. Applied on top:
- importmap → the already-vendored `three-0.160` (its 4 addons + GLTFLoader's
  BufferGeometryUtils dep were all present, so nothing new to vendor). **Server
  requirement 3 — CSP allowance for cdn.jsdelivr.net — is therefore moot.**
- navy/teal palette (it shipped `--bg:#ffffff`). Side benefit: HANDOFF-v4 flags
  `--muted` 3.22:1 and `--accent` 3.53:1 on white as 12 WCAG contrast fails;
  those two values are now the site's dark-background pair.
- **offscreen pause composed with** their visibility handler (added an
  `onScreen` flag both paths respect) — a visible tab can still have this iframe
  scrolled away or hidden behind an inactive product tab, which
  `visibilitychange` cannot see.
- `html.embedded` HUD mode: hides title/hint, hides the **ANCHORS** debug button,
  shrinks buttons/tooltip; 1.18× camera dolly-back so the card doesn't clip the
  figure.
- `.uc-model-frame` was briefly 16/10 per the model's deploy note, then set back
  to **16/9 in v88** so it matches the photo box beside it (see below).

**Fins ship detached.** 5 fin meshes load but both foot anchors have 0 children,
so the diver is barefoot. Verified this is the model's own behaviour by A/B
against the pristine unmodified copy — identical. Not caused by our adaptations.

**Server requirements status:** (2) MIME — the dev server already returns
`model/gltf-binary`; confirm on Webflow Cloud. (1) compression — .glb gzips
2.65 → 1.64 MB and the HTML 2.82 → 1.67 MB, so it's worth ensuring Cloudflare
compresses both; Workers asset serving does not always compress
`model/gltf-binary`. **Verify both after deploying.**

## Aug 17 — spec card + separate 3D model card (CSS v85 / JS v52)

Settled shape. The explorer is **three columns**: name list | **model card** |
**spec card** (flipped at the user's request in v86 — the 3D model reads first,
then the photo + copy).

- The **spec card is exactly as it was** — photo, status badge, domain link,
  title, claim, body, spec chips. Nothing moved into or out of it.
- The **3D model gets its own card** to its left (`.uc-models` >
  `.uc-model-card`), same border/radius/glow treatment, sized to its content so
  it doesn't stretch to the spec card's height.
- Grid: `minmax(200px, 0.42fr) 1fr 1.12fr`, 40px gaps — the fr values were
  swapped along with the cards so the text card keeps the wider share. The 200px floor keeps
  "Stingray" on one line at every width; the model column keeps its track even
  when a product has no model, so switching products never reflows the row.

main.js v52 restores the id-matched toggle (`data-model-for` vs the active
item's id) — needed again now that the model card is a sibling of the detail
pane rather than inside it.

**Remora and Stingray have no model yet**, so their model column sits empty —
the user wants models for both, and it's one `model` field each in products.ts.

## (superseded) Aug 17 — model + photo side by side inside the pane (CSS v84 / JS v51)

Final shape of the products explorer. Each product's detail pane opens with a
**two-window media row**: the interactive 3D model on the LEFT, the photograph
on the RIGHT, both 16:9, equal size, tops aligned. Copy follows underneath,
unchanged. The **name list column was narrowed** (`0.28fr 1fr`, 48px gap — was
`1.15fr 1fr`, 72px) to make room; it only ever holds one short word.

`.uc-media-row` uses `grid-auto-flow: column` + `grid-auto-columns: 1fr`, so a
product with no model yet gets a single full-width photo rather than a gap — no
conditional CSS class needed. At ≤900px it flips to rows (model above photo).

Because each model now lives INSIDE its own detail item, showing the item shows
the model — the JS id-matching added in v50 was removed again (main.js v51 is
back to the simple two-line `pick()`). Inactive items are `display:none`, so
lazy iframes still only load when their product is first selected.

Two fixes the real render exposed, both measured rather than eyeballed:
- The windows come out **398px wide** (capped by the 1240px container), which was
  under the 430px threshold that hid the viewers' controls — so Auto-Rotate /
  Reset View were invisible on *every* desktop. Threshold lowered to 340px
  (phone windows measure ~247px, so they stay hidden there).
- At 398px the diver's fins and ground ring were clipped. `frameModel()` now
  dollies back 1.22× when embedded, standalone framing untouched. Its controls
  moved back to top-right, which the dollied-back figure leaves clear.

## (superseded) Aug 17 — models as a separate left-column window (CSS v83 / JS v50)

The three standalone showcase sections were **reverted** at the user's request.
Instead: **Ibex is product 04 in the numbered list**, and every product's detail
pane now has TWO media slots shown at once —

- the **photograph** stays in the detail pane (`image` ?? `poster`), copy
  unchanged — `ProductMedia.astro` no longer renders models
- the **interactive 3D model** gets its own window in the LEFT column, under the
  numbered list, filling the space the short name list left empty
  (`.uc-left` > `.uc-model` > `.uc-model-frame` + mono `.uc-model-hint`)

Models wired: D2D → `graphics/d2d-diver.html` (the diver in the kit),
Ibex → `graphics/ibex-radio.html`. Remora and Stingray have none yet, and the
window simply doesn't render for them — **the user wants models added for those
two as well** when they exist; it's one `model` field each.

main.js (v50) switches the model window alongside the pane, matched by
`data-model-for` against the active item's id rather than by index (the pane and
model lists are different lengths). Inactive model iframes are `display:none`
AND lazy, so a scene never loads until its product is selected, and the
offscreen-pause observer keeps hidden ones from rendering.

**Ibex copy is invented, with the user's explicit go-ahead** ("i dont have much
info for it just come up with something for now"). Its photo is the supplied
Siguniang peak. Everything is TODO-marked in `products.ts`.

## (reverted) Aug 17 — three showcase sections on products (CSS v81)

`#d2d`, `#remora`, `#ibex` — each a product photo beside its interactive 3D
scene, both in cards, generated from one `showcase` array in the products.astro
frontmatter (alternating deep/dark backgrounds). Separate from the explorer
above, which keeps the copy; these are the visual walk-through, so they carry
title + media only and don't duplicate claims.

| Section | Photo | 3D scene |
| --- | --- | --- |
| D2D | dive-team shot | `graphics/d2d-diver.html` — diver wearing the kit (from the user's Website_Scuba_Model.zip), loads `male_base.glb` |
| Remora | pipeline render | `graphics/plasmonic-surface-wave-link.html` — **reused** physics scene (node-to-node along a conductor = Remora's principle). Swap for a Remora model when one exists |
| Ibex | Siguniang peak | `graphics/ibex-radio.html` — AN/PRC-163 + antenna |

`.ibex-split`/`#ibex` CSS was generalised to `.media-split`/`.showcase`.
**Page weight:** the D2D scene is the heavy one — 1.21 MB HTML (fins are
base64-inline) + 2.25 MB `male_base.glb`, ~4.2 MB with three.js, all lazy behind
the iframe. dist/client is now 12 MB; largest single asset 2.25 MB (25 MiB cap
fine). Vendored three-0.160 grew to 5 files/840 KB — GLTFLoader pulls in
BufferGeometryUtils, so both were added.

## Aug 17 — Ibex section on products (CSS v80)

New `#ibex` section between the products explorer and Software: header image and
the interactive 3D radio side by side, each in a `.tool-card` (reuses `.split`,
so ≤900px stacks). Left card: the user's Siguniang-peak photo cropped 16:9 →
`images/products/ibex-peak.jpg`. Right card: the user's `radio_viewer.html`
(AN/PRC-163 with a Saltenna antenna, drag-to-rotate, hover for specs,
drag-to-bend gooseneck) installed as `graphics/ibex-radio.html` and lazily
iframed — the same isolated pattern as the other four scenes. Hero tabs gained
"Ibex". **No copy yet** — the user supplied none; section is title + the two
cards.

Three things had to change in the viewer, all worth knowing:
1. **three.js is now vendored, not CDN.** It imported three 0.160 ESM +
   3 addons from jsdelivr via importmap; those are now self-hosted at
   `js/vendor/three-0.160/` (minified ESM build, 670 KB + 38 KB addons),
   matching the site's self-hosted-three precedent. Zero CDN refs remain.
   NOTE this is a SECOND three version alongside r128 (`js/vendor/three.min.js`)
   — r128 is a UMD global build and lacks the ESM addons, so it can't serve both.
2. **Recolored navy/teal.** It shipped white/light-grey with a #2b8fd1 accent;
   now uses the card navy (#0d1424 / #131c2e) and the site teal #2ec4b6, same
   treatment the other graphics got on Jul 23.
3. **Offscreen pause + lighter shadows.** It had 2048² shadow maps, a PMREM
   environment and permanent auto-rotate, and like the other scenes never
   paused — continuous GPU load on a long page. Shadow map → 1024²; the render
   loop now stops when the iframe is scrolled out (an IntersectionObserver
   built in the PARENT realm observing `window.frameElement`, so it tracks the
   parent viewport with no parent-side JS). Also `html.embedded` hides the
   full-window HUD title/hint (which collided at card size — the card's own
   status line carries that info) and drops the buttons below 430px.

## Jul 31 — products page visual polish (CSS v79, user's design prompt)

Applied the user's 5-point polish prompt to the products page, ALL SCOPED to
#products / #software so nothing leaks site-wide. Two deliberate page-local
exceptions to site rules, at the user's direction: `.pp-eyebrow` kickers
return (12px teal, 0.2em tracking — site-wide eyebrows stayed removed) and
border-radius 14px overrides --radius: 0 on this page's cards/media. Also:
white→teal `background-clip: text` gradient on the two section titles +
`.tool-name`; 55ch paragraph measure; 1px gradient-border (135deg teal 0.5 →
transparent 40%) + 0 0 60px teal-0.12 glow on `.uc-detail-media` and
`.tool-card`; faint radial teal glows (6%) via ::before on both sections;
`.pp-pill` badges under both intros (999px, factual copy only); mono
`.tool-status` line "RX LOCK · −142 dBm — LIVE" under the waveform. Item 5 of
the prompt (IO scroll fade + reduced motion) was already the site's `.reveal`
system — nothing added. Teal is the existing --teal-rgb throughout. Verified
desktop in real Chrome + 375px via DOM measurement (no overflow, split
stacks); sensing checked as control — zero leakage.

## Jul 31 — Software section on products: the waveform (CSS v76 / JS v48)

New `#software` section on products.astro for licensed software, first entry the
extreme-path-loss waveform (user's copy verbatim in `tools[]` in products.ts —
**name "The Saltenna Waveform" is a placeholder, unconfirmed**). The visual is
the approved `waveform-demo.html` animation, ported (NOT iframed) into the FX
engine as fxVariants.waveform per the user's port spec: 64 one-pixel lines,
integer width-harmonics so the sheet runs full-amplitude edge-to-edge (no
amplitude envelope — that's the look), teal core → powder blue via FX_TEAL /
FX_BLUE, demo's ms-clock SPEED 0.0045 re-derived to 0.075/frame for the
engine's frame counter. Inherits offscreen pause, DPR, reduced-motion static
frame. Presentation (final after two same-day revisions, CSS v78 / JS v49): a
`.split.tool-split` row — **big display-type name top-left**
(clamp 1.9–2.8rem) with claim + paragraph under it, and the animation apart
on the right in its own bordered card (`.tool-card` > 16:9 `.tool-media`,
demo's card gradient) where a product image would sit. Reuses `.split`'s
≤900px single-column collapse. Sheet at the demo's yFrac 0.54. Hero tabs
gained "Software" → #software. The page's CTA band uses `data-fx="field"` like
every other page (was `ripple`; its wave lines + corner antenna were removed at
the user's request — `ripple` is now unused site-wide — contact.astro's form block was switched
to `field` too; the variant's JS stays as inert rollback). Verified in REAL
Chrome (not the pane): two screenshots 3s apart show crests moved; edge-to-edge
confirmed; zero console errors. Both css/js mirror copies updated.

## Jul 31 — products page sea-hero (main.js v47)

The products page now opens with the same `.page-hero.color-media.sea-hero`
pattern as the other pages: full rollout sequence (hero-fade video, scramble
decode, hero-rise), tagline "Physics, packaged." + scroll arrow to #products,
the hero description paragraph, and quick-link tabs generated from
`products.ts` (D2D, Remora). Video: the user's mountain-sunset clip
(Downloads/347325.mp4, 73 MB 4K) — first shipped as 1080p CRF 26 (2.6 MB), the
user flagged it as low quality, re-encoded at **native 4K CRF 24 preset slow →
14 MB** (silent, faststart; crop comparison confirmed visibly sharper rock and
cloud detail). Poster regenerated at 2560px. Sits alongside the two other
30+ MB heroes on the re-encode-someday list, but matches the maritime-hero 4K
precedent and lives on R2. **Palette note: it's a warm golden scene on
a cool navy site — flagged to the user, shipped as requested.** The explorer JS
gained hash deep-linking (main.js v47): a URL hash naming a `.uc-detail-item`
activates that product and scrolls to the explorer — needed because inactive
items are display:none, so native anchor jumps find nothing. Upload script now
lists 13 files (~146 MB).

## Jul 31 — comms/sensing consolidated to barrier-level panels (markup only)

Per the user: fewer, less application-specific use cases so visitors imagine
their own. **Communications 11 → 5 panels** (Through Water and Ice · Through
Steel and Concrete · Along Surfaces · Along Pipes and Industrial Metal · Where
Nothing Else Reaches), **Sensing 7 → 4** (Inside Sealed Metal · Presence Through
Barriers · Through Water · Through Tissue). Panels are grouped by the physical
barrier defeated, not the buyer; merged copy preserves the original
"has demonstrated" vs "is developing" claim levels. Same scroll-focus pattern;
one existing SVG scene kept per panel (animations otherwise untouched at user
request). New anchor ids (`uc-water/-metal/-surfaces/-pipes/-beyond`;
`uc-sealed/-presence/-water/-tissue`); hero quick-links rewritten; the 4
homepage cards remapped (2 now point at `#uc-metal`). No CSS/JS change — no
version bump. NOTE: 12 of the 18 `images/uc/*.svg` scenes are now unreferenced
(kept on disk, in both `public/` and root `images/` — deleting needs approval).

## Jul 31 — maritime use-case clips at 1.3x (main.js v46)

The 5 maritime use-case panel videos play 30% faster via a new `data-speed`
attribute (same idiom as `data-fx` / `data-parallax`); main.js applies it to any
`video[data-speed]`. **No re-encoding** — playback-rate only, so nothing to
re-upload to R2 and no quality loss. **Both `playbackRate` AND
`defaultPlaybackRate` must be set**: the media load algorithm resets
`playbackRate` to `defaultPlaybackRate`, and these clips are `preload="none"`,
so their load runs on first `play()` and would otherwise snap back to 1x
(verified empirically). NOT sped up: the maritime hero (ambient background loop),
the seabed band, and every video on other pages.

## Jul 31 — body copy enlarged site-wide (CSS v75)

Paragraph text was 16px (many card paragraphs 14.1-14.4px), which read small on
the dark background. Body copy is now **17.9px** and the hierarchy above it moved
with it, so nothing inverted:
`.page-hero p` 1.18rem · `.section-head p` 1.14rem · `.split p` / `.cta-band p` /
`.image-band p` / `.uc-detail-item p` 1.12rem · `.hero-info-desc` 1.1rem ·
`.product-claim` 1.2rem · `.card p` 1.02rem · `.team-card p` / `.post-card p` /
`.linkedin-fallback p` 1rem. Two headings had to be raised because body copy
caught up with them: `.card h3` 1rem→1.1rem (it had actually inverted) and
`.team-card h3` 1.05→1.12rem. Deliberately left alone: footer text (0.88rem
chrome), nav, mono spec chips / status badges, display type, and the inert
`.uc-step` rules.

## Jul 31 (second session) — products page built (CSS v72 / JS v44)

`products.astro` is live locally as the 7th page — nav slot after Home, footer
Technology list. Products from the user's spec-sheet PDFs (third added later same day): **D2D**
(diver-to-diver comms; status "Prototype" is a **placeholder, unconfirmed**) and
**Remora** (pipeline data links; status "Customer engagement ready" from its
sheet), and **Stingray** (cognitive wireless penetrator — contactless data
through sealed metal walls/flanges; status "Customer engagement ready" from its
sheet; poster is the spec sheet's product-body photo, end-cap alt saved).
Data-driven: `src/data/products.ts` + `src/components/ProductMedia.astro`
(image → model iframe → poster fallback; posters extracted from the PDFs into
`public/images/products/`). Explorer wiring added to main.js
(`.uc-explorer[data-explorer]`); `.uc-detail-media` now accepts iframes and
crops with `object-fit: cover`; new `.status-badge` / `.product-domain` /
`.product-claim` / `.spec-chips` CSS. Software-tools `.card-grid` section is
scaffolded but hidden until `tools[]` gets entries. Root `css/`+`js/` copies
re-mirrored; root `*.html` navs intentionally NOT updated (no products.html
exists at root — they remain a pre-Astro snapshot).

> **The deployed source moved on Jul 31.** The site is now an Astro app in
> `webflow-app/` targeting Webflow Cloud — see [WEBFLOW_CLOUD.md](WEBFLOW_CLOUD.md).
> `src/pages/*.astro` are the real pages; the root `*.html` files are stale
> duplicates kept until the Astro build is signed off. Version strings now live
> as `CSS_VERSION` / `JS_VERSION` constants in `webflow-app/src/layouts/Base.astro`
> — one edit, not six. `css/` and `js/` are duplicated into
> `webflow-app/public/`; **edit both or copy across** until the root copies go.
>
> Also new: [PRODUCTS_PAGE_PLAN.md](PRODUCTS_PAGE_PLAN.md) — a products +
> software-tools page, designed but not built.

## Jul 31 — no-JS reveal fix (CSS v71 / main.js v43)

Every `.reveal` element used to sit at `opacity: 0` forever without JavaScript.
`main.js` now adds a `js` class to `<html>` as its first statement, and the
hidden start state is scoped to `html.js .reveal`. The `.visible` and
reduced-motion rules were re-scoped to `html.js` too — required, because the new
selector's higher specificity would otherwise have beaten them and left content
permanently hidden *with* JS. `.uc-scroll:not(.js)` media also resets
`transform: none`. Verified on all six pages with scripts stripped.

## Jul 30 batch (see WORK_LOG "Batch polish pass") — site-wide state changes

- NO `.eyebrow` kickers anywhere; NO `.interface-divider` bars (CSS retained).
- Nav order everywhere: Home, **Maritime**, Communications, Sensing, About.
  Footer Technology = Maritime/Communications/Sensing (old gap resolved).
- Header is FULL-WIDTH (`.nav-wrap` max-width none): logo left, tabs right.
- Homepage dead-zone cards are `a.card` links into comms use-case anchors
  (uc-underwater/-ships/-tunnels/-jungle).
- LATER Jul 30 (CSS v70): scrollytelling RETIRED at user request ("liked the
  way maritime scrolled before") — ALL THREE tech pages now use the
  scroll-focus `.use-case-panel` pattern (see Status below).
- ABOUT opens with a drift-ice `.sea-hero` ("Working at the boundary.");
  strait band + "Beyond every existing wireless technology." hero removed.
- 3D graphics: drag-to-orbit only — wheel zoom removed on all four.
- Copy: paragraph-or-bullets rule enforced (no content <ul>s left); image
  bands are title-only.

## Status: fully working

All 6 pages render with no console errors. Current state highlights:

- **Homepage hero**: Anduril-style statement card — full-color `hero-montage.mp4`
  (42MB) + dot-ocean canvas; "Communications beyond the limits of legacy radio
  frequency" scramble-decodes on load (fxScramble in main.js); sign strip decodes
  ([REDEFINING THE LIMITS / OF WIRELESS] · logo · [EST. 2017 / year counter →
  "→ BEYOND"]); terminal cursor blinks 9× then removes itself.
- **Use cases on ALL THREE tech pages** (Jul 30 v70): scroll-focus
  `.split.use-case-panel` rows — the panel nearest mid-viewport gets
  `.is-focus` (grows 1.12 / 1.25 ≥1500px, teal border; no grow ≤900px).
  Maritime: 5 panels with the user's VIDEOS (focused one plays, click
  replays). Communications (11) and Sensing (7): panels with the animated
  SVG scenes in `.split-media.scene` (16:9, no grayscale; scenes self-animate
  via CSS keyframes inside <img>). Anchor ids live on the panels. The
  `.uc-scroll` scrollytelling (Jul 22-30) is retired; its CSS/JS remain as
  inert rollback. "Along the seabed." band stays (title-only).
- **Seapower-style heroes**: Maritime, Communications, Sensing, AND About (Jul 30)
  use `.page-hero.color-media.sea-hero` — full-color untinted video, 100vh flex
  column, big title up top (eyebrows removed Jul 30), bottom mono info row
  [tagline + ↓ arrow · description · quick-links where applicable]. First card
  sections carry `id="use-cases"` (maritime's arrow targets `#challenge`,
  About's targets `#who-we-are`).
- **About page**: opens with the drift-ice sea-hero ("Working at the
  boundary."); Who We Are is a single paragraph column (id=who-we-are).
- **Tonal system**: `.block.deep` on all card sections; header/footer #0d1424;
  `sonar` fx behind comms/sensing use-cases (pings rise through the bottom, no
  visible origin); nav active-tab has the sweeping-gap underline.
- **Scrollytelling history**: `.uc-scroll` (Jul 22 option A → Jul 23
  instrument-panel stage w/ brackets/glow/live bar) was RETIRED Jul 30 in
  favor of the panels above; all its CSS + the ucScrolls JS (incl. img+video
  stage support and the reduced-motion tracker) remain in the codebase as
  inert rollback — no page has a `.uc-scroll`. `section.block.deep` stays
  near-black `#070c14→#0a1220→#070c14` (Jul 23). All 18 `images/uc/*.svg`
  are blueprint-quality animated scenes (style guide/checker in
  scratchpad/uc-style); srcs carry `?v=2`. NOTE: `.has-fx` uses
  `overflow: clip` (NOT hidden — hidden kills sticky). Old `.uc-explorer`
  CSS also retained. Skills installed: `.claude/skills/{fleet,verify-audit}`.
- **Interactive 3D graphics** (Jul 23): 4 static SVG diagrams replaced by the
  user's three.js scenes, embedded as isolated lazy `<iframe>`s from `graphics/`
  (`.split-media.graphic`): index surface-wave-link + through-metal-link,
  communications why-plasmonics (saltenna-vs-conventional), sensing how-it-works
  (sealed-container-link). three.js r128 self-hosted at `js/vendor/three.min.js`. Cards recolored navy (#15283f→#0b1626) + navy fog + cameras zoomed in (Jul 23).
- **LinkedIn newsroom**: SociableKIT widget id 25695728, in-page embed; user set
  matching colors in the SociableKIT dashboard (feed #17304D, posts #1A3550,
  text #9BB0C2, links #2EC4B6).

## Open with the user (asked, no answer yet)

1. **Hero-montage weight**: 42MB — offer stands to re-encode (~20MB) or add a 720p
   mobile source before deploy.
2. **maritime-hero.mp4 weight**: now 35.6MB (user's 4K beach clip @ CRF 27,
   Jul 21 — quality was the priority; a CRF 29 encode at 26.6MB looked nearly
   identical in stills and sits in the session scratchpad recipe if size
   matters later). Also shared by the homepage "Built for the maritime edge."
   band.

(Resolved Jul 21: seabed band KEPT per user; focus scale grown to a 1.25
wide-screen tier — see WORK_LOG.)

## Open decisions (older, still unanswered)

- Maritime "Learn More" links are `href="#"` placeholders awaiting detail pages —
  EXCEPT #uc-surface (USV), which links to the user's claude.ai artifact
  (67483ee6-…1eb8, target=_blank, Jul 21). CAVEAT: artifact is 403 without the
  user's login — they should verify its share setting is public before deploy.
- Contact form is `mailto:` — Formspree (or similar) is a one-line swap.
- **Deletable unused videos**: `bg-1490262444.mp4`, `bg-1729633035.mp4`,
  `saltenna-main.mp4` (old home hero), `band-diver-pair.mp4` + its poster (band
  removed Jul 20), `band-jungle-fog.mp4` (13.1MB) + its poster ("Under the
  canopy." band removed Jul 30), `about-band-strait.mp4` + its poster (strait
  band replaced by the drift-ice About hero, Jul 30). `fonts/boxen-*.{otf,woff2}` also unused (Boxen tried+reverted).
- ~~Deployment: never set up.~~ **Resolved Jul 31** — Webflow Cloud (Astro) in
  `webflow-app/`, video to Cloudflare R2. Built and locally verified, not yet
  deployed. The untouchable root items no longer matter: only
  `webflow-app/public/` (5.0 MB) ships, so `wordpress-theme/`, `saltenna.zip`,
  `underwater_drone_swarm.mp4` are excluded by
  construction (`soundcloud-downloader/` and `dunmore-site/` have since been
  moved out of the folder entirely). Video compression is still worth doing. See
  [WEBFLOW_CLOUD.md](WEBFLOW_CLOUD.md) for the remaining steps.
- `saltenna.com` currently serves a **live Webflow Designer site** (Webflow's own
  CDN) — not WordPress, not these files. Mounting the Cloud app at `/` shadows
  it immediately; stage first.

## Known environment quirks (cost real time — read before verifying anything)

- **The SociableKIT LinkedIn widget cannot render on `localhost`** (found Jul 31,
  after time lost thinking the feed was broken). Its `widget.js` special-cases
  the hostnames `localhost` and `127.0.0.1` and repoints its own asset base at
  your dev server, so its CSS 404s and it hangs on its spinner forever — while
  the post data fetches fine (`window.sk_embed_data["25695728"]` is populated).
  **Browse via `http://app.localhost:PORT`**; any hostname that isn't literally
  `localhost`/`127.0.0.1` takes the production path and the feed renders. Do not
  "fix" feed code in response to a localhost-only failure.
- **The preview pane reports `document.visibilityState === "hidden"`**, so
  `IntersectionObserver` never fires at all — `.reveal` elements never gain
  `.visible` there. Force the class manually (with `transition: 'none'`) to
  verify reveal CSS.
- macOS ships bash 3.2: no `mapfile`. There is also no `timeout` binary.
- **Webflow's published limits are wrong about video**: the real per-asset cap on
  Webflow Cloud / Workers is **25 MiB**, not the advertised 1 GB. Verified.

- **Embedded preview pane**: refuses `video.play()` and programmatic `currentTime`
  seeks; rAF + IntersectionObserver throttle OR FULLY SUSPEND (a rAF-liveness
  probe can hang → eval timeout); CSS animations AND transitions freeze mid-flight
  (verify end states via `document.getAnimations().forEach(a=>a.finish())` or by
  toggling `transition:'none'` and reading computed styles); `setTimeout` is
  throttled ~3-4×; screenshots can be stale. Verify with DOM measurement,
  getImageData brightest-pixel sampling, `video.load()` + readyState, stubbed
  play/pause to prove wiring, and text-position via Range (padding doesn't move
  border-box rects). Trust the user's real Chrome over the pane.
- **User screen recordings**: NSIRD temp paths die in seconds — have them save to
  Desktop first (3 were lost). macOS filenames use a narrow no-break space before
  "PM" — `cp` with a typed space fails; use a glob.
- **Local server** (`saltenna-site`, port 4173, `.claude/launch.json`) dies between
  sessions — `preview_start` it and curl-check. If the port is held by a previous
  session's server, it still serves fresh files from disk (curl-verify works).
- **Videos on the Astro dev server (4321)**: served by a dev-only Vite
  middleware in `astro.config.mjs` mapping `/videos` → `../videos` (added Jul 31
  after they 404'd; heroes "stopped playing"). Build-safe (`apply: "serve"`).
  The wrangler preview (8787) does NOT have it — set `PUBLIC_VIDEO_BASE` there.
- **Run `npx astro build` from `webflow-app/`, not the repo root** — from the
  root, npx resolves a stale cached astro and dies with a rolldown error.
- **ffmpeg**: none installed; use the imageio_ffmpeg bundled binary
  (`python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"`).
  fontTools IS available (used for woff2 conversion).
- **Pexels**: curl blocked — WebSearch + CDN thumbnails +
  `pexels.com/download/video/{id}/` (see PROJECT_OVERVIEW).

## Fast verification recipe

1. Start server; `curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/index.html`
2. Navigate with `?r='+Date.now()` (beats cache); console-check errors (expect none)
3. DOM-check the specific change; force `.reveal` visible before screenshots; set
   `document.documentElement.style.scrollBehavior='auto'` before scrolling
4. For animations/transitions: fast-forward with getAnimations().finish() or
   disable the transition, then read computed styles
