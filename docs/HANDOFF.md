# Session handoff — 2026-08-24

## Where things stand in one paragraph

The Saltenna site is an **Astro app at `webflow-app/`** targeting **Webflow
Cloud**, with ~143 MB of video destined for **Cloudflare R2**. Seven pages build
and are verified locally against the real Workers runtime. It is **not
deployed** — that needs the user's Cloudflare and Webflow credentials, and has
been the only blocker for weeks. The recent work has all been on the **products
page**: four products (D2D, Remora, Stingray, Ibex) driven from a single data
file, a Software section carrying a ported canvas waveform animation, a visual
polish pass, and **five interactive 3D viewers** installed from third-party
exports and skinned to the site palette — every product now has at least one
model. Current versions are
**CSS `?v=92` / main.js `?v=63` / `MODEL_VERSION = "5"`**. Build is clean;
`dist/client` is 20 MB.

## Read these, in this order

| File | What it's for |
| --- | --- |
| `docs/HANDOFF.md` | This file — state, task status, next actions, open questions |
| `docs/MODEL_VIEWERS.md` | The 3D viewer subsystem: install rules, runtime skinning, gotchas. **Read before touching any `graphics/` file.** |
| `docs/WEBFLOW_CLOUD.md` | Deployment decision record, verified platform limits, remaining steps |
| `webflow-app/README.md` | Operational runbook — the actual commands |
| `docs/CURRENT_STATUS.md` | Living site status, newest first; environment quirks |
| `docs/PROJECT_OVERVIEW.md` | Longer-standing project background |
| `docs/PRODUCTS_PAGE_PLAN.md` | The products page design rationale — now built |
| `docs/WORK_LOG.md` | Chronological history, ~1880 lines. Grep it; don't read it end to end. |

## Architecture in six facts

1. **`webflow-app/src/pages/*.astro` is the real source.** The root `*.html`
   files are stale duplicates, kept only because deleting them was never
   approved.
2. **`css/styles.css` and `js/main.js` exist as byte-identical duplicates** at
   the repo root and in `webflow-app/public/`, with **no sync script**. Same for
   `graphics/` and `js/vendor/`. Edit both, or edit one and copy across. A
   verification sweep that only checks one tree will pass while the site is
   broken.
3. **Cache busting is manual**: `CSS_VERSION` / `JS_VERSION` in
   `src/layouts/Base.astro`, `MODEL_VERSION` in `products.astro`. Bump with the
   file you changed.
4. **`output: "server"` + `@astrojs/cloudflare`**, with `export const prerender
   = true` on every page. Webflow Cloud requires server output; prerender opts
   each route back into static generation.
5. **The FX engine** in `main.js` holds `fxVariants` (hero, signal, radar, field,
   grid, ripple, sonar, waveform, terrain), mounted on `<canvas data-fx="…">`.
   Draw signature is `draw(ctx, w, h, t, mouse, ripples)` where **`t` is a
   per-frame counter, not milliseconds** — a port written against a ms clock will
   animate at the wrong speed. This bit once already.
6. **Video lives outside the bundle.** Pages reference `PUBLIC_VIDEO_BASE`; a
   dev-only Vite plugin (`devVideos()` in `astro.config.mjs`, `apply: "serve"`)
   serves `../videos` at `/videos` with Range support so local dev has video
   without shipping it.

## Products page anatomy

`src/data/products.ts` is the single source of truth — products and software
tools both. Each product has copy, spec chips, a photograph, and optionally one
or more 3D models. The explorer is three columns: numbered list → `.uc-model-card`
(3D, borderless, edge-to-edge) → `.uc-detail` (photo + spec card). Two models in
one card split it evenly.

| Product | Status badge | Photo | 3D model(s) |
| --- | --- | --- | --- |
| D2D | Prototype ⚠️ placeholder | `d2d-dive-team.jpg` | diver kit |
| Remora | Customer engagement ready | `remora-subsea.jpg` | pipe limpet |
| Stingray | Customer engagement ready | `stingray-subsea.jpg` | system interface module |
| Ibex | Prototype ⚠️ placeholder | `ibex-peak.jpg` | radio + ROVER 1 |

Software section: one tool, "The Saltenna Waveform" (⚠️ placeholder name), over
the ported waveform canvas animation.

## Task status

| # | Task | Status |
| --- | --- | --- |
| 1 | Astro port of all pages, shared `Base.astro` | done, verified |
| 2 | Local verification against real Workers runtime | done |
| 3 | Video srcs onto configurable R2 base + upload script | done (dry-run verified) |
| 4 | Upload video to R2 | **DONE Sep 10** — 12/12 serving, `pub-555801c7c2ae4ca7a0c96f1fac3f953d.r2.dev` |
| 5 | **Deploy to Webflow Cloud** | **blocked — needs Webflow site id / auth** |
| 6 | Products page built, 4 products from spec sheets | done |
| 7 | Body copy enlarged site-wide → 17.9 px | done, verified |
| 8 | Maritime clips at 1.3× playback | done, verified |
| 9 | Comms 11→5 use-case panels, Sensing 7→4 | done, verified |
| 10 | Waveform ported into the FX engine as a variant | done, verified |
| 11 | `ripple` fx removed from products + contact CTA bands | done, verified |
| 12 | Visual polish pass on products (typography, frames, motion) | done, verified |
| 13 | Code/animation sample bundle + email for external reviewer | done, sent |
| 14 | Four 3D viewers installed and skinned to the palette | done, verified |
| 15 | Remora backdrop matched to the others (source rebuild) | done — **not upstreamed** |
| 16 | Remora card photo → subsea shot | done, verified |
| 17 | Stingray 3D viewer installed (vendored three, navy/teal, embed mode) | done, verified |

## What needs the user, not the next session

These are decisions and data, not work. Nothing below can be closed by writing
code.

1. **D2D's maturity status.** Currently "Prototype" — not stated on its spec
   sheet. Remora and Stingray carry real statuses taken verbatim.
2. **All Ibex copy is invented.** Name, claim, body and all four spec chips were
   written from the 3D viewer's own placeholder SPECS block, which its author
   marked "replace freely". The chips assert specifics — AN/PRC-163 fit, SMA,
   250 mm — that cannot be substantiated. Flagged with ⚠️ in `products.ts`.
   The user authorised "come up with something for now"; it must not go public
   as is.
3. **The waveform tool's real name.** "The Saltenna Waveform" is a placeholder.
4. **More software tools?** The section renders any number; there is one.
5. **Two Remora content conflicts, for the user's judgment:**
   - Its own viewer readout calls it a "Concept study … not a validated design …
     coupling arrangement in particular is unresolved", while the site badge says
     "Customer engagement ready".
   - Its physics note describes a Sommerfeld surface wave, "not an optical
     surface plasmon" — the site says plasmonic throughout.
6. **Mount path for deploy**: root `/` (replaces the live Webflow site) or a
   subpath to stage first?
7. **Delete the root `*.html`, `css/`, `js/` duplicates?** Still needs explicit
   approval. Drift is a real risk (see fact 2 above).

## Loose ends worth knowing about

- **`videos/products-hero.mp4` (14 MB) is now unused.** The products hero was
  changed to a `data-fx="terrain"` canvas outside of a Claude session, so the 4K
  video that was encoded for it is orphaned. Either restore it or drop it from
  the R2 upload set — currently it would upload for nothing.
- **19 videos on disk, 12 referenced.** Worth reconciling before the R2 bill.
- **Unreferenced assets still shipping**: `d2d-kit-front.jpg` (56 KB),
  `stingray-endcap.jpg` (24 KB), and 9 of 18 `images/uc/*.svg`. Deliberate
  fallbacks, kept: `remora-pipelines.jpg` (36 KB) and `stingray-body.jpg`
  (40 KB) — both still named as `poster` behind an `image` override.
- **`hero-montage.mp4` (33 MB) and `maritime-hero.mp4` (34 MB)** were flagged for
  re-encode back in July. Less pressing now they are bound for R2, still large.
- **Maritime "Learn More" links are `href="#"` placeholders.** The contact form
  is still a `mailto:` handoff.

## Environment traps — please don't rediscover these

1. **The LinkedIn feed cannot render on `localhost`.** SociableKIT's `widget.js`
   special-cases `localhost`/`127.0.0.1` and repoints its own assets at your dev
   server, so it hangs on a spinner. Browse via **`http://app.localhost:PORT`**.
   The `.claude/launch.json` entries already do this.
2. **The embedded preview pane reports `visibilityState === "hidden"`**, so
   `IntersectionObserver` never fires and `.reveal` elements never appear there.
   That is the pane, not the site. Corollary: never trust the pane alone for
   animation or lazy-load checks — use real Chrome.
3. **`products.html` stalls script eval** in both the pane and real Chrome — it
   is genuinely heavy (canvas hero + 3 WebGL iframes). Verify components on a
   tiny isolated check page, then delete it and confirm it is gone from `dist/`.
4. **`graphics/*.html` are standalone documents with their own dependencies.**
   A grep over root `*.html` + `main.js` wrongly reports `js/vendor/three.min.js`
   as unused. All four diagram scenes load it. Include `graphics/` in any sweep.
5. **The real per-asset cap on Webflow Cloud/Workers is 25 MiB**, not the 1 GB
   Webflow's own limits page advertises. That is why video goes to R2.
6. **Running `npx astro build` while `astro dev` is running kills the dev
   server** — both write `dist/`. Restart it after builds.
7. **Run `npx astro build` from `webflow-app/`, never the repo root** — from the
   root, npx resolves a stale cached astro and dies with a rolldown error.
8. **`video.playbackRate` silently resets** to `defaultPlaybackRate` when the
   media load algorithm runs, and the clips are `preload="none"`. Set both, or
   the speed change reverts on load. Proved empirically with a control video.

## Deploy, when credentials arrive

```
cd webflow-app && ./scripts/upload-videos.sh <bucket> --dry-run   # then without the flag
# set PUBLIC_VIDEO_BASE=https://<public-bucket-domain>/videos
npx webflow cloud init -f astro -m / -s <site-id>
npx webflow cloud deploy
```

Stage before mounting at `/` — see the cutover caution in `WEBFLOW_CLOUD.md`.
Then run the post-deploy checks in `MODEL_VIEWERS.md` (`.glb` MIME type, and
gzip/brotli on `.glb`/`.json`/`.js`).

## Handoff prompt for a new session

Copy the block below into a fresh session, filling in the last line.

```
Picking up the Saltenna website project at ~/Saltenna (not a git repo).

Read these first, in order:
  docs/HANDOFF.md        — state, task status, open questions, environment traps
  docs/MODEL_VIEWERS.md  — the 3D viewer subsystem; REQUIRED before touching graphics/
  docs/CURRENT_STATUS.md — living status, newest first
  webflow-app/README.md  — the actual commands
  docs/WEBFLOW_CLOUD.md  — deploy decision record + real platform limits
docs/WORK_LOG.md is ~1900 lines of chronological history — grep it, don't read it.

Context in brief: the site is an Astro app at webflow-app/ targeting Webflow
Cloud, with ~143 MB of video headed to Cloudflare R2. Seven pages build and are
verified locally against the real Workers runtime, but it is NOT deployed —
that needs my Cloudflare and Webflow credentials. Recent work has all been the
products page: four products (D2D, Remora, Stingray, Ibex) driven from
src/data/products.ts, a Software section with a ported canvas waveform
animation, and five interactive 3D viewers skinned to the site palette (every
product has at least one model). Versions are CSS ?v=92 / main.js ?v=63
(CSS_VERSION / JS_VERSION in webflow-app/src/layouts/Base.astro) and
MODEL_VERSION "5" in products.astro — bump manually with whatever you change.

Things that will bite you, all learned the hard way — please don't rediscover:
  1. css/styles.css, js/main.js, graphics/ and js/vendor/ exist as
     BYTE-IDENTICAL duplicates at the repo root and in webflow-app/public/,
     with no sync script. Edit both, or edit one and copy across. Verifying
     only one tree will pass while the site is broken.
  2. webflow-app/src/pages/*.astro is the real source; root *.html is stale.
  3. The SociableKIT LinkedIn widget CANNOT render on localhost — its widget.js
     special-cases localhost/127.0.0.1 and repoints its own assets at the dev
     server, so it hangs on a spinner. Browse via http://app.localhost:PORT.
  4. The embedded preview pane reports visibilityState "hidden", so
     IntersectionObserver never fires and .reveal never appears there. Don't
     trust it for animation or lazy-load checks — use real Chrome.
  5. products.html stalls script eval in the pane AND real Chrome (canvas hero
     + 3 WebGL iframes). Verify components on a tiny isolated check page, then
     delete it and confirm it's gone from dist/.
  6. Run `npx astro build` from webflow-app/, never the repo root (stale cached
     astro → rolldown error), and never while astro dev is running (both write
     dist/, it kills the server).
  7. graphics/*.html are standalone three.js documents with their own deps — a
     grep over root *.html + main.js wrongly says js/vendor/three.min.js is
     unused. All four diagram scenes load it. Include graphics/ in asset sweeps.
  8. The FX engine's draw signature is draw(ctx, w, h, t, mouse, ripples) where
     t is a PER-FRAME COUNTER, not milliseconds.
  9. The real per-asset cap on Webflow Cloud/Workers is 25 MiB, NOT the 1 GB
     their limits page advertises. That's why video goes to R2.
 10. DO NOT hand-edit anything under graphics/rover/ or graphics/remora/ —
     they're third-party build output. Adapt them from outside via the runtime
     skin in main.js. See docs/MODEL_VIEWERS.md.

Open items awaiting ME, not you — don't try to close them by writing code:
D2D's maturity status ("Prototype" is a placeholder); ALL Ibex copy is invented
from its viewer's placeholder specs and must not go public as is; the waveform
tool's real name; and two Remora content conflicts
(its own viewer calls it a concept study while the badge says "customer
engagement ready", and it describes a Sommerfeld surface wave, "not an optical
surface plasmon", where the site says plasmonic). All are detailed at the end
of docs/HANDOFF.md. Also note the Remora source edits live only in my Downloads
tree and need to go upstream, and videos/products-hero.mp4 (14 MB) is orphaned.

What I want to work on next: [[YOUR TASK HERE]]
```
