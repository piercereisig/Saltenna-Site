# Products page — plan

_Created 2026-07-31. Status: **BUILT 2026-07-31** (CSS v72 / JS v44) — first two
products (D2D, Remora) live from the user's spec-sheet PDFs; posters extracted
from those PDFs stand in until 3D models arrive. Software-tools section is
scaffolded but hidden (`tools: []` in `src/data/products.ts`) pending copy.
Decisions taken: nav slot **after Home, before Maritime**; maturity shown as a
**separate `.status-badge`** (deliberate exception to the no-eyebrow rule);
root duplicates kept until deploy, CSS/JS mirrored. D2D's "Prototype" status is
a **placeholder — user has not confirmed**._

## The requirement (from the user)

A new products page with two parts:

1. **Products** — four or five of them. Hardware, presumably.
2. **Tools** — software the company sells. A separate section.

Each item has a description. **3D models go in now; photographs come later.**
The user asked for organization/presentation ideas, not implementation.

Not yet supplied: the product names, what they are, or any copy. That's the
first thing to ask for.

## Recommended structure

**Products use [`.uc-explorer`](../webflow-app/public/css/styles.css) · Tools use `.card-grid`.**

Using two different patterns does double duty: it organizes the page *and*
signals "these are two different kinds of thing" without tabs or a second page.

### Why the explorer for products

`.uc-explorer` is a big numbered list of names on the left with a sticky detail
pane on the right. It is **already fully styled in `css/styles.css` and has
never been used** on any page:

- `.uc-explorer` grid at **styles.css:1472** (1.15fr / 1fr, 72px gap)
- `.uc-list button` with mono `.idx` numerals, teal `.is-active` state, from 1478
- `.uc-detail` sticky pane at 1519; `uc-fade` entry animation
- **Mobile fallback already present** at `@media (max-width: 900px)` (1556):
  single column, `position: static`, smaller list type
- **`.uc-detail-media` at 1564 is already a locked `aspect-ratio: 16/9` box**

What it needs: **~15 lines of JS** to wire click-to-switch (none exists —
`main.js` only drives `.uc-scroll` and the focus panels), and **one CSS rule** so
`.uc-detail-media` accepts an `iframe` as well as an `img` (1570 styles `img`
only).

### The constraint that actually drives the choice

Each 3D graphic is a separate three.js document in an iframe, so **each is its
own WebGL context**. The busiest page today (`index.astro`) runs **two**. Five
live at once would be a materially different load — browsers cap concurrent
contexts and each three.js instance costs GPU and memory on first paint.

- Alternating `.split` rows (the zero-work option) = **five live contexts**. Avoid.
- The explorer renders **one at a time**. Turns the problem into a non-issue.
- A card grid should use **still posters**, activating 3D on click.

Give every product a poster image regardless — a screenshot of its own 3D model
is fine. The page looks complete today, loads fast, and the poster is exactly
what a real photo replaces later.

## Making "photos later" a data edit, not a markup edit

Now that the site is Astro, drive the page from data:

```
webflow-app/src/data/products.ts        name, eyebrow, status, claim, body,
                                        specs[], model?, image?, poster
webflow-app/src/components/ProductMedia.astro
```

`ProductMedia` renders `image` if present, else `model` in a lazy iframe, else
the poster alone. Adding photographs later becomes **editing one field per
product**. Because the box is a fixed 16/9, nothing reflows on swap.

## Description shape — same five slots every time

Consistency is what makes four or five products read as a line rather than a pile.

1. **Eyebrow** — domain and maturity, e.g. `Maritime · Prototype`
2. **Name**
3. **One-line claim** — what it does, in plain language
4. **Two or three sentences** of body
5. **Three or four spec chips** — `.tag-row` already exists (frequency, range,
   depth rating, interface)

**The maturity label should be non-negotiable.** These are dual-use products
almost certainly at different readiness levels; being explicit about "fielded"
vs "in development" protects the company with government buyers far more than it
costs. Note the Jul 30 site-wide rule that `.eyebrow` kickers were removed
everywhere — so either reintroduce the eyebrow deliberately for products, or
carry the status as a separate badge. **Confirm with the user.**

## Smaller recommendations

- Order products by **maturity descending**, so the most credible item is first.
- **Cross-link each product** to whichever of maritime / communications /
  sensing it serves. Turns the products page into a hub rather than a dead end.
- `.interface-divider` exists for separating the two sections (CSS retained
  though currently unused site-wide per the Jul 30 pass).
- A sticky anchor sub-nav (`#products`, `#software`) is worth it if the page runs
  long.
- **"Tools" alone is vague** to a first-time visitor — "Software" or "Software
  tools" as the heading does more work.

## Other components available for reuse

`.card-grid` / `.card` / `.card-media` (used on index, maritime) · `.domain-grid`
/ `.domain-card` with eyebrow/title/body/arrow (built, unused) · `.split` /
`.split-media graphic` (the proven lazy-iframe 3D pattern) · `.tag-row` ·
`.cta-band` (on all five content pages) · `.section-head` · `.reveal` with
grid stagger.

## Next steps

1. Get the product names, what each is, and rough copy from the user.
2. Confirm: is the products page a **new 7th page** (`products.astro` + nav +
   footer entry in `Base.astro`), and does it replace anything?
3. Confirm the eyebrow/status-badge question above.
4. Build: `products.ts`, `ProductMedia.astro`, `products.astro`, the explorer JS
   in `main.js` (bump `JS_VERSION` in `Base.astro`), the `iframe` CSS rule (bump
   `CSS_VERSION`).
5. Add the nav/footer link in `Base.astro` — it is one shared file now, so this
   is a single edit rather than six.
