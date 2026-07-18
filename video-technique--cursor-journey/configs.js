// Cursor Journey — 7 Hyperframes configs (versions 2.1–2.7) for justpercent.com (US).
// Single source of truth. `node export-configs.mjs` mirrors these into configs/*.json.
//
// Coordinate space: CSS pixels of the captured 1600×900 viewport states
// (assets are @2x). Cursor waypoints travel on cubic Bezier segments — never
// linear: `cp` = [[dx1,dy1],[dx2,dy2]] control-point offsets relative to the
// segment start/end. `jump:true` snaps the cursor with the content when a
// state swap shifts the page (scroll / navigation).
//
// The camera follows the cursor through a deterministic damped spring
// (fixed-step integration from t=0 → identical pixels for every seek).
// All captures were taken only after full DOM stabilization
// (see meta.captureGuard) — never mid-transition.

window.CJ_CONFIGS = {
  "2.1": {
    hyperframes: "1.0",
    name: "cj-2-1-classic-guided-flow",
    technique: "Cursor Journey / Classic Guided Flow",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/?noredirect",
      locale: "en-US",
      flow: "Homepage → click Search (A) → typewriter “tip” (B) → click the “Restaurant Tip” practical use (C) → the page scrolls to the Basic Percentage Calculator, pre-filled 15% of $60 = $9 with the practical use pinned below.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        perKeystrokeSettle: true, neverCaptureMidTransition: true
      }
    },
    duration: 9.5,
    states: {
      home:     { asset: "assets/s-home-top.png", w: 1600, h: 900 },
      focus:    { asset: "assets/s-home-search-focus.png", w: 1600, h: 900 },
      t1:       { asset: "assets/s-home-search-t.png", w: 1600, h: 900 },
      t2:       { asset: "assets/s-home-search-ti.png", w: 1600, h: 900 },
      t3:       { asset: "assets/s-home-search-tip.png", w: 1600, h: 900 },
      scrolled: { asset: "assets/s-home-tip-scrolled.png", w: 1600, h: 900 }
    },
    swaps: [
      { t: 0.0, state: "home", fx: "cut", dur: 0 },
      { t: 1.35, state: "focus", fx: "fade", dur: 0.22 },
      { t: 2.45, state: "t1", fx: "cut", dur: 0 },
      { t: 2.95, state: "t2", fx: "cut", dur: 0 },
      { t: 3.45, state: "t3", fx: "cut", dur: 0 },
      { t: 6.35, state: "scrolled", fx: "slide-up", dur: 0.75 }
    ],
    cursor: [
      { t: 0.0, x: 1230, y: 690 },
      { t: 1.30, x: 800, y: 216, cp: [[-260, -60], [150, 120]] },   // A: search box
      { t: 1.36, x: 800, y: 140, jump: true },                       // page scrolled 76px on focus
      { t: 4.30, x: 800, y: 140 },                                   // hold while typing
      { t: 5.60, x: 700, y: 255, cp: [[-140, 40], [90, -60]] },      // B→C: “Restaurant Tip” result
      { t: 6.30, x: 700, y: 255 },                                   // click + settle
      { t: 6.41, x: 813, y: 737, jump: true },                       // glued to pinned row after scroll
      { t: 7.30, x: 813, y: 737 },
      { t: 8.60, x: 971, y: 124, cp: [[60, -300], [-180, 150]] },    // up to the answer: 9
      { t: 9.5, x: 971, y: 124 }
    ],
    camera: {
      follow: { mode: "cursor", stiffness: 60, damping: "critical" },
      scaleTrack: [
        { t: 0.0, s: 1.0 },
        { t: 0.9, s: 1.0 },
        { t: 1.9, s: 1.5, ease: "ease-in-out-cubic" },
        { t: 5.9, s: 1.5 },
        { t: 6.6, s: 1.32, ease: "ease-in-out-sine" },
        { t: 8.4, s: 1.32 },
        { t: 9.3, s: 1.55, ease: "ease-in-out-cubic" }
      ]
    },
    events: [
      { kind: "click", t: 1.35, x: 800, y: 216 },
      { kind: "glow", t0: 1.4, t1: 4.3, rect: { x: 461, y: 115, w: 678, h: 50 } },
      { kind: "type", t0: 2.45, t1: 3.45, x: 560, y: 140, text: "tip", msPerChar: 500 },
      { kind: "click", t: 6.30, x: 700, y: 255 },
      { kind: "ring", t0: 7.0, t1: 9.4, rect: { x: 501, y: 693, w: 624, h: 88 } }
    ],
    fx: { letterbox: true, vignette: true, grain: true },
    overlays: [
      { kind: "chip", text: "justpercent.com — Search “tip”", in: 0.2, out: 9.4 },
      { kind: "caption", text: "Type what you need. Like “tip”.", in: 1.6, out: 3.9 },
      { kind: "caption", text: "Real practical uses appear before you finish.", in: 4.2, out: 6.1 },
      { kind: "caption", text: "One click — the right calculator, already filled in.", in: 6.9, out: 9.3 }
    ]
  },

  "2.2": {
    hyperframes: "1.0",
    name: "cj-2-2-post-click-chain-capture",
    technique: "Cursor Journey / Post-Click Chain Capture",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/decreased-value-calculator/",
      locale: "en-US",
      flow: "Homepage → click Solution Card “Apply My Coupon” — the click mutates the DOM (navigation) and the next frame was captured only after the new page fully settled: Value Decrease Calculator pre-filled $100 − 20% = $80.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        afterClick: true, neverCaptureMidTransition: true
      }
    },
    duration: 8.0,
    states: {
      home: { asset: "assets/s-home-top.png", w: 1600, h: 900 },
      dec:  { asset: "assets/s-dec-arrived.png", w: 1600, h: 900 }
    },
    swaps: [
      { t: 0.0, state: "home", fx: "cut", dur: 0 },
      { t: 2.75, state: "dec", fx: "zoom", dur: 0.6 }
    ],
    cursor: [
      { t: 0.0, x: 320, y: 190 },
      { t: 2.10, x: 681, y: 471, cp: [[240, -40], [-160, -130]] },   // A→B: coupon CTA
      { t: 2.55, x: 681, y: 471 },                                    // click
      { t: 2.85, x: 700, y: 300, jump: true },                        // new page
      { t: 4.10, x: 570, y: 417, cp: [[-160, 60], [-60, -90]] },      // $100
      { t: 4.70, x: 570, y: 417 },
      { t: 5.40, x: 827, y: 417, cp: [[90, 70], [-90, 70]] },         // 20%
      { t: 5.90, x: 827, y: 417 },
      { t: 6.70, x: 1019, y: 417, cp: [[70, -60], [-70, -60]] },      // ANSWER: 80
      { t: 8.0, x: 1019, y: 417 }
    ],
    camera: {
      follow: { mode: "cursor", stiffness: 80, damping: "spring", offset: { x: -130, y: 0 } },
      scaleTrack: [
        { t: 0.0, s: 1.12 },
        { t: 1.6, s: 1.12 },
        { t: 2.5, s: 1.6, ease: "ease-in-out-cubic" },
        { t: 2.9, s: 1.28, ease: "ease-out-cubic" },
        { t: 6.4, s: 1.28 },
        { t: 7.3, s: 1.6, ease: "ease-in-out-cubic" }
      ]
    },
    events: [
      { kind: "ring", t0: 1.9, t1: 2.6, rect: { x: 436, y: 348, w: 360, h: 155 } },
      { kind: "click", t: 2.55, x: 681, y: 471 },
      { kind: "glow", t0: 4.1, t1: 4.9, rect: { x: 506, y: 396, w: 128, h: 42 } },
      { kind: "glow", t0: 5.4, t1: 6.1, rect: { x: 763, y: 396, w: 128, h: 42 } },
      { kind: "ring", t0: 6.8, t1: 7.9, rect: { x: 949, y: 393, w: 140, h: 48 } }
    ],
    fx: { letterbox: true, vignette: true, grain: true },
    overlays: [
      { kind: "chip", text: "Home → “Apply My Coupon” → Value Decrease", in: 0.2, out: 7.9 },
      { kind: "caption", text: "Have a coupon — 20% off?", in: 0.4, out: 2.3 },
      { kind: "caption", text: "One tap on a Solution Card…", in: 2.5, out: 4.4 },
      { kind: "caption", text: "…and your numbers are already there: $100 − 20% = $80.", in: 4.7, out: 7.9 }
    ]
  },

  "2.3": {
    hyperframes: "1.0",
    name: "cj-2-3-form-fill-walkthrough",
    technique: "Cursor Journey / Form Fill Walkthrough",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/increased-value-calculator/",
      locale: "en-US",
      flow: "Value Increase Calculator greets you with a live example (240 + 15% = 276) → click field 1, typewriter “5000” — the answer recomputes on every keystroke → click field 2, typewriter “25” → 6250. No submit anywhere. Every keystroke state captured after full settle.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        perKeystrokeSettle: true, freshContext: true,
        neverCaptureMidTransition: true
      }
    },
    duration: 10.0,
    states: {
      empty: { asset: "assets/s-inc-empty.png", w: 1600, h: 900 },
      c1: { asset: "assets/s-inc-type-5.png", w: 1600, h: 900 },
      c2: { asset: "assets/s-inc-type-50.png", w: 1600, h: 900 },
      c3: { asset: "assets/s-inc-type-500.png", w: 1600, h: 900 },
      c4: { asset: "assets/s-inc-type-5000.png", w: 1600, h: 900 },
      p1: { asset: "assets/s-inc-type-25-2.png", w: 1600, h: 900 },
      p2: { asset: "assets/s-inc-type-25-25.png", w: 1600, h: 900 }
    },
    swaps: [
      { t: 0.0, state: "empty", fx: "cut", dur: 0 },
      { t: 2.20, state: "c1", fx: "cut", dur: 0 },
      { t: 2.55, state: "c2", fx: "cut", dur: 0 },
      { t: 2.90, state: "c3", fx: "cut", dur: 0 },
      { t: 3.25, state: "c4", fx: "cut", dur: 0 },
      { t: 5.30, state: "p1", fx: "cut", dur: 0 },
      { t: 5.65, state: "p2", fx: "cut", dur: 0 }
    ],
    cursor: [
      { t: 0.0, x: 1180, y: 680 },
      { t: 1.45, x: 573, y: 324, cp: [[-320, -90], [130, 160]] },     // field 1
      { t: 4.20, x: 573, y: 324 },                                     // typing 5000
      { t: 4.95, x: 824, y: 324, cp: [[80, 90], [-80, 90]] },          // field 2
      { t: 6.40, x: 824, y: 324 },                                     // typing 25
      { t: 7.60, x: 1016, y: 324, cp: [[60, -80], [-70, -80]] },       // ANSWER 6250
      { t: 10.0, x: 1016, y: 324 }
    ],
    camera: {
      follow: { mode: "cursor", stiffness: 42, damping: "soft", offset: { x: -110, y: 0 } },
      scaleTrack: [
        { t: 0.0, s: 1.05 },
        { t: 0.9, s: 1.05 },
        { t: 1.8, s: 1.4, ease: "ease-in-out-cubic" },
        { t: 7.4, s: 1.4 },
        { t: 8.4, s: 1.58, ease: "ease-in-out-cubic" }
      ]
    },
    events: [
      { kind: "click", t: 1.50, x: 573, y: 324 },
      { kind: "glow", t0: 1.55, t1: 4.4, rect: { x: 509, y: 303, w: 128, h: 42 } },
      { kind: "type", t0: 2.20, t1: 3.25, x: 540, y: 324, text: "5000", msPerChar: 350 },
      { kind: "click", t: 5.00, x: 824, y: 324 },
      { kind: "glow", t0: 5.05, t1: 6.6, rect: { x: 760, y: 303, w: 128, h: 42 } },
      { kind: "type", t0: 5.30, t1: 5.65, x: 800, y: 324, text: "25", msPerChar: 350 },
      { kind: "ring", t0: 7.7, t1: 9.9, rect: { x: 950, y: 296, w: 132, h: 52 } }
    ],
    fx: { letterbox: true, vignette: true, grain: true },
    overlays: [
      { kind: "chip", text: "Value Increase Calculator — form walkthrough", in: 0.2, out: 9.9 },
      { kind: "caption", text: "It greets you computing: 240 + 15% = 276.", in: 0.4, out: 1.8 },
      { kind: "caption", text: "Type your budget — it recalculates every keystroke.", in: 2.0, out: 4.4 },
      { kind: "caption", text: "The boost: 25%.", in: 4.9, out: 6.7 },
      { kind: "caption", text: "No Enter. No submit. 6,250 — live.", in: 7.6, out: 9.9, emphasis: true }
    ]
  },

  "2.4": {
    hyperframes: "1.0",
    name: "cj-2-4-fast-demo-reel",
    technique: "Cursor Journey / Fast Demo Reel",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/faqs/tip-calculation-calculator/",
      locale: "en-US",
      flow: "Rapid 4-hop reel: (1) click “Calculate My Tip” card → (2) Basic Percentage Calculator lands pre-filled 15% of $60 = $9 → (3) click the “Tip Calculation” question on the Interactive FAQs index → (4) the FAQ subpage answers live: $150 bill, 10% tip → $15. Each post-click DOM captured after full settle.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        afterClick: true, neverCaptureMidTransition: true
      }
    },
    duration: 6.2,
    states: {
      home:  { asset: "assets/s-home-top.png", w: 1600, h: 900 },
      basic: { asset: "assets/s-basic-tip-arrived.png", w: 1600, h: 900 },
      faqs:  { asset: "assets/s-faqs-tip-row.png", w: 1600, h: 900 },
      faq:   { asset: "assets/s-faq-tip.png", w: 1600, h: 900 }
    },
    swaps: [
      { t: 0.0, state: "home", fx: "cut", dur: 0 },
      { t: 1.45, state: "basic", fx: "whip", dur: 0.28 },
      { t: 3.05, state: "faqs", fx: "whip", dur: 0.28 },
      { t: 4.45, state: "faq", fx: "whip", dur: 0.28 }
    ],
    cursor: [
      { t: 0.0, x: 520, y: 260 },
      { t: 0.95, x: 1049, y: 634, cp: [[330, 60], [-120, -220]] },     // hop 1: tip card
      { t: 1.35, x: 1049, y: 634 },                                     // click 1
      { t: 1.60, x: 900, y: 380, jump: true },
      { t: 2.30, x: 971, y: 417, cp: [[60, 60], [-60, 30]] },           // hop 2: answer 9
      { t: 2.85, x: 971, y: 417 },                                      // click 2 (the result)
      { t: 3.20, x: 820, y: 520, jump: true },
      { t: 3.85, x: 801, y: 744, cp: [[-120, 90], [110, -80]] },        // hop 3: FAQ row
      { t: 4.25, x: 801, y: 744 },                                      // click 3
      { t: 4.60, x: 750, y: 350, jump: true },
      { t: 5.25, x: 700, y: 472, cp: [[-90, 40], [80, -60]] },          // hop 4: answer $15
      { t: 5.55, x: 700, y: 472 },                                      // click 4
      { t: 6.2, x: 700, y: 472 }
    ],
    camera: {
      follow: { mode: "cursor", stiffness: 110, damping: "tight" },
      scaleTrack: [
        { t: 0.0, s: 1.3 },
        { t: 0.8, s: 1.7, ease: "ease-out-quart" },
        { t: 6.2, s: 1.7 }
      ]
    },
    events: [
      { kind: "click", t: 1.35, x: 1049, y: 634 },
      { kind: "click", t: 2.85, x: 971, y: 417 },
      { kind: "click", t: 4.25, x: 801, y: 744 },
      { kind: "click", t: 5.55, x: 700, y: 472 },
      { kind: "ring", t0: 5.6, t1: 6.15, rect: { x: 656, y: 444, w: 90, h: 56 } }
    ],
    fx: { letterbox: true, vignette: true, grain: true, trail: true },
    overlays: [
      { kind: "chip", text: "Four hops. One answer machine.", in: 0.15, out: 6.1 },
      { kind: "caption", text: "Tip?", in: 0.3, out: 1.4 },
      { kind: "caption", text: "$9. Done.", in: 1.9, out: 2.95 },
      { kind: "caption", text: "Real questions…", in: 3.3, out: 4.35 },
      { kind: "caption", text: "…answered live. $15.", in: 4.8, out: 6.15 }
    ]
  },

  "2.5": {
    hyperframes: "1.0",
    name: "cj-2-5-hover-reveal-tour",
    technique: "Cursor Journey / Hover-Reveal Tour",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/?noredirect",
      locale: "en-US",
      flow: "Homepage Solution Cards. The cursor glides A→B→C and pauses; each hover reveal (violet glow, border, arrow) was captured only after the hover transition fully settled. Coupon → Tip → Sales Tax.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        hoverRevealSettled: true, neverCaptureMidTransition: true
      }
    },
    duration: 8.5,
    states: {
      base:   { asset: "assets/s-home-top.png", w: 1600, h: 900 },
      coupon: { asset: "assets/s-home-hover-coupon.png", w: 1600, h: 900 },
      tip:    { asset: "assets/s-home-hover-tip.png", w: 1600, h: 900 },
      tax:    { asset: "assets/s-home-hover-tax.png", w: 1600, h: 900 }
    },
    swaps: [
      { t: 0.0, state: "base", fx: "cut", dur: 0 },
      { t: 1.55, state: "coupon", fx: "fade", dur: 0.3 },
      { t: 3.75, state: "tip", fx: "fade", dur: 0.3 },
      { t: 5.95, state: "tax", fx: "fade", dur: 0.3 }
    ],
    cursor: [
      { t: 0.0, x: 800, y: 150 },
      { t: 1.55, x: 616, y: 430, cp: [[-260, 90], [120, -150]] },     // A: coupon card
      { t: 3.30, x: 616, y: 430 },                                     // hover pause
      { t: 3.75, x: 984, y: 588, cp: [[180, -60], [-40, -160]] },      // B: tip card
      { t: 5.50, x: 984, y: 588 },
      { t: 5.95, x: 616, y: 588, cp: [[-140, 120], [140, 120]] },      // C: sales-tax card
      { t: 7.70, x: 616, y: 588 },
      { t: 8.5, x: 640, y: 560 }
    ],
    camera: {
      follow: { mode: "cursor", stiffness: 60, damping: "critical" },
      scaleTrack: [
        { t: 0.0, s: 1.1 },
        { t: 1.3, s: 1.5, ease: "ease-in-out-cubic" },
        { t: 8.5, s: 1.5 }
      ]
    },
    events: [
      { kind: "ring", t0: 1.7, t1: 3.6, rect: { x: 436, y: 348, w: 360, h: 155 } },
      { kind: "ring", t0: 3.9, t1: 5.8, rect: { x: 804, y: 511, w: 360, h: 155 } },
      { kind: "ring", t0: 6.1, t1: 8.3, rect: { x: 436, y: 511, w: 360, h: 155 } }
    ],
    fx: { letterbox: true, vignette: true, grain: true },
    overlays: [
      { kind: "chip", text: "Homepage — hover the Solution Cards", in: 0.2, out: 8.4 },
      { kind: "caption", text: "Coupons.", in: 1.8, out: 3.5 },
      { kind: "caption", text: "Tips.", in: 4.0, out: 5.7 },
      { kind: "caption", text: "Sales tax.", in: 6.2, out: 7.6 },
      { kind: "caption", text: "Every card is a real-life answer.", in: 7.8, out: 8.45 }
    ]
  },

  "2.6": {
    hyperframes: "1.0",
    name: "cj-2-6-two-step-success-flow",
    technique: "Cursor Journey / Two-Step Success Flow",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/decreased-value-calculator/",
      locale: "en-US",
      flow: "Value Decrease Calculator ($100 − 20% = $80, via the Coupon card) → click “+ Save” → success: the calculation lands in the Saved panel with its full equation → click “Copy” → success: green “Copied!”. Each success frame captured after the post-click DOM fully settled.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        afterClick: true, successStateSettled: true,
        neverCaptureMidTransition: true
      }
    },
    duration: 8.0,
    states: {
      arrived: { asset: "assets/s-dec-arrived.png", w: 1600, h: 900 },
      saved:   { asset: "assets/s-dec-saved.png", w: 1600, h: 900 },
      copied:  { asset: "assets/s-dec-copied.png", w: 1600, h: 900 }
    },
    swaps: [
      { t: 0.0, state: "arrived", fx: "cut", dur: 0 },
      { t: 2.85, state: "saved", fx: "fade", dur: 0.35 },
      { t: 5.85, state: "copied", fx: "cut", dur: 0 }
    ],
    cursor: [
      { t: 0.0, x: 1019, y: 417 },
      { t: 0.9, x: 1019, y: 417 },
      { t: 1.9, x: 1018, y: 452, cp: [[40, 30], [40, -20]] },          // + Save
      { t: 2.75, x: 1018, y: 452 },                                     // click Save
      { t: 3.60, x: 800, y: 728, cp: [[-120, 140], [160, -60]] },       // down to the saved memo
      { t: 4.50, x: 800, y: 728 },
      { t: 5.40, x: 955, y: 452, cp: [[120, -160], [-60, 90]] },        // Copy
      { t: 5.80, x: 955, y: 452 },                                      // click Copy
      { t: 6.60, x: 1019, y: 417, cp: [[50, -30], [40, 40]] },          // rest on the answer
      { t: 8.0, x: 1019, y: 417 }
    ],
    camera: {
      follow: { mode: "cursor", stiffness: 60, damping: "critical", offset: { x: -130, y: 0 } },
      scaleTrack: [
        { t: 0.0, s: 1.25 },
        { t: 1.4, s: 1.5, ease: "ease-in-out-cubic" },
        { t: 8.0, s: 1.5 }
      ]
    },
    events: [
      { kind: "click", t: 2.75, x: 1018, y: 452 },
      { kind: "glow", t0: 3.3, t1: 5.2, rect: { x: 461, y: 688, w: 678, h: 66 } },
      { kind: "click", t: 5.80, x: 955, y: 452 },
      { kind: "ring", t0: 5.9, t1: 7.9, rect: { x: 1146, y: 436, w: 100, h: 34 } }
    ],
    fx: { letterbox: true, vignette: true, grain: true },
    overlays: [
      { kind: "chip", text: "Value Decrease — Save & Copy", in: 0.2, out: 7.9 },
      { kind: "caption", text: "$100 − 20% = $80. Keep it.", in: 0.4, out: 2.6 },
      { kind: "caption", text: "Saved — with the full equation.", in: 3.3, out: 5.4 },
      { kind: "caption", text: "Copied. Green means done.", in: 6.0, out: 7.9 }
    ]
  },

  "2.7": {
    hyperframes: "1.0",
    name: "cj-2-7-onboarding-path",
    technique: "Cursor Journey / Onboarding Path",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/increased-value-calculator/",
      locale: "en-US",
      flow: "3-step onboarding: STEP 1 — pick the “Calculate Total Price” Solution Card on the homepage → STEP 2 — the Value Increase Calculator lands pre-filled $100 + 8% = $108 → STEP 3 — click the “Budget Boost” practical use below the calculator: $5,000 + 25% = $6,250 fills itself. DOM stability re-verified between every step.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        afterClick: true, betweenStepsRecheck: true,
        neverCaptureMidTransition: true
      }
    },
    duration: 12.0,
    states: {
      home:   { asset: "assets/s-home-top.png", w: 1600, h: 900 },
      tax:    { asset: "assets/s-inc-tax-arrived.png", w: 1600, h: 900 },
      pu:     { asset: "assets/s-inc-pu.png", w: 1600, h: 900 },
      pinned: { asset: "assets/s-inc-pu-pinned.png", w: 1600, h: 900 },
      result: { asset: "assets/s-inc-pu-result.png", w: 1600, h: 900 }
    },
    swaps: [
      { t: 0.0, state: "home", fx: "cut", dur: 0 },
      { t: 3.05, state: "tax", fx: "zoom", dur: 0.6 },
      { t: 6.15, state: "pu", fx: "slide-up", dur: 0.7 },
      { t: 8.45, state: "pinned", fx: "fade", dur: 0.4 },
      { t: 9.85, state: "result", fx: "slide-down", dur: 0.7 }
    ],
    cursor: [
      { t: 0.0, x: 360, y: 210 },
      { t: 2.40, x: 681, y: 634, cp: [[260, 40], [-140, -200]] },      // STEP 1: tax card
      { t: 2.85, x: 681, y: 634 },                                      // click
      { t: 3.15, x: 730, y: 300, jump: true },
      { t: 4.30, x: 1016, y: 417, cp: [[160, 30], [-120, -70]] },       // STEP 2: $108
      { t: 5.60, x: 1016, y: 417 },
      { t: 6.25, x: 900, y: 560, jump: true },                          // scroll to practical uses
      { t: 7.30, x: 808, y: 450, cp: [[-120, 60], [110, 60]] },         // STEP 3: Budget Boost row
      { t: 8.35, x: 808, y: 450 },                                      // click
      { t: 9.40, x: 808, y: 448 },                                      // pinned
      { t: 9.95, x: 850, y: 560, jump: true },                          // back to the calculator
      { t: 11.0, x: 1016, y: 507, cp: [[90, -60], [-90, 60]] },         // $6,250
      { t: 12.0, x: 1016, y: 507 }
    ],
    camera: {
      follow: { mode: "cursor", stiffness: 60, damping: "critical", offset: { x: -110, y: 0 } },
      scaleTrack: [
        { t: 0.0, s: 1.0 },
        { t: 1.0, s: 1.0 },
        { t: 2.0, s: 1.5, ease: "ease-in-out-cubic" },
        { t: 5.9, s: 1.5 },
        { t: 6.6, s: 1.38, ease: "ease-in-out-sine" },
        { t: 10.4, s: 1.38 },
        { t: 11.4, s: 1.55, ease: "ease-in-out-cubic" }
      ]
    },
    events: [
      { kind: "step", t0: 0.5, t1: 3.0, text: "STEP 1 — Pick your moment", x: 360, y: 700 },
      { kind: "click", t: 2.85, x: 681, y: 634 },
      { kind: "step", t0: 3.6, t1: 6.1, text: "STEP 2 — Land pre-filled: $100 + 8% = $108", x: 360, y: 700 },
      { kind: "glow", t0: 4.4, t1: 5.9, rect: { x: 958, y: 401, w: 116, h: 32 } },
      { kind: "step", t0: 6.8, t1: 11.9, text: "STEP 3 — Try a practical use", x: 360, y: 700 },
      { kind: "ring", t0: 7.4, t1: 8.4, rect: { x: 468, y: 390, w: 680, h: 120 } },
      { kind: "click", t: 8.35, x: 808, y: 450 },
      { kind: "ring", t0: 10.9, t1: 11.9, rect: { x: 950, y: 479, w: 132, h: 48 } }
    ],
    fx: { letterbox: true, vignette: true, grain: true },
    overlays: [
      { kind: "chip", text: "Onboarding — three clicks to mastery", in: 0.2, out: 11.9 },
      { kind: "caption", text: "In-store shopping? Start with a card.", in: 0.5, out: 2.8 },
      { kind: "caption", text: "Sales tax, pre-filled: $100 + 8% = $108.", in: 3.7, out: 5.9 },
      { kind: "caption", text: "Practical uses live under every calculator.", in: 6.7, out: 8.3 },
      { kind: "caption", text: "$5,000 + 25% = $6,250. You're ready.", in: 10.1, out: 11.9 }
    ]
  }
};
