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
