// Technique 4 — "The State Toggle" (Before & After) · justpercent.com (US)
// 7 versions. Every asset pair was captured from the LIVE DOM only after full
// stabilization (network idle ≥500ms, fonts.ready, no animations, CLS quiet
// ≥500ms) — see capture.mjs / capture-fix.mjs. All URLs verified in src/pages.
//
// Camera keys: {t, s, fx, fy} — scale + focus point in 1600×900 image coords.
// Cursor path is in image coords of the layer it rides on.

window.ST_CONFIGS = {
  "4.1": {
    name: "4.1 Classic Before/After Cut",
    technique: "State Toggle / Hard Cut",
    duration: 7.0,
    layers: {
      a: { asset: "assets/home-grid.png", h: 900 },
      b: { asset: "assets/dec-after-coupon.png", h: 900 }
    },
    cam: {
      easing: "ease-in-out-cubic",
      keys: [
        { t: 0.0, s: 1.0, fx: 800, fy: 450 },
        { t: 1.6, s: 1.12, fx: 740, fy: 390 },
        { t: 2.6, s: 1.8, fx: 681, fy: 300 },
        { t: 3.0, s: 1.8, fx: 681, fy: 300 },
        { t: 3.1, s: 1.85, fx: 681, fy: 300, e: "ease-out-cubic" },
        { t: 3.2, s: 1.8, fx: 700, fy: 330 },
        { t: 3.25, s: 1.8, fx: 1010, fy: 420 },
        { t: 5.2, s: 1.0, fx: 800, fy: 450, e: "ease-in-out-quart" }
      ]
    },
    cursor: {
      easing: "ease-in-out-cubic",
      layer: "a",
      path: [
        { t: 0.6, x: 430, y: 720 },
        { t: 2.4, x: 681, y: 236 },
        { t: 3.4, x: 681, y: 236 }
      ],
      clickAt: 3.0
    },
    toggle: { type: "cut", at: 3.1 },
    overlays: [
      { kind: "chip", text: "TECHNIQUE 4 · STATE TOGGLE — HARD CUT", in: 0.4, out: 3.0 },
      { kind: "caption", text: "Every Solution Card is a real-life problem.", in: 0.9, out: 2.7 },
      { kind: "chip", text: "justpercent.com/decreased-value-calculator/", in: 3.5, out: 6.8 },
      { kind: "caption", text: "$100 − 20% coupon → $80. Already solved.", emphasis: true, in: 4.1, out: 6.7 }
    ]
  },

  "4.2": {
    name: "4.2 Live Post-Click Capture",
    technique: "State Toggle / Real DOM Mutation",
    duration: 7.5,
    layers: {
      a: { asset: "assets/inc-pu-list.png", h: 900 },
      b: { asset: "assets/inc-pu-after.png", h: 900 }
    },
    cam: {
      easing: "ease-in-out-cubic",
      keys: [
        { t: 0.0, s: 1.22, fx: 800, fy: 430 },
        { t: 2.6, s: 1.35, fx: 808, fy: 480 },
        { t: 2.8, s: 1.35, fx: 808, fy: 480 },
        { t: 2.9, s: 1.43, fx: 808, fy: 490, e: "ease-out-cubic" },
        { t: 3.05, s: 1.35, fx: 808, fy: 480 },
        { t: 3.45, s: 1.5, fx: 1000, fy: 470 },
        { t: 5.4, s: 1.0, fx: 800, fy: 450, e: "ease-in-out-quart" }
      ]
    },
    cursor: {
      easing: "ease-in-out-cubic",
      layer: "a",
      path: [
        { t: 0.6, x: 520, y: 800 },
        { t: 2.5, x: 808, y: 495 },
        { t: 3.3, x: 808, y: 495 }
      ],
      clickAt: 2.8
    },
    toggle: { type: "whip", at: 3.05, dur: 0.4 },
    overlays: [
      { kind: "chip", text: "LIVE POST-CLICK CAPTURE · REAL DOM", in: 0.4, out: 3.0 },
      { kind: "caption", text: "Tap a Practical Use under any calculator…", in: 0.9, out: 2.8 },
      { kind: "chip", text: "justpercent.com/increased-value-calculator/", in: 3.6, out: 7.3 },
      { kind: "caption", text: "$5,000 + 25% → $6,250 — filled in for you.", emphasis: true, in: 4.4, out: 7.2 }
    ]
  },

  "4.3": {
    name: "4.3 Whip-Pan Transition",
    technique: "State Toggle / Directional Whip",
    duration: 6.5,
    layers: {
      a: { asset: "assets/home-grid.png", h: 900 },
      b: { asset: "assets/basic-after-tip.png", h: 900 }
    },
    cam: {
      easing: "ease-in-out-cubic",
      keys: [
        { t: 0.0, s: 1.05, fx: 860, fy: 480 },
        { t: 2.2, s: 1.3, fx: 1049, fy: 430 },
        { t: 2.4, s: 1.3, fx: 1049, fy: 430 },
        { t: 2.5, s: 1.37, fx: 1049, fy: 430, e: "ease-out-cubic" },
        { t: 2.6, s: 1.3, fx: 1049, fy: 430 },
        { t: 2.85, s: 1.35, fx: 980, fy: 430 },
        { t: 4.7, s: 1.0, fx: 800, fy: 450, e: "ease-in-out-quart" }
      ]
    },
    cursor: {
      easing: "ease-in-out-cubic",
      layer: "a",
      path: [
        { t: 0.5, x: 1330, y: 780 },
        { t: 2.2, x: 1049, y: 396 },
        { t: 2.8, x: 1049, y: 396 }
      ],
      clickAt: 2.4
    },
    toggle: { type: "whip", at: 2.6, dur: 0.25 },
    overlays: [
      { kind: "chip", text: "STATE TOGGLE · WHIP-PAN", in: 0.4, out: 2.5 },
      { kind: "caption", text: "Dining out? There's a card for that.", in: 0.8, out: 2.4 },
      { kind: "chip", text: "justpercent.com/basic-percentage-calculator/", in: 3.1, out: 6.3 },
      { kind: "caption", text: "18% tip on a $50 bill → $9.", emphasis: true, in: 3.7, out: 6.2 }
    ]
  },

  "4.4": {
    name: "4.4 Crossfade Morph",
    technique: "State Toggle / Crossfade",
    duration: 8.0,
    layers: {
      a: { asset: "assets/faqs-index.png", h: 900 },
      b: { asset: "assets/faq-bill-splitting.png", h: 1055 }
    },
    cam: {
      easing: "ease-in-out-cubic",
      keys: [
        { t: 0.0, s: 1.0, fx: 800, fy: 420 },
        { t: 2.4, s: 1.15, fx: 800, fy: 560 },
        { t: 2.6, s: 1.15, fx: 800, fy: 560 },
        { t: 2.7, s: 1.2, fx: 801, fy: 580, e: "ease-out-cubic" },
        { t: 2.8, s: 1.15, fx: 800, fy: 560 },
        { t: 3.4, s: 1.12, fx: 800, fy: 400 },
        { t: 7.2, s: 1.12, fx: 800, fy: 680, e: "ease-in-out-sine" },
        { t: 8.0, s: 1.12, fx: 800, fy: 680 }
      ]
    },
    cursor: {
      easing: "ease-in-out-cubic",
      layer: "a",
      path: [
        { t: 0.7, x: 1250, y: 260 },
        { t: 2.3, x: 801, y: 615 },
        { t: 3.0, x: 801, y: 615 }
      ],
      clickAt: 2.6
    },
    toggle: { type: "fade", at: 2.8, dur: 0.6, bump: 0.05 },
    overlays: [
      { kind: "chip", text: "STATE TOGGLE · CROSSFADE MORPH", in: 0.4, out: 2.7 },
      { kind: "caption", text: "64 interactive FAQs — real questions, live math.", in: 0.8, out: 2.6 },
      { kind: "chip", text: "justpercent.com/faqs/bill-splitting-calculator/", in: 3.6, out: 7.8 },
      { kind: "caption", text: "Split the bills 60/40 — you owe $150, they owe $100.", emphasis: true, in: 4.6, out: 7.7 }
    ]
  },

  "4.5": {
    name: "4.5 Empty-State to Data",
    technique: "State Toggle / Empty → Data",
    duration: 8.0,
    layers: {
      pre: { asset: "assets/home-search-focused.png", h: 900 },
      a: { asset: "assets/home-search-portal.png", h: 900 },
      b: { asset: "assets/home-search-selected.png", h: 900 }
    },
    cam: {
      easing: "ease-in-out-cubic",
      keys: [
        { t: 0.0, s: 1.15, fx: 800, fy: 330 },
        { t: 1.4, s: 1.22, fx: 800, fy: 330 },
        { t: 3.1, s: 1.5, fx: 800, fy: 330 },
        { t: 3.3, s: 1.5, fx: 800, fy: 320 },
        { t: 3.4, s: 1.56, fx: 800, fy: 310, e: "ease-out-cubic" },
        { t: 3.5, s: 1.8, fx: 950, fy: 330 },
        { t: 5.6, s: 1.0, fx: 800, fy: 450, e: "ease-in-out-quart" }
      ]
    },
    cursor: {
      easing: "ease-in-out-cubic",
      layer: "a",
      path: [
        { t: 1.8, x: 1230, y: 720 },
        { t: 3.0, x: 800, y: 264 },
        { t: 3.5, x: 800, y: 264 }
      ],
      clickAt: 3.3
    },
    toggle: {
      type: "cut-seq",
      seq: [
        { at: 0.0, show: "pre" },
        { at: 1.4, show: "a" },
        { at: 3.5, show: "b" }
      ]
    },
    overlays: [
      { kind: "chip", text: "STATE TOGGLE · EMPTY STATE → DATA", in: 0.4, out: 3.3 },
      { kind: "caption", text: "One search box. Type “tip”…", in: 0.7, out: 2.0 },
      { kind: "caption", text: "Practical uses, solutions and FAQs — instantly.", in: 2.2, out: 3.4 },
      { kind: "chip", text: "search → pinned example on the home calculator", in: 4.0, out: 7.8 },
      { kind: "caption", text: "15% of a $60 dinner bill → $9. Pinned and computed.", emphasis: true, in: 4.7, out: 7.7 }
    ]
  },

  "4.6": {
    name: "4.6 Split-Screen Comparison",
    technique: "State Toggle / Split Wipe",
    duration: 7.0,
    layers: {
      a: { asset: "assets/change-default.png", h: 900 },
      b: { asset: "assets/change-after-renthike-nobanner.png", h: 900 }
    },
    cam: {
      easing: "ease-in-out-sine",
      keys: [
        { t: 0.0, s: 1.3, fx: 790, fy: 400 },
        { t: 7.0, s: 1.3, fx: 815, fy: 415 }
      ]
    },
    cursor: null,
    toggle: { type: "wipe", at: 1.6, dur: 0.8 },
    labels: { before: "BEFORE — worked example", after: "AFTER — your rent hike" },
    overlays: [
      { kind: "chip", text: "STATE TOGGLE · SPLIT-SCREEN WIPE", in: 0.4, out: 6.8 },
      { kind: "caption", text: "From the built-in example…", in: 0.6, out: 1.7 },
      { kind: "caption", text: "$2,000 → $2,200 rent is EXACTLY +10%.", emphasis: true, in: 3.0, out: 6.6 },
      { kind: "chip", text: "justpercent.com/percentage-change-calculator/", in: 2.6, out: 6.8 }
    ]
  },

  "4.7": {
    name: "4.7 Double Toggle Loop",
    technique: "State Toggle / Double Toggle ×2",
    duration: 8.0,
    layers: {
      a: { asset: "assets/inc-default.png", h: 900 },
      b: { asset: "assets/inc-after-tax-nobanner.png", h: 900 }
    },
    cam: {
      easing: "ease-in-out-cubic",
      keys: [
        { t: 0.0, s: 1.25, fx: 800, fy: 400 },
        { t: 1.7, s: 1.25, fx: 850, fy: 360 },
        { t: 1.8, s: 1.32, fx: 850, fy: 360, e: "ease-out-cubic" },
        { t: 2.0, s: 1.25, fx: 850, fy: 360 },
        { t: 2.9, s: 1.25, fx: 850, fy: 360 },
        { t: 3.0, s: 1.32, fx: 850, fy: 360, e: "ease-out-cubic" },
        { t: 3.2, s: 1.25, fx: 850, fy: 360 },
        { t: 3.5, s: 1.25, fx: 850, fy: 360 },
        { t: 3.6, s: 1.32, fx: 850, fy: 360, e: "ease-out-cubic" },
        { t: 3.8, s: 1.3, fx: 990, fy: 350 },
        { t: 4.6, s: 1.3, fx: 990, fy: 350 },
        { t: 6.6, s: 1.0, fx: 800, fy: 450, e: "ease-in-out-quart" }
      ]
    },
    cursor: {
      easing: "ease-in-out-cubic",
      layer: "a",
      path: [
        { t: 0.5, x: 620, y: 720 },
        { t: 1.5, x: 860, y: 330 },
        { t: 2.0, x: 860, y: 330 }
      ],
      clickAt: 1.7
    },
    toggle: {
      type: "cut-seq",
      seq: [
        { at: 0.0, show: "a" },
        { at: 1.9, show: "b" },
        { at: 3.0, show: "a" },
        { at: 3.6, show: "b" }
      ]
    },
    overlays: [
      { kind: "chip", text: "STATE TOGGLE · DOUBLE TOGGLE ×2", in: 0.4, out: 3.6 },
      { kind: "caption", text: "Same calculator. Watch the state flip.", in: 0.6, out: 1.8 },
      { kind: "chip", text: "justpercent.com/increased-value-calculator/", in: 4.0, out: 7.8 },
      { kind: "caption", text: "$100 + 8% sales tax → $108. In one tap.", emphasis: true, in: 4.6, out: 7.7 }
    ]
  }
};
