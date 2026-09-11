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

No `.env` is needed — the static build has no in-app auth gate (the preview is
gated by Cloudflare Access).

```bash
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

## Video

`VIDEO_BASE` (`src/videoBase.ts`) defaults to the relative path `videos`, so the
MP4s are served from the site's **own origin** — deliberately NOT from Cloudflare's
shared `*.r2.dev` domain, which corporate security tools blocklist wholesale
(video from there is flagged as malicious on company machines).

The clips are large (~122 MB) and are supplied out-of-band, not committed to this
repo. Two supported ways to provide them:

- **Now — git submodule** at `public/videos/` (a separate repo keeps this repo's
  history lean). After cloning: `git submodule update --init`. The clips ship
  inside the deploy and serve from `/videos/`.
- **Later (preferred) — R2 via your own domain** (no repo/deploy bloat, no r2.dev
  block). Once `saltenna.com`'s DNS is on Cloudflare, attach `media.saltenna.com`
  to the R2 bucket and build with `PUBLIC_VIDEO_BASE=https://media.saltenna.com/videos`
  as a **build** env var on the Pages project. `scripts/upload-videos.sh` uploads
  the clips; switching is one env var and dropping the submodule.

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
