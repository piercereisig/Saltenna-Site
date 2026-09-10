# Deploying to Cloudflare

> ## ⚠️ CORRECTION — 2026-09-10: it is **Pages**, not Workers
>
> The site is live at **https://saltenna-site.pages.dev** — Cloudflare **Pages**,
> not Workers. This file was written assuming `wrangler deploy` (Workers) because
> `wrangler.json` was already set up that way and nobody had confirmed the
> target. `wrangler deploy` is the WRONG command here.
>
> If Pages is connected to the GitHub repo, **`git push` deploys**. Otherwise it
> is `wrangler pages deploy` or a dashboard upload. Confirm which before relying
> on either.
>
> **Two live problems found on that deployment, 2026-09-10:**
>
> 1. **It is fully public — no password at all.** `/`, `/maritime` and
>    `/products` all return 200 with no credentials, and the invented Ibex copy
>    (`AN/PRC-163`) is publicly visible. The Basic-auth middleware in
>    `src/middleware.ts` is not gating it. Either the deployed build predates
>    `prerender = false`, or middleware is not running on this Pages setup.
> 2. **Every video is broken.** `/videos/maritime-hero.mp4` returns **200 with
>    `Content-Type: text/html`** — Pages is serving the fallback page, not an
>    MP4. The deployed HTML still uses relative `src="videos/…"` paths and the
>    files are not there, so every hero silently shows its poster still. This is
>    exactly the failure mode `src/videoBase.ts` was changed to prevent; a fresh
>    build now hardcodes the R2 base, so the next deploy fixes it.
>
> The deployment also predates the copy review — it contains no "Plasmonix" and
> still shows the removed "Along the seabed" band. It needs redeploying.

## The original Workers write-up

_2026-09-10. Replaces the Webflow Cloud path in `WEBFLOW_CLOUD.md`._

## Why this was barely a migration

The app was always built with **`@astrojs/cloudflare`** — Cloudflare's own
adapter. Webflow Cloud ran Cloudflare Workers underneath, so it was only ever a
middleman. `wrangler.json` was already correct. Verified with
`wrangler deploy --dry-run`: 23 modules / 442 KiB worker, 107 static assets,
bindings `ASSETS`, `SESSION` (KV), `IMAGES`.

## What changed

| | Before | Now |
| --- | --- | --- |
| Deploy | `webflow cloud deploy` | `wrangler deploy` (`npm run deploy`) |
| `webflow.json` | required | moved to `share/webflow-cloud-legacy/` |
| `@webflow/webflow-cli` | dependency | removed |
| `MOUNT_PATH` | had to match the Webflow mount or everything 404s | `/` — the whole class of bug is gone |
| Video base | `PUBLIC_VIDEO_BASE` env var, easy to forget | **defaults to R2 in `src/videoBase.ts`** |

## ⚠️ Video is bundled again, and that dictates HOW you deploy (2026-09-10)

**The r2.dev URL is blocked on company machines.** `pub-*.r2.dev` is
Cloudflare's SHARED development domain; corporate security tools (Zscaler,
Umbrella, Netskope, Defender SmartScreen) blocklist it wholesale because malware
is commonly hosted there. The videos were reported as malicious on the user's
boss's computer. **A second bucket does not help** — `saltenna-media2` would get
another URL on the same domain and be flagged identically. That was tried.

Fix in place: the 11 referenced videos are copied into
`webflow-app/public/videos/` and `src/videoBase.ts` defaults to the relative
path, so they are served from the SITE's own origin. No third-party host, no DNS
change. `dist/client` is ~145 MB; every file is under the 25 MiB per-asset cap
(largest 23.0 MB). These are the re-encoded copies — the full-quality originals
stay in `videos/` and on R2.

**CONSEQUENCE — deploys must be DIRECT UPLOADS, not git-connected.**
`webflow-app/public/videos/` is gitignored (git stores every version of a binary
forever). So a Pages build from GitHub would produce a site with no video. Deploy
by uploading the built folder, which carries the files from local disk:

```bash
cd webflow-app && npx astro build
npx wrangler pages deploy dist/client --project-name=<project>
```

If you ever want git-connected deploys instead, the videos have to be committed
(~122 MB into history, permanently) or moved to `media.saltenna.com`.

**The proper long-term fix** is `PUBLIC_VIDEO_BASE=https://media.saltenna.com/videos`
with that subdomain pointed at R2 — your own domain carries your own reputation,
video leaves the bundle, and full quality returns. It needs saltenna.com's
nameservers moved from **GoDaddy** (`ns39/ns40.domaincontrol.com`) to Cloudflare
first, which is a planned change with whoever owns the domain.

## Account split — read before deploying

Verified 2026-09-10: `wrangler pages project list` returns NOTHING and
`saltenna-site` reports "Project not found" for the account wrangler is logged
into (`Pierce.reisig@saltenna.com's Account`, `9566baba…`) — **yet the site is
live at saltenna-site.pages.dev.** So the Pages project sits in a DIFFERENT
Cloudflare account from the R2 bucket.

Also confirmed: **pushing to GitHub does not deploy.** After a push containing
~130 copy edits, the live site still served `styles.css?v=92` / `main.js?v=63`,
i.e. the state from before any of that work. Pages is not connected to the repo.

To deploy to the existing URL you must be authenticated as the account that owns
that project (`npx wrangler logout && npx wrangler login`). Deploying from the
current account would create a separate project on a different URL.

## Deploy

```bash
cd webflow-app
npm run deploy          # = wrangler deploy
```

First deploy asks to create the `SESSION` KV namespace and may ask about a
`workers.dev` subdomain — accept both. The site lands on
`saltenna-site.<subdomain>.workers.dev`.

`npm run preview` (`astro build && wrangler dev`) runs the real Workers runtime
locally and is the honest pre-deploy check.

## Video: no env var required any more

`src/videoBase.ts` resolves in this order:

1. `PUBLIC_VIDEO_BASE` if set **at build time** — note this is
   `import.meta.env`, a build-time inline. **Setting it as a Worker runtime
   variable in the Cloudflare dashboard does nothing.** That misunderstanding
   would render every hero as a silent poster still.
2. `astro dev` → `"videos"`, served from local disk by `devVideos()`. Dev stays
   offline-capable.
3. Any production build → the R2 bucket, hardcoded.

Verified: a plain `npx astro build` with no variables set compiles
`VIDEO_BASE = "https://pub-555801c7c2ae4ca7a0c96f1fac3f953d.r2.dev/videos"`,
ships 0 MP4s, and dist/client is 20 MB.

## Open decisions

1. **Workers vs Pages.** Workers is configured and is Cloudflare's current
   recommendation (Pages is being folded into Workers). Nobody has confirmed
   which was intended — worth a sentence from whoever made the call.
2. **saltenna.com DNS.** If it comes to Cloudflare:
   - `media.saltenna.com` replaces the `pub-*.r2.dev` URL, which Cloudflare
     rate-limits and advises against for production. One-line change in
     `videoBase.ts`.
   - **Cloudflare Access** can replace the Basic-auth middleware — real
     email/SSO login, free to 50 users. That would let every page go back to
     `prerender = true` (currently `false` purely so the middleware runs),
     making the site static again: faster, cheaper, and the simple
     static-folder draft workflow starts working again.
   - The live saltenna.com cutover becomes a Cloudflare-side routing decision.
3. **Account ownership.** wrangler is authenticated to
   *"Pierce.reisig@saltenna.com's Account"* — an individual account, not a
   company org. Same issue as the GitHub repo sitting under a personal login.
   Worth moving both to company-owned before launch.

## Still true from the Webflow era

- **25 MiB per static asset** — a Workers limit all along. Still why video is on R2.
- `output: "server"` + the Cloudflare adapter.
- All internal links and asset paths are **relative**; keep them that way.
