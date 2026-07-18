// Film 4 — Hyper-Mixed Media — director config (source of truth).
// Polished UI colliding with paper, markers, tape, stop-motion cutouts and a
// datamosh finale. All effects are pure f(t): stop-motion = time quantized to
// 8 fps for cutout elements; glitch offsets seeded by frame index; marker
// strokes drawn via stroke-dashoffset as a function of t.
window.F4 = (() => {
  const DUR = 35;

  return {
    meta: {
      id: "4",
      technique: "HYPER-MIXED MEDIA",
      detail: "Digital Scrapbook · Stop-Motion Cutouts · Glitch/Datamosh",
      duration: DUR,
      fps: 30,
      stage: { w: 1080, h: 1920 },
      cssToStage: 2.5,
      captureGuard:
        "network idle ≥500ms; fonts.ready; images decoded; no finite animations; CLS quiet ≥500ms"
    },

    stopFps: 8,          // cutout elements move on 8 fps steps
    paper: {
      warm: "#efe3c8", warmDark: "#2a2119",
      marker: "#e0342b", ink: "#221c14"
    },

    beats: {
      // 1 · live-action placeholder
      openEnd: 3.0,
      // 2 · photocopied /faqs/ scan
      faqsIn: 3.0, faqsBillAt: 5.2, circleAt: 6.4, faqsEnd: 10.0,
      // 3 · bill-splitting FAQ page
      billIn: 10.0, billScrollAt: 12.6, billAnswerAt: 14.2, billEnd: 17.0,
      // 4 · decreased-value flow
      decPuIn: 17.0, arrowAt: 18.2, pressAt: 20.0, pinnedIn: 20.6,
      savedScribbleAt: 22.4, decEnd: 26.0,
      // 5 · datamosh → clean answer
      moshIn: 26.0, moshPeak: 27.6, resolveAt: 28.8, cleanAt: 29.6,
      // 6 · endcard
      endcardIn: 30.2, glitchBlinkAt: 30.4, end: DUR
    },

    clips: [
      { name: "opening-live-action", start: 0.0, dur: 3.0, kind: "full" },
      { name: "hands-cutout", start: 10.0, dur: 7.0, kind: "corner" }
    ],

    mosh: {
      frames: 12,          // active mosh window ≈ moshIn..resolveAt
      rgbMax: 26,          // px channel split
      blocks: 5,           // displaced horizontal slices
      blockMax: 46,        // px slice offset
      scanOpacity: 0.22
    },

    captions: [
      { t0: 0.5,  t1: 2.7,  kind: "marker", text: "ugh… math again??" },
      { t0: 3.8,  t1: 6.2,  kind: "plate",  big: "64 real-life FAQ calculators", sub: "found: bill splitting" },
      { t0: 10.8, t1: 13.2, kind: "cutout", text: "REAL FAQ" },
      { t0: 13.6, t1: 16.4, kind: "cutout2", text: "NO APP NEEDED" },
      { t0: 14.4, t1: 16.8, kind: "plate",  big: "60/40 split of $250", sub: "you owe $150 — they owe $100" },
      { t0: 18.0, t1: 19.8, kind: "plate",  big: "Sale Discount — one tap", sub: "" },
      { t0: 22.4, t1: 25.6, kind: "marker2", text: "$90 SAVED" },
      { t0: 28.6, t1: 31.6, kind: "plate",  big: "from paper mess → instant answer", sub: "$300 − 30% = $210" }
    ],

    endCopy: {
      brand: "Just Percent",
      url: "justpercent.com",
      tagline: "Every percent problem — solved in seconds.",
      pills: ["Free", "Instant", "No sign-up"]
    }
  };
})();
