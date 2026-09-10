// HTTP Basic auth gate for the staging deployment.
//
// Webflow Cloud environments are public by default — "anyone with access to
// your deployed mount path can view the environment" — so a draft mounted at
// /draft on saltenna.com would otherwise be open to the internet. This gates it.
//
// IMPORTANT: middleware only runs for routes rendered ON DEMAND. Astro runs
// middleware at BUILD time for `prerender = true` routes, so every page in
// src/pages sets `prerender = false` for this to work. That is the trade this
// gate costs: the pages are server-rendered per request instead of static.
// Reverting is flipping those flags back and deleting this file.
//
// It also means STATIC ASSETS ARE NOT GATED. Files under public/ — images,
// the MP4s, css/js, and the standalone graphics/*.html viewer documents — are
// served by Cloudflare's asset layer without reaching this middleware. Anyone
// who knows an exact asset URL can fetch it. There is no directory listing, so
// this is obscurity, not access control. The HTML pages are protected; the
// files they reference are not.
//
// Credentials come from Webflow Cloud environment variables (set PREVIEW_PASSWORD
// as a SECRET, not a plain variable — plain ones are visible to anyone with
// access to the Webflow site):
//   PREVIEW_USER      optional, defaults to "saltenna"
//   PREVIEW_PASSWORD  required; if unset the site returns 503 rather than
//                     falling open.

import { defineMiddleware } from "astro:middleware";
// Astro v6 removed `Astro.locals.runtime.env`; bindings and secrets now come
// from the Workers runtime module. Verified 2026-09-02 — reading locals throws
// "Astro.locals.runtime.env has been removed in Astro v6".
import { env as workerEnv } from "cloudflare:workers";

const REALM = "Saltenna draft preview";

function unauthorized(message = "Authentication required.") {
  return new Response(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

// Length-independent comparison, so response timing does not leak the password.
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

// Secrets come from the Workers runtime; import.meta.env is the `astro dev`
// fallback so the gate still behaves locally.
function readEnv(key: string): string | undefined {
  const fromRuntime = (workerEnv as Record<string, unknown> | undefined)?.[key];
  if (typeof fromRuntime === "string" && fromRuntime.length > 0) return fromRuntime;
  const fromBuild = (import.meta.env as Record<string, unknown>)[key];
  if (typeof fromBuild === "string" && fromBuild.length > 0) return fromBuild;
  return undefined;
}

export const onRequest = defineMiddleware(async (context, next) => {
  // `astro dev` is not the thing this gate protects — the DEPLOYED staging
  // environment is. Gating localhost only produced a 503 wall (the gate fails
  // closed, so with no PREVIEW_PASSWORD every page returned "Preview is not
  // configured") and a login prompt on every reload. import.meta.env.DEV is
  // true only under `astro dev`; it is false for `astro build`, so every
  // production build — and `npm run preview`, which builds first — keeps the
  // gate. Deliberate trade-off: a dev server exposed on a LAN is ungated.
  if (import.meta.env.DEV) {
    const devResponse = await next();
    devResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
    return devResponse;
  }

  const expectedPass = readEnv("PREVIEW_PASSWORD");
  if (!expectedPass) {
    return new Response(
      "Preview is not configured: set the PREVIEW_PASSWORD secret on this Webflow Cloud environment.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
  const expectedUser = readEnv("PREVIEW_USER") || "saltenna";

  const header = context.request.headers.get("Authorization") || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return unauthorized();

  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorized("Malformed credentials.");
  }
  const sep = decoded.indexOf(":");
  if (sep === -1) return unauthorized("Malformed credentials.");

  // Both comparisons always run — no early return on the username.
  const userOk = safeEqual(decoded.slice(0, sep), expectedUser);
  const passOk = safeEqual(decoded.slice(sep + 1), expectedPass);
  if (!(userOk && passOk)) return unauthorized("Incorrect username or password.");

  // Webflow Cloud mounts this app at a subpath (MOUNT_PATH, e.g. "/draft"), and
  // every asset and page link in the site is RELATIVE by design. That breaks on
  // the bare mount path: at "/draft" (no trailing slash) the browser resolves
  // "css/styles.css" against "/" and asks for "/css/styles.css", which does not
  // exist — an unstyled, video-less page. At "/draft/" it resolves correctly.
  // Astro serves the bare path with a 200 rather than redirecting, so redirect
  // it here. Verified 2026-09-02 against the Workers runtime: without this,
  // "/draft" 200s and every asset on it 404s.
  const base = import.meta.env.BASE_URL || "/";
  if (base !== "/") {
    const bare = base.endsWith("/") ? base.slice(0, -1) : base;
    const url = new URL(context.request.url);
    if (url.pathname === bare) {
      url.pathname = bare + "/";
      return Response.redirect(url.toString(), 308);
    }
  }

  const response = await next();
  // Keep an unfinished draft out of search engines and shared caches.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
});
