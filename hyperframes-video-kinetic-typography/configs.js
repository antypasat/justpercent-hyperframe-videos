// Film 2 — Kinetic Typography & Font Bending — director config (source of truth).
// The player (kinetic-typography.html) is a pure function of the master clock;
// everything time-related lives here. Times in seconds, stage = 1080×1920.
window.F2 = {
  meta: {
    id: "2",
    technique: "KINETIC TYPOGRAPHY & FONT BENDING",
    detail: "Frankenstein Type · Beat-Driven Stretch · Flash Frames",
    duration: 30,
    fps: 30,
    stage: { w: 1080, h: 1920 },
    cssToStage: 2.5, // 432 CSS px viewport → 1080 stage px
    captureGuard:
      "network idle ≥500ms; fonts.ready; images decoded; no finite animations; CLS quiet ≥500ms; keystroke states: full stabilize BEFORE typing + anim-quiet guard, shot inside the <1s window before the app re-selects the input"
  },

  // 1 ─ hook: "MATH IS EVERYWHERE" — Frankenstein typography (0–3s)
  hook: {
    t1: 3.05, // hard cut into the strobe
    words: [
      { w: "MATH",  at: 0.12, font: "grotesk", size: 252, weight: 700,
        x: 540, y: 640,  rot: -4,  enter: "slam" },
      { w: "is",    at: 0.55, font: "georgia", size: 190, weight: 400,
        x: 350, y: 852,  rot: 3,   enter: "slide" },
      { w: "EVERY", at: 0.92, font: "mono",    size: 150, weight: 700,
        x: 600, y: 1010, rot: -2,  enter: "spin" },
      { w: "WHERE", at: 1.22, font: "plex",    size: 196, weight: 300,
        x: 540, y: 1220, rot: 1.5, enter: "rise", spaced: true }
    ],
    jitter: { amp: 3.2, rotAmp: 0.9 } // tiny deterministic wobble per word
  },

  // 2 ─ flash frames: 2–3 frame subliminal plates (~0.1s each), inverse pairs
  strobe: {
    start: 3.05,
    per: 0.1, // 3 frames @30fps
    words: ["TIPS", "TAX", "SALES", "RAISES", "DISCOUNTS",
            "TIPS", "TAX", "SALES", "RAISES", "DISCOUNTS"]
  },
  oneAnswer: { t0: 4.15, t1: 5.5, small: "ONE ANSWER:", big: "JUST PERCENT" },

  // 3 ─ typing sequence: giant letters punch into the real search box (5–13s)
  ui: { snapAt: 5.55 }, // search-focused plate snaps in
  letters: {
    font: 132, // px at scale 1 (landing size ≈ the input's own glyphs)
    from: { x: 540, y: 860, scale: 8 },
    ctrlY: 430, // quadratic-bezier control height (arc into the box)
    land: { xBase: 106, charAdv: 24, scale: 0.34 }, // offsets inside search box
    beats: [
      { ch: "t", fly0: 5.95,  land: 6.75,  plate: "t" },
      { ch: "i", fly0: 8.15,  land: 8.95,  plate: "ti" },
      { ch: "p", fly0: 10.35, land: 11.15, plate: "tip" }
    ]
  },
  shakeAmp: 10, // impact shake at each letter landing

  // 4 ─ select result: real pinned basic-calculator state (13.35–19.35s)
  selected: {
    t0: 13.35, t1: 19.35,
    punch: { from: 1.0, to: 1.2, ox: 540, oy: 700 } // slow zoom to the answer
  },
  flashes: [
    { at: 5.55,  peak: 0.22, len: 0.3 },
    { at: 6.75,  peak: 0.18, len: 0.25 },
    { at: 8.95,  peak: 0.18, len: 0.25 },
    { at: 11.15, peak: 0.18, len: 0.25 },
    { at: 13.35, peak: 0.3,  len: 0.35 },
    { at: 19.35, peak: 0.2,  len: 0.3 }
  ],

  // 5 ─ font-bending finale on the answer (19.35–25.3s)
  bend: {
    t0: 19.35, t1: 25.3,
    text: "$9.00",
    x: 540, y: 830, size: 300,
    beat0: 19.6, beatLen: 0.5, // implied 120 bpm
    weights: [300, 400, 600, 700], // stepped, one per beat
    pulse: 0.24,   // scaleY punch per beat (damped)
    skew: 8,       // deg, alternating hits
    echoes: [ { grow: 0.45, op: 0.30 }, { grow: 0.8, op: 0.16 } ]
  },

  // kinetic captions (white on translucent dark plates, both themes)
  captions: [
    { t0: 5.9,  t1: 7.95,
      words: [ { w: "JUST", at: 6.05 }, { w: "TYPE…", at: 6.3, hl: 1 } ] },
    { t0: 8.9,  t1: 12.9,
      words: [ { w: "WATCH", at: 9.0 }, { w: "IT", at: 9.2 },
               { w: "FIND", at: 9.4 }, { w: "THE", at: 9.6 },
               { w: "MATH.", at: 9.8, hl: 1 } ] },
    { t0: 13.9, t1: 19.05,
      words: [ { w: "15%", at: 14.0, hl: 1 }, { w: "OF", at: 14.3 },
               { w: "$60", at: 14.6, hl: 1 } ],
      line2: { w: "= $9 — instantly.", at: 16.4 } },
    { t0: 20.6, t1: 24.7,
      words: [ { w: "TYPE.", at: 20.8 }, { w: "TAP.", at: 21.3 },
               { w: "DONE.", at: 21.8, hl: 1 } ] }
  ],

  // 6 ─ endcard (same layout & copy as Film 1)
  endcard: { start: 25.4 },
  endCopy: {
    brand: "Just Percent",
    url: "justpercent.com",
    tagline: "Every percent problem — solved in seconds.",
    pills: ["Free", "Instant", "No sign-up"]
  }
};
