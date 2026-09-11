# Saltenna site — Cloudflare Pages (Astro)

The hand-built static site, wrapped in the minimum Astro needed to build and
deploy. The markup, CSS and JS are the originals; only the page chrome was
factored into a layout and the video URLs made configurable.

**Deploy target: Cloudflare Pages** (your own Cloudflare account). The build is
fully static (`output: "static"`) — plain HTML/CSS/JS, no server runtime. The
private preview is gated by **Cloudflare Access**, not by any in-app code.

## Layout

```
webflow-app/
  astro.config.mjs      output: "static", build.format: "file"; dev-only video server
  src/
    layouts/Base.astro  shared head/header/footer
    pages/*.astro       the 7 pages; body content lifted verbatim
    components/         ProductMedia.astro
    data/products.ts    products shown on products.astro
    videoBase.ts        PUBLIC_VIDEO_BASE indirection for the MP4s
  public/               css, js, images, fonts, graphics, data, _headers (served as-is)
  scripts/upload-videos.sh
```

## Local development

**First: `cp .env.example .env`.** The Basic-auth gate in `src/middleware.ts`
fails closed — with no `PREVIEW_PASSWORD` set, every page returns 503 and the
dev server appears completely broken. `.env` is gitignored, so each clone needs
this once.

```bash
cp .env.example .env
npm install
npm run dev       # astro dev — fast
npm run build     # astro build — static output to dist/
npm run preview   # astro preview — serve the built dist/ locally
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
  only — nothing enters the build. Poster images always render regardless.

## Video: Cloudflare R2

The referenced MP4s total ~146 MB and are **not** committed (see `.gitignore`)
and do **not** ship in the deploy: Cloudflare caps a single static asset at
**25 MiB**, and several clips exceed that. They live in **R2**:

```bash
# once, with wrangler authenticated for R2 write
./scripts/upload-videos.sh <bucket-name> --dry-run   # check first
./scripts/upload-videos.sh <bucket-name>
```

Then attach a public custom domain to the bucket (e.g. `media.saltenna.com`) and
build with:

```bash
PUBLIC_VIDEO_BASE=https://media.saltenna.com/videos npm run build
```

Set `PUBLIC_VIDEO_BASE` as a **build-time environment variable in the Cloudflare
Pages project** so deploys pick it up. The upload script derives its file list
from `src/pages/*.astro`, so it stays in sync with the markup automatically.

## Deploying to Cloudflare Pages

**Recommended — git-connected (deploy on push):** in the Cloudflare dashboard,
create a Pages project connected to this repo with:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `webflow-app`
- **Environment variables:** `PUBLIC_VIDEO_BASE` (see above)

Every push builds and deploys; pull requests get their own preview URL.

**Manual (from a local build):**

```bash
npm run build
npm run deploy    # wrangler pages deploy dist
```

### Response headers

`public/_headers` sets the site's security headers (CSP, HSTS, etc.). Cloudflare
Pages honors this file natively — no extra configuration. After a deploy, verify
with:

```bash
curl -sI https://<host>/ | grep -iE 'content-security|x-content-type|referrer|permissions|strict-transport|x-frame'
```

### Private preview gate

Gate the preview deployment (e.g. `new.saltenna.com`) with **Cloudflare Access**
(Zero Trust → Access → Applications): restrict to approved emails. This runs at
the network layer, so it also protects images and video, and needs no app code.

### Links

All internal links and asset paths are deliberately **relative**
(`about.html`, `css/styles.css`) and `build.format: "file"` emits `about.html`
(not `about/index.html`), so the links resolve directly. Keep them relative.

### saltenna.com cutover

`saltenna.com` currently serves the old **Webflow** site (a prototype of this
build also runs on Netlify). Cut over by pointing DNS at the Cloudflare Pages
deployment once the preview is signed off — see the Phase 1 launch plan. Keep the
old site reachable (e.g. `orig.saltenna.com`) as a rollback until retired.

## Verification note

Scroll-reveal animations will look broken in an embedded preview panel: it
reports `document.visibilityState === "hidden"`, so `IntersectionObserver` never
fires and `.reveal` elements never get `.visible`. That's the panel, not the
site. Check animations in a real browser window.
