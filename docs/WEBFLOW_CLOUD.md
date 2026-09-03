# Deployment — Webflow Cloud (Astro)

_Created 2026-07-31. Status: built and verified locally; **not yet deployed**._

Operational commands live in [`webflow-app/README.md`](../webflow-app/README.md).
This file is the decision record and status — read it first, run from the README.

## Decision

The site ships as an **Astro app on Webflow Cloud**, with video on **Cloudflare R2**.
The user chose this path on 2026-07-31 after the alternatives were ruled out:

| Option | Why not |
| --- | --- |
| Upload the hand-coded site to Webflow | **Impossible.** Webflow has no raw-HTML import. It exports static files, never imports. Pages must come from the Designer or Webflow Cloud. |
| Rebuild the 6 pages in the Webflow Designer | Weeks of GUI work that Claude cannot do (no API for building layouts/styles). Scrollytelling and focus panels would need rework as Webflow Interactions, and the video still wouldn't fit. |
| Static host elsewhere (Cloudflare Pages / Netlify) | Works today with zero rework, but abandons Webflow entirely — no visual editing surface. Kept as the fallback if Webflow Cloud disappoints. |

## Hard platform limits (verified, some contradict Webflow's docs)

- **A single static asset on Webflow Cloud / Workers caps at 25 MiB.** Webflow's
  own limits page advertises "videos: 1 GB per file" — that is **not** what the
  runtime enforces. The build dies with `Asset too large` naming the file. Hit
  empirically when a stray `public/videos` symlink pulled the MP4s into `dist/`:
  `hero-montage.mp4` reported at 32.5 MiB. Don't trust that docs page.
- **A whole deployment caps at 100 MB compressed** (worker bundle + static
  assets), per Webflow Cloud's limits page; oversized deploys fail at build.
  Measured 2026-08-25: `dist/client` alone gzips to **11.1 MB** — no problem —
  but the same tree with the twelve MP4s inside gzips to **133.3 MB**, because
  MP4 is already compressed and gzip cannot touch it. **This is a second,
  independent reason the video cannot ship in the bundle**, on top of the
  25 MiB per-asset cap: even if every clip were re-encoded under 25 MiB (they
  now are — see `PREVIEW-HOSTING.md`), the total still fails. R2 is not
  optional for a Webflow Cloud deploy.
- **Webflow's native asset pipeline cannot take the video at all**: the Assets
  panel rejects `.mp4`, and the Background Video element caps at **30 MB/file**
  and force-transcodes to **720p** on every plan including Enterprise.
- **`Astro.locals.runtime.env` is gone in Astro v6+** (we are on astro 7.1.6).
  Reading it throws `Astro.locals.runtime.env has been removed in Astro v6. Use
  'import { env } from "cloudflare:workers"' instead.` — at *runtime*, so the
  build passes clean and every request 500s. Found 2026-09-02 writing
  `src/middleware.ts`; only `wrangler dev` catches it.
- **Astro serves the bare mount path with a 200, not a redirect.** With
  `MOUNT_PATH=/draft`, a request to `/draft` returns the homepage, and since
  every link here is relative the browser then resolves `css/styles.css` against
  `/` and 404s the lot. `/draft/` is fine. So the "relative URLs work at the root
  or under a subpath with no rewriting" note below is true for pages and **false
  for the bare mount path** — something must redirect `/draft` → `/draft/`.
  `src/middleware.ts` now does. Verified 2026-09-02.
- **Static assets bypass Astro middleware entirely.** Cloudflare's asset layer
  serves `public/` before the worker runs, so anything in `css/`, `js/`,
  `images/`, `videos/` and `graphics/` is reachable without authentication even
  when the pages are gated. Verified 2026-09-02.
- **`output: "static"` is unsupported.** Webflow Cloud runs an Edge runtime and
  requires `@astrojs/cloudflare` with `output: "server"`. Every page therefore
  sets `export const prerender = true` to still get build-time static HTML.
- Custom code panels cap at 50,000 chars. `css/styles.css` is ~49.9 KB — it
  would fit today and break on the next edit. It must stay an external file.
- Worker bundle caps at 10 MB. Ours is ~600 KB. Not a concern.

## What exists

```
webflow-app/
  astro.config.mjs      base from MOUNT_PATH (default "/"), output: "server",
                        adapter: cloudflare, build.format: "file", compressHTML
  webflow.json          { "cloud": { "framework": "astro" } }
  wrangler.json         compatibility_date 2025-04-15, nodejs_compat,
                        ASSETS binding -> ./dist/client
  package.json          dev / build / preview / deploy scripts
  README.md             operational runbook
  .gitignore            dist, node_modules, .astro, public/videos, .dev.vars, .wrangler
  src/
    layouts/Base.astro  shared head + header + footer; props title, description,
                        active; CSS_VERSION / JS_VERSION constants
    pages/*.astro       index, maritime, communications, sensing, about, contact
    videoBase.ts        VIDEO_BASE from PUBLIC_VIDEO_BASE, default "videos"
  public/               css, js (incl. js/vendor/three.min.js), images, fonts,
                        graphics, data — 5.0 MB total, served verbatim
  scripts/upload-videos.sh
```

Toolchain as installed: node v22.20.0, npm 10.9.3, astro 7.1.6,
@astrojs/cloudflare 14.1.7, wrangler 4.118.0.

## Design choices — do not undo these

- **All internal links and asset paths stay relative** (`about.html`,
  `css/styles.css`). This is what makes one build work at the domain root *or*
  under a subpath mount with no rewriting. Astro `base` comes from `MOUNT_PATH`
  and must match the Webflow Cloud mount exactly or everything 404s.
- **`build.format: "file"`** so pages emit as `about.html`, preserving the
  original relative-link semantics.
- Astro still canonicalizes to extensionless URLs: `/about.html` → **307** →
  `/about`. Links keep working in one hop; assets are direct 200s. Attempting
  `html_handling: "none"` in `wrangler.json` had **no effect** — the redirect
  comes from Astro's router, not Cloudflare's asset layer. That config was
  reverted rather than left as dead settings.
- **`src/pages/*.astro` are now the deployed source.** The root-level `*.html`
  files are stale duplicates — see Remaining work.

## How pages were generated

`src/pages/*.astro` were produced mechanically from the root `*.html` files:
body content lifted verbatim between `</header>` (line 27 on every page) and
`<footer`, wrapped in `Base.astro`. Safe because the head/header/footer were
byte-identical across all six pages and **no page contains `{` or `}`**, which
would otherwise be parsed as Astro expressions (checked before converting).
The 14 `videos/*.mp4` references (12 distinct files) were templated onto
`VIDEO_BASE`.

Generator script: `scratchpad/gen-pages.mjs` (session scratchpad, disposable —
the `.astro` files are the artifact now).

## Verification performed (2026-07-31)

- `astro build` prerenders all 6 pages to static HTML. `dist/client` 4.8 MB.
- Crawled all 6 pages **plus the 4 iframe'd `graphics/*.html` documents** on the
  dev server: **67 distinct local asset references, all resolving**, zero
  console errors. (Script: `scratchpad/check-assets.mjs`.)
- Ran the real Workers runtime via `wrangler dev` and clicked nav: landed on
  `/maritime`, correct title, CSS applied, logo loaded, active nav correct,
  `main.js` executing.
- Hero video confirmed actually playing — `readyState` 4, `paused` false,
  `currentTime` advancing past 30s.
- LinkedIn feed rendering at full 42,779 chars.
- Proved the R2 indirection end-to-end by building with
  `PUBLIC_VIDEO_BASE=http://localhost:4173/videos`: all 14 refs rewrote to
  absolute URLs, all 12 files served 200.
- `scripts/upload-videos.sh <bucket> --dry-run` lists the correct 12 files.

### One real bug caught by verification

`js/vendor/three.min.js` (592 KB) was initially dropped as unreferenced — a grep
over root `*.html` and `main.js` found nothing. The Workers run 404'd it: all
four `graphics/*.html` documents load it via `../js/vendor/three.min.js`.
Restored and re-verified. **Lesson: `graphics/*.html` are standalone documents
with their own dependencies; include them in any asset sweep.**

## Remaining work

1. **Upload video to R2** (needs the user's Cloudflare credentials):
   ```
   cd webflow-app && ./scripts/upload-videos.sh <bucket> --dry-run
   ./scripts/upload-videos.sh <bucket>
   ```
   12 referenced files, 143.1 MB. The script derives its list from
   `src/pages/*.astro` so it can't drift, and skips ~39 MB of unreferenced clips.
2. **Enable a public URL for the bucket** — ideally a custom domain such as
   `media.saltenna.com` — then set `PUBLIC_VIDEO_BASE=https://<domain>/videos`
   both locally and in the Webflow Cloud environment.
3. **Deploy** (needs the user's Webflow site id / auth):
   `npx webflow cloud init -f astro -m / -s <site-id>` then
   `npx webflow cloud deploy`. GitHub is optional — CLI deploys the local dir.
   This project is **not a git repo**, so deploy-on-push would need `git init`
   plus a GitHub remote first.
4. **Decide the mount path.** `/` replaces the live site; a subpath is safer for
   staging. Changing it later means rebuild + redeploy (baked in at build time).
5. **Delete the root `*.html` files** once the Astro pages are confirmed good,
   so the two copies can't drift. Same for `css/` and `js/` at root, which are
   now duplicated into `webflow-app/public/`. **Ask the user before deleting.**
6. Video compression still open from Jul 30 — `hero-montage.mp4` (33 MB) and
   `maritime-hero.mp4` (34 MB). Less urgent now that they're on R2 rather than
   in the deploy, but they're still the page-weight story on first load.

## Cutover caution

`saltenna.com` currently serves a **live Webflow Designer site** (Webflow's own
CDN, `cdn.prod.website-files.com` — Webflow-hosted). It is unrelated to these
files and to `wordpress-theme/`. When a Cloud app route and a Designer page match
the same path, **the Cloud app wins**, so mounting at `/` shadows the old site
immediately. Deploy to a staging environment and verify there first.

## Environment gotchas added this session

- **The SociableKIT LinkedIn widget cannot render on `localhost`.** Its
  `widget.js` special-cases hostnames `localhost` and `127.0.0.1` and rewrites
  its own asset base to your dev server, so its CSS 404s and the widget hangs on
  its spinner forever — even though the post data fetches fine (check
  `window.sk_embed_data[embedId]`). **Browse via `http://app.localhost:PORT`
  instead**; any hostname that isn't literally `localhost`/`127.0.0.1` takes the
  production path. `.claude/launch.json` is configured this way.
- The embedded preview pane reports `document.visibilityState === "hidden"`, so
  `IntersectionObserver` never fires and `.reveal` elements never gain
  `.visible`. Force the class manually to verify reveal CSS.
- `.claude/launch.json` gained two entries: `saltenna-astro` (astro dev, 4321,
  opens at `http://app.localhost:4321`) and `saltenna-workers-preview`
  (`npm run preview` → wrangler, 8787).
- macOS ships bash 3.2 — no `mapfile`, and no `timeout` binary.
