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
