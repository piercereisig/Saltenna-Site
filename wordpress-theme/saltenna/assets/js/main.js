/* Saltenna — shared behavior */

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
    const subject = encodeURIComponent(
      `Website inquiry — ${data.get("topic") || "General"}`
    );
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nOrganization: ${data.get("org") || "—"}\nEmail: ${data.get("email")}\n\n${data.get("message")}`
    );
    window.location.href = `mailto:info@saltenna.com?subject=${subject}&body=${body}`;
  });
}

// Newsroom feed. Priority: a connected LinkedIn widget (data-embed) shows the
// live posts iframe; otherwise posts are rendered from the JSON file named in
// data-posts; if neither is available the follow card stays.
const linkedinFeed = document.getElementById("linkedin-feed");
if (linkedinFeed) {
  const embedUrl = (linkedinFeed.dataset.embed || "").trim();
  if (embedUrl) {
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.title = "Saltenna LinkedIn posts";
    iframe.loading = "lazy";
    linkedinFeed.replaceChildren(iframe);
    linkedinFeed.classList.add("connected");
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

// Ensure background videos autoplay (some browsers need an explicit nudge)
document.querySelectorAll(".hero-video, .bg-video").forEach((v) => {
  const tryPlay = () => v.play().catch(() => {});
  tryPlay();
  document.addEventListener("click", tryPlay, { once: true });
});

// Scroll-linked motion (Apple-style parallax)
const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
const bgVideos = [...document.querySelectorAll(".bg-video")];
const heroContent = document.querySelector(".hero-content");

if (motionOK && (parallaxEls.length || bgVideos.length || heroContent)) {
  function applyScrollFX() {
    const vh = window.innerHeight;

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
}

// Plasmonic wave hero animation
const canvas = document.getElementById("wave-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let w, h, t = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const layers = [
    { amp: 26, freq: 0.006, speed: 0.0042, yOff: 0.52, color: "rgba(255, 255, 255, 0.30)", width: 1.4 },
    { amp: 38, freq: 0.0045, speed: 0.0032, yOff: 0.58, color: "rgba(255, 255, 255, 0.22)", width: 1.2 },
    { amp: 20, freq: 0.008, speed: 0.0056, yOff: 0.64, color: "rgba(255, 255, 255, 0.16)", width: 1 },
    { amp: 48, freq: 0.0035, speed: 0.0025, yOff: 0.7, color: "rgba(255, 255, 255, 0.11)", width: 1 },
    { amp: 30, freq: 0.0055, speed: 0.0039, yOff: 0.78, color: "rgba(255, 255, 255, 0.07)", width: 1 },
  ];

  // sparse particle field
  const particles = Array.from({ length: 70 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.6 + 0.4,
    s: Math.random() * 0.0004 + 0.0001,
  }));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function frame() {
    ctx.clearRect(0, 0, w, h);

    // particles
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    particles.forEach((p) => {
      p.x += p.s * 0.4;
      if (p.x > 1.02) p.x = -0.02;
      ctx.globalAlpha = 0.25 + 0.5 * Math.sin(t * 0.02 + p.y * 12);
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // plasmonic surface waves
    layers.forEach((l, i) => {
      ctx.beginPath();
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.width;
      const base = h * l.yOff;
      for (let x = 0; x <= w; x += 3) {
        // wave envelope decays toward edges — surface-wave feel
        const env = Math.sin((x / w) * Math.PI);
        const y =
          base +
          Math.sin(x * l.freq + t * l.speed * 60 + i * 1.7) * l.amp * env +
          Math.sin(x * l.freq * 2.3 + t * l.speed * 90) * l.amp * 0.25 * env;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    t += 1;
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  frame();
}
