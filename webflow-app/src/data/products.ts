// Products and software tools shown on products.astro.
//
// Two media slots per product, shown side by side in the explorer:
//   - the PHOTOGRAPH in the detail pane (`image` if a real photo exists, else
//     `poster`) — see ProductMedia.astro
//   - the interactive 3D MODEL(S) in a card to the LEFT of that pane
//     (`models`: standalone three.js documents, lazily iframed). Two or more
//     stack and split the card evenly, so Ibex shows the radio above the rover.
// A product can have either or both; the model card only renders when `models`
// is set. Adding a model later is one entry here.

export interface Product {
  id: string; // anchor id on the detail item, e.g. "prod-d2d"
  name: string; // short — this is the big-type list entry
  fullName: string; // heading in the detail pane
  status: string; // maturity badge, e.g. "Prototype"
  domain: { label: string; href: string }; // which tech page it serves
  claim: string; // one line, plain language
  body: string; // two or three sentences
  specs: string[]; // three or four chips
  poster: string;
  models?: { src: string; hint?: string }[]; // stacked, split the card evenly
  image?: string;
}

export const products: Product[] = [
  {
    id: "prod-d2d",
    name: "D2D",
    fullName: "D2D — Diver-to-Diver Communications",
    // TODO(user): confirm maturity — not stated on the spec sheet.
    status: "Prototype",
    domain: { label: "Maritime", href: "maritime.html" },
    claim: "Underwater voice for dive teams — no line of sight, no buoy relay",
    body: "D2D lets divers talk in non-line-of-sight, silt-out, and blackout conditions — and through the air/water barrier to surface teams over a compatible two-way radio, with no transducer or buoy relay. A bone-conduction earpiece and push-to-talk configure rapidly for full-face and half-mask systems, integrating with a wide range of currently fielded dive equipment",
    specs: ["Depth rating 20 m", "Range up to 300 m", "2.12 kg total", "2 °C to 35 °C"],
    poster: "images/products/d2d-dive-team.jpg",
    models: [
      { src: "graphics/d2d-diver.html", hint: "Diver kit fit \u00b7 drag to rotate" },
    ],
  },
  {
    id: "prod-remora",
    name: "Remora",
    fullName: "Remora — Pipeline Data Links",
    status: "Customer engagement ready",
    domain: { label: "Communications", href: "communications.html" },
    claim: "Wireless data links along subsea pipelines, cables, and umbilicals",
    body: "Remora replaces conductive cable links with a wireless hop that uses the pipe or cable itself as the transmission medium. Built for subsea pipelines, flexibles, and umbilicals, it removes the cost and complexity of cable installation — no cable pull, no ROV connector alignment on either end, and no galvanic earth-loop issues on aging infrastructure",
    specs: [
      "Up to 200 m per hop",
      "Retrofit — no cable pull",
      "Non-galvanic coupling",
      "High & low frequency paths",
    ],
    // pipeline render kept as a fallback: images/products/remora-pipelines.jpg
    image: "images/products/remora-subsea.jpg",
    poster: "images/products/remora-pipelines.jpg",
    models: [
      // Vite build output — do NOT hand-edit anything under graphics/remora/.
      { src: "graphics/remora/index.html", hint: "Clamp-on pipe limpet \u00b7 drag to rotate" },
    ],
  },
  {
    id: "prod-stingray",
    name: "Stingray",
    fullName: "Stingray — Cognitive Wireless Penetrator",
    status: "Customer engagement ready",
    domain: { label: "Communications", href: "communications.html" },
    claim: "Contactless data through sealed metal walls, flanges, and pressure barriers.",
    body: "Stingray uses Plasmonix™ to penetrate a metal wall, flange, or pressure boundary — replacing wired penetrators and bulkhead connectors with a fully contactless wireless feedthrough. Internal and external units mount magnetically on opposite faces of the boundary, giving 360° coverage around a flange with no drilling, no leak path, and no alignment constraints",
    specs: [
      "Up to 1 Mbps bidirectional",
      "3,000 m design depth",
      "Magnetic, tool-less mounting",
      "Seawater & saturated brine",
    ],
    // spec-sheet product shot kept as a documented fallback:
    // images/products/stingray-body.jpg (alt: stingray-endcap.jpg)
    image: "images/products/stingray-subsea.jpg",
    poster: "images/products/stingray-body.jpg",
    models: [
      { src: "graphics/stingray.html", hint: "System interface module · drag to rotate" },
    ],
  },
  {
    // ⚠️ ALL COPY BELOW IS PROVISIONAL. The user supplied the 3D viewer but no
    // Ibex copy; the strings here are lifted from the viewer's own SPECS block,
    // which its author marked "placeholder — replace freely". Confirm every
    // field before this page goes live.
    id: "prod-ibex",
    name: "Ibex",
    fullName: "Ibex — Handheld Radio Antenna", // TODO(user): confirm
    status: "Prototype", // TODO(user): confirm — not stated anywhere
    domain: { label: "Communications", href: "communications.html" },
    claim: "A Plasmonix™ antenna that fits fielded handheld radios", // TODO(user)
    body: "Ibex replaces the standard whip on a handheld radio with a Plasmonix™ antenna, quick-mounting to the existing RF port with no change to the radio itself. The sealed housing is built for marine use, and the gooseneck bends to stow against a pack or vest", // TODO(user): confirm — written from the model, not a spec sheet
    specs: [
      "AN/PRC-163 fit", // from the viewer's placeholder SPECS
      "Plasmonix™ surface-wave launch",
      "SMA, quick-mount",
      "250 mm",
    ],
    models: [
      { src: "graphics/ibex-radio.html", hint: "AN/PRC-163 fit \u00b7 drag to rotate" },
      // ROVER 1 — shipped as a 5-file folder; index.html is the entry point.
      // Build output: do NOT hand-edit anything under graphics/rover/.
      { src: "graphics/rover/index.html", hint: "ROVER 1 \u00b7 drag to rotate" },
    ],
    poster: "images/products/ibex-peak.jpg",
  },
];

export interface Tool {
  name: string;
  claim: string; // one line
  body: string; // a paragraph
  href?: string; // detail page or external link, when one exists
}

// Software we license. The section on products.astro renders only when this
// list is non-empty; the first entry sits over the animated waveform band.
export const tools: Tool[] = [
  {
    // TODO(user): confirm the tool's real name — placeholder.
    name: "The Saltenna Waveform",
    claim: "A software-defined waveform for links with extreme path loss.",
    body: "Our waveform is designed for links with extreme path loss, where conventional radios lose synchronization or drop out entirely. Paired with our antenna technology, it forms a complete communications system: the antenna establishes a usable RF path through difficult media, and the waveform sustains a reliable data link over it. The entire receiver and transmitter run as software on compact, low-power embedded hardware",
  },
];
