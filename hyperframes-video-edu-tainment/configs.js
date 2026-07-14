// Film 7 — Edu-Tainment "SaaS Brain Rot" — director config (source of truth).
// The player (edu-tainment.html) is a pure function of the master clock.
// Times in seconds. Stage 1080×1920; capture CSS px × 2.5 = stage px.
//
// First-person gamer tutorial: persistent circular facecam placeholder,
// 200% zoom punches with 2-frame shakes, FPV sweep with a per-keystroke
// arcade combo counter, a wrong-way gag (red ✕ freeze-frame), XP badge,
// rapid recap montage, endcard.
window.F7 = (() => {
  const DUR = 40;

  return {
    meta: {
      id: "7",
      technique: "EDU-TAINMENT (SaaS BRAIN ROT)",
      detail: "First-Person Tutorial · Zoom Punches · FPV UI Fly-Over",
      duration: DUR,
      fps: 30,
      stage: { w: 1080, h: 1920 },
      cssToStage: 2.5,
      captureGuard:
        "network idle ≥500ms; fonts.ready; images decoded; no finite animations; CLS quiet ≥500ms; active element blurred"
    },

    // camera center for plates (punch targets get centered here)
    center: { x: 540, y: 880 },

    facecam: {
      d: 300, x: 60, yFromBottom: 60,   // Ø and bottom-left margins
      outStart: 36.5, outEnd: 37.6      // slides down & away
    },

    // master beat sheet
    beats: {
      // 1 · cold open on the homepage
      openPunch1: 0.9,  openPunch2: 1.9,  openEnd: 3.0,
      // 2 · FPV sweep + per-keystroke combo
      sweepEnd: 9.0,
      keyT: 5.0, keyTi: 6.3, keyTip: 7.6,
      // 3 · wrong-way gag
      gagFreeze: 10.8, gagHold: 11.8, gagSnap: 12.4, rowPress: 13.2,
      selectedIn: 13.6, gagEnd: 15.2,
      // 4 · zoom punches on the pinned calculator, then the raise flow
      punch15: 15.6, punch60: 16.8, punch9: 18.0, xpIn: 18.6, xpOut: 20.4,
      incIn: 20.4, punch6250: 21.4, incEnd: 23.2,
      // 5 · FAQ flex
      faqIn: 23.2, faqPunch: 26.4, faqEnd: 31.0,
      // 6 · recap montage (4 × ~1.1s)
      recap: [31.0, 32.1, 33.2, 34.3], recapEnd: 35.4,
      // 7 · endcard
      endcardIn: 36.0, end: DUR
    },

    // zoom punch mechanics
    punch: {
      scale: 2.0, overshoot: 1.06, settleFrames: 6, cutFrames: 2,
      rot: 0.6, shakePx: 7, ringDur: 0.5
    },

    // FPV sweep pose keys over the home plate (s, cx, cy in stage px)
    sweep: [
      { t: 3.0, s: 1.30, cx: 540, cy: 620, rz: -2.0 },
      { t: 4.6, s: 1.42, cx: 420, cy: 980, rz: 1.6 },
      { t: 6.0, s: 1.36, cx: 660, cy: 1500, rz: -1.4 },
      { t: 7.4, s: 1.45, cx: 540, cy: 700, rz: 1.8 },
      { t: 9.0, s: 1.25, cx: 540, cy: 640, rz: 0.0 }
    ],

    // wrong-way gag cursor path (stage coords on the home-cards plate)
    gag: {
      cursorFrom: { x: 850, y: 1750 },
      // target = gag.totalPrice.cta center (from geometry, per theme)
      vignette: "rgba(255, 30, 30, .28)",
      xColor: "#ff2e2e"
    },

    combo: { color: "#b6ff3d", x: 940, y: 300 },

    xp: {
      text: "+ TIP MASTER unlocked",
      gold: "#ffc63d", y: 1560
    },

    captions: [
      { t0: 0.4,  t1: 2.8,  big: "bro this site does your math FOR you", sub: "" },
      { t0: 3.4,  t1: 6.0,  big: "type. literally 3 letters.", sub: "" },
      { t0: 7.8,  t1: 9.6,  big: "it already knows.", sub: "" },
      { t0: 10.9, t1: 12.2, big: "nope. not that one.", sub: "", style: "alert" },
      { t0: 13.8, t1: 15.4, big: "THIS one. it fills itself.", sub: "" },
      { t0: 18.4, t1: 20.2, big: "15% of $60. nine bucks. gg.", sub: "" },
      { t0: 21.6, t1: 23.0, big: "raise math? same site. two taps.", sub: "" },
      { t0: 24.2, t1: 26.2, big: "bro the FAQ page IS a calculator", sub: "" },
      { t0: 26.8, t1: 29.6, big: "free real estate.", sub: "" },
      { t0: 31.15, t1: 32.0, big: "search.", sub: "" },
      { t0: 32.25, t1: 33.1, big: "tap.", sub: "" },
      { t0: 33.35, t1: 34.2, big: "done.", sub: "" },
      { t0: 34.45, t1: 35.3, big: "gg.", sub: "" },
      { t0: 37.0, t1: 39.6, big: "go be lazy: justpercent.com", sub: "", style: "low" }
    ],

    endCopy: {
      brand: "Just Percent",
      url: "justpercent.com",
      tagline: "Every percent problem — solved in seconds.",
      pills: ["Free", "Instant", "No sign-up"]
    }
  };
})();
