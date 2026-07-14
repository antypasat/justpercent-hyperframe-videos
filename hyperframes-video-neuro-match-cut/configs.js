// Film 5 — Neuro-Editing & Match-Cutting — director config (source of truth).
// The player (neuro-match-cut.html) is a pure function of the master clock;
// everything time-related lives here. Times in seconds, stage = 1080×1920.
//
// ZOOM INFINITO: a single wrapper zoom Z(t) = 1.22^(t/30) runs strictly
// monotonically through the whole film. Scene poses are authored in wrapper
// coordinates; where an exact ON-SCREEN size is contractual (the Ø640 loop
// circle at t=0 and t=30) the player divides by Z(t) per frame.
window.F5 = (() => {
  const DUR = 30;
  const ZBASE = 1.22;
  const Zof = (t) => Math.pow(ZBASE, t / DUR); // strictly monotonic zoom

  return {
    meta: {
      id: "5",
      technique: "NEURO-EDITING & MATCH-CUTTING",
      detail: "Match Cuts · Zoom Infinito · Seamless Loop",
      duration: DUR,
      fps: 30,
      stage: { w: 1080, h: 1920 },
      cssToStage: 2.5, // 432 CSS px viewport → 1080 stage px
      captureGuard:
        "network idle ≥500ms; fonts.ready; images decoded; no finite animations; CLS quiet ≥500ms; post-click DOM settled before every frame"
    },

    zoom: { base: ZBASE, Zof },

    // anchor point: the zoom-invariant stage center — the eye never moves
    anchor: { x: 540, y: 960 },

    // master beat sheet (all cuts land exactly on these times)
    beats: {
      openEnd: 2.0,        // CUT #1  circle → theme toggle
      togglePullA: 3.3,    // hold circle, ring of homepage appears
      togglePullEnd: 5.3,  // homepage fitted
      ctaPushEnd: 6.0,     // CUT #2a → CTA pill crop, centered
      ctaHoldEnd: 7.1,     // CUT #2b → hint banner crop, same anchor
      hintHoldEnd: 8.3,    // dec reveal begins
      decRevealEnd: 10.4,  // dec page fitted (100 − 20% = 80)
      resultPushEnd: 11.4, // CUT #3a → result "80" crop, centered
      resultHoldEnd: 12.4, // panel starts rounding into a circle
      resultCircleEnd: 13.1, // CUT #3b → round FAQ icon, same circle
      faqIconHoldEnd: 13.9,  // faq reveal begins
      faqRevealEnd: 16.2,    // FAQ hub fitted
      faqPushEnd: 17.1,      // CUT #4 → "%" glyph circle (micro-cuts start)
      glyphGrown: 18.2,      // glyph circle finishes its takeover growth
      glyphHoldEnd: 19.6,    // circle starts stretching into the search pill
      pillMorphEnd: 20.5,    // search pill fully on
      pillHoldEnd: 23.2,     // finale begins
      urlMorphEnd: 24.6,     // white justpercent.com pill in endcard slot
      endcardIn: 24.05,      // endcard elements stagger in
      endcardOutStart: 28.9, // non-pill endcard elements fade
      loopStart: 29.1,       // pill shrinks back into the opening circle
      end: 30.0
    },

    // opening / closing circle — Ø640 ON SCREEN at t=0 and t=30 (loop contract)
    loopCircle: { screenDiameter: 640 },

    // scene pose intents (wrapper coords unless noted; the player builds
    // poses from geometry.js anchors — see poseFromAnchor in the player)
    scenes: {
      // S2 home: circle Ø640/Z(2) → pull back → fit → push into CTA
      home: {
        anchorKey: ["home", "toggleClip"],   // plate rect of the toggle crop
        ctaKey: ["home", "ctaClip"],
        holdCircle: 631.6,     // 640 / Z(2.0) — wrapper Ø at the cut
        ringGrow: 760,         // window Ø while holding (context ring appears)
        pullScaleMid: 4.2,     // plate wrapper-scale at togglePullA
        fitOnScreen: 0.99,     // on-screen plate scale when fitted (t=5.3)
        ctaScreenW: 812        // CTA pill on-screen width at the 6.0 cut
      },
      // S3 CTA pill → hint banner → dec reveal → push into result
      dec: {
        hintKey: ["dec", "hintClip"],
        resultKey: ["dec", "resultClip"],
        ctaW: 780,             // wrapper width of the centered CTA crop
        ctaGrow: 806,          //   … creeps to this by 7.1 (zoom feel)
        hintW: 850,            // wrapper width of the centered banner crop
        hintGrow: 872,
        fitOnScreen: 0.99,     // dec plate fitted at 10.4
        resultW: 620           // wrapper width of the centered result crop
      },
      // S4 result "80" → circle → FAQ icon → faq reveal → push toward icon
      faq: {
        iconKey: ["faq", "iconClip"],
        resultCircle: 430,     // Ø the result panel rounds into
        iconCircle: 430,       // Ø of the FAQ icon circle at the cut
        fitOnScreen: 0.99,     // faq plate fitted at 16.2
        pushScale: 2.6,        // wrapper plate scale while diving at the icon
        overlayFadeBelow: 2.2  // hi-res icon overlay fades once s < this
      },
      // S5 "%" glyph circle → search pill; micro-cuts behind
      glyph: {
        startD: 170,           // matches the icon on-screen size at 17.1
        grownD: 420,
        holdD: 430,
        fontFrac: 0.62         // % glyph size as fraction of circle Ø
      },
      search: {
        pillW: 821,            // wrapper width at 20.5 (≈940 on screen)
        pillGrow: 850
      },
      micro: {
        start: 17.1, period: 0.8, end: 23.9, // hard bg swaps every 0.8s
        opacity: 0.34, blur: 7, scale: 1.06, jitter: 26
      },
      // S6 endcard (wrapper coords authored for Z≈1.18 mid-hold)
      endcard: {
        urlPill: { cx: 540, cy: 1122, w: 590, h: 82, br: 41, font: 44 },
        markY: 620, brandY: 760, tagY: 1262, pillsY: 1372
      }
    },

    // video placeholder clip (assets/opening-ball.mp4)
    clip: {
      name: "opening-ball",
      start: 0.0,
      dur: 2.0,
      echo: { start: 29.2, opacity: 0.03 } // first frame echo inside the loop circle
    },

    captions: [
      { t0: 0.35, t1: 1.85,  big: "your brain hates math.",  sub: "good thing…" },
      { t0: 2.5,  t1: 5.6,   big: "…justpercent.com solved it.", sub: "every percent tool on one page" },
      { t0: 6.3,  t1: 8.1,   big: "ONE TAP.",                sub: "coupon → checkout price" },
      { t0: 8.8,  t1: 11.0,  big: "$100 − 20% = $80",        sub: "already filled in" },
      { t0: 14.2, t1: 16.7,  big: "answers before you finish asking.", sub: "64 real-life FAQ calculators" },
      { t0: 17.9, t1: 19.5,  big: "ONE % SIGN.",             sub: "every percent problem" },
      { t0: 20.8, t1: 22.9,  big: "search. tap. done.",      sub: "" }
    ],

    endCopy: {
      brand: "Just Percent",
      url: "justpercent.com",
      tagline: "Every percent problem — solved in seconds.",
      pills: ["Free", "Instant", "No sign-up"]
    }
  };
})();
