// Film 6 — Gaussian Splatting & AI Morphing — director config (source of truth).
// The player (gaussian-morph.html) is a pure function of the master clock;
// everything time-related lives here. Times in seconds, stage = 1080×1920.
//
// ONE CONTINUOUS CAMERA BREATH: the film has zero hard cuts. Scenes are clouds
// of ~14.4k gaussian splats (90×160 grid per plate, sampled by capture.mjs);
// scene A dissolves and re-condenses into scene B (index-matched morphs), the
// camera dollies THROUGH the frozen clouds, and every assembled moment
// crossfades to the crisp PNG plate so real UI text is always readable.
window.F6 = (() => {
  const DUR = 30;

  return {
    meta: {
      id: "6",
      technique: "GAUSSIAN SPLATTING & AI MORPHING",
      detail: "Splat Fly-Through · Hallucinatory Morphs · Frozen Time",
      duration: DUR,
      fps: 30,
      stage: { w: 1080, h: 1920 },
      cssToStage: 2.5, // 432 CSS px viewport → 1080 stage px
      captureGuard:
        "network idle ≥500ms; fonts.ready; images decoded; no finite animations; CLS quiet ≥500ms; post-click DOM settled before every frame"
    },

    // splat engine tuning
    splat: {
      fov: 900,          // perspective: s = fov / (fov + z − camZ)
      baseR: 9,          // sprite radius at s = 1 (cell is 12 px)
      alpha: 0.92,
      cullDenom: 60,     // points closer than this to the camera plane vanish
      // depth model: z = lerp(zNear, zFar, 1 − lum) + jitter — bright UI floats
      // closer to the camera, seeded jitter makes surfaces volumetric
      zNear: -130,
      zFar: 210,
      zJitter: 70
    },

    // cloud choreography — one entry active at any t (segments touch exactly).
    // modes: intro | condense | held | morph | endcard
    // crisp: [fadeInStart, fadeInEnd] window of the readable PNG plate; the
    // plate stays up until 0.4 s into the following morph.
    segments: [
      { t0: 0.0,  t1: 2.5,  mode: "intro" },
      { t0: 2.5,  t1: 5.5,  mode: "condense", scene: "home" },
      { t0: 5.5,  t1: 7.4,  mode: "held", scene: "home", crisp: [5.5, 6.2] },
      { t0: 7.4,  t1: 9.5,  mode: "morph", a: "home", b: "home-grid", dolly: true },
      { t0: 9.5,  t1: 10.8, mode: "held", scene: "home-grid", crisp: [9.5, 10.2] },
      { t0: 10.8, t1: 13.0, mode: "morph", a: "home-grid", b: "calc", lift: "card" },
      { t0: 13.0, t1: 14.4, mode: "held", scene: "calc", crisp: [13.0, 13.7] },
      { t0: 14.4, t1: 15.4, mode: "morph", a: "calc", b: "pu", dolly: true },
      { t0: 15.4, t1: 16.4, mode: "held", scene: "pu", crisp: [15.4, 16.0] },
      { t0: 16.4, t1: 17.6, mode: "morph", a: "pu", b: "pu-pinned", swirl: true },
      { t0: 17.6, t1: 19.2, mode: "held", scene: "pu-pinned", crisp: [17.6, 18.2] },
      { t0: 19.2, t1: 22.6, mode: "morph", a: "pu-pinned", b: "faq", glyph: true },
      { t0: 22.6, t1: 25.0, mode: "held", scene: "faq", crisp: [22.6, 23.3] },
      { t0: 25.0, t1: 30.0, mode: "endcard", from: "faq" }
    ],

    // scripted camera path (stage-px pan, z in splat depth units); the player
    // eases smoothly between keyframes — slow, luxurious, drone-like
    camera: [
      { t: 0.0,  x: 0,   y: 0,    z: 0 },
      { t: 2.5,  x: 0,   y: -120, z: 420 },  // inside the forming cloud
      { t: 4.2,  x: 20,  y: -40,  z: 160 },  // flying between the dots
      { t: 5.5,  x: 0,   y: 0,    z: -20 },  // settled behind the plate
      { t: 7.4,  x: 0,   y: 0,    z: 22 },   // slow dolly-in on crisp home
      { t: 9.5,  x: 0,   y: 26,   z: -14 },
      { t: 10.8, x: 0,   y: 26,   z: 24 },
      { t: 13.0, x: -14, y: 0,    z: -24 },
      { t: 14.4, x: 0,   y: 0,    z: 16 },
      { t: 15.4, x: 0,   y: -10,  z: -12 },
      { t: 16.4, x: 0,   y: 0,    z: 2 },
      { t: 17.6, x: 10,  y: 0,    z: 30 },
      { t: 19.2, x: 0,   y: 0,    z: 62 },
      { t: 21.0, x: 0,   y: 0,    z: 85 },   // gentle push into the hallucination
      { t: 22.6, x: 0,   y: 0,    z: -20 },
      { t: 25.0, x: 0,   y: 0,    z: 8 },
      { t: 30.0, x: 0,   y: 0,    z: -46 }
    ],

    // per-morph feel
    morphs: {
      staggerSpread: 0.6,     // 0–0.6 s per-point offsets inside each morph
      scatter: 240,           // px of mid-morph curl drift
      swirlTurns: 1.4,        // pu → pinned swirl around the result field
      liftZ: -220,            // card mini-cloud pulls this much closer
      glyph: {                // the "%" hallucination inside the faq morph
        window: [0.32, 0.68], // fraction of the morph spent as the glyph
        fontPx: 1150,
        cx: 540, cy: 930,
        tint: 0.85            // how far colors bend into the brand gradient
      }
    },

    intro: {
      card: { cx: 540, cy: 850, w: 560, h: 720, br: 40 },
      bobPx: 8,
      dissolve: [2.15, 2.8],  // card fades/blurs away while splats take over
      leak: { count: 900, start: 0.5, reach: 260 } // splats leaking from edges
    },

    // result-field crop punched forward in z (pinned hold)
    resultPunch: { t0: 17.8, t1: 19.2, scale: 1.35, inDur: 0.35 },

    endcard: {
      urlPill: { cx: 540, cy: 1122, w: 590, h: 82, br: 41, font: 44 },
      markY: 620, brandY: 760, tagY: 1262, pillsY: 1372,
      collapse: [25.0, 26.6],   // cloud spirals down / fades
      stagger: 25.3,            // endcard elements begin staggering in
      orbit: {                  // the last splats circling the URL pill
        every: 24,              // keep 1 of every 24 points as an orbiter
        rx: 380, ry: 126,
        turns: 2.2,
        freeze: 29.5            // fully frozen by here — heartbeat still
      }
    },

    // video placeholder clip (assets/product-still.mp4) — intended post
    // content: slow-mo lifestyle shot, e.g. a receipt on a table
    clip: { name: "product-still", start: 0.0, dur: 2.5 },

    captions: [
      { t0: 4.6,  t1: 7.2,  big: "every percent tool.", sub: "one frozen world." },
      { t0: 10.5, t1: 12.9, big: "tap a card…", sub: "" },
      { t0: 15.8, t1: 18.9, big: "…or a real-life example.", sub: "numbers appear before doubts do." },
      { t0: 21.8, t1: 24.4, big: "64 answers, frozen mid-air.", sub: "" }
    ],

    endCopy: {
      brand: "Just Percent",
      url: "justpercent.com",
      tagline: "Every percent problem — solved in seconds.",
      pills: ["Free", "Instant", "No sign-up"]
    }
  };
})();
