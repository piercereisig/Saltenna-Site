// Where the MP4s are served from.
//
// The site's video is ~143 MB across 12 files, which cannot live in the deploy
// (and cannot go in Webflow's own asset pipeline at all — the Assets panel
// rejects .mp4, and the Background Video element caps at 30 MB per file and
// force-transcodes to 720p). So video is hosted on Cloudflare R2 and referenced
// by absolute URL.
//
// Set PUBLIC_VIDEO_BASE to the R2 public bucket URL (no trailing slash), e.g.
//   PUBLIC_VIDEO_BASE=https://media.saltenna.com
// The default keeps the original relative path, so a local
// webflow-app/public/videos/ directory still works for development.
export const VIDEO_BASE = import.meta.env.PUBLIC_VIDEO_BASE || "videos";
