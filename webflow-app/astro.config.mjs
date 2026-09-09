import { defineConfig } from "astro/config";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Dev-only: serve the MP4s from ../videos at /videos. They are deliberately
// NOT in public/ — production serves them from Cloudflare R2 via
// PUBLIC_VIDEO_BASE — but `astro dev` should still play the hero videos with no
// env setup. `apply: "serve"` keeps this out of builds entirely; nothing can
// leak into dist/. Range requests are handled because Safari refuses to play
// video from a server that ignores them.
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

// Static site, deployed to Cloudflare Pages.
//
// Every page is prerendered to plain HTML at build time — `output: "static"`
// is the Astro default, so there is no server runtime and no adapter. Build
// output lands in dist/ (set that as the Pages "output directory").
//
// The private preview is gated by Cloudflare Access at the network layer, so
// no in-app auth middleware is needed. Links between pages stay relative
// ("about.html", "contact.html") and resolve from the domain root.
export default defineConfig({
  output: "static",
  // Emit /about.html rather than /about/index.html, so the existing relative
  // links between pages keep resolving exactly as authored.
  build: { format: "file" },
  compressHTML: true,
  vite: { plugins: [devVideos()] },
});
