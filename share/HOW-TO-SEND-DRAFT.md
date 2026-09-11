# Sending a draft of the site to your boss

_Prepared 2026-08-25. Deliverable: `share/saltenna-draft.zip` (130 MB, 128 files)._

This is a **complete, self-contained static site** — all 7 pages, all 4 interactive
3D viewers, and all 12 videos. It needs no Node, no Astro, no build step, and no
Webflow or Cloudflare credentials. Any static host can serve it.

**It does not touch saltenna.com.** The live Webflow Designer site is untouched;
this is a separate URL. The cutover risk in `docs/WEBFLOW_CLOUD.md` applies only
to the real Webflow Cloud deploy, not to this.

## Upload it (pick one — both are free and take about 2 minutes)

**Netlify Drop** — least friction, no CLI:
1. Go to https://app.netlify.com/drop
2. Drag `saltenna-draft.zip` onto the page (it accepts a zip directly).
3. You get a URL like `random-name-123.netlify.app`. Send that.
- Free account needed to keep the URL alive beyond a few hours.
- To restrict access you need a paid plan (password protection). See "Access" below.

**Cloudflare Pages** — better if you want access control on a free plan:
1. Cloudflare dashboard → Workers & Pages → Create → Pages → Upload assets.
2. Upload `saltenna-draft.zip`, name the project, Deploy.
3. Optionally add Cloudflare Access to require an email login (free tier covers
   a small number of users) — this is the cleanest way to keep it boss-only.

## Access, and why it matters here

The draft ships with `robots.txt` (`Disallow: /`) and `<meta name="robots"
content="noindex, nofollow">` on all 7 pages, so search engines will not index it.

That matters because **the Ibex product copy is still invented** — its name, claim
and all four spec chips (AN/PRC-163 fit, SMA, 250 mm) came from the 3D viewer's
placeholder block and cannot be substantiated. `noindex` keeps it out of search
results, but the URL itself is public to anyone who has the link. If that is a
problem, use Cloudflare Pages + Access rather than an open Netlify URL.

Other copy still provisional: D2D's "Prototype" status, the waveform tool's name
("The Saltenna Waveform"), and the two Remora conflicts (its own viewer calls it a
concept study while the badge says "customer engagement ready"). Full list at the
end of `docs/HANDOFF.md`.

## Suggested note to send with the link

> Here's a working draft of the new site: <URL>
>
> Everything is live and clickable — 7 pages, and the products page has
> interactive 3D models for all four products (drag to rotate, hover the parts
> for specs).
>
> Two things to flag as you look: the Ibex copy is placeholder text I wrote from
> the 3D model, so treat those specs as provisional, and the maritime "Learn
> More" links aren't wired to detail pages yet. Contact form opens your mail
> client rather than submitting.
>
> Not indexed by search engines, so please don't share the link outside the team.

## What is NOT in the draft

- **Not the real deploy.** The Webflow Cloud deploy still needs your Webflow site
  id and Cloudflare credentials — see `docs/WEBFLOW_CLOUD.md`.
- **Maritime "Learn More" links** are `href="#"` placeholders (one points at a
  claude.ai artifact that 403s without your login).
- **Contact form** is still a `mailto:` handoff, not a real form backend.
- **The LinkedIn feed** will render on a real host (it only breaks on `localhost`).

## The video re-encode that made this possible

Free static hosts cap a single file at 25 MiB — the same real limit as Webflow
Cloud. Two clips were over:

| File | Was | Now | How |
|---|---|---|---|
| `hero-montage.mp4` | 32.3 MiB @ 4252 kb/s | 21.4 MiB @ 2800 kb/s | x264 two-pass, preset slow |
| `maritime-hero.mp4` | 33.3 MiB @ 13305 kb/s | 20.8 MiB @ 8200 kb/s | x264 two-pass, preset slow |

Both stay 1920×1080 at original frame rate, audio dropped (they are silent
background loops anyway), `+faststart` for streaming. Checked at 1:1 against the
source on the waterfall frame — the hardest content in the montage — and they are
visually indistinguishable.

**CRF did not work here.** Water and foam are so high-frequency that `-crf 23`
produced files *larger* than the source (42 MiB / 39 MiB). Size has to be targeted
explicitly with two-pass ABR. Worth remembering for the other clips.

The re-encoded masters are kept at `videos/reencoded-2026-08-25/`. They close the
"re-encode hero-montage and maritime-hero" item that has been open since July, so
consider promoting them over the originals in `videos/` before the R2 upload —
that cuts 23 MiB off the R2 payload too.

## Rebuilding this draft later

```bash
cd webflow-app && npx astro build          # never from the repo root
# copy dist/client + the 12 referenced videos, substituting videos/reencoded-2026-08-25/
# then re-add robots.txt and the noindex meta
```
Do not run the build while a dev server is running — both write `dist/` and the
build kills the server.
