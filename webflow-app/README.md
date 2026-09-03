# Saltenna site — Webflow Cloud (Astro)

The hand-built static site, wrapped in the minimum Astro needed to deploy on
Webflow Cloud. The markup, CSS and JS are the originals; only the page chrome
was factored into a layout and the video URLs made configurable.

## Layout

```
webflow-app/
  astro.config.mjs      base = MOUNT_PATH, output: "server", build.format: "file"
  webflow.json          { "cloud": { "framework": "astro" } }
  wrangler.json         edge runtime + ASSETS binding
  src/
    layouts/Base.astro  shared head/header/footer (was byte-identical on all 6 pages)
    pages/*.astro       the 6 pages; body content lifted verbatim
    videoBase.ts        PUBLIC_VIDEO_BASE indirection for the MP4s
  public/               css, js, images, fonts, graphics, data (served as-is)
  scripts/upload-videos.sh
```

`src/pages/*.astro` were generated from the root-level `*.html` files. **Those
root `.html` files are no longer the deployed source** — edit the `.astro` pages
from here on, or the two copies will drift.

## Local development

```bash
npm install
npm run dev      # astro dev  — fast, no edge runtime
npm run preview  # astro build && wrangler dev — real Workers runtime
```

Two things to know when checking it locally:

- **Browse via `http://app.localhost:4321`, not `localhost:4321`.** The
  SociableKIT LinkedIn widget special-cases the hostnames `localhost` and
  `127.0.0.1` and repoints its own assets at your dev server, so the feed hangs
  on its spinner forever. Any other hostname works. `.claude/launch.json` is
  already set up this way.
- **`astro dev` serves the videos itself**: a dev-only Vite middleware in
  `astro.config.mjs` maps `/videos` onto `../videos` (with Range support, which
  Safari requires), so hero videos play with no env setup. It is `apply: "serve"`
  only — nothing enters the build. `npm run preview` (wrangler) does NOT get
  this middleware; there the videos 404 unless you set `PUBLIC_VIDEO_BASE`
  (e.g. to a running dev server's `/videos`). Poster images always render.

## Video: two options

### A. In the bundle (staging / draft preview) — no Cloudflare account

Since 2026-09-02 the twelve referenced clips are trimmed and re-encoded to
**77.4 MB total, every file under 25 MiB**, and live in `public/videos/`. With
`PUBLIC_VIDEO_BASE` unset, `videoBase.ts` falls back to the relative path
`videos`, so they ship inside the deploy and no R2 bucket is needed.

Measured 2026-09-02: `dist/client` without video gzips to 11.10 MB and the
worker bundle to 0.21 MB, so a full deploy is **~88.7 MB compressed against
Webflow Cloud's 100 MB limit** — about 11 MB of headroom. Adding video back at
full length, or restoring the original encodes, blows that budget. See
`docs/PREVIEW-HOSTING.md` for what was trimmed.

### B. Cloudflare R2 (production)

The 13 referenced MP4s total ~146 MB and **cannot** ship in the deployment:
Cloudflare Workers caps a single static asset at **25 MiB**, and `hero-montage.mp4`
(33 MB) and `maritime-hero.mp4` (34 MB) both exceed it. (Webflow's own limits page
advertises "videos: 1 GB per file" — that is not what the runtime enforces; the
build fails with `Asset too large` at 25 MiB. Verified locally.)

They also can't go in Webflow's native asset pipeline at all: the Assets panel
rejects `.mp4`, and the Background Video element caps at 30 MB per file and
force-transcodes to 720p on every plan.

So they live in R2:

```bash
# once, with wrangler authenticated for R2 write
./scripts/upload-videos.sh <bucket-name> --dry-run   # check first
./scripts/upload-videos.sh <bucket-name>
```

Then enable a public URL for the bucket (ideally a custom domain such as
`media.saltenna.com`) and build with:

```bash
PUBLIC_VIDEO_BASE=https://media.saltenna.com/videos npm run build
```

Set the same variable in the Webflow Cloud environment so deploys pick it up.
The script derives its file list from `src/pages/*.astro`, so it stays in sync
with the markup automatically; it skips the ~39 MB of unreferenced clips in
`../videos/`.

## Deploying

```bash
npx webflow cloud init -f astro -m / -s <site-id>   # first time only
npx webflow cloud deploy
```

GitHub is optional — `webflow cloud deploy` pushes the local directory. Connect
a repo instead if you want deploy-on-push.

### Mount path

`astro.config.mjs` reads `base` from `MOUNT_PATH` (default `/`). It **must**
match the mount path configured in Webflow Cloud or every route and asset 404s.
Change the mount in the dashboard, then rebuild and redeploy — it's baked in at
build time.

All internal links and asset paths are deliberately **relative**
(`about.html`, `css/styles.css`), so the same build works at the domain root or
under a subpath without rewriting. Keep them relative.

### URLs

Astro's canonical URLs are extensionless: a request for `/about.html`
307-redirects to `/about`. Internal links still say `about.html` and work fine
(one redirect hop); assets are served directly with no redirect.

### saltenna.com cutover

`saltenna.com` currently serves a **Webflow (Designer/Webflow-hosted) site** —
it is unrelated to these files. When a Cloud app route and a Designer page match
the same path, the Cloud app wins, so mounting this app at `/` shadows the old
site. Deploy to a staging environment and verify there before mounting at root.

## Verification note

Scroll-reveal animations will look broken in an embedded preview panel: it
reports `document.visibilityState === "hidden"`, so `IntersectionObserver` never
fires and `.reveal` elements never get `.visible`. That's the panel, not the
site. Check animations in a real browser window, or force the class manually.
