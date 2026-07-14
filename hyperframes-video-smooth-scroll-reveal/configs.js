// Smooth Scroll Reveal — 7 Hyperframes configs (versions 6.1–6.7) for
// justpercent.com (US locale). Single source of truth.
// `node export-configs.mjs` mirrors these into configs/*.json.
//
// Coordinate space: CSS pixels of the captured page (assets are @2x).
// camera.path keys: t = seconds, y = page-space scrollTop, s = zoom scale
// (1.0 = page fits the panel width). x is LOCKED to 0 (horizontal center)
// by the technique. Per-key `ease` overrides camera.easing for the segment
// that ends at that key. cursor.keys are panel-space (1230x656).
// All captures were taken only after full DOM stabilization (meta.captureGuard).

window.SSR_CONFIGS = {
  "6.1": {
    hyperframes: "1.0",
    name: "ssr-6-1-classic-vertical-scan",
    technique: "Smooth Scroll Reveal / Classic Vertical Scan",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/?noredirect",
      displayUrl: "justpercent.com",
      locale: "en-US",
      flow: "Homepage, full page — a calm top-down scan: hero, search, Solution Cards, quick examples.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        neverCaptureMidTransition: true
      }
    },
    duration: 3.5,
    page: { asset: "assets/us-home-full.png", w: 1600, h: 5861 },
    camera: {
      easing: "ease-in-out-sine",
      path: [
        { t: 0.0, y: 0, s: 1.3 },
        { t: 3.5, y: 800, s: 1.3 }
      ]
    },
    cursor: {
      keys: [
        { t: 0.9, x: 1176, y: 200, o: 0 },
        { t: 1.3, x: 1176, y: 230, o: 0.65 },
        { t: 2.7, x: 1176, y: 452, o: 0.65 },
        { t: 3.2, x: 1176, y: 490, o: 0 }
      ]
    },
    highlights: [],
    fx: { vignette: true, grain: true, letterbox: true },
    overlays: [
      { kind: "chip", text: "justpercent.com — Home", in: 0.2, out: 3.4 },
      { kind: "caption", text: "Every percentage answer, on one page.", in: 0.4, out: 1.9 },
      { kind: "caption", text: "Just scroll — tips, sales, taxes, raises.", in: 2.1, out: 3.4 }
    ]
  },

  "6.2": {
    hyperframes: "1.0",
    name: "ssr-6-2-post-click-loaded-list",
    technique: "Smooth Scroll Reveal / Post-Click Loaded List",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/decreased-value-calculator/",
      displayUrl: "justpercent.com/decreased-value-calculator",
      locale: "en-US",
      flow: "Homepage → click Solution Card 'Apply My Coupon' → Value Decrease Calculator arrives pre-filled ($100 − 20% = $80) with the Practical Uses list loaded below. Captured only after the post-click DOM fully settled.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        afterClick: true, asyncListLoaded: true, neverCaptureMidTransition: true
      }
    },
    duration: 4.0,
    page: { asset: "assets/us-decreased-value-after-card-click.png", w: 1600, h: 4610 },
    camera: {
      easing: "ease-in-out-sine",
      path: [
        { t: 0.0, y: 0, s: 1.3 },
        { t: 4.0, y: 1000, s: 1.3 }
      ]
    },
    cursor: null,
    highlights: [],
    fx: { vignette: true, grain: true, letterbox: true },
    overlays: [
      { kind: "chip", text: "Home → “Apply My Coupon” → Value Decrease Calculator", in: 0.2, out: 3.9 },
      { kind: "caption", text: "One tap on a Solution Card…", in: 0.3, out: 1.5 },
      { kind: "caption", text: "…opens a calculator already filled in: $100 − 20% = $80.", in: 1.7, out: 3.1 },
      { kind: "caption", text: "Real examples keep loading below.", in: 3.3, out: 3.9 }
    ]
  },

  "6.3": {
    hyperframes: "1.0",
    name: "ssr-6-3-slow-log-read",
    technique: "Smooth Scroll Reveal / Slow Log Read",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/faqs/",
      displayUrl: "justpercent.com/faqs",
      locale: "en-US",
      flow: "Interactive FAQs index — a long ledger of real-life percentage questions, read slowly line by line.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        neverCaptureMidTransition: true
      }
    },
    duration: 5.0,
    page: { asset: "assets/us-faqs-index.png", w: 1600, h: 13044 },
    camera: {
      easing: "ease-in-out-sine",
      path: [
        { t: 0.0, y: 0, s: 1.25 },
        { t: 5.0, y: 1200, s: 1.25 }
      ]
    },
    cursor: null,
    highlights: [],
    fx: { vignette: true, grain: true, letterbox: true },
    overlays: [
      { kind: "chip", text: "justpercent.com/faqs — Interactive FAQs", in: 0.2, out: 4.9 },
      { kind: "caption", text: "Read it slow — every line is a real question.", in: 0.6, out: 2.5 },
      { kind: "caption", text: "And every question is a live calculator.", in: 2.9, out: 4.8 }
    ]
  },

  "6.4": {
    hyperframes: "1.0",
    name: "ssr-6-4-long-form-glide",
    technique: "Smooth Scroll Reveal / Parallax-Free Long Form",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/increased-value-calculator/",
      displayUrl: "justpercent.com/increased-value-calculator",
      locale: "en-US",
      flow: "Value Increase Calculator → clicked Practical Use 'Budget Boost' below the calculator → inputs fill themselves: $5,000 + 25% = $6,250. Then the long-form guide (How to Use, How It Works) glides past.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        afterClick: true, neverCaptureMidTransition: true
      }
    },
    duration: 4.5,
    page: { asset: "assets/us-increased-value-practical-use.png", w: 1600, h: 4701 },
    camera: {
      easing: "ease-in-out-sine",
      path: [
        { t: 0.0, y: 0, s: 1.2 },
        { t: 4.5, y: 1500, s: 1.2 }
      ]
    },
    cursor: null,
    highlights: [],
    fx: { vignette: true, grain: true, letterbox: true },
    overlays: [
      { kind: "chip", text: "Value Increase Calculator → Practical Use: “Budget Boost”", in: 0.2, out: 4.4 },
      { kind: "caption", text: "Tapped once below the calculator: $5,000 + 25% = $6,250.", in: 0.5, out: 2.3 },
      { kind: "caption", text: "The whole guide reads like a page — because it is one.", in: 2.7, out: 4.3 }
    ]
  },

  "6.5": {
    hyperframes: "1.0",
    name: "ssr-6-5-cursor-assisted-scroll",
    technique: "Smooth Scroll Reveal / Cursor-Assisted Scroll",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/?noredirect",
      displayUrl: "justpercent.com",
      locale: "en-US",
      flow: "Homepage Search: typed 'tip', picked the first result — the app pins the 'Restaurant Tip' Practical Use and scrolls to the Basic Percentage Calculator, pre-filled: 15% of $60 = $9. A guiding cursor rides the right margin during the reveal.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        afterClick: true, neverCaptureMidTransition: true
      }
    },
    duration: 4.3,
    page: { asset: "assets/us-home-tip-pinned-full.png", w: 1600, h: 6780 },
    camera: {
      easing: "ease-in-out-sine",
      path: [
        { t: 0.0, y: 0, s: 1.3 },
        { t: 0.5, y: 0, s: 1.3 },
        { t: 3.8, y: 1880, s: 1.3 },
        { t: 4.3, y: 1880, s: 1.3 }
      ]
    },
    cursor: {
      keys: [
        { t: 0.3, x: 1180, y: 130, o: 0 },
        { t: 0.7, x: 1180, y: 150, o: 0.9 },
        { t: 3.8, x: 1180, y: 545, o: 0.9 },
        { t: 4.2, x: 1180, y: 560, o: 0 }
      ]
    },
    highlights: [],
    fx: { vignette: true, grain: true, letterbox: true },
    overlays: [
      { kind: "chip", text: "Home → Search “tip”", in: 0.2, out: 4.2 },
      { kind: "caption", text: "You searched “tip”.", in: 0.3, out: 1.3 },
      { kind: "caption", text: "Just Percent walks you down the page…", in: 1.5, out: 2.8 },
      { kind: "caption", text: "…to your example, pinned: 15% of $60 = $9.", in: 3.0, out: 4.2 }
    ]
  },

  "6.6": {
    hyperframes: "1.0",
    name: "ssr-6-6-highlight-on-scroll",
    technique: "Smooth Scroll Reveal / Highlight-on-Scroll",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/?noredirect",
      displayUrl: "justpercent.com",
      locale: "en-US",
      flow: "Homepage Solution Cards. Steady scroll; each card row entering the center of the frame gets a brief glow, handing the eye from Coupon to Exam.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        neverCaptureMidTransition: true
      }
    },
    duration: 4.0,
    page: { asset: "assets/us-home-full.png", w: 1600, h: 5861 },
    camera: {
      easing: "ease-in-out-sine",
      path: [
        { t: 0.0, y: 0, s: 1.3 },
        { t: 4.0, y: 1000, s: 1.3 }
      ]
    },
    cursor: null,
    glowSigma: 180,
    highlights: [
      { x: 436, y: 348, w: 360, h: 155, label: "Coupon" },
      { x: 804, y: 348, w: 360, h: 155, label: "Sale" },
      { x: 436, y: 511, w: 360, h: 155, label: "Tax" },
      { x: 804, y: 511, w: 360, h: 155, label: "Tip" },
      { x: 436, y: 674, w: 360, h: 155, label: "Commission" },
      { x: 804, y: 674, w: 360, h: 155, label: "Costs" },
      { x: 436, y: 837, w: 360, h: 155, label: "Salary" },
      { x: 804, y: 837, w: 360, h: 155, label: "Sales Tax" },
      { x: 436, y: 1000, w: 360, h: 155, label: "Exam" }
    ],
    fx: { vignette: true, grain: true, letterbox: true },
    overlays: [
      { kind: "chip", text: "justpercent.com — Solution Cards", in: 0.2, out: 3.9 },
      { kind: "caption", text: "Nine everyday problems, one grid.", in: 0.5, out: 1.9 },
      { kind: "caption", text: "Yours lights up on the way down.", in: 2.2, out: 3.8 }
    ]
  },

  "6.7": {
    hyperframes: "1.0",
    name: "ssr-6-7-scroll-zoom-finish",
    technique: "Smooth Scroll Reveal / Scroll + Zoom Finish",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/faqs/bill-splitting-calculator/",
      displayUrl: "justpercent.com/faqs/bill-splitting-calculator",
      locale: "en-US",
      flow: "Interactive FAQ subpage: 'How much should each person pay when a bill is split by percentage?' Full scroll pass over the live example (60/40 of $250), then a zoom finish onto the Answer and the Basic Percentage Calculator CTA, held for a beat.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        neverCaptureMidTransition: true
      }
    },
    duration: 5.5,
    page: { asset: "assets/us-faq-bill-splitting.png", w: 1600, h: 1055 },
    camera: {
      easing: "ease-in-out-sine",
      path: [
        { t: 0.0, y: 0, s: 1.3 },
        { t: 3.0, y: 300, s: 1.3 },
        { t: 4.5, y: 186, s: 2.0, ease: "ease-in-out-cubic" },
        { t: 5.5, y: 186, s: 2.0 }
      ]
    },
    cursor: null,
    highlights: [],
    fx: { vignette: true, grain: true, letterbox: true },
    overlays: [
      { kind: "chip", text: "FAQs → Splitting a bill by percentage", in: 0.2, out: 5.4 },
      { kind: "caption", text: "Splitting the bills, 60/40.", in: 0.4, out: 1.8 },
      { kind: "caption", text: "Scroll the full answer…", in: 2.0, out: 3.1 },
      { kind: "caption", text: "You owe $150. Your roommate, $100.", in: 3.5, out: 5.4, emphasis: true }
    ]
  }
};
