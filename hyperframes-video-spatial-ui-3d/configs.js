// Film 1 — Spatial UI & 3D Screencasting — director config (source of truth).
// The player (spatial-ui-3d.html) is a pure function of the master clock;
// everything time-related lives here. Times in seconds, stage = 1080×1920.
window.F1 = {
  meta: {
    id: "1",
    technique: "SPATIAL UI & 3D SCREENCASTING",
    detail: "Layer Peeling · Clay Cursor · Glassmorphism · Camera Shake",
    duration: 32,
    fps: 30,
    stage: { w: 1080, h: 1920 },
    cssToStage: 2.5, // 432 CSS px viewport → 1080 stage px
    captureGuard:
      "network idle ≥500ms; fonts.ready; images decoded; no finite animations; CLS quiet ≥500ms; post-click DOM settled before every frame"
  },

  // deterministic camera pose keyframes (eased per segment)
  cam: [
    { t: 0.0,  x: 0,   y: 210,  s: 1.32, rx: 0,  ry: 0,   e: "io" },
    { t: 2.2,  x: 0,   y: 30,   s: 1.06, rx: 6,  ry: -10, e: "io" },
    { t: 4.6,  x: -30, y: -10,  s: 0.99, rx: 9,  ry: 5,   e: "io" },
    { t: 7.0,  x: 20,  y: 0,    s: 1.0,  rx: 8,  ry: 12,  e: "io" },
    { t: 9.0,  x: 0,   y: 165,  s: 1.24, rx: 7,  ry: 6,   e: "io" },
    { t: 10.1, x: 0,   y: 170,  s: 1.28, rx: 6,  ry: 4,   e: "o"  },
    { t: 11.2, x: 0,   y: 150,  s: 1.26, rx: 5,  ry: 2,   e: "io" },
    { t: 13.0, x: 0,   y: 40,   s: 1.04, rx: 4,  ry: -7,  e: "io" },
    { t: 16.5, x: -20, y: 90,   s: 1.1,  rx: 7,  ry: 6,   e: "io" },
    { t: 19.6, x: 0,   y: -60,  s: 1.3,  rx: 5,  ry: -4,  e: "io" },
    { t: 24.0, x: 0,   y: -40,  s: 1.26, rx: 4,  ry: 3,   e: "io" },
    { t: 27.5, x: 0,   y: 0,    s: 1.0,  rx: 0,  ry: 0,   e: "io" },
    { t: 32.0, x: 0,   y: 0,    s: 1.04, rx: 0,  ry: 0,   e: "l"  }
  ],

  // Layer Peel — home page (keys match geometry.json home.layers)
  peel: {
    start: 2.6,
    stagger: 0.16,
    rise: 1.15, // seconds per layer rise
    depths: {
      h1: 80, search: 200, toggle: 120,
      card0: 220, card1: 150, card2: 115, card3: 85
    },
    order: ["h1", "search", "toggle", "card0", "card1", "card2", "card3"],
    bob: { amp: 6, speed: 0.7 } // gentle float once peeled
  },

  // focus on the coupon card while the cursor approaches
  focus: { start: 7.0, end: 11.0, key: "card0", dimOthers: 0.4, blurOthers: 2.5 },

  // clay cursor + slam
  cursor: {
    enter: 8.2, impact: 10.1, leave: 11.0,
    from: { x: 1350, y: 2150 }, // off-stage bottom-right
    ctrl1: { x: 1120, y: 1500 },
    ctrl2: { x: 560,  y: 1080 },
    size: 230
  },
  shake: { at: 10.1, amp: 16, decay: 5.5 },
  flash: [{ at: 10.14, peak: 0.55, len: 0.35 }, { at: 12.0, peak: 0.22, len: 0.5 }],

  // home → dec transition (group z fly-through)
  swap: { start: 11.2, end: 13.0 },

  // glass panel float on the calculator page
  glass: {
    start: 14.2,
    plateBlur: 7,
    panels: [
      { key: "originalClip", delay: 0.0, z: 130 },
      { key: "percentClip",  delay: 0.22, z: 130 },
      { key: "hintClip",     delay: 0.45, z: 70 },
      { key: "resultClip",   delay: 0.62, z: 185 }
    ],
    rise: 1.3,
    resultPop: { at: 19.6, scale: 0.18 }
  },

  reassemble: { start: 25.8, end: 27.6 },
  endcard: { start: 27.8 },

  captions: [
    { t0: 0.45, t1: 2.15,  big: "PERCENT MATH?",           sub: "handled." },
    { t0: 3.1,  t1: 6.6,   big: "ONE HOME.",               sub: "every percent problem on it." },
    { t0: 7.5,  t1: 10.0,  big: "GOT A COUPON?",           sub: "tap the card." },
    { t0: 13.4, t1: 16.2,  big: "THE CALCULATOR ARRIVES",  sub: "already filled in." },
    { t0: 16.6, t1: 19.4,  big: "$100 • 20% OFF",     sub: "watch the panels do the work." },
    { t0: 19.9, t1: 24.6,  big: "YOU PAY $80.",            sub: "no formulas. no mental math." },
    { t0: 25.9, t1: 27.6,  big: "THAT EASY.",              sub: "" }
  ],

  endCopy: {
    brand: "Just Percent",
    url: "justpercent.com",
    tagline: "Every percent problem — solved in seconds.",
    pills: ["Free", "Instant", "No sign-up"]
  }
};
