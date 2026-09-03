# Saltenna Website — Work Log (condensed, chronological)

_Last updated: 2026-07-31. Full detail lives in the agent memory at
`~/.claude/projects/-Users-piercereisig-Saltenna/memory/project_saltenna_website.md`._

## Foundation (Jul 6–8)

- Built 5-page site from scratch, content sourced from live saltenna.com.
- Pulled real assets from saltenna.com CDN per user request: white/color logo,
  8 leadership headshots, 3 background videos. All self-hosted.
- Apple-style scroll parallax added; hero wave animation slowed per feedback.
- **LinkedIn newsroom**: SociableKIT widget (id 25695728) embedded **in-page**
  (not iframe) so the free-plan branding line (`.sk_branding`) can be removed —
  MutationObserver in main.js + CSS size/opacity fallback (their inline style
  forces `display:block !important`, so display can't be used). Two earlier
  iframe-cropping attempts failed; in-page embed is the durable fix.
- All copy synced verbatim to live saltenna.com wording (hero casing, 11 comms
  use cases, full team bios with education, live CTA text, contact fields
  Name/Company/Email Address/Phone/Message; `info@saltenna.com` verified real).

## Visual identity & interactivity (Jul 9–10)

- Interactive canvas FX system in main.js (`fxMount`/`fxVariants`): homepage 3D
  dot-ocean hero (antennas later removed per user), signal/radar/grid/ripple
  variants per page, then site-wide subtle `field` variant (dot grid brightens
  near cursor — user's favorite; crosshair removed per user). `interface-divider`
  motif added above CTA headings.
- Brand palette extracted from investor deck (see PROJECT_OVERVIEW); background
  flipped black↔navy 3 times at user request — **now navy**. All SVG accents,
  FX colors, and CSS vars use exact deck colors. Palette artifact built.
- Partner portal (Supabase-backed + demo mode) was fully built, made demo-ready
  with credentials `partner@saltenna.com`/`Plasmonic2026!` — then **entirely
  removed** at user request (Jul 13). Nothing portal/Supabase remains.

## Maritime page (Jul 13–14)

- Page created per detailed user brief (structure mirrors sensing; hedged voice;
  no Oil & Gas card; no swarming in USV copy; seabed kept general).
- User delivered 3 of 4 of their own animations: **diver-to-diver, UUV swarming,
  USV comms** — optimized (CRF 23, ~45–48% smaller, faststart, posters), placed
  as large alternating split-row panels with lazy-load and click-to-replay.
  Contact-form-style "terminal narration" overlay was built, then **removed**
  (white log text was illegible on the pale animations).
- Anduril-style: 4 image-backed **domain cards** (anchor-linking to the panels;
  seabed uses a gradient placeholder until its animation exists), "The Challenge"
  3-card section, use-case panels carded with hover states.
- Maritime hero: user-supplied dark-ocean aerial (Pexels), grayscale+navy blend.

## Contact form (Jul 13)

- Rebuilt in the big Saronic style: full-width, large underline-only inputs, teal
  focus, small caption labels, compact button, info strip below. (This was
  actually a misread — user meant the maritime page — but they kept the form.)

## Site-wide polish (Jul 14)

- Card gradient washes (teal/blue/deep cycling), hover lifts, nav gradient
  underline, staggered reveals, roll-into-frame scroll effect.
- Tonal variants: near-black + paper-white sections distributed across all pages;
  `.image-band` component (image or video + overlaid eyebrow/h2/p/button).
- Stock footage round 1 (I curated from Pexels, user approved 2/3/5/6):
  drift-ice band + jungle-fog band (Communications), foggy-forest hero +
  container-port band (Sensing).
- Stock footage round 2 (user-supplied): diver-pair band (homepage, links to
  maritime#uc-divers), strait video (About band, upgraded from still), seabed
  divers band (Maritime), shipping-lanes fleet (Communications hero).
- Old stock loops `bg-1490262444.mp4` / `bg-1729633035.mp4` now unused.

## Nav tab signal pulse (Jul 15)

- User liked the `.interface-divider` moving-pulse motif and asked to put a rolling
  line under the nav tabs. First attempt (v30) was a full-width `.header-signal`
  line along the header's bottom edge — user said "not quite," wanted short pulses
  under the individual tabs, thin like the existing underline. Reverted that and
  added `.main-nav a:not(.nav-cta)::before` — a short teal pulse (1px, animated via
  `background-position`, `tab-signal` keyframe, 6s) rolling across each tab's
  underline zone, staggered per tab (nth-of-type delays) so it ripples left→right.
  Active/hover `::after` underline untouched. Reduced-motion renders it static.
  CSS-only, main.js unchanged. CSS v=31.
- Refined again (v32): dropped the per-tab pulse. Now the effect lives on the
  `::after` underline itself and only appears on the ACTIVE tab (looping) or on
  hover — non-selected tabs show nothing. Instead of a lit pulse moving across,
  a fully-transparent GAP sweeps through the solid teal→powder-blue line (inverse
  effect), via an animated CSS `mask-position` (`tab-gap` keyframe; mask window
  250%, notch parked off-window at both cycle ends → seamless loop). Underline
  gradient/colors kept as-is per user. Reduced-motion: solid line, no gap.
  CSS-only, main.js unchanged. CSS v=32.
- Scoped back (v33): user wanted the sweeping gap ONLY on the current page's
  (active) tab; hover now does just the classic solid underline reveal (no gap).
  Split the rule so `transform: scaleX(1)` applies on hover+active, but the
  `tab-gap` animation applies to `.active::after` alone. CSS v=33.
- (v34): halved the gap size — mask transparent notch 8%→4% (feather halved too),
  so the visible gap is ~10% of the underline instead of ~20%. CSS v=34.

## Band redistribution + flips (Jul 15)

- User wants the image/video bands spread through each page, not clustered low.
  Communications done as template (v35, HTML + small CSS): split the 11-card
  use-case section (6 cards → "Through and along the ice." band → 5 cards) so the
  band moved from lower-half up into the middle; media now lands top/upper-mid/
  lower. Then flipped two sections per user ("flip these"): the "Why Plasmonics"
  split reordered to diagram-left/text-right (DOM reorder — did NOT touch the
  shared `.split.reverse` rule, which is also on maritime and appears to be a
  no-op as written); the "Under the canopy." band got a new `.image-band.reverse`
  modifier (text right-aligned, scrim gradient mirrored to 270deg dark-on-right).
  Verified in real Chrome via preview DOM checks (desktop: media left x=49 / text
  right x=668; band text-align right, gradient 270deg) + screenshot. Rollout to
  sensing/maritime/about pending user's redistribute-vs-add-footage choice.

## Header/footer color (Jul 15, v36)

- User asked the top menu (header) and bottom menu (footer) to be the dark navy of
  the diagram "card" (`#0d1424`, = rgb 13,20,36 — distinct from the near-black
  `#070c14` sections and the body navy `#13263f`). Header `rgba(13,20,36,0.9)` (keeps
  the blur/frost), mobile dropdown nav `rgba(13,20,36,0.97)`, footer solid `#0d1424`.
  Verified computed rgb in Chrome. CSS v=36.

## Roll-effect gap fix (Jul 15, main.js v21)

- User saw a lighter-navy sliver appear between sections while scrolling. Cause:
  the roll-into-frame effect translated the whole `<section>` (background included)
  as it entered, exposing the page background as a transient gap above it. Fix:
  `applyScrollFX` now translates the section's inner `> .container` instead of the
  section box, so backgrounds stay flush (verified gap=0 at all scroll positions).
  Skips `.container.reveal` (bands/CTA) since their 0.85s transform transition would
  fight a per-frame inline transform — those keep animating in via `.reveal`.
  Verified in real Chrome: container rolls (matrix translateY 15.3 mid-entrance),
  section transform none, gap 0. main.js v=21.

## Hero waves tidied — Anduril-clean (Jul 15, main.js v22)

- User likes the homepage hero dot-waves but wanted them tidied toward the clean
  Anduril look (referenced anduril.com/lattice/command-and-control — couldn't fetch
  its visuals, JS-heavy SPA, so went on Anduril's known minimal house style + user
  pick of "Anduril-clean"). Rewrote the `hero` fx variant: removed the mirrored top
  wave field and the floating "air" particles; kept ONE dot ocean below the interface
  line. Near-monochrome (steady dim-white dots, teal only where the cursor lifts them;
  dropped the blue/white/teal cycling and the FX_BLUE usage). Calmer: removed the
  shimmer flicker (steady alpha), slower wave speeds. Lighter density (66×26, row
  spacing 46→52). Kept cursor swell + ripples + interface line. Verified in Chrome:
  syntax OK, no console errors, single ocean paints (below-interface ~53k px), top
  cleared (~2.5k faint px vs a full mirror field before), resting dot RGB pure white.
  main.js v=22 (CSS unchanged).
- Follow-up (v23): user asked to check the waves are uniform + span the screen.
  Measured coverage — ocean reached full width except a pinch at the horizon, but
  the bottom ~22% was EMPTY (near rows topped out mid-screen). User chose "keep the
  3D ocean, extend it" (over flatten-to-uniform). Made camera height viewport-
  relative (`camY = h * 0.6`, was fixed 300) so the nearest waves always reach the
  bottom edge; added depth (ROWS 26→38, z-spacing 52→62) so far rows still hug the
  horizon. Re-measured: all 8 vertical bands paint, bottom 40px strip has dots,
  ~0–100% width (horizon still pinches ~9–91%, expected perspective). main.js v=23.

## Deeper Use Cases background (Jul 15, v37)

- User wanted the Communications "Use Cases" card section background darker + more
  varied, but the cards kept the same color. Added a reusable `section.block.deep`
  variant: darker-than-body navy vertical gradient (#0a1220→#0d1a2b→#0a121f) + teal
  & blue radial washes for variation. Deliberately does NOT restyle cards (unlike
  `.dark`), so cards stay `var(--bg)` navy (opaque) and now pop against the darker
  frame. Applied `deep` to BOTH use-case card blocks on communications (the section
  is split by the ice band) for consistency. Verified: 2 deep sections, card bg
  still rgb(19,38,63), darker gradient applied, screenshot confirms. CSS v=37.
- Rolled `deep` out to the other card sections (HTML-only, no version bump — reused
  the v=37 `.block.deep`): Sensing use-cases block, Maritime `#use-cases`, About
  `#team` (was `block alt` → `deep`). Cards unchanged: sensing/maritime `.card` stay
  rgb(19,38,63), About `.team-card` stays --bg-alt rgb(23,48,77). Left Maritime's
  "The Challenge" (block dark) as-is. Verified computed bg + card colors in Chrome.

## Sonar ping background (Jul 15, main.js v24)

- User asked for "sonar-like pings" behind the use-case sections on Communications
  and Sensing — no antenna, emitting from a corner ("we'll see how it looks").
  Added a new `sonar` fx variant: ping rings emit on a timer (GAP 190 / LIFE 300
  frames) from the bottom-left corner, expand linearly to the section diagonal and
  fade; a faint dot contact-field blips teal as each ring sweeps its radius; small
  pulsing source glow at the corner; also brightens gently under the cursor. Swapped
  `data-fx`: comms 2 signal→sonar, sensing 1 radar→sonar (signal/radar now unused).
  Verified: mounts, paints (~19k px), brightest pixel = corner source, no console
  errors. NOTE it reads SUBTLE because the opaque card grid covers most of the
  canvas — pings mostly show in the top/margins. Offered tweaks (move origin to
  top-right open area, boost brightness/frequency) pending user feedback. main.js v24.
- Tuned (v25): user asked to slow the ping, hide the origin, and have it come out
  through the bottom. Moved origin off-canvas below, bottom-center (ox=w*0.5,
  oy=h*1.05); removed the source glow/dot entirely (no visible origin); slowed
  expansion (LIFE 300→430, GAP 190→250); maxR=hypot(w*0.5,h)*1.1. Rings now rise up
  through the bottom edge. Verified: corner hotspot gone (max alpha 148→13 at rest),
  a ring rose into view low (~91% down), no console errors. main.js v25.

## Maritime animation replacements (Jul 16)

- User delivered re-themed (dark navy, matches site) versions of all 3 maritime
  animations from Downloads. Mapping confirmed by frame extraction: DI1547~1.MP4 →
  diver-to-diver (40s), SA3824~1.MP4 → uuv-swarming (57.5s), USV_CO~1 1.MP4 →
  usv-comms (35s) — durations identical to the old versions. Standard pipeline
  (CRF 23, slow, faststart, -an): 8.1 / 15.2 / 8.7 MB. Fresh posters at t=1s (also
  refresh the domain-card thumbnails). Same filenames → no HTML changes, no version
  bump. Verified: served bytes = new encodes, metadata loads (1920w, right
  durations), no console errors. Old versions overwritten.

## Bigger + hover-to-play maritime animations (Jul 16, v38/main.js v26)

- User asked for bigger use-case videos that play on hover and hold still
  otherwise. CSS: `.split.use-case-panel` gets `grid-template-columns: 1fr 1.6fr`
  (media column 1.6×; media is always the 2nd child/column), padding 44→36,
  gap 52→48; added `.split.use-case-panel { grid-template-columns: 1fr }` inside
  the 900px query (the specific rule would otherwise beat the generic collapse).
  JS: `.use-case-panel` videos are hover-controlled on `(hover: hover)` devices —
  panel mouseenter→play, mouseleave→pause (frame holds); excluded from the IO
  autoplay (IO still pauses them offscreen); touch devices keep IO autoplay;
  reduced-motion guard unchanged; click-to-replay kept. Verified: 1.6 ratio at
  1440px (644 vs 402px), single column at mobile, hover wiring fires play/pause
  (stubbed — panel blocks real play()), no console errors. CSS v38, main.js v26.
- Follow-up (main.js v27): user wanted the hover to be STICKY/exclusive — a
  hovered animation keeps playing until a different card is hovered. Dropped the
  mouseleave-pause; mouseenter now pauses the other panel videos then plays this
  one (one at a time; last-hovered persists). IO still pauses offscreen. Verified
  by stub: hover P0→[T,F,F], leave P0→still [T,F,F], hover P1→[F,T,F], hover
  P2→[F,F,T]. No console errors. main.js v27.

## Hero waves — more 3D + wider (Jul 16, main.js v28)

- User: more variation/3D in the homepage waves + doesn't fill screen width. Asked
  clarifying Qs → chose "bigger, varied swells" + "widen, keep the taper". Rewrote
  `surface()` from 3 calm sines to 5 layered ones (large rolling swell 42 + depth
  swell 48 + medium diagonal cross-wave 21 + fine chop 10 + finer chop 6 ≈ 127 amp)
  for real relief. Widened SPAN 2600→4400, COLS 66→108 (keeps ~40px near spacing;
  off-screen dots still `continue`-clipped so perf is fine). Verified horizontal
  coverage by computing the projection math (rAF was suspended in the panel — couldn't
  watch it move): at 1425px, near+upper-mid rows now reach -1/101% (was 10/90), lower-
  mid 9/91 (was 26/74), horizon 19/81 (was 32/68 — still tapers). Syntax OK, no console
  errors. NOTE: partially reverses the Jul 15 "calm/tidy" pass per user's new ask.
  main.js v28.

## Hero waves — wider back + taller swells (Jul 16, main.js v29)

- User: back rows still don't reach the sides + want higher peaks / lower valleys
  (a bit more). Eased the perspective taper (PERSP 430→560) and widened (SPAN
  4400→5000, COLS 108→124) so the very back reaches wider; bumped swell amps
  (54/60/27/12/7 ≈ 160, was ~127). Verified via projection math at 1425px: farthest
  row 26→74 became 16→84, far group 19→81 became 7→93, mid/near still fill edges,
  taper preserved. No console errors. main.js v29.

## Anduril-style statement hero (Jul 16, CSS v39–41)

- User (with Anduril homepage screenshot as reference): strip the homepage hero to
  one big clean statement in the logo's style, white text over a FULL-COLOR video,
  text rolls out on first open and stays, logo included. Replaced the hero content:
  removed eyebrow/long lede/btn-row/hero-stats (h1 is now the phrase "Communication
  beyond the limits of legacy communications." — SEO heading changed); markup is 3
  `.line > span` rows + `.hero-sign` logo (logo-white.png, 30px, centered). CSS:
  hero now centers content; `.hero-video` full color (removed grayscale+0.5
  opacity); `::after` simplified to a plain dark scrim (dropped teal/blue washes);
  `.hero-statement` = display font, 700, uppercase, clamp(2.2rem,6vw,5.45rem)
  (max sized so the longest line fits the 1280 container — 6.6vw/6.2rem WRAPPED
  line 1), line-height 1.04; roll-out = overflow-hidden lines, spans translateY(112%)
  → 0, staggered 0/0.14/0.28s, `forwards`; logo fades in at 0.75s; reduced-motion
  shows everything static. Removed dead CSS (h1 .grad, .lede, .hero-stats + its
  media-query line). Gotcha: global `img { display:block }` beat text-align:center —
  logo needed `margin: 0 auto` (v41). Dot-wave canvas kept over the color video.
  Verified: styles computed (color video, white uppercase 700), 3 single-row lines,
  animations' end state via getAnimations().finish() (panel suspends animations),
  logo centered ±8px, screenshot matches reference, no console errors.

## Terminal-typing hero + EST. 2017 (Jul 16, CSS v42 / main.js v30)

- User: change the phrase to "communications beyond the limits of legacy radio
  frequency", make it roll out from the side like terminal typing, add EST. 2017,
  with rollout animations. (Their reference screen recording at an NSIRD temp path
  was GONE before it could be read — second time; implemented from description and
  invited a re-share via Desktop.) Replaced the CSS line-roll with JS typing in
  main.js: chars insert one at a time before a `.type-cursor` block (solid while
  typing, `.blink` class after; uneven 22–60ms cadence, 380ms initial delay); lines
  reserve height (`min-height:1.04em`) so nothing jumps; HTML keeps the full phrase
  (JS empties + retypes, so no-JS/SEO still has text); reduced-motion skips typing
  entirely. `.hero-sign` is now flex logo + `.est` "Est. 2017" (mono, tracked),
  hidden via `.pending` only after JS starts (no-JS stays visible), flips to `.show`
  (fade + rise) when typing completes. Statement font resized for the longer line 1
  (clamp max 5.45→5.2rem, 6vw→5.75vw). Verified live in the panel: progressive
  typing observed, full phrase lands, cursor blinks, sign pending→show; sign's
  final opacity/transform proven by disabling the transition (panel freezes CSS
  transitions mid-flight — same quirk family as animations/rAF). No console errors.

## Side-roll hero + subline + folding sign (Jul 16, CSS v43 / main.js v31)

- User refined the hero rollout: liked "Redefining the limits of wireless." from a
  brainstorm — added as a smaller tracked uppercase subline under the statement;
  and wanted the Anduril-video rollout matched more closely ("close but not quite"):
  big text comes FROM THE SIDE, small text (EST. 2017) FOLDS DOWN sleekly. (The
  reference video was again unreadable — NSIRD temp path died; built from their
  description.) Replaced the JS terminal typing (removed from main.js, v31) with
  pure CSS: `line-wipe` keyframe (clip-path inset unmask left→right + slight
  translateX) on the 3 statement lines staggered 0/0.18/0.36s and on the subline at
  0.8s; `.hero-sign` (logo + Est. 2017) now does `sign-fold` — 3D fold-down from
  its top edge (perspective + rotateX -88°→0) at 1.35s. Reduced-motion: all static.
  Sequence: lines wipe in → subline wipes in → sign folds down; everything stays.
  Verified: animations wired with right delays, end states via getAnimations()
  .finish() (all clips open, sign upright/opaque), rows single-height, screenshot,
  no console errors.

## Scramble-decode hero, matched to the actual Anduril video (Jul 16, v45/main.js v32)

- User FINALLY got their anduril.com screen recording through (saved to Desktop
  first — the NSIRD temp paths had eaten 3 prior attempts; also note macOS puts a
  narrow no-break space in "12.36 PM" filenames, so cp needs a glob). Frame-by-frame
  analysis showed the real effect is a CHARACTER SCRAMBLE-DECODE, not a wipe or
  plain typing: text grows char-by-char with the trailing few chars cycling random
  letters before resolving (frames showed "© AXNEB", "TRANSFORMIXQ", "ESB@");
  the small mono strip is [justified 2-row tagline] · [logo mark] · [EST. 2017 +
  a second field that counts years (2018…) then resolves to "→ FUTURE"].
- Replaced the line-wipe/sign-fold CSS (v43) with: `fxScramble()` engine in main.js
  (setInterval, reveal 1 char/step, tail 3-4 scrambled, spaces preserved; A-Z
  charset for the statement, A-Z0-9@# for mono fields). Statement lines decode
  overlapping (380ms + 260ms stagger); strip joins at 1.2s: logo fades (.sign-on),
  tag words decode individually, EST. 2017 decodes then the future field counts
  2018→2026 @80ms and scramble-resolves to "→ Future". Subline restructured INTO
  the strip as justified word-rows (`.sign-tag` width 19.5em — was 15.5em, which
  jammed row 1's words together; the flex space-between rows only spread if the
  container is wider than the text). Reduced-motion/no-JS: full text in HTML.
- Verified live in panel: scrambled tails observed mid-decode ("CommunicatATWG",
  "the limits oV ZW"), full resolve, year counter seen at 2020/2024, "→ Future"
  landed, word gaps 16px+, no console errors. Reference video + frames saved in
  session scratchpad. CSS v45, main.js v32.

## Beyond + blink cursor + glyph logo (Jul 16, v46/main.js v33)

- "→ Future" → "→ Beyond" (user picked from a brainstorm; year counter unchanged,
  resolves into it). Terminal cursor returns: when the last statement line finishes
  decoding, a white block (.type-cursor) lands at its end, blinks 5× (CSS
  `cursor-blink` 0.55s ×5), and removes itself on `animationend`. Logo in the sign
  strip is now the GLYPH ONLY — new `images/logo-mark-white.png` cropped from
  logo-white.png via PIL (alpha column-gap detection at x=74; glyph 64×45) — shown
  larger (34→54px). Verified: → Beyond resolves, cursor appears with cursor-blink
  ×5 (removal proven by dispatching animationend — panel freezes animations),
  glyph loads at 54px, no console errors.
- Walk-back (v47): user asked for the wordmark text back — strip logo restored to
  full logo-white.png at 38px (glyph file images/logo-mark-white.png kept on disk,
  unused). "→ Beyond" indented right under "Est. 2017" via `.est-future
  { padding-left: 1.2em }` (≈14px — note: measure the indent via a text Range;
  the element's border-box left doesn't move with padding). Verified + screenshot,
  no console errors.

## Hero montage wired in (Jul 16, HTML-only)

- Swapped the homepage hero background from `saltenna-main.mp4` to the user's
  `videos/hero-montage.mp4` (rebuilt version: 89.8s, 1920×1080, ~3.8 Mbps, 42MB,
  yuv420p, faststart) with `poster="images/posters/hero-montage.jpg"` +
  `preload="auto"`. Quality frame-checked (crisp, vivid full color — suits the
  full-color hero). Verified: served bytes == disk, metadata loads (1920w/89.8s),
  poster 200, no console errors. `saltenna-main.mp4` now UNREFERENCED (kept on
  disk — deletion candidate alongside the two old bg loops). NOTE: 42MB is heavy
  for a public deploy — revisit compression before launch.

## Hero timing: slower decode + longer blink (Jul 16, v48/main.js v34)

- User: slower text roll-out + longer end blink. Statement fxScramble step 30→55ms,
  line stagger 260→380 (start 380→500); strip start pushed 1200→2100ms to follow;
  strip decode nudged slower too (tag 26→40, est/future 34→48, year counter 80→110).
  Cursor CSS `cursor-blink 0.55s ×5` → `0.6s ×9` (~2.75s → ~5.4s). Verified served
  values + cursor computed (0.6s ×9), full resolve, no console errors. CSS v48/js v34.

## Neutral hero cursor highlight (Jul 16, main.js v35)

- User: the teal mouse-highlight on the hero waves looked out of place over the
  color montage video — make it neutral grey/white. Hero variant: near-cursor dot
  color FX_TEAL→FX_WHITE (was `g > 0.12 ? FX_TEAL : FX_WHITE`, now always white —
  the alpha/size bump still makes the glow read) and the cursor ripple color
  FX_TEAL→FX_WHITE. Left the static teal horizon line as-is (brand accent, not the
  mouse highlight). Verified live: drove pointermove over the dot ocean, sampled
  brightest pixel around cursor = rgb(255,255,255) (was teal), no console errors.
  main.js v35.

## Boxen logo font — tried then reverted (Jul 17, CSS v49→v50)

- User asked to match the hero statement to the logo wordmark font (identified by
  user as "Boxen"; family zip provided). Self-hosted Boxen Bold: copied
  BOXEN-Bold.otf → `fonts/boxen-bold.otf`, converted to `fonts/boxen-bold.woff2`
  (fontTools, 10KB), added `@font-face` (family "Boxen"), applied to
  `.hero-statement` (v49). Verified it loaded/rendered. User: "not loving this,
  go back" → REVERTED to `var(--font-display)` (Helvetica Neue), removed the
  @font-face (v50). Font files kept in `fonts/` UNUSED (deletion candidate; the
  full Boxen family is in ~/Downloads/Boxen-Type-Family.zip) in case of a revisit
  (Light weight, or Boxen on line 1 only — Bold across all 3 lines was the miss).

## Seabed animation delivered — 4th maritime panel (Jul 21)

- User delivered the final maritime animation (`SEABED~2 1.MP4`, 35s, UUV along a
  "SUBSEA PIPELINE", dark-navy on-theme). Encoded via standard pipeline (CRF 23 slow
  faststart -an → `videos/maritime-seabed.mp4` 7MB; poster t=12s). Promoted the
  placeholder Seabed `.card-grid #uc-seabed` into the 4th `.split reverse
  use-case-panel #uc-seabed` (matches usv/uuv/diver exactly; reverse continues the
  alternation). All 4 maritime animations now live. Verified: 4 use-case panels,
  seabed video loads (1920w/35s), assets 200, no console errors. PENDING user: the
  interim "Along the seabed." image band (band-seabed-divers) is now redundant with
  the real panel — offered to remove it, awaiting answer.

## Oil & Gas animation — 5th maritime panel (Jul 21)

- User delivered an Oil & Gas animation (`OIL_GA~1 1.MP4`, 60s, UUV inspecting a
  labeled "SUBSEA RISER" with a link running along it) — this resolves the
  original brief's "Oil & Gas card intentionally omitted (pending)". Standard
  pipeline → `videos/maritime-oil-gas.mp4` (7.5MB) + poster (t=20s). Added as the
  5th `.split use-case-panel #uc-oilgas` (normal orientation; alternation holds:
  diver n / uuv r / usv n / seabed r / oilgas n). Copy hedged, grounded in the
  approved comms-page pipelines wording. Section intro now "Five domains".
  Verified: 5 panels, video loads (1920w/60s), assets 200, no console errors.

## Scroll-focus use-case panels (Jul 21, CSS v51 / main.js v36)

- User: make the video cards get big on scroll and play the centered one — no
  hover. REPLACED the sticky hover-to-play (v27 behavior) with scroll focus:
  in `applyScrollFX`, the `.use-case-panel` whose center is nearest mid-viewport
  (and within 0.38·vh) gets `.is-focus`; CSS scales it 1.05 (transition includes
  transform now — this also fixes reveals snapping on panels, since the panel's
  `transition` beat `.reveal`'s) with teal border + surface bg; its video plays,
  all others pause. `panelVideos` excluded from IO autoplay on ALL devices now
  (was hover-only); `:hover` CSS on panels removed. Works on touch. Verified:
  served CSS/JS contain the full implementation; live behavior NOT observable in
  the pane this session (rAF fully suspended — even a rAF-liveness probe timed
  out; reveals not firing either) — needs a real-Chrome check by the user.

## Focus scale increased (Jul 21, CSS v52)

- Focused panel scale 1.05 → 1.12; grow disabled ≤900px (panel is ~full-width
  there, would overflow — focus styling/playback kept). Verified at 1280px: true
  1.12 scale, NO horizontal scrollbar; panel bleeds ~30px past each side edge
  (teal border lightly clipped — flagged; 1.08 offered as middle ground).

## Wide-screen focus tier + seabed band kept (Jul 21, CSS v53)

- User answered two open questions: (1) KEEP the "Along the seabed." band
  (not redundant to them — stays as a visual break before the CTA); (2) the
  focused panel should grow LARGER, not smaller. Since the panel is ~1184px
  (1240 container − 56 padding), bigger scales would clip text off-screen at
  ~1280px viewports, so the grow is tiered: base `.is-focus` stays 1.12, new
  `@media (min-width: 1500px)` bumps it to **1.25** (1184×1.25 = 1480 — fits
  a 1500px viewport). ≤900px still no grow. Verified in the pane (forced
  class, transition:none): 1600px → matrix(1.25), panel 53→1533 fully
  on-screen, NO horizontal scrollbar; 1280px → matrix(1.12); no console
  errors. CSS v53 (main.js unchanged v36).

## Bigger inter-panel gap for enlarged focus (Jul 21, CSS v54)

- User: keep space between the maritime use-case panels even when one is
  enlarged. At 1.25 the tallest panel grows ~62px toward each neighbour, so
  the old 44px gap overlapped. Bumped `.use-case-panel + .use-case-panel`
  (and `+ .card-grid`) margin-top 44→**100px**; added a ≤900px override back
  to 56px (panels don't scale there). Verified at 1600px (all panels forced
  to revealed state to kill the entrance-transform artifact): base gap 100px,
  focused panel matrix(1.25) leaves a symmetric **45px clearance** each side,
  no overlap, no horizontal scrollbar, no console errors. CSS v54.

## 18 animated use-case SVGs generated + integrated (Jul 21, CSS v60)

- User asked for images/animations for every explorer use case "in the style
  of the maritime ones". Style was derived from frame-extraction of the
  user's actual maritime animation videos: near-black navy (#0c141f–#121c28)
  with faint contour lines, flat pale-gray objects, dashed link lines, thin
  red/teal/green status boxes, tiny mono CAPS dash-labels. Wrote a style
  guide + programmatic checker; hand-authored `images/uc/comms-underwater.svg`
  as the reference; a 34-agent workflow authored + adversarially reviewed the
  other 17 (three sensing verifies were cut off by a spend limit — later
  eyeballed manually: all on-style; counter-trafficking uses an abstract
  vital-sign indicator, deliberately no human figure).
- SVG format: viewBox 800×450, CSS-keyframe animation only (runs inside
  `<img>`), seamless loops, prefers-reduced-motion static, ≤20KB each,
  palette-locked. Files: `images/uc/comms-{underwater,under-ice,runways,
  around-aircraft,dense-infrastructure,tunnels,ships,iiot,pipelines,
  jungle-canopy,lunar}.svg` + `sensing-{iiot,detection,aquaculture,
  supply-chain,counter-trafficking,bioimaging,environmental}.svg`.
- Integration (finished in the follow-up session): each `.uc-detail-item` on
  communications/sensing now opens with `<div class="uc-detail-media"><img
  src=... loading="lazy">`; CSS `.uc-detail-media` (16:9, border-soft frame,
  #0c141f base) + `:has()` rule hides the old icon when media is present
  (icon markup kept in DOM as fallback). Verified: 11+7 media in correct
  DOM order, active img loads (naturalWidth>0), swaps with selection, icon
  hidden, sticky panel 446px (fits ≥900px-tall viewports), no h-scroll, no
  console errors, screenshots confirm the composed panel. CSS v60
  (main.js unchanged v37). NOTE: old 4173 server finally died — this
  session's own `saltenna-site` server now owns the port.

## Use-case explorer replaces card grids on Comms + Sensing (Jul 21, CSS v59 / main.js v37)

- User found the card grids "static and boring and too many words"; picked
  "option D" (big-type list + swapping detail) from 4 wireframed directions.
  New `.uc-explorer` component: left = `.uc-list` of big display-font titles
  (~2.35rem, dim white 0.3, mono `.idx` numbers; active/hover = white + teal
  index), right = `.uc-detail` STICKY panel (top 110px, bg-alt card) showing
  ONE `.uc-detail-item` (old card's icon at 52px teal + full verbatim h3 + p).
  Hover/focus/click a title swaps the detail (uc-fade 0.35s rise). JS in
  main.js adds `.js` to the explorer — without JS all details render stacked
  (SEO/no-JS keeps the verbatim copy). Hash listener: hero quick-links (ids
  now on the list BUTTONS) activate their item on arrival/click (hashchange
  is async — verify with a delay, not synchronously).
- Communications: the TWO card sections merged into one explorer (11 items,
  shortened display labels e.g. "Runways & Roads", full titles in the panel);
  the second `.block.deep` section REMOVED; drift-ice + canopy bands now sit
  sequentially after. Sensing: 7-item explorer replaces its card grid.
  Old `.card` markup is gone from both pages (`.card` CSS still used on
  index/maritime/about).
- Mobile ≤900px: single column, detail static below list, titles 1.3rem.
  Verified both pages: counts, hover swap, exactly one visible detail, hash
  activation, ids on buttons, bands intact, no h-scroll at 375px, no console
  errors. Pane screenshots were stale/garbled this session (compositor
  quirk) — layout PROVEN via DOM geometry (explorer 1184×708, active btn
  36px white, teal idx, sticky panel 517×320); user should eyeball in real
  Chrome. CSS v59, main.js v37.

## USV "Learn More" → user's artifact (Jul 21, HTML-only)

- User asked to point "the surface wave link" at their claude.ai artifact.
  Interpreted as the #uc-surface (USV / Surface Vessel) panel's "Learn More"
  placeholder → now `https://claude.ai/artifacts/latest/67483ee6-5bfa-4253-
  a1cc-fe47173d1eb8` with target=_blank rel=noopener (external). Their second
  paste of the URL was truncated mid-UUID; used the full first-message URL.
  Other 4 panels keep `#` placeholders. Verified via DOM. CAVEAT flagged:
  artifact returns 403 unauthenticated — user must make it shared/public or
  visitors can't open it.

## Scrollytelling layout (option A) + verification fleet fixes (Jul 22, CSS v61 / main.js v38)

- User picked "option A" (scrollytelling, pinned scene) from 4 Anduril-inspired
  wireframes, asking for BIGGER images and text. `.uc-explorer` (hover list +
  panel) REPLACED by `.uc-scroll`: left = `.uc-steps` (one step per use case:
  teal mono num + full h3 at clamp 1.6-2.3rem + copy at 1.08rem/1.85, steps
  min-height 58vh, inactive dimmed 0.32); right = `.uc-stage` sticky at 13vh
  (mono status bar UC-NN · tagline · NN/NN, then the animated scene at 16:9,
  ~630px wide at 1440). Driver lives in applyScrollFX (same nearest-to-mid
  model as maritime panels; ucActivate/ucScrolls are new top-level globals in
  main.js). Hero quick-link ids moved to the steps (native anchor scroll).
  no-JS: scenes stack visible; reduced-motion: steps undimmed. ≤900px: block
  layout, stage pins UNDER THE HEADER (top 78px) while steps scroll beneath.
  Old `.uc-explorer` CSS left in styles.css as a rollback path (markup gone).
- KEY FIX: `.has-fx { overflow: hidden }` → `overflow: clip` — hidden makes
  the section a scroll container which SILENTLY KILLS position:sticky inside
  (stage sat at top -1910). clip contains the fx canvas identically but keeps
  sticky working. Applies to all has-fx sections; no visual change.
- Verification fleet (3 batched adversarial art-director agents per the fleet
  skill) synthesized: 2 files failed on density (jungle-canopy) / tracking-rect
  drift bug (lunar), 2 on HUD structure+density (detection) / stat overflow
  (supply-chain, environmental had red-filled flags), rest passed with nits.
  SYSTEMIC (in my own reference too): HUD stat rows overflowed their boxes
  (~24-char budget at 8px/ls1.5 in a 176px box) and the waveform translateX(-24)
  popped on wrap (pattern period 84px). Fixed fleet-wide by script: stat rows
  trimmed to <=24 chars, waveforms regenerated on an exact 24px period; checker
  now enforces both (fs8 text <=24 chars, no negative-height rects). Per-file:
  jungle-canopy density rework (2-family mesh, varied curved trunks, station
  detail, tracking rect); detection rework (HUD bar row, blue PASSIVE DETECTION
  SWEEP label, bigger island, array base ring/cable, UUV prop ticks, seabed
  rocks/grass, 8s sync); lunar rover drift 18->7px (stays inside its rect) +
  regolith survey mesh; pipelines LINK ACTIVE + LIVE restored + drift 14px;
  environmental flags -> thin strokes + label/dash reunited; iiot steam 0.16 +
  junk rect/dead CSS removed; ambient top-ups across 9 files. ALL 18 pass
  checker v2. Verified in pane via DOM (driver logic replicated manually —
  rAF/IO/lazy-load/compositor ALL suspended today; ucActivate cascade, sticky
  pinning, counters, ids, no h-scroll at 375px all proven; screenshots
  unavailable). Real-Chrome confirmation requested from user.

## Blueprint-quality SVG re-do COMPLETED + skills installed (Jul 22)

- User supplied two skill files (installed at `.claude/skills/fleet/` and
  `.claude/skills/verify-audit/` — moved OUT of project root so they can't
  deploy). NOTE: fresh Downloads files carry macOS quarantine attrs this app
  cannot read (EPERM even sandbox-off) AND Desktop is TCC-blocked for this
  process — files must be dragged into ~/Saltenna itself.
- Applied the fleet skill's own economics: agents cost ~150k tokens/SVG
  (measured), so the remaining 11 were authored INLINE (~10x cheaper) since
  the style context was already held; independence was preserved by a small
  batched verification fleet instead (3 adversarial art-director agents ×
  4 files, JSON contracts, blueprint frames + checker + qlmanage renders).
- All 18 files now pass checker v2 (7 from the earlier agent run at 14-26KB,
  11 inline at 7-10KB using symbols). Personal render review of all 11 new:
  fixed a pipelines HUD text overlap and an aquaculture label clipping at the
  frame edge. sensing-detection renders quiet in static (CONTACT box/rings
  animate from opacity 0 — by design).
- Cache-bust: all 18 explorer img srcs now `images/uc/<f>.svg?v=2` (SVGs
  changed on disk at same URLs). All 18 URLs curl 200.
- PANE QUIRK (new documentation): today the pane suspended `loading="lazy"`
  img loading entirely (no request fired even after scroll; a fresh eager
  `new Image()` of the same URL decodes fine, and the identical markup
  verified as loading yesterday). Trust eager-probe + curl, and real Chrome.

## Maritime hero video REPLACED with user's 4K beach clip (Jul 21, assets-only)

- Right after the lossless remux (below), user supplied a new clip:
  `~/Downloads/12290768_3840_2160_24fps.mp4` (4K 24fps, 92Mbps, 21.4s —
  top-down golden-hour aerial of waves washing onto sand, real colour; frame
  previewed before use). Encoded scale=1920:-2: CRF 23 hit 61MB (foam bloat),
  settled on CRF 27 → 35.6MB @13.3Mbps after frame-comparing vs CRF 29
  (26.6MB) — nearly identical stills, kept the safer one since the complaint
  was pixelation. Poster re-extracted (t=5s, q:v 2). Same filename
  `maritime-hero.mp4` → NOTE the homepage "Built for the maritime edge."
  band shares this file and changed imagery too (renders dimmed/grayscale
  there). User must hard-refresh. 2nd-heaviest asset after the 42MB montage —
  deploy-weight list updated. Verified: served bytes == disk, 1920×1080/21.4s
  metadata, screenshot (crisp foam, warm sand), no console errors.

## Maritime hero video re-done at source quality (Jul 21, assets-only)

- User: hero looks "pixley". Cause: the old maritime-hero.mp4 was CRF 29
  (chosen Jul 14 when the video sat grayscale at 0.35 opacity — artifacts were
  hidden; full-color/full-opacity exposed them). Pexels has NO 4K variant of
  clip 19518666 (default download is byte-identical to our HD source, ?w/h
  params return empty), so the fix is a LOSSLESS REMUX of the source: `-c copy
  -an -movflags +faststart` — video stream untouched (H.264 High, 5.7Mbps,
  yuv420p, 19.4s), 11.2→13.9MB. Poster regenerated at q:v 2 from the clean
  file. Verified: served bytes == disk, metadata loads 1920×1080/19.4s, no
  console errors. NOTE: same filename + videos have no ?v= — user must
  hard-refresh (⌘⇧R) to drop the cached old encode.

## Seapower hero rolled out to Communications + Sensing (Jul 21, HTML-only)

- User: "do these edits for communications and sensing." Reused the v58
  `.sea-hero` CSS — HTML-only, no version bump. Both heroes now
  `page-hero color-media sea-hero` (full-color video, neutral scrim) with the
  bottom mono info row. Communications: tagline "Beyond legacy radio
  frequency." + desc derived from approved card copy; quick-links UNDERWATER /
  UNDER ICE / SHIPS & SUBS / PIPELINES / LUNAR → new card ids (#uc-underwater,
  #uc-ice, #uc-ships, #uc-pipelines, #uc-lunar). Sensing: tagline "Sensing
  where others can't." + desc = the former hero paragraph MOVED into the info
  row (sensing hero-top is finally trimmed); quick-links INDUSTRIAL IOT /
  DETECTION / SUPPLY CHAIN / BIOIMAGING / ENVIRONMENT → new card ids
  (#uc-iiot, #uc-detection, #uc-supply, #uc-bioimaging, #uc-environment).
  Both first card sections got `id="use-cases"` (the ↓ arrow target).
  Verified per page: sea-hero + full-color video computed, all 6 anchors
  resolve, left edges align at 121px, no h-scroll, no console errors,
  sensing screenshot. All three interior video heroes now share the layout.

## Maritime hero → Anduril Seapower layout (Jul 21, CSS v57→v58)

- User showed anduril.com/sea/seapower and asked to make the maritime hero
  "look more like this." Chose (AskUserQuestion): KEEP dark navy (not white)
  + KEEP video as hero background (not moved below). New `.sea-hero` layout on
  the existing color-media video hero: min-height 100vh flex column,
  space-between → eyebrow "Maritime" + big title (clamp 2.8–6.4rem, lh 0.98)
  up top, and a bottom mono info row pinned to the base: [tagline "Where
  wireless can't reach." + a ↓ scroll link to #challenge] · [description
  (the reinstated intro copy, mono uppercase)] · [5 use-case quick-links
  UUV SWARMING/OIL & GAS/DIVERS/USV/SEABED → the panel anchors]. Links + arrow
  go teal on hover. Added `id="challenge"` to the Challenge section for the
  arrow target. NOTE this reintroduces the eyebrow + a description paragraph
  the user had earlier removed — inherent to the Anduril layout. GOTCHA fixed:
  `.hero-lead`/`.hero-info` are flex items with `.container`'s `margin:0 auto`,
  so they shrink-wrapped to content and CENTERED (title left 257 vs info 93);
  added `width:100%` to both so all left-align at the container edge (121).
  Neutral (untinted) scrim kept, slightly stronger mid for the big title.
  Verified: all left edges 121px, no h-scroll, all 6 anchors resolve, no
  console errors, screenshot matches the reference. CSS v58.

## Maritime hero in full color + untinted (Jul 21, CSS v55→v56)

- User: "give the image color at the top." Interior heroes are normally
  grayscale(1) at opacity 0.35; added a reusable `.page-hero.color-media`
  modifier (opacity 1, filter none). Applied to maritime's hero only
  (comms/sensing/contact stay grayscale). (CSS v55)
- Follow-up: "it still looks blue, no tints." The blue was the navy+teal
  `::after` scrim, NOT the footage. Replaced the color-media scrim with a
  NEUTRAL black-only darkening gradient (rgba(0,0,0,.55)/.12/.72) — no navy,
  no teal — so the footage keeps its true colours; kept enough black top/bottom
  for title legibility + to blend into the dark Challenge section below.
  Verified: computed ::after is pure rgba(0,0,0,…), CSS v56, no console errors.
  NOTE: with the tint gone the hero clip (maritime-hero.mp4) reads nearly
  black-and-white — the blue was entirely the overlay; the footage itself is
  near-monochrome dark water + white foam. A colourful hero would need a
  different, more colourful clip, not a scrim change. (CSS v56)

## Maritime hero trimmed to title only (Jul 21, HTML-only)

- User: "just one title" then "take out that tab that says Maritime" (the
  eyebrow). Removed BOTH the hero paragraph and the "Maritime" `.eyebrow`
  label — maritime hero is now ONLY the h1 "Maritime Communications and
  Sensing" over the video (unlike Communications/About which kept their
  eyebrow). Verified: 0 eyebrows, 0 paragraphs, h1 intact. Nav "MARITIME"
  tab untouched. Only Sensing still has a hero paragraph now.

## Maritime panel reorder (Jul 21, HTML-only)

- User: move UUV to the top and Oil & Gas below it. New panel order:
  UUV Swarming → Oil & Gas → Diver-to-Diver → USV → Seabed. Re-applied the
  normal/reverse alternation (UUV n / oilgas r / diver n / usv r / seabed n)
  so the sides still zig-zag. Each panel kept its id/video/copy. HTML-only,
  no version bump. Verified order + reverse flags in the pane, no console
  errors.

## Reverted / dead ends (don't re-do)

- Partner portal (built → removed).
- Video terminal narration (built → removed; the "text behind the animations").
- iframe-based LinkedIn embeds (twice; replaced by in-page embed).
- Pure-black background (twice; now navy).
- Antenna masts on hero waves; radar crosshair following cursor (both removed).

## Interactive 3D three.js graphics replace 4 static diagrams (Jul 23, CSS v62)

- User delivered 4 self-contained three.js HTML graphics (from ~/Downloads,
  dragged into ~/Saltenna after quarantine blocked Read) and asked to swap them
  in for 4 existing static SVG diagrams. Mapping: index "Game-changing
  communications" → plasmonic-surface-wave-link; index "Sensing subtle changes"
  → through-metal-link; communications "Why Plasmonics" → saltenna-vs-conventional;
  sensing "How It Works" → sealed-container-link.
- Approach: embedded each as an isolated `<iframe loading="lazy">` (preserves
  the orbit/zoom controls, sandboxes the WebGL context, can't collide with
  main.js). Made trimmed "embed" copies in `graphics/` (kept each scene's
  three.js VERBATIM; stripped the standalone prose wrapper so the `.card` fills
  the frame; repointed `<script src>` to a SELF-HOSTED three.js). Downloaded
  three.js r128 → `js/vendor/three.min.js` (603KB) to keep the no-CDN ethos.
- CSS: new `.split-media.graphic` modifier (opts out of the grayscale filter,
  3:2 aspect to match the graphics' native ratio, dark bg); iframe fills it.
- Verified: all 4 graphic files + three.js serve 200; direct-load screenshots
  of 2 (surface-wave-link, saltenna-vs-conventional) render the full 3D scenes;
  on index the embedded iframe's contentDocument has live THREE r128 + canvas;
  no console errors; 0 old-svg split-media left on the 3 pages. NOTE: the
  preview pane can't composite WebGL inside an iframe (screenshots of the
  embedded frames come back blank — direct-load proves the render). Original
  Downloads HTML files untouched. CSS v62 (main.js unchanged v38).

## 3D graphic cards recolored navy + zoomed (Jul 23, CSS v63)

- User: white-on-black cards too harsh; match the site, make the graphic
  bigger. Per embed: card gradient #12141b/#0a0d14 → navy #15283f/#0b1626;
  three.js `scene.fog` 0x0a0a0b → 0x0b1626 (depth fades to navy, not black);
  camera initial radius zoomed in (plasmonic 95→78, through-metal 52→44,
  saltenna-vs 105→93, sealed-container 82→75 — the two with WIDE bottom labels
  eased off less to avoid the world-space text sprite clipping the frame edge).
  `.split-media.graphic` bg → #0b1626 (tried 4/3 for more area but reverted to
  3/2: these are landscape scenes, 3/2 is wider and keeps the long labels like
  "PRESENCE DETECTED THROUGH METAL" inside frame). Verified: navy bg computed
  rgb(11,22,38), 3/2, all 4 serve 200, no console errors, screenshot shows the
  softer navy card + larger scene. CSS v63 (main.js unchanged v38).

## Graphic card bg flattened to match the scene (Jul 23)

- User: match the card background to the graphic. The card had a gradient
  (#15283f→#0b1626) whose lighter top didn't match the 3D scene, which fogs to
  a flat #0b1626. Flattened each graphic's `.card` background to solid #0b1626
  = the fog/fade color = the `.split-media.graphic` container color, so card +
  empty space + scene fade are one seamless navy field. graphics/*.html only,
  no CSS/version change (container was already #0b1626). Verified render +
  no console errors.

## Graphics fully reverted to originals + black container (Jul 23, CSS v64)

- User asked twice to revert the 3D graphics to their originals; the second ask
  made clear it meant EVERYTHING (the navy recolor round AND the camera zooms).
  Regenerated all 4 `graphics/*.html` embeds verbatim from the original
  ~/Downloads files — original card gradient (#161618→#0a0a0b 70%), original
  black fog (0x0a0a0b), original camera radii (95/52/105/82). Only embed
  necessities differ from the originals: card fills the iframe viewport and
  three.js loads from ../js/vendor/three.min.js. `.split-media.graphic`
  container bg = #0a0a0b (black, matches the card gradient end) — set in v64.
  Verified: sanity greps for original radius/fog per file, direct-load render
  matches the original look, container computes rgb(10,10,11), no console
  errors. LESSON: when the user says "revert to original", regenerate from the
  source files rather than un-picking individual edits.

## Homepage What We Do section white → black (Jul 23, CSS v65)

- User: make the white background match the graphics' black. The homepage
  "What We Do" section (`block light`, the only light section left on the
  site) is now `block ink` — new one-line variant `section.block.ink
  { background: #0a0a0b; }` matching the 3D graphic cards exactly. Dropping
  `light` restores the default white heading / dim body text automatically
  (verified computed: section bg == media bg == rgb(10,10,11), h white,
  p #9bb0c2). Note: the what-we-do fx canvas that was removed when the
  section went light was NOT re-added — offer if wanted. `.block.light`
  CSS retained (unused). CSS v65.

## Interior hero rollout animation (Jul 23, CSS v66)

- User: interior hero videos + text feel static on page flip; want a rollout
  like the homepage. Added a CSS-only staggered entrance scoped to `.sea-hero`
  (comms/sensing/maritime): bg-video `hero-fade` (opacity 1.1s), eyebrow
  `hero-rise` (0.15s), h1 `hero-wipe` (clip-path inset left→right reveal +
  slight rise, 0.3s), then hero-info-tag/desc/links `hero-rise` staggered
  0.62/0.74/0.86s. All `animation-fill-mode: both` so they start hidden and
  hold visible; fires on load (no scroll/JS trigger — immune to the pane's
  rAF/IO suspension and works on every navigation). prefers-reduced-motion
  disables all six. Homepage `.hero` (scramble-decode) untouched — scoping is
  `.sea-hero` only. Video uses opacity-only (no transform) to avoid colliding
  with main.js parallax on .bg-video. Verified: computed animation-names +
  delays correct on comms & maritime, getAnimations().finish() resolves h1 to
  opacity 1 / clip fully open, video+links opacity 1, no console errors.
  CSS v66.

## Interior heroes now scramble-decode like the homepage (Jul 23, CSS v67 / main.js v39)

- User upgraded the ask: not just the CSS rollout (v66) but the actual
  homepage scramble effect on the other pages. main.js: new sea-hero block
  reuses `fxScramble` — eyebrow (250ms, MONO charset), h1 (500ms, step 22,
  tail 4, NEW mixed-case charset SCRAMBLE_MIXED since interior titles are
  sentence case), info tagline (1300ms, MONO), then the 5 quick-links
  staggered 1600+i*150ms (MONO). `decode()` helper pins each element's
  min-height to its rendered height before emptying so the hero layout
  doesn't jump while text regrows. Hero gets `.js-decode`, and CSS turns off
  the v66 entrance animations on those elements (they remain the no-JS
  fallback); the bg-video hero-fade and description hero-rise stay CSS-driven.
  Reduced-motion: JS skips (motionOK) AND CSS entrances are disabled → fully
  static. Verified on sensing: caught mid-decode "Wireless SensiCe r" →
  resolves to full title; tag + all 5 links land complete; maritime decodes
  too (h1 + eyebrow full after load); .js-decode set, CSS anim computed
  'none', no console errors. CSS v67, main.js v39.

## Darker deep sections + instrument-panel scrollytelling stage (Jul 23, CSS v68 / main.js v40)

- User (screenshots): the comms scrollytelling section should match the
  homepage dark-section color, and the pinned scene "looks plain just
  sitting there — come up with a better way to present it".
- `section.block.deep` gradient darkened from the navy #0a1220→#0d1a2b ramp
  to near-black `#070c14 → #0a1220 (55%) → #070c14`, teal/blue radial washes
  reduced to 0.05/0.04. Matches homepage `.block.dark` (#070c14). By design
  this also darkens maritime #use-cases and about #team (all .deep sections).
- Instrument-panel stage treatment (`.uc-scroll`):
  - `.uc-stage::after` — reticle corner brackets: 8 no-repeat
    linear-gradient strips (`--bkt: rgba(157,189,209,0.5)`), inset -14px,
    24×1.5px legs at each corner.
  - `.uc-stage-media` — `overflow:hidden` + layered glow
    `box-shadow: 0 34px 90px -42px rgba(0,0,0,0.85), 0 0 90px -36px
    rgba(var(--teal-rgb),0.3)`.
  - Scene settle: imgs sit at `scale(1.045)`; `.is-active` eases to
    `scale(1)` over 0.9s — each swap gets a subtle camera-settle.
    Disabled under prefers-reduced-motion.
  - Live status bar: ucScrolls init harvests `labels` from each step's
    `.uc-num` text (strips "NN — ") and grabs the bar's middle span
    (`mid`); `ucActivate` writes the active label. Bar now reads e.g.
    `UC-03 · RUNWAYS & ROADS · 03 / 11` and updates per step.
- Verified (pane, DOM + screenshot): deep bg contains rgb(7,12,20);
  ::after brackets + glow computed present; activating steps updates
  tag/label/counter on comms (UC-03 RUNWAYS & ROADS 03/11) and sensing
  (UC-02 ADVERSARY DETECTION 02/07); active img resolves to scale(1);
  desktop screenshot shows brackets/glow/label; no console errors either
  page. CSS v68, main.js v40, bumped on all six pages.

## "Under the canopy." band removed (Jul 30, HTML only)

- User asked to take out the jungle-canopy `.image-band` on communications.
  Removed the whole `<section class="image-band reverse">` (video + container).
  Communications section order is now: sea-hero → use-case scrollytelling
  (block deep) → "Through and along the ice." band → Why Plasmonics (block
  dark) → CTA. The jungle-canopy USE CASE itself (scrollytelling step 06 +
  images/uc/comms-jungle-canopy.svg) is untouched — only the full-bleed band
  went away. No CSS/JS change, so no version bump (still CSS v68 / main.js
  v40). Verified: 0 references to band-jungle-fog in any HTML, one remaining
  `.image-band` ("Through and along the ice."), no console errors.
- NEWLY UNUSED assets (deletable): `videos/band-jungle-fog.mp4` (13.1MB) and
  `images/posters/band-jungle-fog.jpg` (293KB).

## Batch polish pass — 10 tweaks (Jul 30, CSS v69 / main.js v41)

One large user prompt; all pages touched. In order:
1. Homepage dead-zone cards are now LINKS (`a.card` + `.card-go` corner
   arrow, slides teal on hover): Water & Ice → comms#uc-underwater, Metal →
   #uc-ships, Soil/Rock → #uc-tunnels (new id), Vegetation → #uc-jungle
   (new id).
2. 3D graphics (graphics/*.html ×4): wheel-zoom handler removed (identical
   block in each), hint now "drag to orbit". Spin/drag untouched. Bonus:
   page scroll no longer hijacked over the iframes.
3. Copy dedup: paragraph OR bullets, never both — removed the <ul>s from
   index what-we-do (both splits, paragraphs tightened), comms
   why-plasmonics (traits folded into the paragraph), sensing how-it-works
   (same). About who-we-are ul → single merged paragraph. Index dead-zones
   lede lost its environment enumeration (the cards repeat it).
4. ALL `.eyebrow` kickers removed site-wide (17 total incl. hero-lead ones;
   CSS + the null-guarded decode line cleaned in main.js). `.uc-num` step
   numbering deliberately KEPT (drives the stage-bar labels).
5. "Under the canopy." band was already gone (prev entry) — user screenshot
   was a cached page.
6. `.interface-divider` markup removed everywhere (6 instances; CSS kept).
7. About rebuilt: strait band + no-media hero REPLACED by a `.sea-hero`
   using the drift-ice footage (videos/band-drift-ice.mp4, shared with the
   comms ice band), h1 "Working at the boundary." (decodes), tagline
   "Est. 2017 — McLean, Virginia.", ↓ → #who-we-are. "Beyond every existing
   wireless technology." removed per user. NEWLY UNUSED: about-band-strait.mp4
   + poster.
8. Nav order on all 6 pages + footers: Home, MARITIME, Communications,
   Sensing, About. Footer Technology list finally gained Maritime (old open
   item resolved).
9. Maritime use-cases converted from scroll-focus panels to the same
   `.uc-scroll` scrollytelling as comms/sensing — 5 steps (ids preserved for
   hero quick-links, Learn More links kept incl. the USV artifact), sticky
   stage now holds the FIVE VIDEOS (poster + preload=none). main.js:
   ucScrolls generalized img→media (img|video); ucActivate pauses non-active
   videos; the scroll driver plays the active video only while the section
   is on-screen and pauses it off-screen; reduced-motion never autoplays.
   CSS: .uc-stage-media video joins every img rule + object-fit cover.
   Section canvas field→sonar to match. Old .use-case-panel CSS/JS remains
   but matches nothing.
10. Header un-centered: `.nav-wrap` gets max-width none + clamp padding —
    logo hugs the left edge, tabs the right, at every width.
Verified via DOM on maritime/index/about/comms (nav order, 0 eyebrows/
dividers, card hrefs+arrows, ucScrolls media=VIDEO×5, activation updates
bar to "UC-02 · OIL & GAS · 02 / 05" + play() on the right video, about
hero decodes with ice video, graphics served with 0 wheel listeners) — no
console errors anywhere. Pane was HIDDEN mid-session (screenshots blank);
visual confirmation deferred to the user's Chrome. CSS v69, main.js v41.

## Post-verify fixes (Jul 30, main.js v42, HTML copy)

- Adversarial verify fleet (5 agents, 32 checks) found 4 issues; 2 fixed:
  (a) heading-echo copy trimmed — comms runways + pipelines steps, sensing
  supply-chain step no longer repeat their h3 phrase in the paragraph;
  (b) reduced-motion scrollytelling: the stage used to freeze on scene 01
  because the driver lives behind motionOK — added an `else if
  (ucScrolls.length)` scroll listener that runs ucActivate only (scenes
  track the step being read; videos never autoplay, posters show).
- Not fixed by design: USV Learn More still points at the user's claude.ai
  artifact (existing deploy caveat — must be made public); no-JS `.reveal`
  content invisible site-wide is a PRE-EXISTING pattern (spawned as a
  separate task chip). main.js v42 on all six pages (CSS stays v69).

## Scrollytelling retired — scroll-focus panels site-wide (Jul 30, CSS v70)

- User: "i liked the way the maritime page scrolled before — revert it and
  make sensing and communications scroll like that."
- Maritime use-cases reverted to the five `.split.use-case-panel` rows
  (videos + replay hint + parallax + Learn More links incl. USV artifact;
  eyebrows NOT restored — that removal stands; canvas back to `field`).
- Communications (11) and Sensing (7) use-case sections converted from
  `.uc-scroll` to the same panel pattern: text column + NEW
  `.split-media.scene` (16:9, no grayscale, #0c141f bg) holding each
  animated SVG scene (`images/uc/*.svg?v=2` — they animate inside <img>).
  Alternating `.reverse` (visual no-op, matches old maritime markup). All
  anchor ids preserved on the panels (hero quick-links + homepage card
  links still resolve).
- NO `.uc-scroll` remains in any page; the uc-scroll CSS + ucScrolls JS
  (incl. the v42 reduced-motion tracker) stay as inert rollback. The
  existing focusPanels driver now grows/plays the centered panel on all
  three pages (comms/sensing panels have no video → just the 1.12/1.25
  focus grow; maritime videos play/pause as before).
- Verified via DOM (pane compositor suspended for screenshots mid-session):
  panel counts 5/11/7, all ids resolve, focus math applies is-focus +
  scale(1.12), maritime focus plays the right video (stubbed play),
  scene SVGs serve 200 + eager-probe loads, no console errors on any of
  the three pages. CSS v70 (main.js unchanged, v42).

## No-JS reveal fallback (Jul 31, CSS v71 / main.js v43)

- Every `.reveal` element sat at `opacity: 0` forever with JS disabled; the
  `.uc-scroll` CSS comments promised a stacked no-JS fallback that never worked.
- `main.js` now adds a `js` class to `<html>` as its FIRST statement; the hidden
  start state is scoped to `html.js .reveal`.
- Gotcha that bit mid-task: `.reveal.visible` and the reduced-motion
  `.reveal` rule had to be re-scoped to `html.js` as well. The new
  `html.js .reveal` selector outranks a bare `.reveal.visible`, so scoping only
  the hidden state left content permanently invisible WITH JS. Caught by
  verifying the JS-on path, not just the JS-off path.
- `.uc-scroll:not(.js)` stage media also resets `transform: none` so stacked
  scenes aren't stuck at the 1.045 overscale. (No page contains `.uc-scroll`
  markup — this is future-proofing for the inert rollback component.)
- Verified by serving script-stripped copies of all six pages: 16/15/11/12/11/2
  `.reveal` elements, all at computed opacity 1, no transform.

## Ported to Astro for Webflow Cloud (Jul 31)

Full decision record and remaining steps: `docs/WEBFLOW_CLOUD.md`.

- Established that **Webflow cannot host hand-coded HTML** (no raw-HTML import,
  export-only), which ruled out "just put the site in Webflow". User chose
  Webflow Cloud + Astro, with video on Cloudflare R2.
- New `webflow-app/`: Astro 7.1.6 + @astrojs/cloudflare 14.1.7 + wrangler
  4.118.0. `output: "server"` + `prerender = true` per page (Webflow Cloud does
  not support `output: "static"`). `build.format: "file"` so pages emit as
  `about.html` and the original RELATIVE links keep resolving — that relativity
  is what makes one build work at any mount path.
- Head/header/footer were byte-identical on all six pages, so they collapsed
  into `src/layouts/Base.astro` (props: title, description, active). Body
  content lifted verbatim between `</header>` (line 27 everywhere) and
  `<footer`. Safe because no page contains `{` or `}` — checked first.
- 14 video refs (12 distinct, 143.1 MB) templated onto `VIDEO_BASE`
  (`PUBLIC_VIDEO_BASE`, default relative `videos`). `scripts/upload-videos.sh`
  derives its file list from `src/pages/*.astro` so it can't drift; skips ~39 MB
  of unreferenced clips.
- **Discovered the real Workers per-asset cap is 25 MiB**, not the 1 GB Webflow's
  limits page advertises — the build failed with `Asset too large` on
  `hero-montage.mp4` (32.5 MiB) once a stray `public/videos` symlink pulled the
  MP4s into `dist/`. Symlink removed; video must live on R2.
- **Bug caught by verification**: `js/vendor/three.min.js` was dropped as
  unreferenced (a grep over root `*.html` + `main.js` found nothing) and the
  Workers run 404'd it — all four `graphics/*.html` standalone documents load it
  via `../js/vendor/three.min.js`. Restored. Include `graphics/` in asset sweeps.
- Astro canonicalizes to extensionless URLs: `/about.html` 307s to `/about`.
  Harmless (one hop; assets are direct 200s). `html_handling: "none"` in
  `wrangler.json` had NO effect — the redirect is Astro's router, not
  Cloudflare's asset layer — so that config was reverted rather than left dead.
- Verified: 6 pages prerender; crawl of all 6 pages plus the 4 `graphics/*.html`
  documents found **67 distinct local refs, all resolving**, no console errors;
  nav click-through on the real `wrangler dev` Workers runtime; hero video
  actually playing (readyState 4, currentTime past 30s); LinkedIn feed at 42,779
  chars; R2 indirection proved by building with an absolute `PUBLIC_VIDEO_BASE`
  and confirming all 12 files serve 200.
- `.claude/launch.json` gained `saltenna-astro` (4321) and
  `saltenna-workers-preview` (8787), both opening at `app.localhost` because the
  SociableKIT widget refuses to render on `localhost` (see CURRENT_STATUS quirks).

## Products page designed, not built (Jul 31)

- User is planning a products page: 4-5 products plus a separate software-tools
  section, 3D models now and photographs later.
- Recommendation recorded in `docs/PRODUCTS_PAGE_PLAN.md`: `.uc-explorer` for the
  products, `.card-grid` for the tools. `.uc-explorer` is fully styled at
  styles.css:1472 (with a ≤900px mobile fallback at 1556 and an already-locked
  16/9 `.uc-detail-media` at 1564) and has NEVER been used — it needs ~15 lines
  of JS plus one `iframe` CSS rule.
- Driving constraint: each 3D graphic is its own WebGL context via iframe. The
  busiest page today runs two; five live at once would be a real load problem.
  The explorer shows one at a time, which removes the issue.
- No code written; product names and copy not yet supplied.

## Products page built (Jul 31, CSS v72 / main.js v44)

- Built per PRODUCTS_PAGE_PLAN with the first two products, both sourced from
  spec-sheet PDFs the user supplied (`D2D 6. (most recent)pdf (1).pdf`,
  `Remora product spec outline.pdf` — both image-based; text read by rendering
  pages via PyMuPDF, posters extracted from the embedded images):
  - **D2D** — diver-to-diver comms. Specs: 20 m depth, up to 300 m range,
    2.12 kg total, 2–35 °C, antenna 30×15×10 cm. Status **"Prototype" is a
    placeholder — not on the sheet, unconfirmed**. Cross-links Maritime.
  - **Remora** — wireless data links along subsea pipelines/cables/umbilicals,
    pipe as the transmission medium. Up to 200 m/hop, retrofit no cable pull,
    non-galvanic, high & low frequency paths. Status "Customer engagement
    ready" (verbatim from its sheet). Cross-links Communications.
- Decisions (user, via question dialog): nav slot after Home before Maritime;
  maturity as a separate `.status-badge` (deliberate exception to the Jul 30
  no-eyebrow rule); root duplicates kept until deploy with CSS/JS mirrored.
- New files: `src/data/products.ts` (products + `tools[]`, currently empty →
  software section hidden), `src/components/ProductMedia.astro` (image → model
  iframe → poster fallback in the locked 16/9 box), `src/pages/products.astro`
  (page-hero no-media + explorer in `block deep` + hidden card-grid tools
  section + cta-band). Posters in `public/images/products/` (293 KB total).
- Explorer JS added to main.js scoped to `.uc-explorer[data-explorer]` (the
  retired `.uc-scroll` code untouched). CSS: `.uc-detail-media` img rule now
  also styles `iframe` and crops with `object-fit: cover`; new `.product-meta`,
  `.status-badge`, `.product-domain`, `.product-claim`, `.spec-chips`.
- One specificity bug caught in verification: `.uc-detail-item p` (0,1,1) beat
  `.product-claim` (0,1,0) and dimmed the claim line — fixed by scoping to
  `.uc-detail-item .product-claim`.
- Verified on astro dev at `app.localhost:4321`: build prerenders all 7 pages;
  zero console errors; explorer collapses to item 1 and click-swaps (DOM
  measured: 2-col grid, sticky detail, 16/9 media, cover-fit images loaded,
  teal badge, chips); emitted HTML carries `?v=72`/`?v=44`; posters serve 200;
  nav + footer updated on all pages. Screenshots limited by the hidden-pane
  compositor freeze (known quirk) — hero captured, explorer DOM-verified only.
- Root `*.html` navs intentionally NOT given the Products link (no
  products.html exists at root); root css/js re-mirrored.

## Hero videos restored on astro dev (Jul 31)

- User reported all hero videos stopped playing. Cause: they were browsing the
  Astro dev server (4321), where `videos/*.mp4` 404'd — the MP4s are
  deliberately not in `public/` (25 MiB Workers asset cap; R2 in production),
  and only the old static server (4173, repo root) had them. Not a regression
  from the products-page work.
- Fix: dev-only Vite middleware (`devVideos()` in `astro.config.mjs`) serving
  `../videos` at `/videos` under `astro dev`. Handles Range requests (206 with
  Content-Range — Safari refuses video from servers that ignore Range) and
  blocks path traversal. `apply: "serve"` keeps it out of builds.
- Verified: all 12 referenced MP4s curl 200 on 4321; range probe returns 206
  `bytes 0-1/34077446`; traversal 404s; sensing hero measured readyState 4,
  paused false, duration 17.6s in-page; rebuild puts zero MP4s in dist
  (client 5.8 MB). `npm run preview` (wrangler) still needs PUBLIC_VIDEO_BASE —
  README updated.
- Gotcha hit: `npx astro build` from the repo root (not webflow-app/) grabs a
  stale npx-cached astro and dies with a rolldown error — run it from
  webflow-app/.

## Body copy enlarged site-wide (Jul 31, CSS v75)

- User asked for larger paragraph text. Surveyed every paragraph rule first
  rather than bumping one page: body copy was 16px (inherited, no explicit
  size on `.split p`, `.cta-band p`, `.image-band p`, `.uc-detail-item p`) and
  card paragraphs were 0.88-0.9rem (14.1-14.4px).
- First pass at ~+6% was only a 1px change and would not have read as an
  answer to the request; went to 1.12rem (17.9px) for body copy instead, with
  the surrounding scale moved to match. Final: `.page-hero p` 1.18rem,
  `.section-head p` 1.14rem, `.split p`/`.cta-band p`/`.image-band p`/
  `.uc-detail-item p` 1.12rem, `.hero-info-desc` 1.1rem, `.product-claim`
  1.2rem, `.card p` 1.02rem, `.team-card p`/`.post-card p`/
  `.linkedin-fallback p` 1rem.
- Two hierarchy inversions caught by measuring headings against their own body
  text, not by eye: `.card h3` (1rem) had fallen BELOW `.card p` (1.02rem) —
  raised to 1.1rem; `.team-card h3` was left only 0.8px above its body —
  raised 1.05→1.12rem. Also raised `.product-claim` 1.02→1.2rem, which would
  otherwise have dropped under the body paragraph it introduces.
- Left deliberately unchanged: footer text (0.88rem, chrome not copy), nav,
  mono spec chips and status badges, all display type, and the inert
  `.uc-step` rules from the retired scrollytelling.
- Verified across pages: computed sizes measured on sensing/products/index,
  every heading-vs-body pair reports OK, no horizontal overflow at desktop or
  narrow width, no clipped cards, sticky detail pane not overflowing. Build
  prerenders all 7 pages emitting `?v=75`; root `css/` re-mirrored and
  diff-verified in sync.

## Maritime use-case clips sped up (Jul 31, main.js v45 -> v46)

- User asked for 20% (shipped as `data-speed="1.2"`, main.js v45), then revised
  to 30% minutes later — final value is **1.3** (v46). Because the rate lives in
  the markup, the revision was a 5-attribute edit with no JS change; the JS
  comment was reworded to stop naming a specific rate so the two can't drift.
  Done with playback rate, NOT
  re-encoding: no quality loss, no 143 MB re-upload to R2, instantly adjustable,
  and the source files stay untouched.
- Declarative rather than hardcoded: the 5 panel videos in `maritime.astro` carry
  `data-speed="1.2"`, and main.js applies it to any `video[data-speed]` — same
  pattern as the existing `data-fx` / `data-parallax` attributes, so scope is
  visible in the markup and per-video tuning needs no JS edit.
- **Both `playbackRate` and `defaultPlaybackRate` are set, and that is load-
  bearing, not defensive.** The HTML media load algorithm resets `playbackRate`
  to `defaultPlaybackRate`; these clips are `preload="none"`, so their resource
  load runs on the first `play()` and a `playbackRate`-only assignment would
  silently snap back to 1x. Verified empirically with a control video: setting
  only `playbackRate = 1.5` then calling `load()` returned it to 1.
- Scope: the 5 use-case panel clips only. Deliberately excluded the maritime
  hero (ambient background loop — speeding it reads as hurried), the
  `band-seabed-divers` image band, and all other pages. Confirmed homepage
  videos, incl. its `maritime-hero.mp4` band, still report rate 1.
- Verified: all 5 report playbackRate/defaultPlaybackRate 1.2; timed playback
  advanced 1.801s of video in 1.501s wall clock = 1.2x measured; rate survives
  both the first `play()` and the click-to-replay path (`currentTime = 0`); no
  console errors; build emits `?v=45` with 5 `data-speed` attributes in
  `dist/client/maritime.html`. Root `js/` re-mirrored and diff-verified.

## Comms/sensing use cases consolidated (Jul 31, markup only)

- User direction after an options discussion: keep the scroll-focus pattern,
  don't touch animations, communications 11 → 5 panels, sensing 7 → 4.
  Organizing principle (agreed in discussion): group by the barrier the tech
  defeats, not the application, so buyers project their own uses. Buyer lists
  ("military, law enforcement, and intelligence") dropped from copy.
- Communications: Water+Ice → uc-water (comms-underwater.svg) · Ships+Dense
  Infra+Tunnels → uc-metal (comms-ships.svg) · Runways+Aircraft → uc-surfaces
  (comms-runways.svg) · Pipelines+IIoT → uc-pipes (comms-pipelines.svg) ·
  Jungle+Lunar → uc-beyond (comms-jungle-canopy.svg). Section head now "Five
  barriers. One physics."
- Sensing: IIoT+Supply → uc-sealed (sensing-iiot.svg) · Detection+Stowaways →
  uc-presence (sensing-detection.svg) · Aquaculture+Environmental → uc-water
  (sensing-environmental.svg) · Bioimaging → uc-tissue (sensing-bioimaging.svg).
  Section head "Sensing through the opaque." with the imagination prompt
  ("What's behind yours?") folded into the intro line since the page stays at 4.
- Merged copy deliberately preserves claim levels: "has demonstrated" kept only
  where an original source panel said it (tunnels range, tanks/pipes comms,
  through-metal sensing); everything else stays "developing/working on/may".
- Anchor remaps: hero quick-links on both pages rewritten (comms 5, sensing 4);
  homepage's 4 deep-link cards remapped — uc-underwater→uc-water,
  uc-ships→uc-metal, uc-tunnels→uc-metal (two cards share a target now),
  uc-jungle→uc-beyond. Site-wide grep confirms zero references to the 11 old
  ids outside maritime.astro (whose uc-* ids are its own and untouched).
- No CSS/JS edits, so NO version bump (still v75/v46). Root *.html snapshot
  untouched as agreed. 12 of 18 images/uc/*.svg now unreferenced — left on
  disk pending delete approval.
- Verified: build prerenders all 7 pages; comms shows exactly 5 panels /
  sensing 4 with correct titles+ids; every quick-link and homepage card target
  resolves in the BUILT output (grep of dist/client); scenes serve 200; hero
  scramble-decode settles to the new link names; zero console errors. Panel
  focus/lazy-load not observable in the embedded pane (visibilityState
  "hidden") — pattern unchanged from production, but worth one real-browser
  scroll-through.

## Products page sea-hero + explorer deep links (Jul 31, main.js v47)

- User supplied Downloads/347325.mp4 (73 MB, 4K30, 30 Mbps, 20.3s, with an
  audio track) for the products hero. Re-encoded with the imageio_ffmpeg
  binary to 1920x1080 CRF 26, audio stripped, +faststart → 2.6 MB at 1090 kb/s
  (slow aerial footage compresses extremely well; frame quality spot-checked
  visually at 8s). Installed as videos/products-hero.mp4; poster frame at 1.5s
  → public/images/posters/products-hero.jpg (115 KB).
- NOTE: the clip is a golden mountain-sunset flyover — a deliberate palette
  departure from the site's navy/teal maritime look. Flagged to the user at
  build time; shipped as requested.
- Hero swapped from `page-hero no-media has-fx` to the full sea-hero pattern
  (matches sensing/maritime/comms structurally): bg video + poster, hero-lead
  h1 "Products", tag "Physics, packaged." + ↓ arrow to #products, the
  hero-info-desc paragraph, and hero-info-links tabs generated from
  products.ts ids — so new products get a hero tab automatically. Rollout
  verified identical to sensing (hero-fade on video, hero-rise on desc,
  scramble decode driven by the seaHero JS; h1/tag/links animate via JS, not
  CSS — compared computed styles against sensing in an iframe to confirm
  "none" is correct there too).
- Explorer hash deep-linking added to main.js (v47): on hashchange/load, a
  hash matching a .uc-detail-item id activates that item and scrolls the
  explorer into view. Without this the hero tabs would silently no-op —
  inactive detail items are display:none, so the browser's native anchor jump
  has nothing to scroll to. Verified: #prod-remora activates Remora + scrolls
  (y=944), #prod-d2d swaps back, list button states follow.
- Build: video NOT in dist (0 mp4s), poster + video refs emitted, all 7 pages
  prerender, no console errors. upload-videos.sh --dry-run now lists 13 files;
  README's "12 referenced MP4s ~143 MB" updated to 13/~146. Root js/
  re-mirrored (v47).

## Products hero re-encoded at 4K after quality complaint (Jul 31)

- User: "video seems low quality i believe gave you a 4k one". Correct — the
  first encode downscaled the 4K source to 1080p (2.6 MB), which reads soft
  full-viewport on hi-DPI displays; sunset gradients are also banding-prone at
  1090 kb/s. Since video ships from R2 (no 25 MiB cap applies) and
  maritime-hero set a 4K precedent, downscaling was the wrong default —
  lesson: for full-viewport heroes, keep source resolution and spend the bytes.
- New encode: native 3840x2160, CRF 24, preset slow, audio stripped,
  +faststart → 14 MB @ 5.7 Mbps (still under maritime-hero's 35.6 MB).
  Verified by same-frame crop comparison at matched scale: 4K resolves rock
  striations and cloud texture the 1080p upscale smears. Poster regenerated at
  2560px (139 KB).
- Same filename (videos/products-hero.mp4), so no markup change and no version
  bump; upload script list unchanged at 13 files (~158 MB now). In-page
  verification with a cache-busted source: videoWidth 3840, readyState 4,
  playing, 20.3s.

## Waveform ported into the FX engine; Software section shipped (Jul 31, CSS v76 / JS v48)

- User provided the tool description (a software-defined waveform for extreme
  path loss links, licensed out) plus a detailed port spec for
  ~/Saltenna/waveform-demo.html. Followed the spec exactly:
  - fxVariants.waveform added to main.js (not an iframe) — inherits the
    engine's offscreen pausing, DPR handling, and reduced-motion static frame.
  - CRITICAL detail from the spec, confirmed against fxMount: engine `t` is a
    per-frame counter (+1), not milliseconds. Demo SPEED 0.0045×ms ≈ 4.5/s →
    0.075/frame at 60fps. Both match at 4.5 field-units/sec.
  - Integer width-harmonics kept verbatim (u spans 2π across w) so all 64
    lines land on both edges at full amplitude; no amplitude envelope added.
  - Colors from FX_TEAL/FX_BLUE constants (channel-parsed, interpolated per
    line exactly like the demo). Cursor/ripples deliberately ignored — the
    sheet is the product on display, not ambient decoration.
  - Sheet placed at yFrac 0.62 under a 620px copy column; section gets 220px
    bottom padding so the sheet has room to breathe.
- products.ts: Tool interface gained `body`; tools[] populated with the user's
  description verbatim. Name "The Saltenna Waveform" is a PLACEHOLDER —
  TODO(user) comment in the data file. Section renders via the existing
  tools.length gate; hero quick-links gained a Software tab (also gated).
- Old card-grid tools scaffold replaced by `.tool-feature` over the fx canvas
  in section.block.dark.has-fx#software.
- Versions: CSS 76 / JS 48; both root and webflow-app copies diff-verified
  identical. Root *.html untouched (no products page there — the :4173
  preview cannot show this section).
- Verified in REAL Chrome via claude-in-chrome (the embedded pane suspends
  rAF), per the spec's method: two screenshots 3 s apart show the crest
  cluster clearly traveled and the fan reshaped; lines confirmed running to
  both edges with no pinch; copy legible over the sheet; zero console errors;
  build prerenders all 7 pages.

## Waveform section reworked into a product-style card (Jul 31, CSS v77 / JS v49)

- User revision: text on its own card like a product, animation where the
  image would be. Full-width band replaced by `.tool-card` (720px, border +
  bg-alt + 36px padding — the explorer detail pane's card treatment) with a
  16:9 `.tool-media` box holding the fx canvas; media bg is the demo's own
  card gradient (#0d1424→#0f1a2e→#0d1424) so the sheet sits on its approved
  ground. Section keeps block dark; the section-level fx canvas is gone
  (has-fx removed). Y_FRAC returned to the demo's 0.54 for the card framing.
- Engine note: fxMount sizes the canvas from clientWidth/Height, so it adapts
  to the media box with no changes; .fx-canvas absolute-fills the
  position:relative .tool-media.
- Verified in real Chrome: card renders with the sheet edge-to-edge inside
  the media box; two zooms 3 s apart show crests traveled; no console errors;
  build clean; both css/js mirrors diff-identical.

## Waveform presentation, third pass: split with corner name (Jul 31, CSS v78)

- User revision: "big text in the corner with the name on it and the paragraph
  and then on another card on the right side put the image." Now a
  `.split.tool-split` row: left column has the name in display type
  (clamp(1.9rem, 3vw, 2.8rem), weight 500, -0.02em — the explorer big-type
  voice) top-left with claim + body beneath; right column is the bordered
  `.tool-card` holding only the 16:9 `.tool-media` fx canvas. align-items:
  start overrides .split's center so the name sits in the corner.
- Reuses .split wholesale: 1fr/1fr 72px grid and the ≤900px single-column
  collapse come free. JS untouched (still v49) — same canvas markup, engine
  sizes from the element. CSS v78; both mirrors in sync; build clean.
- Verified in real Chrome: name/claim/paragraph left, animated card right,
  crests moved between consecutive screenshots, copy fully revealed.

## Products page polish per user's design prompt (Jul 31, CSS v79)

- User supplied a 5-point "cutting-edge" polish prompt (said products.html;
  applied to products.astro + styles.css, both mirrors).
- Everything scoped under #products / #software. Two knowing exceptions to
  site-wide rules, per the user's explicit ask: eyebrow kickers return on this
  page only as .pp-eyebrow (the Jul 30 removal stands elsewhere), and 14px
  radius overrides --radius: 0 on this page's media/cards only. A CSS comment
  marks both as deliberate page-local exceptions.
- Implemented: gradient section titles (white→teal, background-clip: text,
  -webkit-text-fill-color); 55ch body measure; gradient-border media frames
  via two-layer background (padding-box fill + 135deg teal border-box) with
  0 0 60px teal glow; radial teal glows behind media areas via section
  ::before (container z-index raised on #software); .pp-pill badges (999px,
  1px border, 12px) with factual attribute copy (Hardware/Maritime/
  Communications; Software-defined/Extreme path loss/Low-power embedded);
  mono .tool-status "RX LOCK · −142 dBm · LIVE" (LIVE in teal) under the
  waveform card.
- Prompt item 5 (IntersectionObserver fade/slide, trigger once, reduced
  motion) required NO work — the site's .reveal system already does exactly
  this (34px/0.75s vs the prompt's 24px/0.6s; kept the site's values), and
  the waveform variant already animates slowly + respects reduced motion.
- Teal matched via var(--teal-rgb) everywhere; no new colors introduced.
- Verified: desktop (~1440) in real Chrome — eyebrows, gradient titles
  (visible white→teal on "The Saltenna Waveform"), rounded glowing frames,
  pills, status line, waveform still animating. Mobile 375px via embedded
  pane DOM measurement (real-Chrome window resize reports success but doesn't
  apply — likely tiled/fullscreen): no horizontal overflow, tool card stacks
  under text at 319px wide, pills fit. Control check on sensing: text-fill
  white, radius 0, zero .pp-* elements — no leakage. Build clean; CSS v79
  mirrored.

## Stingray added as product 03 (Jul 31, data-only)

- From the user's "Stingray 2.pdf" (image-based; rendered via PyMuPDF like the
  others). Cognitive wireless penetrator: RF plasmons through sealed metal
  walls/flanges/pressure boundaries, replacing wired penetrators — magnetic
  internal/external units, no drilling, no leak path. Status "Customer
  engagement ready" (verbatim from sheet). Cross-links Communications.
- Chips: up to 1 Mbps bidirectional · 3,000 m design depth · magnetic
  tool-less mounting · seawater & saturated brine. Poster: the sheet's
  product-body hero (837x232, crops fine under object-fit cover);
  stingray-endcap.jpg saved as an alt swap.
- ONE data entry in products.ts was the entire change — explorer row "03",
  hero tab, hash deep-link, badge, chips, v79 media styling all generated.
  No version bumps (no css/js edits). Build clean; verified in-page: deep
  link #prod-stingray activates and shows the item, poster decodes at
  837x232, media frame carries the 14px/gradient treatment.

## Products CTA band: dropped the ripple fx (Jul 31, markup only)

- User pointed at the "Evaluate it on your mission." band and asked to remove
  "the lines an the little antenna". Both came from `data-fx="ripple"`, the
  only variant that draws BOTH a horizontal interface line + two sine lines AND
  an fxAntenna/fxBroadcast pair (at w*0.93, h*0.82 — the circled antenna at
  bottom right of the user's screenshot).
- Fix: products CTA band switched to `data-fx="field"` (faint dot grid +
  occasional pulse ring, no lines, no antenna). This also makes products match
  every other page — index/maritime/comms/sensing/about all use `field` on
  their cta-band; ripple on products was an inconsistency I introduced when
  creating the page.
- Chose the swap over editing the ripple variant itself because ripple is
  shared: contact.astro still uses it on its form block. Contact therefore
  KEEPS its lines + antenna — flagged to the user in case they want that
  changed too.
- Markup-only (prerendered HTML), so NO version bump — still CSS v79 / JS v49.
- Verified in real Chrome at the CTA band: dot grid only, no wave lines, no
  antenna at bottom right; heading/button unaffected; build clean.

## Contact page: ripple fx removed too (Jul 31, markup only)

- User confirmed they wanted the wave lines + corner antenna gone on contact as
  well. contact.astro's form block switched `data-fx="ripple"` → `"field"`
  (its page-hero was already `field`).
- **`ripple` is now unreferenced site-wide** — zero `data-fx="ripple"` in src/.
  The variant's code stays in main.js as inert, same convention as the retired
  `.uc-scroll` scrollytelling: it's the only variant pairing sine lines with an
  antenna, so it's worth keeping around if that look is ever wanted again.
  (fxAntenna/fxBroadcast themselves are still live — used by signal/radar/grid.)
- Markup-only again, so still CSS v79 / JS v49. Verified in real Chrome: form
  block shows dot grid only through its full height incl. the lower-right
  region where the antenna sat; form fields/button unaffected; no console
  errors; build clean.

## End-of-session verification sweep (Jul 31)

Audited every request from this session against source, built output, and a
live browser. All present and correct at **CSS v79 / JS v49**:

| Change | Verified by |
| --- | --- |
| Products page, 3 products (D2D/Remora/Stingray) | 3 `prod-*` ids + "01/02/03" list in dist + live |
| 4K products sea-hero + rollout + tabs + paragraph | 3840x2160 confirmed; sea-hero classes; 4 hero tabs |
| Software section + ported waveform animation | `data-fx="waveform"` canvas; fxVariants.waveform in main.js |
| Waveform as split: corner big-type name + card right | `.tool-split`/`.tool-name` 30.4px; card right at ≥900px |
| Design polish (eyebrows, gradient titles, radius, glow, pills, status line) | 2 eyebrows, 6 pills, 14px radius, teal glow, RX LOCK line |
| Body copy 17.9px site-wide | measured 17.92px on index/maritime/products |
| Maritime clips 1.3x | 5 clips report rate+default 1.3; hero/band still 1.0 |
| Comms 11→5, Sensing 7→4 | exact panel ids/titles; all quick-links resolve |
| Homepage cards remapped | 3 distinct targets, 2 sharing `#uc-metal` |
| Products in nav + footer on all pages | 7/7 pages |
| `ripple` removed (products CTA + contact) | zero `data-fx="ripple"` in src/; both pages `field` |
| Polish scoped, no leakage | index + communications report 0 `.pp-*`/`.tool-card` |
| Mirrors | root css/js byte-identical to webflow-app/public |
| Deploy safety | 0 mp4s in dist; dist/client 6.0 MB; 13 videos for R2 |

- Gotcha for next session: running `npx astro build` while `astro dev` is up on
  4321 kills the dev server (both write dist/). Restart via preview_start
  `saltenna-astro` after builds. Also: the 14 MB 4K hero can make real-Chrome
  script injection time out mid-load — wait or verify via the pane.
- Still open (unchanged): D2D status + waveform tool name placeholders, 3D
  models/photos to swap in, 12 unreferenced uc SVGs, R2 upload + deploy.

## Ibex section: header image + interactive 3D radio (Aug 17, CSS v80)

- User: "put this radio model in a new section called ibex and use this image as
  the header and this file next to it", with ~/Downloads/radio model/
  radio_viewer.html and a pasted mountain photo.
- The photo arrived as a paste, not a path — located it in Downloads by
  timestamp (`lin2015-siguniang-mountain-8568913_1920.jpg`, saved minutes
  earlier) and confirmed it visually against the pasted image before using it.
- Layout read as image + model side by side (the user asked twice for this exact
  "card on the right" treatment on the waveform), so: section head (eyebrow +
  gradient title "Ibex") over a `.split.ibex-split` of two `.tool-card`s. Reuses
  `.split`, so the ≤900px stack comes free. Verified deterministically that
  `.ibex-split` only overrides align-items, so columns come from `.split`
  (1fr 1fr >900px) — the same grid confirmed side-by-side in real Chrome at
  1485px for `.tool-split` earlier.
- `.tool-media`/`.tool-card` were scoped to `#software`; generalised so #ibex
  reuses them, and added `.tool-media img/iframe` fill rules.
- three.js VENDORED: the viewer imported three 0.160 ESM + OrbitControls,
  RoomEnvironment, RoundedBoxGeometry from jsdelivr. Checked the addons' import
  graph (all import only 'three' — closed), pulled the MINIFIED ESM build
  (three.module.min.js, 670 KB vs 1.27 MB unminified) and the 3 addons into
  `js/vendor/three-0.160/`, repointed the importmap at relative paths. Zero CDN
  references remain. Coexists with r128 (UMD, no ESM addons) — both needed.
- Recolored to the site's card navy + teal (it shipped white), matching the
  Jul 23 navy pass on the other graphics.
- TWO DEFECTS I introduced and fixed, both found by isolating the section in a
  temporary `public/_ibex-check.html` (since products.html is now too heavy for
  either browser tool to script — 4K hero video + 3 canvas rAF loops + WebGL):
  1. **Never-idle render loop.** Unlike the other 4 scenes it had 2048² shadow
     maps, PMREM env and permanent auto-rotate, and no offscreen pausing —
     continuous GPU cost whenever products.html was open. Fixed: shadow map
     1024², and the loop now stops when the iframe leaves the parent viewport
     via an IntersectionObserver constructed in the PARENT realm against
     `window.frameElement` (same-origin), so it needs no parent-side JS and
     degrades to always-on standalone.
  2. **HUD collision.** Its full-window HUD (title + a 4-phrase hint + two
     buttons) piled on top of itself and the model inside a card. Fixed with an
     `html.embedded` class set pre-paint from `window.frameElement`: hides the
     title/hint (redundant with the card's status line), shrinks the tooltip and
     buttons, and drops the buttons below 430px. Standalone viewing unchanged.
- Verified: viewer renders standalone from the vendored three (screenshot: radio,
  bent gooseneck, LCD, gold contacts, navy bg, teal accents), zero console
  errors; in-page structure measured (2 cards, image 16:9 ratio 1.79, iframe
  lazy with a live canvas document, status line, hero tab `#ibex`, CSS v80);
  isolated screenshot after the fixes shows a clean model with no HUD overlap;
  all 6 new assets serve 200; build clean, 0 CDN refs in dist, dist/client
  7.1 MB, largest asset 0.7 MB (25 MiB cap fine); temp check page deleted and
  confirmed absent from dist. Root mirrors updated: css, js, graphics/
  ibex-radio.html, js/vendor/three-0.160/, images/products/ibex-peak.jpg.
- NOT verified: a fresh desktop-width screenshot of the composed section — both
  browser surfaces stalled on script injection (Chrome failed on sensing.html
  too, so it's the tooling, not this change). Layout rests on the CSS proof above.
- Open: no Ibex copy supplied; the viewer's SPECS block is still its authored
  placeholder ("Plasmonic Sleeve Antenna") — likely should become Ibex.
- Unused: `~/Downloads/radio model/Website_Scuba_Model.zip` was alongside the
  viewer but not requested — left untouched.

## D2D + Remora showcase sections (Aug 17, CSS v81)

- User: "i want this ans another section under remora and d2d" → replicate the
  Ibex treatment for Remora and D2D. Now three `.showcase` sections driven by a
  single `showcase` array in the products.astro frontmatter, so a fourth is one
  entry. Alternating `deep`/`dark` block backgrounds. Ids `#d2d` / `#remora` /
  `#ibex` — no clash with the explorer's `#prod-*` ids.
- **D2D got a real 3D model.** `Website_Scuba_Model.zip` was sitting next to the
  radio viewer in the same folder the user pointed at; its README describes a
  diver mannequin with the Saltenna dive kit fitted (radio, antenna, feed cable,
  earpiece, all hoverable) — unmistakably D2D. Used its `index.html`
  (the README's "production viewer") as `graphics/d2d-diver.html` + the
  `male_base.glb` it loads, rather than the 4.4 MB single-file standalone.
- Same four fixes as the radio viewer: importmap repointed to the local vendored
  three; navy/teal recolor (it shipped `--bg:#ffffff`); shadow map 2048²→1024²;
  offscreen render pause via a parent-realm IntersectionObserver on
  `window.frameElement`; `html.embedded` HUD mode.
- Vendoring chain extended: this viewer needs GLTFLoader, which imports
  `../utils/BufferGeometryUtils.js` — NOT closed, so both were vendored (the two
  `my-cnd-server.com` strings in GLTFLoader are doc examples, not imports).
  three-0.160 is now 5 files / 840 KB. Zero CDN refs across all graphics.
- **Remora has no model**, so it reuses `plasmonic-surface-wave-link.html` — a
  surface-wave link carrying data node-to-node along a conductor, which is
  literally Remora's stated principle ("uses the pipe or cable itself as the
  transmission medium"). Flagged in a code comment as swappable. Its own
  in-scene "drag to orbit" hint made the card's status line redundant, so
  Remora's reads "PIPE AS THE MEDIUM" instead.
- Two polish fixes found by looking at the rendered result:
  1. The diver viewer's **ANCHORS** button is an authoring/debug control (its
     own source says "for future gear placement/debugging") — hidden in
     embedded mode so it never appears on a public page.
  2. Its controls overlapped the figure's head at card size — moved to
     bottom-right when embedded.
- CSS generalised: `#ibex`→`.showcase`, `.ibex-split`→`.media-split`, so all
  three sections share the gradient-border cards, radial glow, gradient title.
- Verified: diver viewer renders standalone from the vendored GLTFLoader (full
  rig, fins, navy/teal, zero console errors); **side-by-side desktop layout
  captured** for D2D and Remora via isolated check pages (the pane was wide
  enough this time); captions/hints correct in dist; all new assets serve 200;
  build clean; temp check pages deleted and absent from dist; every mirror
  (css, js, both viewers, male_base.glb, three-0.160/) diff-verified in sync.
- Note: products.html now hosts a 4K hero video, 3 canvas loops and 3 lazy WebGL
  iframes. Real Chrome's script injection was unusable this session (it also
  failed on sensing.html and on standalone viewers the pane handled fine), so
  verification ran through the pane + isolated pages.

## Showcase sections reverted; models become a second explorer window (Aug 17, CSS v83 / JS v50)

- User: "undo that and just put ibex in the numbered list next in the products
  section ask questions if needed". Removed the three `.showcase` sections and
  all their CSS (`.showcase`, `.media-split`), reverted the section-scoped
  polish selectors to #products/#software, and added Ibex as product 04.
- Asked three questions; the answers changed the design again:
  1. D2D: "keep the photo and description how they are i want another window to
     the left of it with the interactive diver"
  2. Ibex: "just come up with something for now and use the given image radio
     model should go to the left of it like the d2d"
  3. "they should [get models] but keep photos the way they are and add 3d
     models in as well"
- So the explorer now carries TWO media slots per product simultaneously:
  photograph in the detail pane, interactive model in a new left-column window
  under the numbered list. That column was mostly empty (4 short names), so the
  model window uses dead space and ends up LARGER than the detail pane's photo.
- `ProductMedia.astro` reduced to photo-only (`image ?? poster`); the model
  branch moved out, since a product now shows both at once rather than one or
  the other.
- main.js v50: `pick()` also toggles `.uc-model` panes, matched by
  `data-model-for` === active item id — NOT by index, because only some products
  have models so the two lists differ in length. Verified by clicking through:
  D2D→diver shown, Remora→neither shown (no empty window), Ibex→radio shown,
  back to D2D→diver again.
- Loading: inactive model iframes are both `loading="lazy"` and
  `display:none`, so a scene only fetches when its product is first selected;
  the parent-realm IntersectionObserver added earlier keeps hidden/offscreen
  ones from rendering. Avoids 4 live WebGL contexts.
- Ibex copy is INVENTED with explicit user permission; all fields TODO-marked in
  products.ts, and its photo is the supplied peak image as instructed.
- Side effect: the diver model + male_base.glb are no longer orphaned (they were
  3.5 MB shipping unused after the revert). Remaining dead weight is just two
  alt photos, 80 KB.
- Verified: build clean; built HTML has 4 photos in panes + exactly 2 model
  windows with correct hints; desktop layout captured via an isolated check page
  — diver window sits left of the pane, which keeps its photo and copy; temp
  check pages deleted and absent from dist; mirrors in sync; dist/client 12 MB.

## Explorer: model and photo side by side (Aug 17, CSS v84 / JS v51)

- User: "make the windows go side by side and maybe make the other on a bit
  skinnier to fit both windows". Read "the other one" as the name list — the only
  other column — so: both media windows in a row inside the detail pane, list
  column narrowed from 1.15fr to 0.28fr (gap 72→48px). The list holds one short
  word per row, so it never needed 595px.
- The model window moved from the left column INTO each `.uc-detail-item`, above
  the copy, as `.uc-media-row` > [model, photo]. Model left, photo right, per the
  user's earlier "model should go to the left of it".
- Simplification: with each model inside its own detail item, toggling the item
  toggles the model, so the v50 `data-model-for` id-matching in main.js was
  deleted — `pick()` is back to two lines (v51). Lazy loading is unchanged
  (hidden items don't fetch their iframes).
- `grid-auto-flow: column` + `grid-auto-columns: 1fr` means the row adapts to
  child count on its own: Remora/Stingray (no model yet) get one full-width
  photo, no empty half. ≤900px switches to `grid-auto-flow: row`.
- TWO defects caught by measuring the rendered result, not by eye:
  1. Windows measure **398px** wide at any desktop width (container-capped), and
     my earlier `max-width: 430px` rule hid the viewers' controls below that —
     so Auto-Rotate/Reset were hidden on all desktops. Threshold → 340px; phone
     windows measure ~247px so they remain hidden there as intended.
  2. At 398px the diver was clipped (fins + ground ring). `frameModel()` now
     applies a 1.22× dolly-back when `html.embedded`; standalone unchanged. With
     the figure smaller and centred, its controls went back to top-right (the
     bottom position I'd used earlier now sat on the fins).
- Verified at 1280×720 by measurement: explorer columns 248.5px / 887.5px;
  both windows exactly 398×224 and tops aligned to within 2px; `html.embedded`
  applied; HUD title hidden; controls now visible. Screenshot confirms full
  diver, no clipping, buttons over empty background. Build clean, temp check
  pages removed and absent from dist, all four mirrors in sync.

## Explorer: spec card + its own model card (Aug 17, CSS v85 / JS v52)

- User: "i want the first card based off the spec sheets to stay as is and a new
  window with just the 3d models next to it on a new card". So the media row
  from v84 was undone: the detail item is back to `<ProductMedia>` + copy,
  byte-for-byte the pre-Ibex structure, and the model moved OUT into its own
  card in a third grid column to the right.
- Explorer grid is now `minmax(200px, 0.42fr) 1.12fr 1fr` with 40px gaps. The
  200px floor on the list was measured, not guessed: "Stingray" is the longest
  name and needs ~190px at the clamp's 2.35rem ceiling.
- The model column deliberately keeps its track when a product has no model, so
  switching products doesn't reflow the other two columns. Trade-off: Remora and
  Stingray currently show an empty right-hand column until they get models.
- main.js v52: id-matched `data-model-for` toggling restored (removed in v51 when
  the model briefly lived inside the detail item, needed again now it's a
  sibling). Lazy iframes still only load when their product is first selected.
- Verified on the real page by clicking every entry: D2D → diver card, Remora →
  none, Stingray → none, Ibex → radio card, back to D2D → diver. Also asserted
  the spec card is untouched — photo, badge, h3, claim, 4 chips present and NO
  iframe inside it. Isolated screenshot confirms the two cards side by side with
  the spec card intact and the model card sized to its content. Build clean,
  temp check page removed, mirrors in sync.

## Explorer cards flipped (Aug 17, CSS v86)

- User: "flip the 3d models and the text and images with each other. i just want
  the cards flipped". Swapped the DOM order of `.uc-models` and `.uc-detail`, so
  left-to-right is now: name list, 3D model card, spec card.
- **Also swapped the fr values** (`0.42fr 1.12fr 1fr` → `0.42fr 1fr 1.12fr`).
  Without this the flip would have handed the wider track to the model and
  squeezed the text card — the widths follow the cards, not the positions.
- Went with a DOM swap rather than CSS `order` so the source order matches the
  visual order; that also keeps the ≤900px stack sensible (list → model → spec).
- No JS change (v52 stands): the toggle matches on `data-model-for`, which is
  position-independent.
- Verified at 1400×900: order left-to-right is list, model card, spec card; spec
  card wider than the model card; spec card contents untouched. Build clean,
  temp check page removed, css mirror in sync.

## New diver model installed (Aug 17, CSS v87)

- User pointed at ~/Downloads/DIVER with deploy instructions naming
  `dist/index.html` + `dist/male_base.glb`. **There is no dist/ folder and no
  README-DEPLOY.txt in the download** — the folder is flat (~20 loose source
  .glb files + handoff docs + the two shipping files at root). Used the root
  copies per the note that they're identical, and recovered the "two open items"
  from HANDOFF-v4.md since README-DEPLOY.txt was absent.
- Installed as graphics/d2d-diver.html + graphics/male_base.glb (replacing the
  previous pair). Verified in-scene: all four Saltenna products attached
  (product:antenna/:radio/:cable/:earpiece) with matching SPECS keys, loading
  overlay completes, zero console errors, renders from the VENDORED three.
- Adaptations applied (same recipe as before, minus what this build already did
  better): importmap → local three-0.160 (no new vendoring needed — same version,
  same 4 addons); navy/teal palette; embedded HUD mode incl. hiding the ANCHORS
  debug button; 1.18× dolly-back; offscreen pause.
- DELIBERATELY NOT changed, because this build already handles them: named tick
  loop, `visibilitychange` pause, WebGL context-lost/restored recovery, and a
  mobile shadow budget (innerWidth<768 → 1024² + pixelRatio cap) that fires by
  itself inside the ~400px card. My earlier blanket 2048→1024 edit would have
  degraded the standalone view for no gain.
- The offscreen observer was COMPOSED with their visibility handler rather than
  replacing it: added an `onScreen` flag that both paths consult, so scrolling
  back into view resumes correctly and neither handler fights the other.
- `.uc-model-frame` aspect 16/9 → 16/10, following the model's own deploy note.
- FINS SHIP DETACHED: 5 fin meshes load but leftFoot/rightFoot anchors have 0
  children, so the diver is barefoot (the previous model wore fins). Proved this
  is upstream behaviour by serving the pristine unmodified copy side by side —
  identical result — rather than assuming my edits caused it. Pristine copy then
  deleted.
- Server requirements from the user's note: (3) CSP/CDN is moot now three is
  vendored. (2) MIME — dev server already serves model/gltf-binary. (1)
  compression — measured: glb 2.65→1.64 MB gzip, html 2.82→1.67 MB; flagged as a
  post-deploy check since Cloudflare does not always compress
  model/gltf-binary.
- Open items carried forward from HANDOFF-v4.md: two of four SPECS entries
  (`radio`, `earpiece`) are still invented placeholders, and the radio one
  asserts a "D2D-1 Dive Radio" designation the source photos contradict — needs
  real product data before this page is public.

## Model window matched to the photo box (Aug 17, CSS v88)

- User: "make the window of diver the same size as the one next to it".
- Solved as an invariant instead of magic numbers: gave `.uc-model-card` the same
  36px padding as `.uc-detail` and made the two grid tracks equal
  (`1fr 1.12fr` → `1fr 1fr`). Equal track + equal padding ⇒ equal inner width at
  every viewport, so it can't drift the way a tuned fr value would. CSS comment
  says the two must be changed together.
- Aspect reverted 16/10 → 16/9 to match the photo. The 16/10 came from the
  diver's own deploy note, but matching the neighbouring box was the explicit
  ask; the embedded 1.18× dolly-back keeps the figure clear of the shorter frame
  (confirmed by screenshot — full figure, ground ring visible).
- Verified by measurement at 1400px: both boxes 378 × 212.6, tops aligned within
  2px, both cards 36px padding, tracks `200px 452px 452px`. Build clean, temp
  check page removed, css mirror in sync.

## Model card stretched to the spec card's box (Aug 17, CSS v89)

- User: "i would like the card to be as big as the one next to it not the image
  but the whole box". v88 had matched the media boxes; this matches the CARDS.
- `.uc-models { align-self: stretch }` overrides the explorer's
  `align-items: start` for that column only, `.uc-model-card { height: 100%;
  display: flex; flex-direction: column }`, and `.uc-model-frame { flex: 1;
  aspect-ratio: auto }` above 900px so the viewer fills whatever is left after
  the hint line. Below 900px the aspect-ratio still applies (stacked cards are
  content-height).
- Checked FIRST that both viewers handle iframe resize (they set camera.aspect +
  renderer size on `resize`) — necessary because the card height now varies with
  each product's copy length.
- Result measured at 1400px: both cards 452 × 768.6 with tops aligned; the viewer
  frame becomes 378 × 666 (0.57 aspect) — a portrait window, much better for a
  standing figure than the previous letterbox.
- Measurement gotcha worth remembering: `.uc-model-card.is-active` animates
  `uc-fade` from `translateY(8px)`, so an early measurement reported the cards
  8px out of alignment. Finishing animations first
  (`document.getAnimations().forEach(a => a.finish())`) showed both at top 111.
  I checked this rather than "fixing" a layout bug that did not exist.
- Build clean, temp check page removed, css mirror in sync.

## Hairline card borders (Aug 17, CSS v90)

- User: "make the borders thinner". Done as one scoped block setting
  `border-width: 0.5px` on the products-page cards and media frames
  (`#products .uc-detail`, `#products .uc-detail-media`, `.uc-model-card`,
  `.uc-model-frame`, `#software .tool-card`) rather than editing five separate
  declarations — easy to tune or revert in one place.
- Chose 0.5px over faking it with lower opacity because the ask was width. Note
  in the CSS: at DPR 2 it's a genuine half-pixel, and at 1x browsers round it up
  to one device pixel rather than to zero, so the edge never disappears. The
  gradient border-box trick still works — the gradient simply paints in a
  narrower band.
- Deliberately NOT changed: spec chips, status badges, pills, and every border
  outside the products page. Verified by measurement — 0.5px on the five targets,
  1px still on chips and badges (DPR 2).
- Build clean, temp check page removed, css mirror in sync.

## ROVER 1 under Ibex; model card splits into halves (Aug 17, CSS v92)

- User: rover "should go under ibex. The square where the radio is should be cut
  in half and this model should go under it."
- Data reshaped: `model`/`modelHint` → `models: [{src, hint}]`. The card renders a
  frame per model; above 900px each is `flex: 1 1 0` (basis 0, so slices are EQUAL
  regardless of intrinsic size) with a hairline divider. Ibex measured 383/384 of
  a 766px card. Generalises to 3+ models with no further CSS.
- Installed graphics/rover/ = the 5 export files, verified byte-identical after
  copying. Did NOT ship rover-standalone.html (their note: one or the other) or
  DEPLOY.md. Honoured "do not hand-edit" — everything below graphics/rover/ is
  untouched build output.
- That constraint blocked the recipe used on the other two viewers (repoint three,
  recolor navy, embedded HUD, offscreen pause). What was possible without editing:
  - three.js is ALREADY local (three.global.js), so no CDN concern at all.
  - Dark theme through the viewer's own `:root[data-theme="dark"]` selector,
    set from main.js on iframe load. Runtime attribute, not a file change, so it
    survives the author overwriting the build. Verified both frames report dark.
  - Offscreen pause NOT possible → the rover renders continuously once loaded.
- FINDING, measured not guessed: nothing overflows in a 452px frame because the
  rover ships its own `@media (max-width:900px)` that hides `#readout` and
  `#hint`. So at half-card width its dimensions panel (LENGTH/WIDTH/HEIGHT/
  WHEELBASE/TRACK/CLEARANCE/TRIANGLES) is permanently suppressed — by its own
  design, but it means the products page never shows the numbers. Getting them
  back needs ≥901px of frame, i.e. a full-width band instead of half a card.
  Flagged to the user rather than worked around.
- Compression note for deploy: rover.json 874→334 KB gzip, three.global.js
  670→166 KB. Their DEPLOY.md calls compression "the single highest-value thing
  to get right"; dev server serves rover.json as application/json.
- Also fixed this round: model iframes had NO cache-busting, so a browser could
  pair a cached OLD viewer with a NEW mesh — the likely cause of the user's
  "model not loading". Added MODEL_VERSION to products.astro (now `?v=2` on every
  model iframe), matching how css/js are versioned.
- NOTE: products.astro's hero and main.js were edited outside this session (the
  hero video is now a `data-fx="terrain"` canvas; JS_VERSION had already been
  bumped to 58). Left both alone; my edits applied on top cleanly and main.js
  passes `node --check`.

## Rover skinned to the site from outside the file (Aug 17, main.js v60)

- User: background should match the radio's blue not white; the rover's pop-ups
  make it hard to see; format all overlays like the radio.
- Constraint: "DO NOT hand-edit any of these files." So everything is applied to
  the iframe's document at runtime from main.js — a `#saltenna-skin` <style> plus
  `data-theme="dark"`. Re-verified all five rover files byte-identical to the
  export afterwards.
- Root cause of the white background surviving my earlier data-theme pass: the
  scene backdrop is a CANVAS TEXTURE built from `--void-1`/`--void-2` at INIT,
  and the only rebuild path is a `prefers-color-scheme` change listener that
  can't be fired synthetically. So setting the attribute on `load` was always too
  late. Fixed by rAF-polling for the iframe document and injecting while it is
  still parsing — the 670 KB three.global.js fetch gives a comfortable window.
  Confirmed visually (navy void, teal accent) rather than by assuming.
- Overlays hidden: #title, #systems, #readout, #hint, #isohint. Note this removes
  its systems "click to isolate" interaction — asked for explicitly.
- Controls: needed `#controls .btn { flex: 0 0 auto }` on top of the position
  override. The rover's own ≤900px rule does
  `#controls{bottom:12px;right:12px;left:12px;justify-content:stretch}` with
  `.btn{flex:1}`, so position alone left three buttons spread edge-to-edge. Found
  by reading its CSS after the first attempt still looked wrong.
- Also mapped --bg/--panel/--line*/--text/--muted/--accent to site values, which
  happens to fix the 12 WCAG contrast failures its own STYLE-GUIDE.md documents.
- Still recommended: ask the author for a navy + compact-embed build. The runtime
  skin works but the injection timing is the fragile part, and a proper build
  would also restore a readout sized for a small frame.

## Remora 3D model added (Aug 17, main.js v62)

- Folder had no instructions, so identified the shippable artifact myself:
  `web/dist/` (4 files) — `out/remora_viewer_site.zip` is a zipped copy of it and
  `out/remora_viewer.html` is the standalone. Installed dist to
  graphics/remora/, verified byte-identical (Vite build output, hashed asset
  names → treat as do-not-edit, same as the rover). No external deps; three is
  bundled in its 581 KB JS.
- Unlike the rover it ships as a full PAGE: 3D stage + a prose readout. Runtime
  skin hides `.readout` and the page titling, keeps `#reset` (restyled like the
  radio's), and stretches `#stage` to the frame. Kept its 3D hotspot markers —
  on-demand detail, the same call as keeping the diver's hover specs.
- Already dark, and `alpha:true` on the renderer means the `#stage` CSS gradient
  IS the visible backdrop → navy override is pure CSS, no init-timing problem
  (unlike the rover's canvas-texture backdrop).
- REFACTOR: skins are now per-viewer, selected by iframe src, instead of one
  blob applied to every model iframe. Necessary because rover and remora both
  use `#stage` but need opposite rules (rover: fixed inset overlay; remora:
  a 62vh block that must stretch), and our own viewers need no skin at all.
  Verified only rover + remora carry `#saltenna-skin`.
- BUG FOUND AND FIXED by measuring instead of eyeballing: after the skin
  stretched `#stage` from 62vh to 100%, the WebGL canvas stayed at its
  initial 475 px inside a 766 px frame — the renderer had already measured.
  main.js now dispatches a synthetic `resize` into each model iframe after load
  (staggered, because the viewer only registers its resize listener once the GLB
  has loaded) and attaches a ResizeObserver to the frame. The observer also
  fixes a pre-existing latent issue: the card's height changes between products
  because their copy differs in length, and nothing was telling the viewers.
  Canvas now measures 306 in a 305 frame.
- CONTENT FLAGS raised to the user (the skin hides the text carrying them):
  its readout calls the model a "Concept study … not a validated design …
  coupling arrangement in particular is unresolved" while the site lists Remora
  as "Customer engagement ready"; and its physics note states this is a
  Sommerfeld surface wave, "not an optical surface plasmon", where the site says
  plasmonic throughout. Not edited or resolved — the user's call.
- Verified: all four products switch correctly (D2D 1 frame, Remora 1, Ibex 2,
  Stingray none); remora canvas fills its frame; no skin leakage; build clean;
  temp check page removed; all mirrors in sync. dist/client 20 MB.

## Remora background matched to the other viewers (Aug 17, rebuilt from source)

- User: "change the background of remora to match the others."
- Diagnosis first: the grey came from the SCENE, not CSS. The viewer builds an
  opaque shader backdrop dome (top 0x3a4149 / bottom 0x15171b) plus a lit
  reflective floor (MeshStandardMaterial 0x1b1d21) that drew a hard horizon —
  both in front of the #stage gradient, so the navy CSS I injected earlier was
  never visible. Confirmed by elementFromPoint (canvas everywhere, so not a DOM
  element) and by parsing the GLB node list (no floor node → it's the JS).
- No runtime lever: nothing on window but __REMORA_MODEL_URL. So changed
  web/src/main.js — source, not dist — and rebuilt with their own Vite. Backup
  at src/main.js.bak-preSaltennaNavy (that tree is not a git repo).
  - backdrop uniforms → 0x16233a / 0x0b1220 (same stops as radio + rover)
  - floor MeshStandardMaterial → ShadowMaterial({opacity:0.38}), matching what
    the other viewers already do: catches shadow, draws nothing, no horizon.
    Grounding still provided by the real shadow + the author's painted contact
    patch, so the pipe doesn't float.
  - lights LEFT ALONE on purpose: the project's v1→v2 notes document how much
    work went into getting the pipe neutral grey rather than tan (a 5400 K key
    was tinting it), so retinting anything that reaches the product was off the
    table for a background fix.
- TWO BUILD TRAPS, both worth remembering:
  1. Its node_modules was installed on WINDOWS — only rollup-win32-* and
     @esbuild/win32-x64 binaries present, so vite refused to run on this arm64
     Mac ("Permission denied" on the bin shim, then rollup MODULE_NOT_FOUND).
     Also explains the backslash paths inside their shipped zip. Fixed with
     `npm install --no-save @rollup/rollup-darwin-arm64 @esbuild/darwin-arm64`
     at the pinned versions; package.json untouched.
  2. `npm run build` does NOT reproduce their dist. Plain `vite build` (no vite
     config in the project) emits ABSOLUTE `/assets/...` paths, which 404 at
     /graphics/remora/ and leave the viewer stuck on "Loading model…". I shipped
     that briefly and caught it by inspecting the iframe's script src rather than
     waiting on the spinner. The original dist uses `./assets/`, so the right
     command is `vite build --base=./`. Verified the rebuilt index.html and the
     in-bundle './remora.glb' are both relative.
- Asset hash changed twice during this (glbebC0v → DZ0kCfsp); removed the stale
  file each time and confirmed the old URL 404s. MODEL_VERSION → 4.
- Verified: loader completes, canvas fills the frame, navy backdrop with no
  horizon, teal hotspots intact; site build clean; temp pages removed; public/
  identical to the fresh dist and root mirror in sync.

## Remora hotspot dots hidden (Aug 17, main.js v63)

- User: take the blue highlight dots out so it matches the other models.
- Checked the mechanism before choosing an approach: they are CSS2D DOM overlays
  (`CSS2DRenderer` + `CSS2DObject`, class `.hotspot` containing `.dot`), not 3D
  geometry — so a single CSS rule in the per-viewer skin does it. No Vite rebuild
  and no additional edit to their source, unlike the background fix.
- Trade-off stated to the user: this also removes the click-to-open annotation
  cards those dots opened (7 labelled parts). The other viewers use hover specs
  with nothing painted on the model, which is what "match the others" means here.
- INVESTIGATION WORTH RECORDING, because it looked like a failure twice:
  after the rule went in, `querySelectorAll('.hotspot')` returned 0 and the
  CSS2D container had 0 children — which reads as "never created". It is not:
  three's CSS2DRenderer does not append elements whose computed display is none.
  Confirmed by A/B — standalone (no skin) has 7 elements and hit-testing at the
  ring coordinates returns `DIV.dot`/`DIV.hotspot`; embedded (skinned) has 0 and
  no dots are painted. An earlier count of 0 on the standalone page was my own
  bad query, not a real signal; the hit-test is what settled it.
  Also checked: no "hotspot node not found in GLB" warnings, and all 7 target
  nodes exist in the GLB — so creation was never the problem.
- Verified on the real products page with Remora selected: skin present, 0 dots
  painted, readout still hidden, Reset still visible, canvas still fills the
  frame, loader completes. Build clean, temp check pages removed, js mirror in
  sync.

## Remora card photo swapped to the subsea shot (Aug 24)

- User pasted an underwater/bubbles photo for Remora. Arrived as a paste again,
  so located it in Downloads by timestamp
  (jong-marshes-79mNMAvSORg-unsplash.jpg, 4608x3456, 4:3) and confirmed visually
  against the paste before using it.
- Cropped 4:3 -> 16:9 biased 18% from the top, keeping the sunlit surface and the
  bubble column and dropping the emptier lower water; resized to 1600x900,
  progressive JPEG q82 -> 158 KB. Saved as images/products/remora-subsea.jpg.
- Set via the `image` field, NOT by overwriting `poster` — so the pipeline render
  (remora-pipelines.jpg) stays on disk as the documented fallback and the swap is
  reversible by deleting one line. ProductMedia resolves `image ?? poster`.
- Verified in an isolated card at real size: photo fills the 16:9 box under
  object-fit cover, badge/claim/chips unaffected; built page references
  remora-subsea.jpg; 158 KB shipped; image mirrored to root; build clean; temp
  check page removed.
- Note: the pane's script eval hung on products.html again (heavy page: terrain
  canvas + 3 WebGL viewers), so verification used the isolated-card page. Same
  workaround as previous rounds.

## Context preserved for handoff (Aug 24)

- Session was running long, so the docs were brought back in line with the code
  rather than trusting recall. Audited first: versions, per-product media
  wiring, root↔public mirror equality (all in sync), build (clean, dist/client
  20 MB), remaining TODO placeholders, video reference counts, unused assets.
- `docs/HANDOFF.md` **rewritten**. The old one was stale in ways that would have
  misled a fresh session: it advertised CSS v79 / JS v49 (actually v92 / v63),
  its task table stopped at item 17 and still described the reverted showcase
  sections, and its copy-paste prompt block pointed at PRODUCTS_PAGE_PLAN.md as
  "the next piece of work, designed but unbuilt" — it has been built for weeks.
- `docs/MODEL_VIEWERS.md` **new**. The four third-party viewers had accumulated
  more hard-won knowledge than any other part of the site, all of it scattered
  across ~10 chronological log sections. Pulled into one reference: the
  install-byte-identical/adapt-from-outside rule, the runtime skin and why its
  injection is an rAF poll, the resize nudge, MODEL_VERSION, the four copies of
  three.js and why that is not a bug, the Remora source edit and its
  `--base=./` requirement, verification false-alarms, deploy requirements, and
  the limitations flagged rather than worked around.
- `docs/CURRENT_STATUS.md` header date corrected (said Aug 17 while already
  carrying an Aug 24 entry) and pointed at the two docs above.
- Found while auditing, not previously recorded: **videos/products-hero.mp4
  (14 MB) is orphaned.** The products hero became a `data-fx="terrain"` canvas
  in an edit made outside any Claude session, so the 4K encode has no
  references. It would upload to R2 for nothing. Logged in HANDOFF.md as a loose
  end for the user, not silently deleted.
- Also quantified for the first time: 19 videos on disk vs 12 referenced;
  unreferenced shipping assets (d2d-kit-front, stingray-endcap, 9 of 18 uc SVGs).
- No source, CSS or JS changed this round, so no version bump.
