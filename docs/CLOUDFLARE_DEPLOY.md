# Deploying to Cloudflare Workers

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
