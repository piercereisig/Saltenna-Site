// Where the MP4s are served from.
//
// The site's video is ~143 MB across 12 files, which cannot live in the deploy:
// a single Cloudflare Workers static asset caps at 25 MiB. So video is hosted
// on Cloudflare R2 and referenced by absolute URL.
//
// Resolution order:
//   1. PUBLIC_VIDEO_BASE, if set at BUILD time (this is import.meta.env — a
//      build-time inline, NOT a Worker runtime variable; setting it in the
//      Cloudflare dashboard does nothing).
//   2. In `astro dev`: the relative path "videos", served off local disk by the
//      devVideos() middleware in astro.config.mjs. Keeps dev offline-capable.
//   3. In any production build: the R2 bucket, hardcoded below.
//
// Why the R2 URL is the production default rather than a required env var:
// there is no bundled video fallback any more, so a build that forgets the
// variable renders every hero as a silent poster still — a broken-looking site
// caused by a missing setting. Defaulting removes that failure mode entirely.
//
// TODO: swap for https://media.saltenna.com/videos once saltenna.com's DNS is
// on Cloudflare. The pub-*.r2.dev subdomain is a development URL that
// Cloudflare rate-limits and advises against for production traffic.
const R2_VIDEO_BASE = "https://pub-555801c7c2ae4ca7a0c96f1fac3f953d.r2.dev/videos";

export const VIDEO_BASE =
  import.meta.env.PUBLIC_VIDEO_BASE ||
  (import.meta.env.DEV ? "videos" : R2_VIDEO_BASE);
