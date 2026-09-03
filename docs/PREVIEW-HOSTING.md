# Publishing a password-protected draft preview

_Written 2026-08-25; **Option D chosen and built 2026-09-02** — skip to it for
the live plan. Options A–C are kept as working fallbacks._

_Originally written 2026-08-25. Companion to `WEBFLOW_CLOUD.md`, which covers the real
production deploy. This is the "let people look at it" path — deliberately
separate from, and harmless to, the live saltenna.com site._

## The one fact that makes this easy

Every page sets `prerender = true`, so `webflow-app/dist/client` is **plain
static HTML/CSS/JS**. No Node, no Workers runtime, no Webflow Cloud is needed
to *show* the site to somebody. Verified 2026-08-25 by serving it with
`python3 -m http.server`: all seven pages, `styles.css`, `main.js`, the five 3D
viewers and all twelve videos returned 200.

The build also contains **zero root-absolute paths** (`href="/…"` / `src="/…"`
— checked, none). So the folder works at a domain root *or* in a subdirectory
(`https://internal.example.com/saltenna-draft/`) with no rebuild.

## The ready-to-upload folder

`~/Saltenna/preview-deploy/` — 141 MB, 106 files. Assembled 2026-08-25 from
`webflow-app/dist/client` (which was current: no file under `src/` was newer)
plus the twelve referenced MP4s copied into `videos/`, which is exactly where
`VIDEO_BASE` points when `PUBLIC_VIDEO_BASE` is unset (`src/videoBase.ts`
defaults to the relative string `"videos"`). No R2, no env var, no rebuild.

**Two videos were re-encoded to fit the platform cap** (see next section):

| File | Was | Now | Encode |
| --- | --- | --- | --- |
| `hero-montage.mp4` | 34.1 MB, 4.25 Mbps | 24.1 MB | x264 `-preset fast -b:v 3050k -maxrate 3800k` |
| `maritime-hero.mp4` | 35.6 MB, 13.3 Mbps | 23.8 MB | x264 `-preset slow -b:v 8800k -maxrate 11000k` |

Both sit just under the 25 MiB cap (~2 MB of margin each) — the bitrates were
raised to spend that headroom after a first pass at 21.3/19.0 MB measured a
weaker Y-SSIM on the surf footage. Measured against the originals over a 5 s
window: hero-montage **Y-SSIM 0.934**, maritime-hero **Y-SSIM 0.909** — the
latter is the harder clip (fine spray detail, and it was a 13.3 Mbps source),
and it plays under a scrim behind hero text.

Both keep 1920×1080, their exact frame counts and durations, and are `-an`
(the site mutes them anyway) with `+faststart`. **The originals in
`~/Saltenna/videos/` were not touched** — `preview-deploy/videos/` holds the
re-encodes. This closes the "flagged for re-encode back in July" loose end in
`HANDOFF.md` for the preview at least; whether to adopt them upstream (and cut
the R2 bill) is a separate call.

### To regenerate the folder after a code change

```sh
cd ~/Saltenna/webflow-app && npx astro build      # from webflow-app/, never the repo root
rsync -a --delete dist/client/ ~/Saltenna/preview-deploy/ \
  --exclude videos --exclude _worker.js           # keep the videos and the gate
```

## Option A — Cloudflare Pages, password-gated (built, not chosen)

Free, gives a sendable `https://…pages.dev` URL, and it is the same Cloudflare
account the production R2 videos are headed to, so nothing here is throwaway.

**Why the re-encode was necessary:** the maximum size of a single Cloudflare
Pages asset is **25 MiB** — the same real cap that sent video to R2 in the
production plan. Two files were over it. Everything in `preview-deploy/` is now
under it, and 106 files is nowhere near the 20,000-file free-plan limit, so the
whole site *including video* uploads in one shot with no R2 bucket to set up.

`preview-deploy/_worker.js` is the gate — a Pages
[advanced-mode](https://developers.cloudflare.com/pages/functions/advanced-mode/)
worker that challenges every request with HTTP Basic auth and then hands off to
`env.ASSETS.fetch()`. One username and password to email to the company. It
also stamps `X-Robots-Tag: noindex, nofollow` on every response so an
unfinished draft cannot be indexed. The password is read from a **secret**, so
it is never in the deployed source; if the secret is missing the site returns
503 rather than falling open.

```sh
cd ~/Saltenna/preview-deploy
npx wrangler login
npx wrangler pages project create saltenna-draft --production-branch main
npx wrangler pages secret put PREVIEW_PASSWORD --project-name saltenna-draft
# optional, defaults to "saltenna":
# npx wrangler pages secret put PREVIEW_USER --project-name saltenna-draft
npx wrangler pages deploy . --project-name saltenna-draft --commit-dirty true
```

Redeploy after any change by re-running the last line. Secrets persist.

**A stricter alternative to Basic auth:** Cloudflare Access can gate the same
project on `@saltenna.com` email addresses (one-time PIN, no shared password to
leak). It is the better choice if the draft is going to more than a handful of
people. Delete `_worker.js` if you switch, so the two gates do not stack.

## Option B — the company's own web server

Hand IT the `preview-deploy/` folder. What to tell them:

> It is a folder of static files — HTML, CSS, JS, images and MP4s. No PHP, no
> Node, no database, no build step. Point a vhost or a subdirectory at it and
> it works. Please serve `.mp4` with `Content-Type: video/mp4` and support
> HTTP Range requests (Safari refuses to play video from a server that ignores
> them — Apache, nginx and IIS all do this by default for static files).
> `.glb`/`.gltf` are not present, so no exotic MIME types are needed. It can
> live in a subdirectory; nothing depends on being at the domain root.

`_worker.js` is Cloudflare-specific and **does nothing on a normal web
server** — it will not password-protect anything there. Delete it and use the
server's own auth (`.htaccess`, an nginx `auth_basic`, or IIS authentication).

## Option C — quick look off your Mac, no infrastructure

```sh
cd ~/Saltenna/preview-deploy && python3 -m http.server 4173
```

Then share `http://<your-LAN-ip>:4173/` with anyone on the office network or
VPN. Zero setup, no password, and only up while your Mac is awake. Fine for
"come look at this now", not for "here's a link, get back to me this week".

Note the environment trap from `HANDOFF.md`: **the LinkedIn newsroom widget
refuses to render on `localhost`** — SociableKIT's `widget.js` special-cases the
hostname. Browse via `http://app.localhost:4173` or the LAN IP instead.

## Option D — Webflow Cloud, no Cloudflare account (CHOSEN 2026-09-02)

"Webflow" means two products here, and only one of them can do this.

**Classic Webflow hosting: no, and never.** Webflow has no raw-HTML import — it
exports static files, it never takes them in. Pages must be built in the
Designer. Settled 2026-07-31; top row of the decision table in
`WEBFLOW_CLOUD.md`. Its Assets panel also rejects `.mp4` outright.

**Webflow Cloud: yes** — and as of 2026-09-02 it works with **no Cloudflare
account and no R2 bucket**, which was the blocker. Three things had to change.

### 1. Video, into the bundle (was: R2)

A Webflow Cloud deployment caps at **100 MB compressed** — worker bundle plus
static assets. The twelve clips were 122 MB after the first re-encode pass;
gzip does nothing to MP4, so that plus the 11.1 MB site failed the cap. They are
now **77.4 MB total**, in `webflow-app/public/videos/`, every file under the
25 MiB per-asset cap. `videoBase.ts` already falls back to the relative path
`videos` when `PUBLIC_VIDEO_BASE` is unset, so nothing in the markup changed.

How the 45 MB came off, cheapest first:

| Clip | Was | Now | How |
| --- | --- | --- | --- |
| `maritime-oil-gas` | 60.0s, 7.1 MB | 20.1s, 3.07 MB | trimmed, **stream copy** |
| `maritime-uuv-swarming` | 57.5s, 14.5 MB | 20.1s, 5.26 MB | trimmed, **stream copy** |
| `maritime-diver-to-diver` | 40.0s, 7.7 MB | 20.1s, 3.31 MB | trimmed, **stream copy** |
| `maritime-seabed` | 35.0s, 6.7 MB | 20.1s, 4.21 MB | trimmed, **stream copy** |
| `maritime-usv-comms` | 35.0s, 8.3 MB | 20.1s, 5.33 MB | trimmed, **stream copy** |
| `maritime-hero` | 8907 kbps, 35.6 MB | 5500 kbps, 14.23 MB | re-encode, Y-SSIM 0.848 |
| `band-container-port` | 6357 kbps, 15.2 MB | 3000 kbps, 7.20 MB | re-encode, Y-SSIM 0.900 |
| `hero-montage` | 4252 kbps, 34.1 MB | 2350 kbps, 17.71 MB | re-encode, Y-SSIM 0.944 |

The five trims are `-c copy`: **no re-encode, no quality loss at all**, they are
literally the first 20 seconds of the original bytes. They were 35–60 s clips
looping behind scroll panels, so the only thing lost is how long before the loop
repeats. The three re-encodes are the ones that were wildly over-provisioned for
background video. `maritime-hero` is the weakest at 0.848 — 4K-sourced surf
spray is the hardest thing here to compress, and it plays under a scrim behind
hero text. Bitrates were chosen to spend the budget, not to hit a number: an
earlier pass at 3500 kbps measured 0.781 and looked it.

The four untouched clips (`comms-hero-fleet`, `band-drift-ice`,
`sensing-hero-forest`, `band-seabed-divers`) were already lean. **Originals in
`~/Saltenna/videos/` are untouched** — every one of these is reproducible from
them, and the exact commands are in this table.

### 2. A password, via `src/middleware.ts`

Webflow Cloud environments are public: "anyone with access to your deployed
mount path can view the environment." `webflow-app/src/middleware.ts` adds HTTP
Basic auth, reading `PREVIEW_PASSWORD` (and optional `PREVIEW_USER`, default
`saltenna`) from the environment. If the secret is missing it returns 503 rather
than falling open.

**This cost the prerendering.** Astro runs middleware at *build* time for
`prerender = true` routes, so all seven pages are now `prerender = false` and
render per request. Reverting is flipping those flags and deleting the
middleware. The worker grew from ~600 KB to 2.1 MB uncompressed as a result —
still far under the 10 MB cap.

**Two honest limits on this gate:**

- **Static assets are not gated.** Verified: `/draft/css/styles.css`,
  `/draft/images/logo-white.png` and `/draft/videos/hero-montage.mp4` all return
  200 with no credentials. Cloudflare's asset layer serves them before the
  worker sees them. There is no directory listing, so it is obscurity, not
  access control — but note that includes the standalone `graphics/*.html`
  viewer documents, which carry the Ibex placeholder SPECS text.
- **Basic auth is a shared password.** Fine for "here's the draft"; it is not
  per-person access and cannot be revoked for one viewer.

### 3. A `/draft` mount, and the bug it exposed

Mounting at `/` shadows the live saltenna.com Designer site immediately (the
Cloud app wins a path collision), so staging must be a subpath.

**Astro serves the bare mount path with a 200 instead of redirecting**, and
every link in this site is relative by design. At `/draft` the browser resolves
`css/styles.css` against `/` and asks for `/css/styles.css` — which does not
exist. Result: whoever is sent the obvious link gets an unstyled, video-less
page, while `/draft/` works fine. This contradicts the "relative URLs make one
build work at the root or under a subpath with no rewriting" note in
`WEBFLOW_CLOUD.md` — true for pages, false for the bare mount path.

The middleware now 308-redirects `/draft` → `/draft/`. Verified both ways.

### Verification performed (2026-09-02, real Workers runtime via `wrangler dev`)

- Built at `MOUNT_PATH=/draft`; assets nest correctly under `dist/client/draft/`.
- Gate: no credentials, wrong password and wrong username all **401**; correct
  credentials **200** on all seven pages; missing secret **503**.
- `WWW-Authenticate` challenge and `X-Robots-Tag: noindex, nofollow` both present.
- Bare `/draft` **308** → `/draft/` → 200.
- **Crawled all 7 pages plus all 7 `graphics/*.html` documents: 70 distinct
  local references, all resolving.** (The `graphics/` sweep is deliberate — see
  the three.js lesson in `WEBFLOW_CLOUD.md`.)
- `graphics/*.html` 307 to their extensionless URL and resolve in one hop, as
  the existing docs describe. Iframes follow it.
- Size: `dist/client` without video 11.10 MB gz + worker 0.21 MB gz + video
  77.4 MB = **~88.7 MB against the 100 MB cap**.

### One bug this caught

The first middleware read secrets from `Astro.locals.runtime.env`. Under the
real runtime every request 500'd: **"Astro.locals.runtime.env has been removed
in Astro v6. Use `import { env } from 'cloudflare:workers'` instead."** Fixed.
Worth knowing before writing any other server-side code on this stack.

### Deploy runbook

```sh
cd ~/Saltenna/webflow-app
npm install

# build at the staging mount — MOUNT_PATH must match the -m flag exactly
MOUNT_PATH=/draft npx astro build

npx webflow cloud init -f astro -m /draft -s <site-id>   # first time only
npx webflow cloud deploy
```

Then in the Webflow Cloud dashboard set **`PREVIEW_PASSWORD` as a SECRET** on
that environment (a plain variable is visible to anyone with access to the
Webflow site) and redeploy. Send people **`https://saltenna.com/draft/`** with
the username `saltenna` and that password.

`webflow cloud deploy` pushes the local directory — GitHub is not required,
which matters because this project is not a git repo.

**Do not run `npx astro build` from the repo root** — npx resolves a stale
cached astro there and dies with a rolldown error. And building while
`astro dev` is running kills the dev server; both write `dist/`.

### What this is not

This is a **staging** deploy. Production still wants prerendering back on, video
on R2 (page weight, and the 100 MB cap leaves no room to grow), and the mount
decision made deliberately. Nothing here forecloses that — it is three reversible
changes.

## Fix before anyone outside the project sees it

1. **`maritime.html` has a "Learn More" link pointing at a `claude.ai`
   artifact URL** (`https://claude.ai/artifacts/latest/67483ee6-…`, on the USV
   panel). It will 404 for everyone else and it looks like a leak. The other
   four `.post-more` links are still `href="#"`.
2. **All Ibex copy is invented** and flagged ⚠️ in `products.ts` — name, claim
   and all four spec chips, asserting an AN/PRC-163 fit, SMA and 250 mm that
   cannot be substantiated. Per `HANDOFF.md` it "must not go public as is".
   A password gate is not the same as it not being public.
3. **The Remora contradiction**: the site badge says "Customer engagement
   ready" while the product's own viewer readout calls it a "Concept study …
   not a validated design". Both are visible on the same page.
4. **"The Saltenna Waveform" is a placeholder name**, and D2D's "Prototype"
   status was assumed, not taken from its spec sheet.
5. The contact form is a `mailto:` handoff — it will open the reader's mail
   client, not submit anywhere.

## The LinkedIn widget on a real host

It loads `https://widgets.sociablekit.com` from the *viewer's* browser. On a
Cloudflare URL it should render normally (the localhost special-case does not
apply). On a locked-down internal network it may be blocked outbound — the rest
of the page degrades fine if it is.
