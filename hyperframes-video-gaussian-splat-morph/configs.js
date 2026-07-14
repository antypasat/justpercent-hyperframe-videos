// Film 6 — Gaussian Splatting & AI Morphing — director config (source of truth).
// The player (gaussian-splat-morph.html) is a pure function of the master clock.
// Times in seconds. Stage = 1080×1920 px; page coords = CSS px × 2.5.
//
// Three FROZEN MOMENTS (strip-sliced 2.5D fly-throughs of real full-page
// captures) chained by two HALLUCINATORY MORPHS (video-placeholder slots with
// a stepped CSS morph fallback beneath), then the impossible pull-back
// (three page slabs floating in the void) and the endcard.
window.F6 = (() => {
  const DUR = 35;

  return {
    meta: {
      id: "6",
      technique: "GAUSSIAN SPLATTING & AI MORPHING",
      detail: "Frozen-Time Fly-Through · Hallucinatory Morphs",
      duration: DUR,
      fps: 30,
      stage: { w: 1080, h: 1920 },
      cssToStage: 2.5,
      captureGuard:
        "network idle ≥500ms; fonts.ready; images decoded; no finite animations; CLS quiet ≥500ms; active element blurred before every frame"
    },

    beats: {
      s1End: 7.4,        // frozen moment #1 (homepage) — morph 1 covers from 7.0
      m1: { start: 7.0, end: 10.0 },
      s2Start: 9.6,      // frozen moment #2 (/increased-value-calculator/, pinned)
      s2End: 17.4,
      m2: { start: 17.0, end: 20.0 },
      s3Start: 19.6,     // frozen moment #3 (live FAQ 150/10→15)
      s3End: 27.5,
      pullStart: 26.8,   // impossible pull-back (three slabs)
      pullFull: 27.8,
      pullEnd: 31.4,
      endcardIn: 31.0,
      end: DUR
    },

    // strip-scene construction (stage px)
    strips: {
      h: 96,             // strip height
      overlap: 20,       // feathered overlap on both edges (mask gradient)
      baseDepth: -70,    // background relief
      waveAmp: 46,       // sin() relief amplitude
      heroDepth: 42,     // strips containing hero rects come toward camera
      heroJitter: 16,
      jitter: 14,        // deterministic per-strip depth jitter
      blurPerPx: 0.055,  // blur ∝ |depth − focusDepth|
      blurMax: 7,
      cullPad: 1100      // render strips within camY−pad … camY+1920+pad
    },

    // camera key paths per frozen moment (y = window top in page stage px)
    // rx = rotateX deg, sc = overscan scale, focus = page stage y in focus
    scenes: {
      home: {
        t0: 0.0, t1: 7.4,
        heroKeys: ["h1", "search"],           // + grid handled by wave
        cam: [
          { t: 0.0, y: -80, rx: 8.0, sc: 1.19, focus: 185 },
          { t: 2.2, y: 120, rx: 9.5, sc: 1.17, focus: 400 },
          { t: 5.0, y: 900, rx: 11.0, sc: 1.16, focus: 1150 },
          { t: 7.4, y: 1560, rx: 10.0, sc: 1.15, focus: 1900 }
        ]
      },
      inc: {
        t0: 9.6, t1: 17.4,
        heroKeys: ["h1", "original", "percent", "result", "pinned"],
        glow: { from: 14.2, to: 17.4, rectKey: "result" },
        cam: [
          { t: 9.6,  y: -60, rx: 9.0, sc: 1.18, focus: 263 },
          { t: 12.5, y: 350, rx: 10.5, sc: 1.16, focus: 1030 },
          { t: 15.0, y: 560, rx: 9.5, sc: 1.16, focus: 1290 },
          { t: 17.4, y: 640, rx: 8.5, sc: 1.15, focus: 1290 }
        ]
      },
      faq: {
        t0: 19.6, t1: 27.5,
        heroKeys: ["h1", "bill", "pct", "result"],
        glow: { from: 24.6, to: 27.2, rectKey: "result" },
        cam: [
          { t: 19.6, y: -40, rx: 8.0, sc: 1.18, focus: 185 },
          { t: 23.0, y: 180, rx: 9.0, sc: 1.16, focus: 712 },
          { t: 26.0, y: 330, rx: 9.5, sc: 1.16, focus: 1010 },
          { t: 27.5, y: 385, rx: 9.0, sc: 1.15, focus: 1010 }
        ]
      }
    },

    // hallucinatory morph fallback (always beneath the video slot)
    morphFx: {
      steps: 6,          // progress quantized — dreamlike AI stutter
      blurMax: 14,
      scaleFrom: 1.06,
      hueDeg: 6
    },

    // video placeholder clips (post-production drops files into assets/)
    clips: [
      { name: "morph-home-to-calc", start: 7.0, dur: 3.0 },
      { name: "morph-calc-to-faq", start: 17.0, dur: 3.0 }
    ],

    // impossible pull-back — three tilted page slabs in the void
    slabs: {
      scale: 0.24,
      gapX: 330,         // ± offset of side slabs
      sideRotY: 20,      // deg, side slabs face inward
      sideZ: -70,
      cy: 880,           // slab center y on stage
      orbitDeg: 3.0,     // slow container orbit ±
      orbitHz: 0.09
    },

    captions: [
      { t0: 0.8,  t1: 5.6,  big: "imagine your math… already done.", sub: "a frozen moment of justpercent.com" },
      { t0: 11.8, t1: 16.4, big: "a raise, frozen mid-air.",          sub: "$5,000 + 25% — filled in for you" },
      { t0: 21.4, t1: 26.2, big: "even the FAQ does the math.",       sub: "live answer: $15 tip on a $150 bill" },
      { t0: 27.6, t1: 30.6, big: "every moment, one site.",           sub: "" }
    ],

    endCopy: {
      brand: "Just Percent",
      url: "justpercent.com",
      tagline: "Every percent problem — solved in seconds.",
      pills: ["Free", "Instant", "No sign-up"]
    }
  };
})();
