# 3D model viewers — how they work and how to change them

The products page embeds interactive 3D models. Five of them come from outside
this project as finished, self-contained web apps; four older diagram scenes were
written in-house. This file is the reference for both, because the outside ones
have rules that are not obvious from reading the code.

_Last updated: 2026-08-24 (Stingray viewer added)._

## The core rule

**Third-party viewers are installed byte-identical and adapted from the
outside.** Their authors ship build output and say, in writing, not to hand-edit
it — the next build would silently overwrite any change. So every visual
adaptation is applied at runtime from `main.js`, keyed on the iframe's `src`.
Editing a viewer's *source* and rebuilding is the escalation path, used only when
no runtime lever exists (so far: Remora's backdrop).

Practical consequence: you can re-drop a fresh export from the author over the
top of `graphics/rover/` or `graphics/remora/` and the site still looks right.

## Inventory

| Path | What | Origin | Loaded by |
| --- | --- | --- | --- |
| `graphics/d2d-diver.html` + `male_base.glb` | D2D diver kit fit | supplied (`~/Downloads/DIVER/dist/`) | D2D product |
| `graphics/ibex-radio.html` | Handheld radio + antenna | supplied (`radio_viewer.html`) | Ibex product |
| `graphics/rover/` (5 files) | ROVER 1 | supplied (`rover-web-export/`) | Ibex product, second slot |
| `graphics/remora/` (4 files) | Clamp-on pipe limpet | supplied, **rebuilt from source** | Remora product |
| `graphics/stingray.html` | System interface module | supplied (`Website Stingray Model 2/export/stingray-viewer.html`), adapted in-file like the radio | Stingray product |
| `graphics/plasmonic-surface-wave-link.html` | physics diagram | in-house | communications page |
| `graphics/saltenna-vs-conventional.html` | physics diagram | in-house | communications page |
| `graphics/sealed-container-link.html` | physics diagram | in-house | sensing page |
| `graphics/through-metal-link.html` | physics diagram | in-house | sensing page |

`graphics/` mirrors to the repo root as well — see the duplicate-tree warning in
`HANDOFF.md`.

### Two three.js versions ship, and both are needed

- `js/vendor/three.min.js` — **r128 UMD**, 592 KB. The four in-house diagram
  scenes. r128 has no ESM addons, so they cannot move up.
- `js/vendor/three-0.160/` — **0.160 ESM**, 6 files, ~840 KB, including
  GLTFLoader, OrbitControls, RoomEnvironment, RoundedBoxGeometry and
  BufferGeometryUtils. The Ibex radio viewer and the Stingray viewer.

The rover bundles **its own** copy of three (`three.global.js`, 672 KB) and
Remora bundles three inside its Vite chunk (`assets/index-*.js`, 584 KB). That
is four copies of three.js across the site. It is not a mistake worth fixing:
each viewer is a separate document with its own WebGL context, and unifying
versions would mean editing files their authors regenerate.

**Asset-sweep trap:** a grep over `*.html` + `main.js` will report
`js/vendor/three.min.js` as unused. It is not — all four diagram scenes load it.
Always include `graphics/` in an asset sweep.

## Where they render on the page

`products.astro` puts each product's models in a `.uc-model-card` **beside** the
spec card, one `.uc-model-frame` per model, lazily iframed. Two or more models
split the card evenly — Ibex shows the radio above ROVER 1. A product with no
`models` entry leaves the column empty rather than reflowing the grid.

Adding a model to a product is one entry in `src/data/products.ts`:

```ts
models: [{ src: "graphics/thing/index.html", hint: "Caption · drag to rotate" }]
```

### `MODEL_VERSION` — bump it when a viewer or its mesh changes

`products.astro` carries `const MODEL_VERSION` and appends `?v=` to every model
iframe. Without it a browser can pair a **cached old viewer with a new mesh**,
which hangs on "Loading model…" forever. This was almost certainly the cause of
one reported "the model not loading". Currently `"6"`.

## Orbit yes, zoom no (2026-09-10)

Wheel-zoom is disabled on all five product viewers at the user's request; drag
to orbit still works. Two mechanisms, because two of the five must not be edited:

1. **`main.js`, for all five** — a capture-phase `wheel` listener on each model
   iframe's own window calls `stopPropagation` + `preventDefault`, then does
   `window.scrollBy(0, e.deltaY)` on the PARENT. So the wheel scrolls the page
   instead of zooming, which is what a visitor expects over a small embed.
   Capture on the window always beats OrbitControls' own canvas listener,
   regardless of attach order, so this need not race the viewer's init.
2. **`controls.enableZoom = false` when embedded**, in the three viewers we own
   (`stingray.html`, `ibex-radio.html`, `d2d-diver.html`). This is the robust
   half and, unlike an event block, it also kills **touch pinch**. Standalone
   (opened outside an iframe) keeps zoom for the author.

**The trap that cost a debugging round:** a lazy iframe starts on `about:blank`
and is then REPLACED by the real document. The first version attached to
whichever window the rAF poll happened to find, which was often the blank one —
the listener died with it, and the wheel still zoomed. Fixed by tracking the
document the listener belongs to and re-attaching when it changes, plus hooking
`load`. `apply()` alone still decides when the poll stops, because the skin's
timing is load-bearing for the rover.

**Known limitation:** touch **pinch** may still zoom `graphics/rover/` and
`graphics/remora/`. Blocking multi-touch there would risk breaking rotation, and
their `enableZoom` is inside build output we must not edit. Mouse wheel is
blocked on both. A build from their authors with zoom disabled is the durable fix.

Verified on the real products page, all five viewers active:
`wheelBlocked: true` and `orbitPointerAllowed: true` on every one.

## Remora hotspots: device parts kept, pipe markers dropped (2026-09-10)

Final state after two passes the same day. Remora's CSS2D hotspots were restored
in full (they had been hidden wholesale in v63), then narrowed: the parts of the
**Remora itself** stay highlightable, the markers sitting on the **pipe** are
hidden.

| Kept — on the device | Dropped — on the pipe |
| --- | --- |
| Limpet housing | 12-inch flanged spool |
| Bolted baseplate | Marine growth |
| Wet-mate connector | |
| Access cover and ribs | |
| Status indicator | |

Selected by the dot's own `aria-label`, not by position:

```css
.hotspot:has(> .dot[aria-label="12-inch flanged spool"]),
.hotspot:has(> .dot[aria-label="Marine growth"]) { display: none !important; }
```

The markup is `.hotspot > .dot[aria-label] + .card`, so `:has()` reaches the
wrapper from the label. `nth-child` would work today but would silently retarget
if the author reorders their HOTSPOTS array in a future build. Verified
`CSS.supports('selector(:has(> .x))')` is true in the target browser.

The whole `.hotspot` is hidden rather than just `.dot` — with no dot there is
nothing to click, so the card would be unreachable regardless.

**Verified by measurement:** 5 hotspots `display: block` with visible dots, the
2 pipe ones `display: none`; clicking "Limpet housing" still flips
`data-open` to `true` and opens its card, so the highlight behaviour is intact.

**Correction to the v63 note:** it said a hidden hotspot vanishes from the DOM.
That holds only when the rule is in place *before* CSS2DRenderer first inserts
the node (it skips `display:none` elements). Here the skin lands after
insertion, so all 7 remain in the DOM and two are simply hidden. Check computed
display per element — never assert on `querySelectorAll('.hotspot').length`.

## (superseded the same day) Remora hotspots are back (2026-09-10)

The `.hotspot { display: none !important }` rule added to Remora's runtime skin
in main.js v63 was **removed** at the user's request. The teal CSS2D dots on the
pod and pipe are visible again, and with them the viewer's click-to-open
annotation cards — Limpet housing, Bolted baseplate, Wet-mate connector, Access
cover and ribs, Status indicator, the 12-inch flanged spool and the pipe entry.

Verified on the products page with the skin applied: **7 hotspots, 7 visible**,
measured 11×11 px on a standalone check page (the products page reports 0×0 in
the embedded preview pane, which collapses it to zero width — measure elsewhere).

Remora is now the only viewer painting persistent markers on its model; that
inconsistency with the radio and diver is accepted, deliberately.

## The runtime skin

`main.js` holds a `SKINS` array keyed on a substring of the iframe `src`
(`/rover/`, `/remora/`). For each match it injects a `#saltenna-skin` `<style>`
and sets `data-theme="dark"` on the iframe document. Same-origin, so this is
legal; a cross-origin frame is left alone by design.

`SKIN_TOKENS` is the shared block that redefines each viewer's design tokens to
the site palette (`--bg`, `--panel`, `--text`, `--accent: #2ec4b6`, …).

Three non-obvious mechanics, each of which cost real debugging time:

1. **The injection is an rAF poll, not a `load` handler.** The rover builds its
   3D backdrop from `--void-1`/`--void-2` **once at init**, and only rebuilds on
   a `prefers-color-scheme` event that cannot be fired synthetically. So the
   variables have to be in place *before its module runs*. The poll lands the
   style while the document is still parsing. Remora would tolerate a later
   injection (its renderer is `alpha: true`, so the `#stage` gradient *is* the
   backdrop) but uses the same path for consistency.

2. **A synthetic `resize` is dispatched after injection.** These viewers size
   their renderer from the stage element at init. The skin changes the stage's
   height *after* that measurement, leaving the canvas short of the frame —
   Remora sizes its stage at `62vh` and came up ~290 px shy inside a card. Fixed
   by dispatching `resize` into the frame at 0/250/1000/2500 ms plus a
   `ResizeObserver` on the frame's parent (the card also changes height between
   products, since each product's copy is a different length).

3. **The rover's own `≤900px` rule fights the skin.** It sets
   `#controls{left:12px; justify-content:stretch}` and `.btn{flex:1}`, so
   pinning the controls to a corner also requires resetting `flex: 0 0 auto`, or
   the buttons spread across the frame.

The skin also hides each viewer's own page furniture (titles, prose readouts,
hints) because the spec card beside it carries the words, and hides Remora's
CSS2D hotspot dots — the other three viewers reveal specs on hover with nothing
painted on the model, so the dots were the odd one out.

## The one source edit: Remora's backdrop

Remora bakes its backdrop into scene uniforms, with no CSS lever, so it was the
one case that required editing source and rebuilding.

- Edited: `~/Downloads/WebsiteRemoraModel/web/src/main.js`
  (backup: `main.js.bak-preSaltennaNavy`)
- Two changes: backdrop uniforms → `0x16233a` / `0x0b1220`; floor
  `MeshStandardMaterial` → `ShadowMaterial({ opacity: 0.38 })`. Lights
  deliberately untouched.
- Rebuild command is **`vite build --base=./`**. A plain `vite build` emits
  absolute `/assets/...` paths, which 404 under `/graphics/remora/` and hang the
  viewer on "Loading model…". This shipped broken for one cycle.
- Their `node_modules` was installed on Windows (only `rollup-win32-*`,
  `@esbuild/win32-x64`), so Vite could not run on macOS at all. Fixed with
  `npm install --no-save @rollup/rollup-darwin-arm64 @esbuild/darwin-arm64`;
  `package.json` untouched.

**These edits live only in the user's Downloads tree.** They must go upstream to
the model's author or they are lost on their next build. This is the most
fragile thing in the whole viewer setup.

## Verification gotchas — things that look like bugs and are not

- **An 8 px card misalignment that isn't real.** `uc-fade` animates from
  `translateY(8px)`. Measure after animations finish.
- **A hotspot count of 0 does not mean the hotspots failed.** three's
  `CSS2DRenderer` does not insert elements whose computed `display` is `none`.
  Confirmed by A/B hit-testing: 7 elements standalone, 0 embedded.
- **WebGL readback comes back blank** without `preserveDrawingBuffer`. Screenshot
  the frame instead of reading pixels.
- **Controls vanish on desktop** if a width threshold is set from the viewport:
  the model windows measure ~398 px because the container caps them. The
  threshold is 340 px for this reason.
- **`products.html` stalls the embedded preview pane and real Chrome alike** —
  3 WebGL iframes plus a canvas hero is genuinely too heavy for script eval
  there. The workaround that works: build a tiny isolated check page containing
  just the component under test, verify, then delete it (and confirm it is
  absent from `dist/`).

## Deploy requirements for these files

Ask after deploy, because Cloudflare does not always do these by default:

- `.glb` served as `model/gltf-binary` (or `application/octet-stream`). The dev
  server does; verify in production.
- gzip/brotli on `.glb`, `.json`, `.js`, `.html`. The rover's own DEPLOY.md calls
  compression "the single highest-value thing to get right" — `rover.json`
  876→334 KB, `three.global.js` 672→166 KB, `male_base.glb` 2.65→1.64 MB.
- No CDN dependency remains: the diver viewer originally pulled three r160 from
  jsdelivr via an importmap; that was repointed at the vendored copies. A grep
  for `jsdelivr|cdn.` across `graphics/` returns nothing, and should stay that
  way. WebGL is required with no fallback image.

## Known limitations, flagged rather than worked around

- **ROVER 1 cannot pause when offscreen.** The other viewers use an
  `IntersectionObserver` constructed in the *parent* realm observing
  `window.frameElement` (the Stingray viewer instead shipped its own IO on its
  root element, which spans documents to the top-level viewport — kept as-is);
  the rover's render loop is inside build output that must not be edited. It
  renders continuously while the page is open.
- **ROVER 1's dimensions readout is permanently suppressed** at half-card width
  by its own `≤900px` rule (`#readout`, `#hint` hidden). Getting the numbers back
  needs ≥901 px of frame — i.e. a full-width band instead of half a card.
- **Diver fins ship detached** (foot anchors empty). Verified against the
  pristine copy, so it is upstream behaviour, not an install error.
- **Placeholder spec text inside the viewers.** The diver's `radio` and
  `earpiece` SPECS entries are invented per its own HANDOFF-v4 — the radio names
  a "D2D-1 Dive Radio" the source photographs contradict. The Ibex viewer's spec
  tooltip still reads "Plasmonic Sleeve Antenna". Both are author placeholders
  and need real data before the page is public.
- **`dist/client` is 20 MB**, of which `remora.glb` (5 MB), `male_base.glb`
  (4 MB) and `d2d-diver.html` (4 MB, the GLB is inlined) are the bulk. All are
  under the 25 MiB per-asset cap, so no action needed — but that cap is the one
  to watch if a bigger mesh arrives.
