// Hyperframes JSON configs — Technique 8 "Layer Explosion / Z-Axis Separation"
// justpercent.com (US locale). Source of truth for layer-explosion.html player;
// mirrored to configs/*.json by export-configs.mjs.
//
// Every source frame was captured by capture.mjs ONLY after full DOM
// stabilization (see captureGuard below) — never mid-transition.
//
// Scene layer geometry (viewport px @1600×900, boxes clamped to viewport)
// comes from assets/layers/<scene>.json manifests, baked in here so the
// player runs from file:// without fetch.

(() => {
  const CAPTURE_GUARD = {
    networkIdleMs: 500,
    documentFontsReady: true,
    imagesDecoded: true,
    noActiveAnimations: true,
    layoutShiftQuietMs: 500,
    postClickSettle: "wait for triggered animation + DOM mutation to finish before capture",
  };

  // scene -> { url, layers: { id: [x, y, w, h] } }  (bg = <scene>-bg.png, full viewport)
  const SCENES = {
    "home": {
      url: "https://justpercent.com/?noredirect",
      layers: { nav: [436, 0, 728, 61], heading: [436, 106, 728, 36], search: [461, 191, 678, 50] },
    },
    "home-picker": {
      url: "https://justpercent.com/?noredirect",
      layers: { nav: [436, 0, 728, 61], picker: [436, 183, 728, 624] },
    },
    "home-cards": {
      url: "https://justpercent.com/?noredirect",
      layers: {
        nav: [436, 0, 728, 61],
        card1: [436, 348, 360, 155], card2: [804, 348, 360, 155],
        card3: [436, 511, 360, 155], card4: [804, 511, 360, 155],
        card5: [436, 674, 360, 155], card6: [804, 674, 360, 155],
      },
    },
    "home-search": {
      url: "https://justpercent.com/?noredirect",
      layers: {
        nav: [436, 0, 728, 61], search: [461, 115, 678, 50], portal: [463, 193, 674, 395],
        row1: [471, 215, 658, 94], row2: [471, 311, 658, 94], row3: [471, 434, 658, 60],
      },
    },
    "home-scrolled": {
      url: "https://justpercent.com/?noredirect",
      layers: { nav: [436, 0, 728, 61], activecard: [436, 0, 728, 900] },
    },
    "calc": {
      url: "https://justpercent.com/decreased-value-calculator/",
      layers: { nav: [436, 0, 728, 61], heading: [517, 238, 610, 28], panel: [436, 203, 728, 412] },
    },
    "calc-pu": {
      url: "https://justpercent.com/increased-value-calculator/?noredirect",
      layers: {
        nav: [436, 0, 728, 61], panel: [436, 110, 728, 412],
        pu1: [468, 734, 680, 120], pu2: [468, 866, 680, 34],
      },
    },
    "calc-pu-open": {
      url: "https://justpercent.com/increased-value-calculator/?noredirect",
      layers: { nav: [436, 0, 728, 61], panel: [436, 110, 728, 590], "pu-open": [461, 223, 678, 162] },
    },
    "faqs": {
      url: "https://justpercent.com/faqs/?noredirect",
      layers: {
        nav: [436, 0, 728, 61], block1: [436, 114, 728, 188],
        block2: [436, 302, 728, 249], block3: [436, 583, 728, 317],
      },
    },
    "faq-ex": {
      url: "https://justpercent.com/faqs/tip-calculation-calculator/?noredirect",
      layers: { nav: [436, 0, 728, 61], heading: [436, 114, 728, 60], block2: [436, 246, 728, 535] },
    },
  };

  window.LE_SCENES = SCENES;
  window.LE_CONFIGS = {
    // ------------------------------------------------------------------ 8.1
    "8.1": {
      name: "le-8-1-classic-4-layer-explosion",
      technique: "Layer Explosion / Classic 4-Layer",
      story: "Homepage SolutionCards separate on Z; cursor clicks 'Apply My Coupon'.",
      duration: 9,
      captureGuard: CAPTURE_GUARD,
      shots: [{
        scene: "home-cards",
        perspective: 1200,
        tilt: { rotateX: 55, rotateZ: -45, intro: { start: 0.5, dur: 1.0, easing: "ease-in-out-cubic" } },
        explode: { start: 1.2, dur: 1.5, easing: "ease-out-back", stagger: 0 },
        layers: [
          { id: "bg", z: 0 },
          { id: "nav", z: 150 },
          { id: "card1", z: 300, highlight: true }, { id: "card2", z: 300 }, { id: "card3", z: 300 },
          { id: "card4", z: 300 }, { id: "card5", z: 300 }, { id: "card6", z: 300 },
        ],
        camera: { arcDeg: 15, start: 1.2, dur: 7.3, easing: "ease-in-out-sine" },
        dolly: { from: 1.0, to: 1.07 },
        cursor: {
          z: 340, // just above the card plane so the click lands visually on the card
          path: [{ t: 3.0, x: 1220, y: 800 }, { t: 4.6, x: 640, y: 440 }],
          clickAt: 5.1,
          easing: "ease-in-out-cubic",
        },
        shadow: 1,
      }],
      overlays: [
        { kind: "chip", text: "8.1 CLASSIC 4-LAYER · Z 0/150/300/450 · ease-out-back", in: 0.4, out: 8.6 },
        { kind: "caption", text: "Every card is a real calculator.", in: 2.2, out: 4.6 },
        { kind: "caption", text: "One click — coupon math, done.", in: 5.4, out: 8.4, emphasis: true },
      ],
    },

    // ------------------------------------------------------------------ 8.2
    "8.2": {
      name: "le-8-2-post-click-modal-explosion",
      technique: "Layer Explosion / Post-Click Modal",
      story: "Practical Use clicked below the Value Increase calculator: the pinned example (modal) leaps off the page with real numbers filled in ($5,000 + 25% → $6,250).",
      duration: 8,
      captureGuard: CAPTURE_GUARD,
      shots: [{
        scene: "calc-pu-open",
        perspective: 1200,
        tilt: { rotateX: 50, rotateZ: -38, intro: { start: 0.4, dur: 0.9, easing: "ease-in-out-cubic" } },
        explode: { start: 1.1, dur: 1.4, easing: "ease-out-elastic", stagger: 0 },
        layers: [
          { id: "bg", z: 0 },
          { id: "nav", z: 90 },
          { id: "panel", z: 180 },
          { id: "pu-open", z: 360, highlight: true },
        ],
        camera: { arcDeg: 20, start: 1.1, dur: 6.5, easing: "ease-in-out-sine" },
        dolly: { from: 1.0, to: 1.09 },
        shadow: 1.15,
      }],
      overlays: [
        { kind: "chip", text: "8.2 POST-CLICK MODAL · Z 0/180/360 · ease-out-elastic · 20° arc", in: 0.4, out: 7.6 },
        { kind: "caption", text: "Click a Practical Use — real numbers fill in.", in: 1.6, out: 4.4 },
        { kind: "caption", text: "$5,000 + 25% = $6,250", in: 4.8, out: 7.5, emphasis: true },
      ],
    },

    // ------------------------------------------------------------------ 8.3
    "8.3": {
      name: "le-8-3-slow-elastic-bloom",
      technique: "Layer Explosion / Slow Elastic Bloom",
      story: "The Value Decrease calculator (opened from the 'Apply My Coupon' card, prefilled 100 − 20% → 80) blooms into floating layers.",
      duration: 9,
      captureGuard: CAPTURE_GUARD,
      shots: [{
        scene: "calc",
        perspective: 1400,
        tilt: { rotateX: 60, rotateZ: -35, intro: { start: 0.5, dur: 1.1, easing: "ease-in-out-cubic" } },
        explode: { start: 1.4, dur: 2.0, easing: "ease-out-elastic", stagger: 0 },
        layers: [
          { id: "bg", z: 0 },
          { id: "panel", z: 200 },
          { id: "heading", z: 320 },
          { id: "nav", z: 420 },
        ],
        camera: { arcDeg: 15, start: 1.4, dur: 7.1, easing: "ease-in-out-sine" },
        dolly: { from: 1.0, to: 1.06 },
        shadow: 1.35, // increasing drop-shadow per elevated layer
      }],
      overlays: [
        { kind: "chip", text: "8.3 ELASTIC BLOOM · persp 1400 · X60°/Z-35° · Z 200/320/420 · 2.0s", in: 0.4, out: 8.6 },
        { kind: "caption", text: "Straight from the coupon card: 100 − 20% = 80.", in: 2.4, out: 5.4 },
        { kind: "caption", text: "Decimal-exact. Always.", in: 5.9, out: 8.4, emphasis: true },
      ],
    },

    // ------------------------------------------------------------------ 8.4
    "8.4": {
      name: "le-8-4-reverse-assembly-implosion",
      technique: "Layer Explosion / Reverse Assembly",
      story: "The Tip Calculation FAQ page starts exploded and assembles itself: layers collapse to Z=0 while the camera settles head-on.",
      duration: 8,
      captureGuard: { ...CAPTURE_GUARD, note: "final stable DOM captured first, layers derived from it" },
      shots: [{
        scene: "faq-ex",
        perspective: 1300,
        tilt: { rotateX: 55, rotateZ: -45, outro: { start: 0.8, dur: 1.8, easing: "ease-in-out-cubic" } },
        explode: { start: 0.8, dur: 1.8, easing: "ease-in-out-cubic", reverse: true },
        layers: [
          { id: "bg", z: 0 },
          { id: "block2", z: 160 },
          { id: "heading", z: 300 },
          { id: "nav", z: 430 },
        ],
        camera: { arcDeg: 12, start: 0, dur: 2.6, easing: "ease-in-out-sine", settle: true },
        dolly: { from: 1.05, to: 1.0 },
        shadow: 1,
      }],
      overlays: [
        { kind: "chip", text: "8.4 REVERSE ASSEMBLY · collapse → Z0 · ease-in-out-cubic · 1.8s", in: 0.4, out: 7.6 },
        { kind: "caption", text: "Interactive FAQs — built for real questions.", in: 3.2, out: 5.6 },
        { kind: "caption", text: "How much tip should I leave?", in: 5.9, out: 7.5, emphasis: true },
      ],
    },

    // ------------------------------------------------------------------ 8.5
    "8.5": {
      name: "le-8-5-deep-parallax-fly",
      technique: "Layer Explosion / Deep Parallax Fly",
      story: "The FAQ index (64 interactive FAQs) explodes into 5 layers up to Z=600 while the camera performs a wide 30° orbit.",
      duration: 9,
      captureGuard: CAPTURE_GUARD,
      shots: [{
        scene: "faqs",
        perspective: 900,
        tilt: { rotateX: 50, rotateZ: -40, intro: { start: 0.4, dur: 0.9, easing: "ease-in-out-cubic" } },
        explode: { start: 1.1, dur: 1.6, easing: "ease-out-quint", stagger: 0 },
        layers: [
          { id: "bg", z: 0, blurMax: 3 },
          { id: "block3", z: 150 },
          { id: "block2", z: 300 },
          { id: "block1", z: 450 },
          { id: "nav", z: 600 },
        ],
        camera: { arcDeg: 30, start: 1.1, dur: 7.4, easing: "ease-in-out-sine" },
        dolly: { from: 1.0, to: 1.1 },
        shadow: 1.2,
      }],
      overlays: [
        { kind: "chip", text: "8.5 DEEP PARALLAX · persp 900 · 5 layers → Z600 · 30° orbit", in: 0.4, out: 8.6 },
        { kind: "caption", text: "64 interactive FAQs. Change any number.", in: 2.4, out: 5.2 },
        { kind: "caption", text: "The answer updates instantly.", in: 5.7, out: 8.4, emphasis: true },
      ],
    },

    // ------------------------------------------------------------------ 8.6
    "8.6": {
      name: "le-8-6-staggered-cascade-explosion",
      technique: "Layer Explosion / Staggered Cascade",
      story: "Type 'tip' in the homepage search: results pop outward bottom-to-top with a 150ms stagger; then the page scrolls to the matched Tip calculator.",
      duration: 11,
      captureGuard: CAPTURE_GUARD,
      shots: [
        {
          scene: "home-search",
          endAt: 7.4,
          perspective: 1200,
          tilt: { rotateX: 52, rotateZ: -42, intro: { start: 0.4, dur: 0.9, easing: "ease-in-out-cubic" } },
          explode: { start: 1.2, dur: 0.9, easing: "ease-out-back", stagger: 0.15, order: "bottom-up" },
          layers: [
            { id: "bg", z: 0, blurMax: 4 }, // farthest layer blurred for focus
            { id: "search", z: 150 },
            { id: "portal", z: 260 },
            { id: "row3", z: 340 },
            { id: "row2", z: 400 },
            { id: "row1", z: 460, highlight: true },
          ],
          camera: { arcDeg: 14, start: 1.2, dur: 5.8, easing: "ease-in-out-sine" },
          dolly: { from: 1.0, to: 1.08 },
          shadow: 1.1,
        },
        {
          scene: "home-scrolled",
          at: 7.4,
          perspective: 1300,
          tilt: { rotateX: 18, rotateZ: -8, intro: { start: 7.5, dur: 0.8, easing: "ease-in-out-cubic" } },
          explode: { start: 7.8, dur: 1.0, easing: "ease-out-back", stagger: 0 },
          layers: [
            { id: "bg", z: 0 },
            { id: "activecard", z: 140, highlight: true },
          ],
          camera: { arcDeg: 6, start: 7.8, dur: 3.0, easing: "ease-in-out-sine" },
          dolly: { from: 1.0, to: 1.05 },
          shadow: 1,
        },
      ],
      overlays: [
        { kind: "chip", text: "8.6 STAGGERED CASCADE · 150ms stagger · bottom-up · ease-out-back", in: 0.4, out: 10.6 },
        { kind: "caption", text: "Search 'tip' — Practical Uses surface first.", in: 2.2, out: 5.2 },
        { kind: "caption", text: "A 15% tip on $60 — that's $9.", in: 5.5, out: 7.2, emphasis: true },
        { kind: "caption", text: "…and the page scrolls straight to the calculator.", in: 8.4, out: 10.5 },
      ],
    },

    // ------------------------------------------------------------------ 8.7
    "8.7": {
      name: "le-8-7-component-architecture-showcase",
      technique: "Layer Explosion / Component Architecture",
      story: "The Value Increase calculator page separates into labeled semantic layers: page, nav, calculator, practical uses.",
      duration: 10,
      captureGuard: CAPTURE_GUARD,
      shots: [{
        scene: "calc-pu",
        perspective: 1250,
        tilt: { rotateX: 55, rotateZ: -45, intro: { start: 0.5, dur: 1.0, easing: "ease-in-out-cubic" } },
        explode: { start: 1.3, dur: 1.5, easing: "ease-out-back", stagger: 0.08 },
        layers: [
          { id: "bg", z: 0, label: "PAGE" },
          { id: "nav", z: 120, label: "NAV" },
          { id: "panel", z: 240, label: "CALCULATOR" },
          { id: "pu1", z: 360, label: "PRACTICAL USES" },
          { id: "pu2", z: 360 },
        ],
        camera: { arcDeg: 10, start: 1.3, dur: 8.2, easing: "ease-in-out-sine", loop: { deg: 4, period: 6 } },
        dolly: { from: 1.0, to: 1.05 },
        shadow: 1.1,
        labels: true,
      }],
      overlays: [
        { kind: "chip", text: "8.7 ARCHITECTURE · semantic layers · Z 0/120/240/360 · rotateY loop", in: 0.4, out: 9.6 },
        { kind: "caption", text: "Calculator on top. Practical Uses one click below.", in: 2.6, out: 5.6 },
        { kind: "caption", text: "Anatomy of a percentage answer.", in: 6.1, out: 9.4, emphasis: true },
      ],
    },
  };
})();
