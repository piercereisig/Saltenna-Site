/* Saltenna — shared behavior */

// Signal that JS is running: CSS hides .reveal content only under html.js,
// so browsers without JavaScript render everything visible.
document.documentElement.classList.add("js");

// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("open");
    mainNav.classList.toggle("open");
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
}

// Contact form (no backend — mailto handoff)
const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const subject = encodeURIComponent("Website inquiry");
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nCompany: ${data.get("org") || "—"}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone") || "—"}\n\n${data.get("message")}`
    );
    window.location.href = `mailto:info@saltenna.com?subject=${subject}&body=${body}`;
  });
}

// Newsroom feed. Priority: a connected SociableKIT LinkedIn widget
// (data-embed-id) renders live posts in-page; otherwise posts are rendered
// from the JSON file named in data-posts; if neither is available the follow
// card stays. The widget is embedded in-page (not as an iframe) so it sizes
// itself naturally and its free-plan credit line can be removed from our DOM.
const linkedinFeed = document.getElementById("linkedin-feed");
if (linkedinFeed) {
  const embedId = (linkedinFeed.dataset.embedId || "").trim();
  if (embedId) {
    const widget = document.createElement("div");
    widget.className = "sk-ww-linkedin-page-post";
    widget.dataset.embedId = embedId;
    linkedinFeed.replaceChildren(widget);
    linkedinFeed.classList.add("connected");
    const script = document.createElement("script");
    script.src = "https://widgets.sociablekit.com/linkedin-page-posts/widget.js";
    script.defer = true;
    document.body.appendChild(script);
    new MutationObserver(() => {
      linkedinFeed.querySelectorAll(".sk_branding").forEach((el) => el.remove());
    }).observe(linkedinFeed, { childList: true, subtree: true });
  } else {
    const postsUrl = linkedinFeed.dataset.posts || "data/posts.json";
    fetch(postsUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((data) => {
        const posts = (data.posts || []).slice(0, 6);
        if (!posts.length) return;
        const grid = document.createElement("div");
        grid.className = "post-grid";
        posts.forEach((p) => {
          const card = document.createElement("a");
          card.className = "post-card";
          card.href = p.url || "#";
          if (/^https?:/.test(p.url || "")) {
            card.target = "_blank";
            card.rel = "noopener";
          }
          const meta = document.createElement("div");
          meta.className = "post-meta";
          meta.textContent = [p.tag, p.date].filter(Boolean).join(" — ");
          const title = document.createElement("h3");
          title.textContent = p.title || "";
          const body = document.createElement("p");
          body.textContent = p.text || "";
          const more = document.createElement("span");
          more.className = "post-more";
          more.textContent = "Learn more →";
          card.append(meta, title, body, more);
          grid.appendChild(card);
        });
        linkedinFeed.replaceChildren(grid);
        linkedinFeed.classList.add("has-posts");
      })
      .catch(() => {}); // keep the follow card
  }
}

// Ensure background/card videos autoplay (some browsers need an explicit nudge)
document.querySelectorAll(".hero-video, .bg-video, .card-media video").forEach((v) => {
  const tryPlay = () => v.play().catch(() => {});
  tryPlay();
  document.addEventListener("click", tryPlay, { once: true });
});

// Click any use-case animation to replay it from the start.
document.querySelectorAll(".video-media").forEach((m) => {
  const v = m.querySelector("video.lazy-video");
  if (!v) return;
  m.addEventListener("click", () => {
    v.currentTime = 0;
    v.play().catch(() => {});
  });
});

// Use-case scrollytelling (Communications + Sensing): text steps scroll past
// a pinned scene stage; the step nearest mid-viewport activates its scene
// (driven from applyScrollFX, same model as the maritime panels). Without JS
// all scenes render stacked in the stage column (SEO/no-JS fallback); the
// .js class is what collapses the stage to the active scene. Hero quick-links
// anchor to step ids — native scroll brings the step to the middle, and the
// scroll driver takes it from there.
function ucActivate(st, i) {
  if (st.active === i) return;
  st.active = i;
  st.steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
  st.media.forEach((m, k) => {
    m.classList.toggle("is-active", k === i);
    // video scenes (maritime): only the active step's animation runs — the
    // scroll driver starts the active one once the section is on screen
    if (m.tagName === "VIDEO" && k !== i && !m.paused) m.pause();
  });
  const pad = (n) => String(n).padStart(2, "0");
  if (st.counter) st.counter.textContent = pad(i + 1) + " / " + pad(st.steps.length);
  if (st.tag) st.tag.textContent = "UC-" + pad(i + 1);
  // the bar's middle field tracks the active use case by name
  if (st.mid && st.labels[i]) st.mid.textContent = st.labels[i];
}
const ucScrolls = [...document.querySelectorAll(".uc-scroll")]
  .map((ex) => {
    const steps = [...ex.querySelectorAll(".uc-step")];
    const media = [...ex.querySelectorAll(".uc-stage-media img, .uc-stage-media video")];
    if (!steps.length || steps.length !== media.length) return null;
    ex.classList.add("js");
    // per-step display labels, taken from the "NN — LABEL" mono line
    const labels = steps.map((s) => {
      const num = s.querySelector(".uc-num");
      return num ? num.textContent.replace(/^\s*\d+\s*—\s*/, "") : "";
    });
    const st = {
      root: ex,
      steps,
      media,
      labels,
      counter: ex.querySelector(".uc-stage-count"),
      tag: ex.querySelector(".uc-stage-id"),
      mid: ex.querySelector(".uc-stage-bar span:nth-child(2)"),
      active: -1,
    };
    ucActivate(st, 0);
    return st;
  })
  .filter(Boolean);

// Products explorer (.uc-explorer[data-explorer]): clicking a name in the
// big-type list swaps the sticky detail pane. Without JS all detail items
// render stacked (SEO/no-JS fallback); the .js class collapses the pane to
// the active item only.
document.querySelectorAll(".uc-explorer[data-explorer]").forEach((ex) => {
  const buttons = [...ex.querySelectorAll(".uc-list button")];
  const items = [...ex.querySelectorAll(".uc-detail-item")];
  if (!buttons.length || buttons.length !== items.length) return;
  ex.classList.add("js");
  const pick = (i) => {
    buttons.forEach((b, k) => b.classList.toggle("is-active", k === i));
    items.forEach((it, k) => it.classList.toggle("is-active", k === i));
  };
  buttons.forEach((b, i) => b.addEventListener("click", () => pick(i)));
  pick(0);
});

// Large use-case animations (video.lazy-video): they ship with preload="none"
// and a poster, so the page paints instantly; the video only downloads and
// plays once it nears the viewport, and pauses again when scrolled away.
// Users with reduced motion enabled keep the still poster.
// Use-case panels are scroll-focused: the panel nearest the middle of the
// screen grows and plays its animation (see applyScrollFX below) — no hover
// needed, and it behaves the same on touch. Their videos are excluded from
// the near-viewport autoplay here.
const focusPanels = [...document.querySelectorAll(".use-case-panel")];
const panelVideos = new Set(
  focusPanels.map((p) => p.querySelector("video.lazy-video")).filter(Boolean)
);

const lazyVideos = document.querySelectorAll("video.lazy-video");
if (
  lazyVideos.length &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const vidObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (panelVideos.has(v)) {
          // scroll-focus controlled: never autoplay here, just stop offscreen
          if (!entry.isIntersecting && !v.paused) v.pause();
          return;
        }
        if (entry.isIntersecting) v.play().catch(() => {});
        else if (!v.paused) v.pause();
      });
    },
    { rootMargin: "240px 0px" }
  );
  lazyVideos.forEach((v) => vidObserver.observe(v));
}

// Scroll-linked motion (Apple-style parallax)
const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Hero scramble decode (Anduril treatment) ----------
// Text grows character by character while the trailing few characters cycle
// through random letters before resolving. Spaces stay spaces so words hold.
const SCRAMBLE_AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SCRAMBLE_MONO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#";
function fxScramble(el, text, { step = 30, tail = 4, charset = SCRAMBLE_AZ } = {}, done) {
  let revealed = 0;
  el.textContent = "";
  const timer = setInterval(() => {
    revealed++;
    const shown = Math.min(text.length, revealed + tail);
    let out = text.slice(0, revealed);
    for (let i = revealed; i < shown; i++) {
      out += text[i] === " " ? " " : charset[(Math.random() * charset.length) | 0];
    }
    el.textContent = out;
    if (revealed >= text.length) {
      clearInterval(timer);
      if (done) done();
    }
  }, step);
}

const heroStatement = document.querySelector(".hero-statement");
if (heroStatement && motionOK) {
  const lines = [...heroStatement.querySelectorAll(".line > span")];
  const lineTexts = lines.map((l) => l.textContent);
  lines.forEach((l) => (l.textContent = ""));

  const sign = document.querySelector(".hero-sign");
  const tagWords = sign ? [...sign.querySelectorAll(".tag-row span")] : [];
  const tagTexts = tagWords.map((w) => w.textContent);
  const estLine = sign && sign.querySelector(".est-line:not(.est-future)");
  const futureLine = sign && sign.querySelector(".est-future");
  const estText = estLine ? estLine.textContent : "";
  const futureText = futureLine ? futureLine.textContent : "";
  tagWords.forEach((w) => (w.textContent = ""));
  if (estLine) estLine.textContent = "";
  if (futureLine) futureLine.textContent = "";

  // the statement decodes line by line, overlapping; when the last line lands,
  // a terminal cursor blinks at its end for a while, then disappears
  lines.forEach((l, i) => {
    const onDone =
      i === lines.length - 1
        ? () => {
            const cursor = document.createElement("span");
            cursor.className = "type-cursor";
            l.appendChild(cursor);
            cursor.addEventListener("animationend", () => cursor.remove());
          }
        : undefined;
    setTimeout(() => fxScramble(l, lineTexts[i], { step: 55, tail: 4 }, onDone), 500 + i * 380);
  });

  // the sign strip joins as the last line finishes resolving
  setTimeout(() => {
    if (!sign) return;
    sign.classList.add("sign-on"); // logo fades in
    tagWords.forEach((w, i) => {
      setTimeout(() => fxScramble(w, tagTexts[i], { step: 40, tail: 3, charset: SCRAMBLE_MONO }), i * 130);
    });
    if (estLine) {
      fxScramble(estLine, estText, { step: 48, tail: 3, charset: SCRAMBLE_MONO }, () => {
        if (!futureLine) return;
        // the second field counts up through the years, then lands on the future
        let year = 2018;
        const count = setInterval(() => {
          futureLine.textContent = String(year++);
          if (year > 2026) {
            clearInterval(count);
            fxScramble(futureLine, futureText, { step: 48, tail: 3, charset: SCRAMBLE_MONO });
          }
        }, 110);
      });
    }
  }, 2100);
}

// Interior sea-hero (Communications / Sensing / Maritime): the title and the
// mono info strip decode like the homepage hero. The CSS entrance animations
// on these elements become the no-JS fallback (disabled via .js-decode); the
// video fade and description rise stay CSS-driven.
const seaHero = document.querySelector(".page-hero.sea-hero");
if (seaHero && motionOK) {
  seaHero.classList.add("js-decode");
  const SCRAMBLE_MIXED = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const decode = (el, opts, delay) => {
    if (!el) return;
    const text = el.textContent;
    // hold the box so the layout doesn't jump while the text regrows
    el.style.minHeight = el.offsetHeight + "px";
    el.textContent = "";
    setTimeout(() => fxScramble(el, text, opts), delay);
  };
  decode(seaHero.querySelector(".hero-lead h1"), { step: 22, tail: 4, charset: SCRAMBLE_MIXED }, 500);
  decode(seaHero.querySelector(".hero-info-tag p"), { step: 34, tail: 3, charset: SCRAMBLE_MONO }, 1300);
  [...seaHero.querySelectorAll(".hero-info-links a")].forEach((a, i) => {
    decode(a, { step: 34, tail: 2, charset: SCRAMBLE_MONO }, 1600 + i * 150);
  });
}

const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
const bgVideos = [...document.querySelectorAll(".bg-video")];
const heroContent = document.querySelector(".hero-content");
// Sections roll gently into frame as they enter the viewport
const rollSections = [...document.querySelectorAll("section.block, section.cta-band, section.image-band")];

if (motionOK && (parallaxEls.length || bgVideos.length || heroContent || rollSections.length || focusPanels.length || ucScrolls.length)) {
  function applyScrollFX() {
    const vh = window.innerHeight;

    // Scrollytelling: the step nearest mid-viewport owns the pinned stage.
    ucScrolls.forEach((st) => {
      const rr = st.root.getBoundingClientRect();
      if (rr.bottom < 0 || rr.top > vh) {
        // section off screen: video scenes stop (they resume on re-entry)
        const off = st.media[st.active];
        if (off && off.tagName === "VIDEO" && !off.paused) off.pause();
        return;
      }
      let best = 0;
      let bestD = Infinity;
      st.steps.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      ucActivate(st, best);
      // the active scene's animation runs while the section is on screen
      const act = st.media[st.active];
      if (act && act.tagName === "VIDEO" && act.paused) act.play().catch(() => {});
    });

    // Each section's CONTENT starts slightly low and eases up as it scrolls in.
    // We translate the inner .container, not the <section> itself — moving the
    // section box would slide its background too, briefly exposing the page
    // background as a gap between sections.
    rollSections.forEach((s) => {
      // Roll the inner content, not the section box. Skip containers that carry
      // .reveal (bands/CTA) — their 0.85s transform transition would fight a
      // per-frame inline transform; they animate in via .reveal instead.
      const c = s.querySelector(":scope > .container");
      const target = c && !c.classList.contains("reveal") ? c : null;
      if (!target) return;
      const r = s.getBoundingClientRect();
      if (r.top > vh || r.bottom < 0) {
        if (target.style.transform) target.style.transform = "";
        return;
      }
      // 0 when the section's top touches the bottom edge → 1 once it has
      // risen 45% of the way up the viewport
      const p = Math.min(Math.max((vh - r.top) / (vh * 0.45), 0), 1);
      const y = (1 - p) * 46;
      target.style.transform = y > 0.5 ? `translate3d(0, ${y.toFixed(1)}px, 0)` : "";
    });

    // The use-case panel nearest the middle of the screen takes focus: it
    // grows and its animation plays; the others settle back and pause.
    if (focusPanels.length) {
      let best = null;
      let bestDist = Infinity;
      focusPanels.forEach((p) => {
        const r = p.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < bestDist) {
          bestDist = d;
          best = p;
        }
      });
      focusPanels.forEach((p) => {
        const on = p === best && bestDist < vh * 0.38;
        if (p.classList.contains("is-focus") !== on) p.classList.toggle("is-focus", on);
        const v = p.querySelector("video.lazy-video");
        if (v) {
          if (on) {
            if (v.paused) v.play().catch(() => {});
          } else if (!v.paused) {
            v.pause();
          }
        }
      });
    }

    // Media that drifts and gently scales as it crosses the viewport
    parallaxEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -160 || r.top > vh + 160) return;
      // -1 (below viewport) → 0 (centered) → 1 (above viewport)
      const progress = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      const depth = parseFloat(el.dataset.parallax) || 0.18;
      const y = progress * depth * -140;
      const scale = 1 - Math.min(Math.abs(progress) * 0.05, 0.05);
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
    });

    // Background videos scroll slower than the page
    bgVideos.forEach((v) => {
      const host = v.closest("section");
      if (!host) return;
      const r = host.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      v.style.transform = `translate3d(0, ${(r.top * -0.25).toFixed(1)}px, 0) scale(1.12)`;
    });

    // Hero text drifts up and fades as you scroll away
    if (heroContent) {
      const sy = window.scrollY;
      heroContent.style.transform = `translate3d(0, ${(sy * 0.22).toFixed(1)}px, 0)`;
      heroContent.style.opacity = Math.max(1 - sy / (vh * 0.85), 0).toFixed(3);
    }
  }

  // rAF loop instead of scroll events: scroll events are unreliable in some
  // embedded/smooth-scroll contexts, and this stays in sync with rendering.
  let lastY = -1;
  let lastH = -1;
  (function fxLoop() {
    if (window.scrollY !== lastY || window.innerHeight !== lastH) {
      lastY = window.scrollY;
      lastH = window.innerHeight;
      applyScrollFX();
    }
    requestAnimationFrame(fxLoop);
  })();
} else if (ucScrolls.length) {
  // Reduced motion: the stage must still track whichever step is being read
  // (otherwise it sits frozen on scene 01) — scenes swap, but videos never
  // autoplay, so each shows its still poster.
  const ucTrack = () => {
    const vh = window.innerHeight;
    ucScrolls.forEach((st) => {
      const rr = st.root.getBoundingClientRect();
      if (rr.bottom < 0 || rr.top > vh) return;
      let best = 0;
      let bestD = Infinity;
      st.steps.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      ucActivate(st, best);
    });
  };
  window.addEventListener("scroll", ucTrack, { passive: true });
  ucTrack();
}

/* ---------- Interactive background FX ----------
   One engine, several variants. Each canvas (the hero's #wave-canvas, or any
   <canvas class="fx-canvas" data-fx="...">) gets its own draw function. All
   variants share the same palette (teal/blue signal colors), react to the
   cursor, and carry a subtle antenna motif — masts quietly broadcasting
   expanding rings. Rendering pauses when the canvas is offscreen, and
   prefers-reduced-motion gets a single static frame with no cursor effects. */

// brand colors sourced from the investor deck's wave/diagram graphics
const FX_TEAL = "46, 196, 182";
const FX_BLUE = "157, 189, 209";
const FX_WHITE = "255, 255, 255";
const fxReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Small broadcasting mast: vertical line, two stays, a dot at the tip.
function fxAntenna(ctx, x, y, size, alpha) {
  ctx.strokeStyle = `rgba(${FX_TEAL}, ${alpha})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - size);
  ctx.moveTo(x - size * 0.34, y - size * 0.42);
  ctx.lineTo(x, y - size * 0.78);
  ctx.moveTo(x + size * 0.34, y - size * 0.42);
  ctx.lineTo(x, y - size * 0.78);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - size, 1.6, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${FX_TEAL}, ${Math.min(1, alpha + 0.25)})`;
  ctx.fill();
}

// Phased expanding broadcast rings from a point.
function fxBroadcast(ctx, x, y, t, maxR, color, baseAlpha, phases = 3, period = 240) {
  for (let i = 0; i < phases; i++) {
    const p = ((t + (period / phases) * i) % period) / period;
    if (p <= 0.02) continue;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${color}, ${(baseAlpha * (1 - p)).toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.arc(x, y, p * maxR, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function fxMount(canvas, makeDraw) {
  const ctx = canvas.getContext("2d");
  const state = {};
  const draw = makeDraw(state);
  let w = 0, h = 0, t = 0, raf = null, running = false;
  const mouse = { x: -1, y: -1, tx: -1, ty: -1, energy: 0, targetEnergy: 0, travel: 0 };
  const ripples = []; // shared pool: {x, y, r, maxR, alpha, color}

  function frame() {
    // ease the cursor and its influence in/out so motion feels fluid
    mouse.travel += Math.hypot(mouse.tx - mouse.x, mouse.ty - mouse.y) * 0.1;
    mouse.x += (mouse.tx - mouse.x) * 0.1;
    mouse.y += (mouse.ty - mouse.y) * 0.1;
    mouse.energy += (mouse.targetEnergy - mouse.energy) * 0.05;
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h, t, mouse, ripples);
    // shared ripple pool
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += (rp.maxR - rp.r) * 0.035;
      rp.alpha *= 0.962;
      if (rp.alpha < 0.01) { ripples.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${rp.color}, ${rp.alpha.toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    t += 1;
    if (running) raf = requestAnimationFrame(frame);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (fxReduceMotion) {
      // single calm frame, no cursor influence
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, 137, mouse, []);
    }
  }
  resize();
  window.addEventListener("resize", resize);
  if (fxReduceMotion) return;

  const host = canvas.parentElement;
  host.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = e.clientX - r.left;
    mouse.ty = e.clientY - r.top;
    if (mouse.x < 0) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    mouse.targetEnergy = 1;
  });
  host.addEventListener("pointerleave", () => { mouse.targetEnergy = 0; });

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) {
      running = true;
      raf = requestAnimationFrame(frame);
    } else if (!entry.isIntersecting && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  });
  io.observe(canvas);
}

// Gaussian bump around the cursor: 1 at the cursor, →0 with distance.
function fxBump(dist, sigma) {
  return Math.exp(-(dist * dist) / (2 * sigma * sigma));
}

const fxVariants = {
  // Homepage hero: a 3D ocean of dots. The dot surface is "the interface" —
  // the boundary Saltenna's waves travel along — marked by a thin horizon
  // line. The cursor lifts and lights the surface, and an antenna glides
  // through the interface, broadcasting as it goes.
  hero(state) {
    const COLS = 124;
    const ROWS = 38;
    const SPAN = 5000; // world-space width — wide, so even the back rows reach the sides
    const PERSP = 560; // perspective strength (higher = gentler taper, back reaches wider)

    // varied ocean swell: large rolling waves layered with medium cross-waves and
    // fine chop, so the surface has real 3D relief with higher peaks / lower valleys
    const surface = (xw, z, t) =>
      Math.sin(xw * 0.0021 + t * 0.012) * 54 +           // large rolling swell
      Math.sin(z * 0.008 - t * 0.0095) * 60 +            // large swell across depth
      Math.sin((xw - z) * 0.0044 + t * 0.017) * 27 +     // medium diagonal cross-wave
      Math.sin(xw * 0.0125 + z * 0.014 + t * 0.026) * 12 + // fine chop
      Math.sin((xw + z) * 0.02 - t * 0.022) * 7;         // finer chop

    return (ctx, w, h, t, mouse, ripples) => {
      const horizon = h * 0.4;
      const cx = w / 2;
      // camera height scales with the viewport so the nearest waves always
      // reach the bottom edge of the hero (fills the frame on any screen size)
      const camY = h * 0.6;

      // the interface: a thin, crisp boundary line where surface meets medium
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, `rgba(${FX_TEAL}, 0.18)`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(w, horizon);
      ctx.stroke();

      // a single dot ocean below the interface, drawn far → near.
      // near-monochrome: steady dim-white dots; teal only where the cursor lifts them.
      for (let zi = ROWS - 1; zi >= 0; zi--) {
        const z = zi * 62;
        const scale = PERSP / (PERSP + z);
        for (let xi = 0; xi <= COLS; xi++) {
          const xw = (xi / COLS - 0.5) * SPAN;
          const sx = cx + xw * scale;
          if (sx < -14 || sx > w + 14) continue;
          let sy = horizon + (camY + surface(xw, z, t)) * scale;
          const d = Math.hypot(sx - mouse.x, sy - mouse.y);
          const g = mouse.energy * fxBump(d, 120);
          sy -= g * 34 * scale; // the surface swells up toward the cursor
          const a = 0.07 + 0.26 * scale + g * 0.5;
          const color = FX_WHITE; // neutral white cursor highlight (reads over the color hero video)
          ctx.fillStyle = `rgba(${color}, ${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 0.7 + 1.5 * scale + g * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // moving cursor disturbs the surface with spreading rings
      if (mouse.travel > 60 && mouse.energy > 0.25 && ripples.length < 5) {
        mouse.travel = 0;
        ripples.push({ x: mouse.x, y: mouse.y, r: 6, maxR: 80, alpha: 0.2, color: FX_WHITE });
      }
    };
  },

  // Communications: signal waves flowing across the section from a mast on
  // the left. The cursor swells the waves and trails faint ripples.
  signal(state) {
    return (ctx, w, h, t, mouse, ripples) => {
      const origin = { x: w * 0.05, y: h * 0.55 };
      // the interface the signal travels along
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, origin.y);
      ctx.lineTo(w, origin.y);
      ctx.stroke();
      const rows = [
        { yOff: 0.3, amp: 13, freq: 0.009, speed: 0.3, color: FX_TEAL, alpha: 0.2 },
        { yOff: 0.55, amp: 20, freq: 0.006, speed: 0.21, color: FX_WHITE, alpha: 0.12 },
        { yOff: 0.78, amp: 15, freq: 0.0075, speed: 0.264, color: FX_BLUE, alpha: 0.17 },
      ];
      rows.forEach((l, i) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${l.color}, ${l.alpha})`;
        ctx.lineWidth = 1.1;
        const base = h * l.yOff;
        for (let x = 0; x <= w; x += 4) {
          // signal launches from the mast: stronger near it, decaying right
          const launch = Math.exp(-Math.max(0, x - origin.x) / (w * 0.9));
          const bump = mouse.energy * fxBump(x - mouse.x, w * 0.06);
          const y =
            base +
            Math.sin(x * l.freq - t * l.speed + i * 2.1) * l.amp * (0.5 + launch) * (1 + bump * 1.6) +
            (mouse.y - base) * 0.12 * bump;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      fxAntenna(ctx, origin.x, origin.y + 26, 26, 0.45);
      fxBroadcast(ctx, origin.x, origin.y, t, w * 0.16, FX_TEAL, 0.26, 3, 260);

      // moving cursor sheds ripples
      if (mouse.travel > 46 && mouse.energy > 0.25 && ripples.length < 8) {
        mouse.travel = 0;
        ripples.push({ x: mouse.x, y: mouse.y, r: 4, maxR: 64, alpha: 0.3, color: FX_BLUE });
      }
    };
  },

  // Sensing: a detection field. Dots brighten teal as the cursor sweeps
  // over them; a mast on the right pings the field with expanding rings.
  radar(state) {
    return (ctx, w, h, t, mouse, ripples) => {
      const gap = 46;
      const origin = { x: w * 0.86, y: h * 0.32 };
      for (let gx = gap / 2; gx < w; gx += gap) {
        for (let gy = gap / 2; gy < h; gy += gap) {
          const d = Math.hypot(gx - mouse.x, gy - mouse.y);
          const glow = mouse.energy * fxBump(d, 150);
          const twinkle = 0.04 + 0.03 * Math.sin(t * 0.03 + gx * 0.05 + gy * 0.07);
          if (glow > 0.06) {
            ctx.fillStyle = `rgba(${FX_TEAL}, ${(twinkle + glow * 0.5).toFixed(3)})`;
          } else {
            ctx.fillStyle = `rgba(${FX_WHITE}, ${twinkle.toFixed(3)})`;
          }
          ctx.beginPath();
          ctx.arc(gx, gy, 1.1 + glow * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      fxAntenna(ctx, origin.x, origin.y + 24, 24, 0.45);
      fxBroadcast(ctx, origin.x, origin.y, t, Math.max(w, h) * 0.5, FX_BLUE, 0.2, 3, 420);

      if (mouse.travel > 90 && mouse.energy > 0.25 && ripples.length < 5) {
        mouse.travel = 0;
        ripples.push({ x: mouse.x, y: mouse.y, r: 16, maxR: 90, alpha: 0.28, color: FX_TEAL });
      }
    };
  },

  // Site-wide subtle detection field: sparse dots that quietly brighten teal
  // as the cursor passes over them (no cursor marker), with an occasional
  // node broadcasting a small ring — an antenna waking up in the field.
  field(state) {
    state.pulse = { x: 0, y: 0, born: -999 };
    return (ctx, w, h, t, mouse, ripples) => {
      const gap = 52;
      if (t - state.pulse.born > 340) {
        state.pulse = {
          x: (Math.floor(Math.random() * (w / gap)) + 0.5) * gap,
          y: (Math.floor(Math.random() * (h / gap)) + 0.5) * gap,
          born: t,
        };
      }
      for (let gx = gap / 2; gx < w; gx += gap) {
        for (let gy = gap / 2; gy < h; gy += gap) {
          const d = Math.hypot(gx - mouse.x, gy - mouse.y);
          const glow = mouse.energy * fxBump(d, 160);
          const twinkle = 0.05 + 0.03 * Math.sin(t * 0.02 + gx * 0.04 + gy * 0.06);
          ctx.fillStyle =
            glow > 0.06
              ? `rgba(${FX_TEAL}, ${(twinkle + glow * 0.55).toFixed(3)})`
              : `rgba(${FX_WHITE}, ${twinkle.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(gx, gy, 1.1 + glow * 1.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      const age = t - state.pulse.born;
      if (age < 140) {
        const p = age / 140;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${FX_TEAL}, ${(0.28 * (1 - p)).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.arc(state.pulse.x, state.pulse.y, p * 70, 0, Math.PI * 2);
        ctx.stroke();
      }
    };
  },

  // About: a lattice of nodes riding slow traveling waves. The cursor pushes
  // nodes aside like a field disturbance; random nodes broadcast briefly.
  grid(state) {
    state.pulse = { x: 0, y: 0, born: -999 };
    return (ctx, w, h, t, mouse, ripples) => {
      const gap = 42;
      // every ~4s a random node starts broadcasting (an antenna waking up)
      if (t - state.pulse.born > 250) {
        state.pulse = {
          x: (Math.floor(Math.random() * (w / gap)) + 0.5) * gap,
          y: (Math.floor(Math.random() * (h / gap)) + 0.5) * gap,
          born: t,
        };
      }
      const pulseAge = t - state.pulse.born;

      for (let gx = gap / 2; gx < w + gap; gx += gap) {
        for (let gy = gap / 2; gy < h + gap; gy += gap) {
          const dy =
            Math.sin(gx * 0.016 + t * 0.02) * 6 +
            Math.sin((gx + gy) * 0.011 - t * 0.014) * 5;
          const dx = Math.hypot(gx - mouse.x, gy - mouse.y);
          const push = mouse.energy * fxBump(dx, 130) * 16;
          const ang = Math.atan2(gy - mouse.y, gx - mouse.x);
          const x = gx + Math.cos(ang) * push;
          const y = gy + dy + Math.sin(ang) * push;
          const near = mouse.energy * fxBump(dx, 150);
          ctx.fillStyle =
            near > 0.08
              ? `rgba(${FX_TEAL}, ${(0.1 + near * 0.4).toFixed(3)})`
              : `rgba(${FX_WHITE}, 0.10)`;
          ctx.beginPath();
          ctx.arc(x, y, 1.2 + near * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (pulseAge < 150) {
        const p = pulseAge / 150;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${FX_BLUE}, ${(0.3 * (1 - p)).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.arc(state.pulse.x, state.pulse.y, p * 90, 0, Math.PI * 2);
        ctx.stroke();
      }

      fxAntenna(ctx, w * 0.09, h * 0.85, 22, 0.35);
      fxBroadcast(ctx, w * 0.09, h * 0.85 - 22, t, 60, FX_TEAL, 0.22, 2, 300);
    };
  },

  // Contact: calm water. Two low waves, a pulsing mast in the corner, and
  // ripples that spread from wherever the cursor moves.
  ripple(state) {
    return (ctx, w, h, t, mouse, ripples) => {
      // the interface the ripples live on
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.85);
      ctx.lineTo(w, h * 0.85);
      ctx.stroke();
      [
        { yOff: 0.8, amp: 9, freq: 0.008, speed: 0.18, color: FX_TEAL, alpha: 0.18 },
        { yOff: 0.9, amp: 12, freq: 0.006, speed: 0.138, color: FX_BLUE, alpha: 0.14 },
      ].forEach((l, i) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${l.color}, ${l.alpha})`;
        ctx.lineWidth = 1.1;
        const base = h * l.yOff;
        for (let x = 0; x <= w; x += 4) {
          const bump = mouse.energy * fxBump(x - mouse.x, w * 0.08);
          const y = base + Math.sin(x * l.freq + t * l.speed + i * 2.4) * l.amp * (1 + bump * 1.8);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // soft glow under the cursor
      if (mouse.energy > 0.03) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
        g.addColorStop(0, `rgba(${FX_TEAL}, ${(0.07 * mouse.energy).toFixed(3)})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(mouse.x - 120, mouse.y - 120, 240, 240);
      }
      if (mouse.travel > 40 && mouse.energy > 0.25 && ripples.length < 10) {
        mouse.travel = 0;
        ripples.push({ x: mouse.x, y: mouse.y, r: 3, maxR: 70, alpha: 0.26, color: FX_TEAL });
      }

      fxAntenna(ctx, w * 0.93, h * 0.82, 24, 0.4);
      fxBroadcast(ctx, w * 0.93, h * 0.82 - 24, t, 70, FX_BLUE, 0.24, 2, 280);
    };
  },

  // Sensing & Communications use cases: sonar pings rising up through the bottom.
  // No antenna, no visible origin (it sits below the bottom edge) — expanding
  // rings ripple across a faint contact field that blips teal as each ring passes
  // over it. Rings emit on a timer (animates with no cursor); the field also
  // brightens gently under the cursor.
  sonar(state) {
    state.pings = [];
    state.next = 20;
    return (ctx, w, h, t, mouse) => {
      const ox = w * 0.5, oy = h * 1.05; // origin hidden just below the bottom edge
      const maxR = Math.hypot(w * 0.5, h) * 1.1;
      const LIFE = 430, GAP = 250; // frames: ring lifetime / spacing (slower)

      if (t >= state.next) {
        state.pings.push({ born: t, hue: state.pings.length % 3 === 2 ? FX_BLUE : FX_TEAL });
        state.next = t + GAP;
      }
      state.pings = state.pings.filter((p) => t - p.born < LIFE);

      // faint contact field; each dot blips as a ring sweeps across its radius
      const gap = 56;
      for (let gx = gap * 0.5; gx < w; gx += gap) {
        for (let gy = gap * 0.5; gy < h; gy += gap) {
          const dr = Math.hypot(gx - ox, gy - oy);
          let blip = 0;
          for (const p of state.pings) {
            const prog = (t - p.born) / LIFE;
            const band = Math.abs(dr - prog * maxR);
            if (band < 24) blip = Math.max(blip, (1 - band / 24) * (1 - prog));
          }
          const cur = mouse.energy * fxBump(Math.hypot(gx - mouse.x, gy - mouse.y), 150);
          if (blip > 0.04 || cur > 0.05) {
            ctx.fillStyle = `rgba(${FX_TEAL}, ${(0.05 + blip * 0.55 + cur * 0.4).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(gx, gy, 1 + blip * 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(${FX_WHITE}, 0.05)`;
            ctx.beginPath();
            ctx.arc(gx, gy, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // the expanding ping rings
      for (const p of state.pings) {
        const prog = (t - p.born) / LIFE;
        const alpha = 0.24 * (1 - prog);
        if (alpha < 0.004) continue;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${p.hue}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.arc(ox, oy, prog * maxR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // no visible source — the origin sits below the bottom edge, so rings
      // simply rise up through the bottom of the section.
    };
  },
};

document.querySelectorAll("#wave-canvas, canvas[data-fx]").forEach((c) => {
  const variant = fxVariants[c.dataset.fx || "hero"];
  if (variant) fxMount(c, variant);
});
