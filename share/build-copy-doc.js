// Build the PR copy-review Word document from share/copy-map.json.
//
//   cd <anywhere with the npm `docx` package installed>
//   node share/build-copy-doc.js share/copy-map.json share/Saltenna-Website-Copy-REVIEW.docx
//
// Needs the npm package `docx` (npm install docx).
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  BorderStyle, PageBreak,
} = require("docx");
const fs = require("fs");

const entries = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const OUT = process.argv[3];

const TEAL = "1F7A70";
const GREY = "6B7785";
const RED = "9E2B25";
const RULE = { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D6DBE1", space: 6 } };

// copy known to be provisional — flagged inline so PR sees it in context
const PROVISIONAL = {
  "prod-ibex.name": "Invented — no source",
  "prod-ibex.fullName": "Invented — no source",
  "prod-ibex.status": "Unconfirmed",
  "prod-ibex.claim": "Invented — no source",
  "prod-ibex.body": "Invented — written from the 3D model, not a spec sheet",
  "prod-ibex.spec1": "Cannot be substantiated",
  "prod-ibex.spec2": "Cannot be substantiated",
  "prod-ibex.spec3": "Cannot be substantiated",
  "prod-ibex.spec4": "Cannot be substantiated",
  "prod-d2d.status": "Placeholder — not on the spec sheet",
  "tool.name": "Placeholder name — unconfirmed",
  "prod-remora.status": "Conflicts with the 3D model's own note (see cover page)",
};

const PAGE_ORDER = ["Every page (shared)", "Home", "Products", "Maritime",
  "Communications", "Sensing", "About", "Contact"];

const KIND_LABEL = {
  h1: "Page title", h2: "Section heading", h3: "Heading", h4: "Sub-heading",
  p: "Paragraph", a: "Link / button", div: "Label", span: "Label",
  label: "Form label", button: "Button", b: "Bold text", meta: "SEO",
  "product-field": "Product copy", "spec-chip": "Spec chip",
  "model-hint": "3D caption",
  // not visible on the page — screen readers, tooltips, search engines
  alt: "IMAGE ALT — not shown on screen",
  title: "TOOLTIP — not shown on screen",
  "aria-label": "SCREEN-READER LABEL — not shown on screen",
  placeholder: "FORM HINT — greyed out inside the field",
};
const INVISIBLE = new Set(["alt", "title", "aria-label", "placeholder"]);

const children = [];

// ---------- cover ----------
children.push(
  new Paragraph({ spacing: { before: 200, after: 60 },
    children: [new TextRun({ text: "SALTENNA", bold: true, size: 30, color: TEAL, characterSpacing: 60 })] }),
  new Paragraph({ heading: HeadingLevel.TITLE,
    children: [new TextRun({ text: "Website Copy — Review Draft", size: 52, bold: true })] }),
  new Paragraph({ spacing: { after: 300 }, border: RULE,
    children: [new TextRun({ text: `Every word on the site · ${entries.length} items · ~${entries.reduce((a, e) => a + e.display.split(/\s+/).length, 0)} words`, color: GREY, size: 20 })] }),
);

[
  ["What this is", "Every piece of text on the seven-page Saltenna site, in the order a visitor meets it. Nothing is omitted — headings, body copy, buttons, form labels, the footer, and the text search engines show."],
  ["How to edit", "Turn on Review → Track Changes, then edit the text directly. Please leave the small grey code above each block untouched — that is what lets the edits be put back on the site automatically."],
  ["Comments welcome", "If something needs a decision rather than a rewrite, leave a Word comment instead of guessing. Please do not type notes into the copy itself — they get published."],
  ["Text you cannot see on the page", "Some blocks are marked NOT SHOWN ON SCREEN. These are image descriptions, hover tooltips and screen-reader labels. They are read aloud to visitors using assistive technology and indexed by search engines, so they matter — they were simply invisible in the previous round."],
].forEach(([h, b]) => {
  children.push(
    new Paragraph({ spacing: { before: 160, after: 40 },
      children: [new TextRun({ text: h, bold: true, size: 22 })] }),
    new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: b, size: 21 })] }),
  );
});

children.push(
  new Paragraph({ spacing: { before: 260, after: 80 },
    children: [new TextRun({ text: "Please read before editing", bold: true, size: 24, color: RED })] }),
);
[
  ["Ibex is entirely placeholder text.", "Its name, claim, body paragraph and all four spec chips were written from a 3D model's placeholder labels, not from any Saltenna source. The specifics it asserts (AN/PRC-163 fit, SMA connector, 250 mm) cannot be substantiated. This copy must not go public as it stands — it needs real product information, not just a polish."],
  ["Two product statuses are unconfirmed.", "D2D says “Prototype”, which is not stated on its spec sheet. Remora says “Customer engagement ready”, while the 3D model supplied for it describes it as a concept study whose coupling arrangement is unresolved. Both need a decision from the team."],
  ["The software tool's name is a placeholder.", "“The Saltenna Waveform” was invented as a working title."],
  ["One technical wording conflict.", "The Remora model's own physics note says the effect at radio frequencies is a Sommerfeld surface wave, “a bound guided mode, not an optical surface plasmon”. Worth a physicist's ruling before launch."],
].forEach(([h, b]) => {
  children.push(new Paragraph({
    spacing: { after: 90 }, indent: { left: 220 },
    children: [
      new TextRun({ text: h + "  ", bold: true, size: 21, color: RED }),
      new TextRun({ text: b, size: 21 }),
    ],
  }));
});

children.push(
  new Paragraph({ spacing: { before: 240, after: 60 },
    children: [new TextRun({ text: "A note on repeated text", bold: true, size: 22 })] }),
  new Paragraph({ spacing: { after: 40 }, children: [new TextRun({
    text: "Some text appears on several pages — the closing call-to-action and the footer, for example. Those blocks are marked “repeated” and are stored once, so editing them anywhere changes every page. You only need to edit them once; the first occurrence is the one to work on.",
    size: 21 })] }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---------- the copy, page by page ----------
for (const page of PAGE_ORDER) {
  const rows = entries.filter((e) => e.page === page);
  if (!rows.length) continue;

  children.push(
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 40 },
      children: [new TextRun({ text: page, bold: true, size: 34, color: TEAL })] }),
    new Paragraph({ spacing: { after: 200 }, border: RULE,
      children: [new TextRun({
        text: page === "Every page (shared)"
          ? "Navigation and footer — appears identically on all seven pages."
          : `${rows.length} items`,
        color: GREY, size: 19, italics: true })] }),
  );

  let lastLoc = null;
  for (const e of rows) {
    const loc = e.location || "";
    if (loc !== lastLoc) {
      children.push(new Paragraph({
        spacing: { before: 200, after: 60 },
        children: [new TextRun({ text: loc.toUpperCase(), bold: true, size: 17, color: TEAL, characterSpacing: 40 })],
      }));
      lastLoc = loc;
    }

    const meta = [new TextRun({ text: `[${e.id}]`, size: 15, color: GREY }),
                  new TextRun({ text: `  ${KIND_LABEL[e.kind] || e.kind}`, size: 15, color: GREY })];
    if (e.shared) meta.push(new TextRun({ text: "  · repeated on other pages", size: 15, color: GREY, italics: true }));
    if (PROVISIONAL[e.id]) meta.push(new TextRun({ text: `  · ${PROVISIONAL[e.id]}`, size: 15, color: RED, bold: true }));
    children.push(new Paragraph({ spacing: { before: 90, after: 20 }, children: meta }));

    const big = /^h[1-4]$/.test(e.kind);
    children.push(new Paragraph({
      spacing: { after: 60 }, indent: { left: 220 },
      children: [new TextRun({
        text: e.display,
        size: big ? 26 : 22,
        bold: big,
        italics: INVISIBLE.has(e.kind),
        color: PROVISIONAL[e.id] ? "7A2E2A" : (INVISIBLE.has(e.kind) ? "44505E" : "1A1A1A"),
      })],
    }));
  }
  children.push(new Paragraph({ children: [new PageBreak()] }));
}
children.pop(); // no trailing blank page

const doc = new Document({
  creator: "Saltenna",
  title: "Saltenna Website Copy — Review Draft",
  description: "Every string of copy on the Saltenna site, for PR review.",
  styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1200, right: 1200 } } },
    children,
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync(OUT, b);
  console.log(`wrote ${OUT} (${(b.length / 1024).toFixed(0)} KB, ${entries.length} copy blocks)`);
});
