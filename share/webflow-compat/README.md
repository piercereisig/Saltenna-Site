# Saltenna — LinkedIn feed + animation source, for compatibility review

Everything here is the live code from the current build. Nothing has been
rewritten or simplified for this package.

_Snapshot taken 2026-07-31, at stylesheet version `?v=72` / script version
`?v=44`. The site is in active development, so if you're reviewing this more than
a few days later, ask for a fresh copy before drawing conclusions._

**Read `full-source/` as the source of truth.** The files under `linkedin/` and
`animations/` are extracts from those same files, split out so you can find the
relevant part quickly — but they are fragments and will not run standalone (see
"CSS custom properties" below).

```
linkedin/
  section-markup.html      the newsroom section exactly as it appears in the page
  linkedin.js              the widget loader (main.js lines 48-104)
  linkedin.css             the feed + fallback + post-card styles (styles.css lines 1043-1157)
animations/
  scroll-reveal.js         IntersectionObserver reveal driver (main.js lines 17-46)
  sample-animated-scene.svg    1 of 18 self-animating SVG scenes
  sample-threejs-graphic.html  1 of 4 standalone WebGL documents
full-source/
  styles.css               complete stylesheet (51 KB)
  main.js                  complete script (38 KB)
  three.min.js             three.js, self-hosted (592 KB)
```

---

## 1. The LinkedIn feed

It is a **third-party embed from SociableKIT**, widget id `25695728`, rendered
**in-page rather than in an iframe** so it sizes to its container naturally.

How it works: `linkedin.js` finds `#linkedin-feed`, reads `data-embed-id`,
injects `<div class="sk-ww-linkedin-page-post" data-embed-id="…">`, then appends
`<script src="https://widgets.sociablekit.com/linkedin-page-posts/widget.js">`
to the body. SociableKIT's script fetches the posts and renders them into that
div.

### What it needs from the host platform

- The external script from `widgets.sociablekit.com` must be allowed to load —
  no CSP or script-blocking in front of it.
- Custom code / embed capability. On Webflow that means a **paid Site plan**.
- Nothing else. No build step, no npm packages, no framework.

### Three behaviours that look like bugs but aren't

1. **It will not render on `localhost` or `127.0.0.1`.** SociableKIT's
   `widget.js` special-cases those two hostnames and rewrites its own asset base
   to point at your dev server, so its stylesheet 404s and the widget sits on its
   loading spinner forever. The post data still arrives correctly — you can
   confirm with `window.sk_embed_data["25695728"]` in the console. **Test on any
   other hostname** (`http://app.localhost:PORT` works, as does any staging
   domain) and it renders normally. We lost time to this one.
2. **Custom code does not run in the Webflow Designer canvas**, and does not run
   in Preview unless Site Settings → Custom code → "Run custom code in Preview"
   is switched on. It only executes on a published site.
3. There is a `MutationObserver` in `linkedin.js` that removes `.sk_branding` —
   the free-plan credit line. Harmless on a paid SociableKIT plan; leave it or
   drop it as you prefer.

### It degrades safely

If the widget never loads, the `.linkedin-fallback` block stays visible — a
"Follow Saltenna on LinkedIn" card with a real link. There's also a secondary
path: if `data-embed-id` is empty, the script reads `data-posts="data/posts.json"`
and renders static cards instead. So no scenario leaves an empty hole.

---

## 2. The animations — five distinct types

| Type | Where | Sample in this package |
| --- | --- | --- |
| CSS keyframes | `styles.css` (8 `@keyframes`) | `full-source/styles.css` |
| Scroll reveal (JS + CSS transition) | `main.js` + `.reveal` rules | `animations/scroll-reveal.js` |
| Self-animating SVG scenes | `images/uc/*.svg` (18 files) | `animations/sample-animated-scene.svg` |
| WebGL / three.js | `graphics/*.html` (4 files) | `animations/sample-threejs-graphic.html` |
| Canvas 2D effects | `main.js` | `full-source/main.js` |

Plus background/hero video (`<video autoplay muted loop playsinline>` with a
poster image) — standard HTML5, no library.

### a. CSS keyframes

Eight of them: `cursor-blink`, `hero-fade`, `hero-rise`, `hero-wipe`,
`interface-signal`, `tab-gap`, `ticker`, `uc-fade`. Plain CSS, no dependency.

### b. Scroll reveal — the one worth checking closely

`.reveal` elements start at `opacity: 0` and get `.visible` from an
`IntersectionObserver` as they enter the viewport.

Two things matter for portability:

- The hidden start state is scoped to `html.js .reveal`, and `main.js` adds the
  `js` class to `<html>` as its very first statement. **So if JavaScript never
  runs, all content is visible rather than permanently blank.** Please keep that
  guard if you refactor — without it, a platform that defers or strips the script
  renders an empty page.
- `IntersectionObserver` never fires in a context reporting
  `document.visibilityState === "hidden"` (some embedded preview panes do this).
  Reveals will appear stuck at invisible there. That's the pane, not the code.

### c. Self-animating SVG scenes — the most portable

The keyframes live **inside** each SVG file, so the scenes animate even inside a
plain `<img src="…">` tag, with no external CSS or JS. Nothing outside the file
can style or script them, which makes them the safest of the five to move. They
are referenced with a `?v=2` cache-buster.

### d. three.js / WebGL — the most likely to need attention

Each 3D graphic is a **standalone HTML document** in `graphics/`, embedded in the
page as a lazy iframe:

```html
<div class="split-media graphic">
  <iframe src="graphics/plasmonic-surface-wave-link.html" title="…" loading="lazy"></iframe>
</div>
```

Three consequences:

- Each iframe is **its own WebGL context**. The busiest current page runs two.
  Stacking many on one page is a real performance question, not a styling one.
- The sample loads three.js with a **relative path**: `../js/vendor/three.min.js`
  (line 33). That relative relationship between `graphics/` and `js/vendor/` has
  to survive whatever directory structure you land on, or the scene renders
  blank. `three.min.js` is included here for that reason — it is self-hosted, not
  from a CDN (project notes record it as r128).
- Interaction is drag-to-orbit only; wheel-zoom was deliberately removed.

### e. Canvas 2D effects

A single rAF engine in `main.js` drives the hero's `#wave-canvas` plus any
`<canvas class="fx-canvas" data-fx="…">`. Three variants exist: `field`, `sonar`,
`ripple`. The newsroom section uses `field` — you'll see it in
`section-markup.html`.

---

## 3. Two cross-cutting notes

**CSS custom properties.** Every fragment depends on variables defined in the
`:root` block at the top of `styles.css`. `linkedin.css` alone references
`--bg`, `--bg-alt`, `--border-soft`, `--font-display`, `--teal-rgb`, `--text`,
`--text-dim`. Pasting a fragment without those renders unstyled or invisible.
For reference:

```css
:root {
  --bg: #13263f;
  --bg-alt: #17304d;
  --surface: #1a3550;
  --surface-2: #20405f;
  --border: rgba(255, 255, 255, 0.16);
  --border-soft: rgba(255, 255, 255, 0.09);
  --text: #ffffff;
  --text-dim: #9bb0c2;
  --accent: #ffffff;
  --teal-rgb: 46, 196, 182;
  --blue-rgb: 157, 189, 209;
  --max-w: 1240px;
  --radius: 0;
  --font-display: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-body: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
```

Typography is a system Helvetica stack — no webfont to load.

**`main.js` is one classic script**, no modules, no build step, no dependencies.
It sits at the end of `<body>` and queries the DOM **once, at load**. Anything
injected into the page afterwards will not be wired up. If the platform adds
nodes dynamically, the relevant initialisers need re-running.

Reduced-motion is respected throughout (8 `@media (prefers-reduced-motion)`
blocks in the CSS, 4 checks in the JS).

---

## Questions worth answering back

1. Is custom `<script>` in the page footer available on the current plan, and is
   `widgets.sociablekit.com` reachable (no CSP)?
2. Are cross-origin iframes to same-origin HTML documents (the `graphics/*.html`
   pattern) permitted, and can that `graphics/` ↔ `js/vendor/` relative path be
   preserved?
3. Can `styles.css` and `main.js` be served as real files rather than pasted into
   a character-limited code box? `styles.css` is ~51 KB, which is close enough to
   a 50,000-character limit to be a problem in a paste-in field.
