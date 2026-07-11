// DoF Fly-Through — 7 Hyperframes configs (versions 9.1–9.7) for justpercent.com (US).
// Single source of truth. `node export-configs.mjs` mirrors these into configs/*.json.
//
// Coordinate space: CSS pixels of the captured page (images are @2x).
// camera.path / focus.track keys: t = seconds, y = page Y under the camera /
// in focus. Holds are baked in as repeated keys. All captures were taken only
// after full DOM stabilization (see meta.captureGuard).

window.DOF_CONFIGS = {
  "9.1": {
    hyperframes: "1.0",
    name: "dof-9-1-classic-cinematic-fly",
    technique: "DoF Fly-Through / Classic Cinematic Fly",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/?noredirect",
      locale: "en-US",
      flow: "Homepage, full page — bottom-to-top camera fly.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        neverCaptureMidTransition: true
      }
    },
    duration: 4.0,
    plane: { asset: "assets/us-home-full.png", w: 1600, h: 5861 },
    scene: { tiltX: 75, perspective: 1400, lift: 40 },
    camera: {
      easing: "ease-in-out-cubic",
      path: [
        { t: 0.0, x: 0, y: 5450, z: -120 },
        { t: 4.0, x: 0, y: 420, z: -60 }
      ]
    },
    depth_of_field: true,
    focus: { mode: "camera-lock", lead: -40 },
    dof: { maxBlur: 16, falloff: 480, aperture: "f/2.0" },
    fx: { vignette: true, grain: true, letterbox: true },
    overlays: [
      { kind: "chip", text: "justpercent.com — Home", in: 0.2, out: 3.9 },
      { kind: "caption", text: "Every percentage answer. One page.", in: 0.5, out: 2.2 },
      { kind: "caption", text: "Tips, discounts, sales tax & more — free, instant.", in: 2.4, out: 3.9 }
    ]
  },

  "9.2": {
    hyperframes: "1.0",
    name: "dof-9-2-post-click-data-fly-over",
    technique: "DoF Fly-Through / Post-Click Data Fly-Over",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/decreased-value-calculator/",
      locale: "en-US",
      flow: "Homepage → click Solution Card 'Apply My Coupon' → Value Decrease Calculator arrives pre-filled ($100 − 20% = $80). Captured only after the post-click DOM fully settled.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        afterClick: true, neverCaptureMidTransition: true
      }
    },
    duration: 4.5,
    plane: { asset: "assets/us-decreased-value-after-card-click.png", w: 1600, h: 4610 },
    scene: { tiltX: 72, perspective: 1400, lift: 30 },
    camera: {
      easing: "ease-in-out-sine",
      path: [
        { t: 0.0, x: 0, y: 300, z: -80 },
        { t: 4.5, x: 0, y: 4150, z: -80 }
      ]
    },
    depth_of_field: true,
    focus: {
      mode: "track", easing: "ease-in-out-cubic",
      track: [
        { t: 0.0, y: 410 }, { t: 0.7, y: 410 },          // calculator card: 100 − 20% = 80
        { t: 1.3, y: 1100 }, { t: 1.9, y: 1100 },        // Practical Uses list
        { t: 2.5, y: 2250 }, { t: 3.1, y: 2250 },        // "What Is a Value Decrease?"
        { t: 3.6, y: 3250 }, { t: 4.0, y: 3250 },        // more percentage tools
        { t: 4.5, y: 4100 }                              // feature list
      ]
    },
    dof: { maxBlur: 12, falloff: 380, aperture: "f/2.8" },
    fx: { vignette: true, grain: true, letterbox: true },
    overlays: [
      { kind: "chip", text: "Home → “Apply My Coupon” → Value Decrease Calculator", in: 0.2, out: 4.4 },
      { kind: "caption", text: "Tap a Solution Card on the homepage…", in: 0.4, out: 1.9 },
      { kind: "caption", text: "…your numbers arrive ready: $100 − 20% = $80.", in: 2.1, out: 4.3 }
    ]
  },

  "9.3": {
    hyperframes: "1.0",
    name: "dof-9-3-slow-focus-rack",
    technique: "DoF Fly-Through / Slow Focus Rack",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/faqs/bill-splitting-calculator/",
      locale: "en-US",
      flow: "Interactive FAQ subpage: 'How much should each person pay when a bill is split by percentage?' Focus pulls across 4 regions: question → live inputs → answer → step-by-step math.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        neverCaptureMidTransition: true
      }
    },
    duration: 5.0,
    plane: { asset: "assets/us-faq-bill-splitting.png", w: 1600, h: 1055 },
    scene: { tiltX: 78, perspective: 1400, lift: 110 },
    camera: {
      easing: "ease-in-out-quart",
      path: [
        { t: 0.0, x: 0, y: 700, z: 300 },
        { t: 5.0, x: 0, y: 360, z: 380 }
      ]
    },
    depth_of_field: true,
    focus: {
      mode: "track", easing: "ease-in-out-cubic",
      track: [
        { t: 0.00, y: 170 }, { t: 0.80, y: 170 },   // the question headline
        { t: 1.25, y: 365 }, { t: 2.05, y: 365 },   // live inputs 60 / 40 / $250
        { t: 2.50, y: 520 }, { t: 3.30, y: 520 },   // Answer: you owe $150, roommate $100
        { t: 3.75, y: 735 }, { t: 5.00, y: 735 }    // Calculation Details (the formula)
      ]
    },
    dof: { maxBlur: 18, falloff: 210, aperture: "f/1.4" },
    fx: { vignette: true, grain: true, letterbox: true },
    overlays: [
      { kind: "chip", text: "Interactive FAQs → Splitting a bill by percentage", in: 0.2, out: 4.9 },
      { kind: "caption", text: "A real question.", in: 0.2, out: 1.1 },
      { kind: "caption", text: "Live inputs — 60 / 40 of a $250 bill.", in: 1.35, out: 2.4 },
      { kind: "caption", text: "Your answer: $150 and $100.", in: 2.6, out: 3.6 },
      { kind: "caption", text: "And the math, step by step.", in: 3.85, out: 4.9 }
    ]
  },

  "9.4": {
    hyperframes: "1.0",
    name: "dof-9-4-fast-trailer-sweep",
    technique: "DoF Fly-Through / Fast Trailer Sweep",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/increased-value-calculator/",
      locale: "en-US",
      flow: "Value Increase Calculator → clicked Practical Use 'Budget Boost' below the calculator → inputs fill themselves: $5,000 + 25% = $6,250. Diagonal sweep, focus snaps to the hero metric.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        afterClick: true, neverCaptureMidTransition: true
      }
    },
    duration: 2.2,
    plane: { asset: "assets/us-increased-value-practical-use.png", w: 1600, h: 4701 },
    scene: { tiltX: 70, perspective: 1400, lift: 30 },
    camera: {
      easing: "ease-out-quint",
      path: [
        { t: 0.0, x: -260, y: 2900, z: -160 },
        { t: 1.6, x: 20, y: 620, z: 0 },
        { t: 2.2, x: 0, y: 520, z: 30 }
      ]
    },
    depth_of_field: true,
    focus: {
      mode: "track", easing: "ease-out-expo",
      track: [
        { t: 0.0, y: 2900 },
        { t: 1.5, y: 900 },
        { t: 1.65, y: 500 }, { t: 2.2, y: 500 }     // hero metric: ANSWER $6,250
      ]
    },
    dof: { maxBlur: 14, falloff: 300, aperture: "f/2.8" },
    fx: { vignette: true, grain: true, letterbox: true, motionBlur: true },
    overlays: [
      { kind: "chip", text: "Value Increase → Practical Use: “Budget Boost”", in: 0.15, out: 2.15 },
      { kind: "caption", text: "+25% on a $5,000 budget?", in: 0.2, out: 1.35 },
      { kind: "caption", text: "$6,250. Instantly.", in: 1.55, out: 2.2, emphasis: true }
    ]
  },

  "9.5": {
    hyperframes: "1.0",
    name: "dof-9-5-bokeh-ambient-drift",
    technique: "DoF Fly-Through / Bokeh Ambient Drift",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/?noredirect",
      locale: "en-US",
      flow: "Homepage Search box: typed 'tip' — Practical Uses, related FAQs and suggested calculators appear in the dropdown. Dreamy ambient drift.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        neverCaptureMidTransition: true
      }
    },
    duration: 6.0,
    plane: { asset: "assets/us-home-search-tip.png", w: 1600, h: 900 },
    scene: { tiltX: 80, perspective: 1400, lift: 130 },
    camera: {
      easing: "linear",
      path: [
        { t: 0.0, x: 0, y: 640, z: 300 },
        { t: 6.0, x: 0, y: 340, z: 380 }
      ]
    },
    depth_of_field: true,
    focus: {
      mode: "track", easing: "ease-in-out-sine",
      track: [
        { t: 0.0, y: 216 }, { t: 1.6, y: 216 },     // the search box: "tip"
        { t: 3.2, y: 420 }, { t: 4.4, y: 420 },     // Practical Uses results
        { t: 6.0, y: 600 }                          // related FAQs / suggestions
      ]
    },
    dof: { maxBlur: 22, falloff: 140, aperture: "f/1.2" },
    fx: { vignette: true, grain: true, letterbox: true, bokeh: true, bloom: true },
    overlays: [
      { kind: "chip", text: "Home → Search", in: 0.3, out: 5.9 },
      { kind: "caption", text: "Type “tip”…", in: 0.6, out: 2.6 },
      { kind: "caption", text: "Practical uses, FAQs & calculators — before you finish typing.", in: 3.0, out: 5.8 }
    ]
  },

  "9.6": {
    hyperframes: "1.0",
    name: "dof-9-6-focus-handoff-chain",
    technique: "DoF Fly-Through / Focus Handoff Chain",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/?noredirect",
      locale: "en-US",
      flow: "Homepage Solution Cards. Gentle S-curve flight; focus hands off Coupon → Tip → Commission, each sharp ~1s.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        neverCaptureMidTransition: true
      }
    },
    duration: 5.0,
    plane: { asset: "assets/us-home-full.png", w: 1600, h: 5861 },
    scene: { tiltX: 74, perspective: 1400, lift: 40 },
    camera: {
      easing: "ease-in-out-sine",
      path: [                                        // gentle S-curve
        { t: 0.0, x: -150, y: 1150, z: -40 },
        { t: 1.7, x: 150, y: 800, z: -10 },
        { t: 3.4, x: -110, y: 500, z: 10 },
        { t: 5.0, x: 0, y: 320, z: 30 }
      ]
    },
    depth_of_field: true,
    focus: {
      mode: "track", easing: "ease-in-out-cubic",
      track: [
        { t: 0.00, y: 426 }, { t: 1.05, y: 426 },   // A — Coupon card
        { t: 1.55, y: 589 }, { t: 2.60, y: 589 },   // B — Tip card
        { t: 3.10, y: 752 }, { t: 4.15, y: 752 },   // C — Commission card
        { t: 5.00, y: 752 }
      ]
    },
    dof: { maxBlur: 13, falloff: 260, aperture: "f/2.0" },
    fx: { vignette: true, grain: true, letterbox: true },
    overlays: [
      { kind: "chip", text: "Homepage → Solution Cards", in: 0.2, out: 4.9 },
      { kind: "caption", text: "Coupons.", in: 0.25, out: 1.25 },
      { kind: "caption", text: "Tips.", in: 1.7, out: 2.7 },
      { kind: "caption", text: "Commission.", in: 3.2, out: 4.1 },
      { kind: "caption", text: "Every answer is one card away.", in: 4.25, out: 4.95 }
    ]
  },

  "9.7": {
    hyperframes: "1.0",
    name: "dof-9-7-vertical-timeline-fly",
    technique: "DoF Fly-Through / Vertical Timeline Fly",
    meta: {
      product: "Just Percent",
      sourceUrl: "https://justpercent.com/faqs/",
      locale: "en-US",
      flow: "Interactive FAQs index — a long vertical list of real-life questions. Bottom-to-top fly; the centered row stays in focus, rows above/below blur progressively.",
      captureGuard: {
        networkIdleMs: 500, fontsReady: true, imagesDecoded: true,
        noActiveTransitions: true, layoutShiftQuietMs: 500,
        asyncListLoaded: true, neverCaptureMidTransition: true
      }
    },
    duration: 5.5,
    plane: { asset: "assets/us-faqs-index.png", w: 1600, h: 13044 },
    scene: { tiltX: 76, perspective: 1400, lift: 40 },
    camera: {
      easing: "ease-in-out-sine",
      path: [
        { t: 0.0, x: 0, y: 12500, z: -100 },
        { t: 5.5, x: 0, y: 450, z: -40 }
      ]
    },
    depth_of_field: true,
    focus: { mode: "camera-lock", lead: 0 },
    dof: { maxBlur: 15, falloff: 320, aperture: "f/2.0" },
    fx: { vignette: true, grain: true, letterbox: true },
    overlays: [
      { kind: "chip", text: "justpercent.com/faqs — Interactive FAQs", in: 0.2, out: 5.4 },
      { kind: "caption", text: "Dozens of real-life questions…", in: 0.6, out: 2.6 },
      { kind: "caption", text: "…and every one is a live calculator.", in: 2.9, out: 5.3 }
    ]
  }
};
