import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Dev-only: serve the MP4s from ../videos at /videos. They are deliberately
// NOT in public/ — a single Workers asset caps at 25 MiB, so in production
// they come from R2 via PUBLIC_VIDEO_BASE — but `astro dev` should still play
// the hero videos with no env setup. `apply: "serve"` keeps this out of
// builds entirely; nothing can leak into dist/. Range requests are handled
// because Safari refuses to play video from a server that ignores them.
function devVideos() {
  const videosDir = fileURLToPath(new URL("../videos", import.meta.url));
  return {
    name: "dev-videos",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/videos", (req, res, next) => {
        const rel = decodeURIComponent((req.url || "").split("?")[0]);
        const filePath = path.join(videosDir, rel);
        // stay inside ../videos (path.join would happily follow "../..")
        if (!filePath.startsWith(videosDir + path.sep)) return next();
        if (!existsSync(filePath) || !statSync(filePath).isFile()) return next();
        const size = statSync(filePath).size;
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Type", "video/mp4");
        const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
        if (range) {
          const start = range[1] ? parseInt(range[1], 10) : 0;
          const end = range[2] ? Math.min(parseInt(range[2], 10), size - 1) : size - 1;
          if (start > end || start >= size) {
            res.statusCode = 416;
            res.setHeader("Content-Range", `bytes */${size}`);
            return res.end();
          }
          res.statusCode = 206;
          res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
          res.setHeader("Content-Length", end - start + 1);
          createReadStream(filePath, { start, end }).pipe(res);
        } else {
          res.setHeader("Content-Length", size);
          createReadStream(filePath).pipe(res);
        }
      });
    },
  };
}

// Webflow Cloud serves the app under a mount path (e.g. "/app", or "/" for a
// standalone app at the domain root). `base` must match it exactly or routes
// and assets 404. Override with MOUNT_PATH at build time rather than editing
// this file, so changing the mount in the Webflow dashboard is a rebuild, not
// a code change.
const mountPath = process.env.MOUNT_PATH || "/";

export default defineConfig({
  base: mountPath,
  // Webflow Cloud runs on an Edge runtime and requires the Cloudflare adapter
  // with server output. Every page sets `prerender = true`, so the six pages
  // are still generated as static HTML at build time — nothing renders per
  // request. This is the supported way to ship a static site here; Astro's
  // `output: "static"` is not supported on Webflow Cloud.
  output: "server",
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  // Emit /about.html rather than /about/index.html, so the existing relative
  // links between pages ("about.html", "contact.html") keep resolving exactly
  // as they did on the hand-built site.
  build: { format: "file" },
  compressHTML: true,
  vite: { plugins: [devVideos()] },
});
