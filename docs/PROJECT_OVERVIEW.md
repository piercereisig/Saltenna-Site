# Saltenna Website — Project Overview

_Last updated: 2026-07-23_

## What this is

A static marketing website for **Saltenna** (real company, saltenna.com — plasmonic
wireless communications & sensing, defense-tech startup in McLean, VA), rebuilt from
scratch in `~/Saltenna`. Plain HTML/CSS/JS, **no build step** — deployable to any
static host (Netlify, Vercel, GitHub Pages, S3). Not a git repository.

The user (Pierce, pierce.reisig@saltenna.com) works for the company and iterates on
it in Claude Code sessions, viewing at `http://localhost:4173`.

## Running it

- Preview server config: `.claude/launch.json` → server name **`saltenna-site`**
  (`python3 -m http.server 4173`). The server dies between sessions — restart with
  `preview_start` when the user says "run localhost".
- Works opened directly as files too (no build).

## Pages (6)

| Page | Hero | Notable sections |
|---|---|---|
| `index.html` | Anduril-style statement hero (built to match the user's screen recording of anduril.com, finally captured Jul 16): FULL-COLOR montage video + dot-ocean canvas + huge white uppercase 3-line phrase "Communications beyond the limits of legacy radio frequency" that SCRAMBLE-DECODES on first load (`fxScramble` in main.js — text grows char-by-char while the trailing ~4 chars cycle random letters before resolving; lines overlap-staggered). Below it the sign strip decodes too: [REDEFINING THE LIMITS / OF WIRELESS justified mono word-rows] · [logo, fades in] · [EST. 2017 / year counter 2018→2026 that resolves to "→ BEYOND"]; full wordmark logo (logo-white.png, 38px; glyph-only logo-mark-white.png exists unused), "→ Beyond" indented 1.2em under Est. 2017; a terminal cursor blinks 9× (~5.4s) at the end of the statement then removes itself. Decode pace: statement step 55ms/char, lines staggered 500+i*380ms; strip starts 2100ms. Everything stays. Old eyebrow/lede/buttons/stats REMOVED (Jul 16) | Dead zones (dark, 4 cards), What We Do (light/white), maritime VIDEO band (maritime-hero.mp4 — since Jul 21 the user's 4K golden-hour surf-on-sand clip, 35.6MB — behind "Built for the maritime edge."), credentials, LinkedIn newsroom, CTA. (Diver-pair band REMOVED Jul 20.) |
| `communications.html` | Fleet-of-ships video hero, Seapower-style `.sea-hero` (Jul 21): full-color, tagline "Beyond legacy radio frequency." + ↓ to #use-cases + 5 quick-links (#uc-underwater/-ice/-ships/-pipelines/-lunar) | Use Cases (deep+sonar, id=use-cases): 11 scroll-focus `.use-case-panel` rows since Jul 30 v70 — text + animated SVG scene (`.split-media.scene`, images/uc/comms-*.svg?v=2); centered panel grows 1.12/1.25 → drift-ice band (title-only) → Why Plasmonics (dark, diagram-LEFT/text-right), CTA. ("Under the canopy." band removed Jul 30.) |
| `sensing.html` | Foggy-forest video hero, Seapower-style `.sea-hero` (Jul 21): full-color, tagline "Sensing where others can't." + hero paragraph in the info row + 5 quick-links (#uc-iiot/-detection/-supply/-bioimaging/-environment) | Use Cases (deep+sonar, id=use-cases): 7 scroll-focus `.use-case-panel` rows since Jul 30 v70 (same pattern, images/uc/sensing-*.svg?v=2), container-port video band (title-only), How It Works (dark), CTA |
| `maritime.html` | Anduril-Seapower-style hero (`.sea-hero`): full-color untinted video bg (user's 4K golden-hour surf clip) + big title (no eyebrow since Jul 30); bottom mono info row [tagline "Where wireless can't reach." + ↓ to #challenge · description · 5 quick-links → panel anchors] | Challenge (dark, 3 cards, id=challenge); Use Cases (deep+field, id=use-cases): FIVE scroll-focused video panels restored Jul 30 (UUV Swarming, Oil & Gas, Diver-to-Diver, USV, Seabed — centered panel grows + plays, click replays; no per-panel eyebrows); "Along the seabed." band (title-only), CTA |
| `about.html` | Drift-ice `.sea-hero` since Jul 30: videos/band-drift-ice.mp4, h1 "Working at the boundary." (decodes), tagline "Est. 2017 — McLean, Virginia.", ↓ → #who-we-are. (Strait band + "Beyond every existing wireless technology." hero REMOVED Jul 30.) | Who We Are (single paragraph, id=who-we-are), team deep (8 full live bios), CTA |
| `contact.html` | Field canvas hero | Large Saronic-style form (underline fields), info strip. Form is `mailto:info@saltenna.com` (address verified real), handler in main.js |

## Design system

- **Palette** (extracted from the investor deck `20260612 Saltenna_Investor_Presentation.pptx`
  in ~/Downloads — theme XML was default Office; real colors came from embedded media +
  slide `<p:bg>`): base navy `#13263f` (`--bg`), alt `#17304d`, surfaces `#1a3550/#20405f`;
  header + footer use the darker card navy `#0d1424` (header `rgba(13,20,36,0.9)` + blur,
  footer solid) to bookend the lighter body navy;
  accents `--teal-rgb: 46,196,182` (#2EC4B6), `--blue-rgb: 157,189,209` (#9DBDD1); slate
  `#5B6B7A`; logo-only blues `#1566BF/#3E92DE` (not used as accents). Deck backgrounds:
  navy `#13263F` titles, white content slides — this justifies the site's light sections.
  Background flipped navy↔black 3× historically; **currently navy**. Full palette artifact:
  https://claude.ai/code/artifact/2025a5a0-a636-4bd5-bb3d-64c272f053f4
- **Tonal variants**: `section.block.dark` (near-black #070c14, darker card bases),
  `section.block.deep` (since Jul 23 a near-black gradient `#070c14→#0a1220 55%→#070c14`
  matching `.dark`, with faint teal/blue radial washes 0.05/0.04; cards NOT restyled,
  so they keep their color and stand out — on the card sections of Communications
  (Use Cases ×2), Sensing (Use Cases),
  Maritime (#use-cases), and About (#team, replacing its `alt`)), `section.block.light`
  (paper-white #f4f7f9, scoped color inversion), default navy, `.image-band` (full-bleed
  image/video + text overlay, optional button; `> video` gets grayscale+0.55 opacity;
  `.image-band.reverse` right-aligns the text and mirrors the scrim to dark-on-right).
- **Cards**: nth-child(3n) gradient washes (teal/blue/deep), hover lift + shadow + teal
  icon. `.domain-card` (maritime): 4:5 image cards, hover zoom + arrow, eyebrow color
  cycles teal/blue/white.
- **Motion**: `.reveal` (rise+scale, staggered in grids), roll-into-frame (a section's
  inner `.container` — NOT the section box, which would expose the page background as a
  gap between sections — translates up to 46px while entering, in `applyScrollFX`; skips
  `.container.reveal` on bands/CTA to avoid fighting the 0.85s reveal transform, so those
  animate via `.reveal`), parallax (`[data-parallax]`),
  nav gradient-underline hover. All respect `prefers-reduced-motion`.
- **Interactive canvases** (`js/main.js`, `fxMount` + `fxVariants`): `hero` (single clean 3D dot
  ocean below a thin interface line, cursor swell + ripples, NO antennas per user;
  tidied Jul 15 to the Anduril-clean look — mirrored top surface + air particles
  removed, near-monochrome white dots; cursor highlight + ripples are WHITE (v35, neutral over the color video — teal only on the static horizon line); Jul 16 given
  bigger VARIED swells (5 layered sines — large rolling swells + medium cross-wave +
  fine chop, ~127 amp) for more 3D relief, and widened SPAN→5000 / COLS→124 / PERSP 430→560
  so waves fill the screen width through near+mid rows while the horizon still tapers),
  `sonar` (Communications + Sensing use-case backgrounds — slow ping rings rise up
  through the bottom edge across a faint contact field that blips as each ring passes;
  no antenna, NO visible origin (it sits off-canvas below, bottom-center); auto-emits +
  gentle cursor brighten), `signal`/`radar` (now unused — sonar
  replaced them on comms/sensing; kept defined), `field` (site-wide subtle dots), `grid`,
  `ripple`. Markup:
  `<section class="... has-fx"><canvas class="fx-canvas" data-fx="NAME">`.
  `.interface-divider` — animated boundary-line motif above CTA headings.
  Nav tab underline (`.main-nav a::after`, teal→powder-blue gradient, 1px):
  on the ACTIVE tab only, a fully-transparent gap sweeps left-to-right through
  the solid line, looping, via an animated CSS `mask-position` (`tab-gap`
  keyframe; mask notch parked off-window at both cycle ends so the loop is
  seamless). Hover = the classic solid underline reveal only (no gap). Idle
  tabs show nothing. Reduced-motion: solid line, no gap.
- **Typography**: Helvetica Neue stack; monospace (ui-monospace stack) for tag/label motifs.

## Cache-busting (IMPORTANT)

HTML references `css/styles.css?v=N` and `js/main.js?v=N`. **Currently CSS v=70,
main.js v=42.** Bump the number on ALL SIX pages whenever the CSS/JS changes — the
user has hit stale-cache confusion repeatedly.

Jul 30 batch redesign notes (details in WORK_LOG): no eyebrow kickers or
interface-divider bars anywhere; nav order Home/Maritime/Communications/
Sensing/About with a full-width header (logo left, tabs right); homepage
dead-zone cards link into the comms scrollytelling; maritime use-cases are a
`.uc-scroll` with the 5 videos in the sticky stage; About opens with a
drift-ice sea-hero ("Working at the boundary.") — strait band and the old
text hero are gone; graphics are drag-to-orbit only (no wheel zoom); copy
follows a paragraph-OR-bullets rule (no content `<ul>`s).

## Video pipeline

- No ffmpeg/brew on machine. Use the bundled binary:
  `FF=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")`
- Standard encode: `-c:v libx264 -crf 23..30 -preset slow -pix_fmt yuv420p
  -movflags +faststart -an` (+ `-vf scale=1920:-2 -r 30` for 4K/60 sources).
  CRF 23 for foreground animations, 27–30 for dimmed backgrounds.
- Posters: `-ss 1 -frames:v 1 -q:v 3` → `images/posters/<name>.jpg`.
- Big videos use `class="lazy-video" preload="none" poster=...` — an
  IntersectionObserver in main.js plays on approach / pauses offscreen.
  EXCEPTION: videos inside `.use-case-panel` (maritime) are SCROLL-FOCUSED (Jul 21,
  replaced the hover-to-play): in `applyScrollFX`, the panel whose center is nearest
  mid-viewport (within 0.38·vh) gets `.is-focus` — CSS scales it to 1.12
  (1.25 at ≥1500px viewports; disabled ≤900px to avoid overflow) with a teal
  border — and its video plays; all others pause. Works identically on touch; the IO
  only pauses these offscreen. Clicking a `.video-media` replays from 0.

## Pexels workflow (stock footage)

- `curl` of pexels.com is Cloudflare-blocked. Search via WebSearch
  (`allowed_domains: pexels.com`); thumbnails from
  `images.pexels.com/videos/{id}/pictures/preview-0.jpg` (or slug URL via WebFetch
  og:image); downloads via `https://www.pexels.com/download/video/{id}/` (works with
  browser UA). License: free commercial use, no attribution.
- Avoid clips with prominent third-party trademarks (rejected an MSC ship for this).

## Copy rules (from the user's briefs)

- Voice: hedged, capability-level. "Saltenna is developing / working on / has
  demonstrated"; "may enable / may be able to". No invented TRL/specs/customers/
  performance numbers. No exclamation points; "game-changing" used at most once.
- Most page copy is synced **verbatim to live saltenna.com** (user requested).
  Maritime copy came from a detailed user brief (see WORK_LOG).
- "Department of Defense/DoD" (what the live site says — not "War/DoW").

## Directory notes

- `images/` — logo (white/color), 8 team headshots, `posters/`, `bands/` (all self-hosted)
- `videos/` — user's 4 animations + optimized stock; `bg-1490262444.mp4` and
  `bg-1729633035.mp4` are now UNUSED (deletable); `saltenna-main.mp4` still the home hero
- `data/posts.json` — newsroom fallback content
- **Do not touch without asking**: `wordpress-theme/` + `saltenna.zip`,
  `underwater_drone_swarm.mp4` — unexplained items the user put in the project
  root. (`dunmore-site/` and `soundcloud-downloader/` were moved OUT to
  `~/dunmore-site` and `~/soundcloud-downloader` on 2026-08-25 — unrelated
  projects that a zip of this folder would have leaked. Dunmore kept its
  port-4180 preview via its own `.claude/launch.json` in the new location.)
- Persistent agent memory also exists at
  `~/.claude/projects/-Users-piercereisig-Saltenna/memory/` (auto-loaded index)
