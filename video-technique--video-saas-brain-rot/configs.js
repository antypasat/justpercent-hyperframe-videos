// Film 7 — Edu-Tainment: SaaS Brain Rot — director config (source of truth).
// The player (saas-brain-rot.html) is a pure function of the master clock;
// everything time-related lives here. Times in seconds, stage = 1080×1920.
//
// SPEEDRUN TUTORIAL: an FPV drone camera flies one continuous transform path
// over real fullPage plates; 200% punch-ins snap to geometry rects; a gaming
// HUD (quest log, XP popups, minimap, error roast) sits ON TOP of the real,
// always-legible UI. Poses use symbolic anchors the player resolves from
// geometry.js (CSS px × 2.5 → stage px).
window.F7 = (() => {
  const DUR = 30;

  return {
    meta: {
      id: "7",
      technique: "EDU-TAINMENT: SAAS BRAIN ROT",
      detail: "FPV UI Tour · 200% Zooms · Gamer-Style Narration",
      duration: DUR,
      fps: 30,
      stage: { w: 1080, h: 1920 },
      cssToStage: 2.5,
      captureGuard:
        "network idle ≥500ms; fonts.ready; images decoded; no finite animations; CLS quiet ≥500ms; keystroke states shot in the <1s window in fresh contexts"
    },

    // FPV feel
    fpv: {
      maxBank: 3,            // deg
      speedLineFrom: 900,    // stage-px/s camera speed where streaks fade in
      fisheye: 0.16          // constant vignette strength (stronger at speed)
    },

    // shot list — one active at any t; poses: {anchor|cx/cy, z, rot}
    // anchors resolve per-theme from geometry.js in the player:
    //   home-full plate: search, cardRight, cardWrong (fullPage coords)
    //   viewport plates: their own rects (searchBox, pxInput, numInput, result)
    // fx: "punch" = 2-frame white flash + 4-frame chromatic edge at t0
    shots: [
      { t0: 0.0,  t1: 2.0,  plate: "home-full",
        from: { cx: 540, cy: 520,  z: 1.28, rot: -3 },
        to:   { cx: 540, cy: 1560, z: 1.16, rot: 2 }, ease: "io" },
      { t0: 2.0,  t1: 2.4,  plate: "home-full", fx: "punch",
        from: { anchor: "search", z: 2.0 },
        to:   { anchor: "search", z: 2.06 }, ease: "o" },
      { t0: 2.4,  t1: 3.2,  plate: "search-s",
        from: { anchor: "searchBox", z: 2.0 },
        to:   { anchor: "searchBox", z: 2.03 }, ease: "o" },
      { t0: 3.2,  t1: 4.0,  plate: "search-sa",
        from: { anchor: "searchBox", z: 2.03 },
        to:   { anchor: "searchBox", z: 2.0 }, ease: "o" },
      { t0: 4.0,  t1: 4.8,  plate: "search-sal",
        from: { anchor: "searchBox", z: 2.0 },
        to:   { anchor: "searchBox", z: 2.04 }, ease: "o" },
      { t0: 4.8,  t1: 5.7,  plate: "search-sale",
        from: { anchor: "searchBox", z: 2.04 },
        to:   { anchor: "searchBox", z: 2.0 }, ease: "o" },
      { t0: 5.7,  t1: 7.0,  plate: "search-sale",       // reveal the match
        from: { anchor: "searchBox", z: 2.0 },
        to:   { anchor: "dropdown", z: 1.12 }, ease: "io" },
      { t0: 7.0,  t1: 7.3,  plate: "home-full", whip: true,
        from: { anchor: "cardWrong", z: 1.0, rot: -4 },
        to:   { anchor: "cardWrong", z: 1.5, rot: 0 }, ease: "o" },
      { t0: 7.3,  t1: 8.1,  plate: "home-full",         // the WRONG card
        from: { anchor: "cardWrong", z: 1.5 },
        to:   { anchor: "cardWrong", z: 1.56 }, ease: "o" },
      { t0: 8.1,  t1: 8.35, plate: "home-full", whip: true, // snap-pan away
        from: { anchor: "cardWrong", z: 1.5 },
        to:   { anchor: "cardRight", z: 1.5 }, ease: "io" },
      { t0: 8.35, t1: 9.3,  plate: "home-full",         // the RIGHT card
        from: { anchor: "cardRight", z: 1.5 },
        to:   { anchor: "cardRight", z: 1.55 }, ease: "o" },
      { t0: 9.3,  t1: 9.75, plate: "home-full", fx: "flashEnd", // dive INTO it
        from: { anchor: "cardRight", z: 1.55, rot: 0 },
        to:   { anchor: "cardRight", z: 4.6, rot: 2 }, ease: "i" },
      { t0: 9.75, t1: 10.4, plate: "calc-plate",        // level 2: arrival
        from: { cx: 540, cy: 960, z: 1.06 },
        to:   { cx: 540, cy: 960, z: 1.0 }, ease: "o" },
      { t0: 10.4, t1: 10.9, plate: "key-p2", fx: "punch",
        from: { anchor: "pxInput", z: 2.0 },
        to:   { anchor: "pxInput", z: 2.04 }, ease: "o" },
      { t0: 10.9, t1: 11.4, plate: "key-p25",
        from: { anchor: "pxInput", z: 2.04 },
        to:   { anchor: "pxInput", z: 2.0 }, ease: "o" },
      { t0: 11.4, t1: 11.9, plate: "key-n8", fx: "punch",
        from: { anchor: "numInput", z: 2.0 },
        to:   { anchor: "numInput", z: 2.04 }, ease: "o" },
      { t0: 11.9, t1: 12.6, plate: "key-n80",
        from: { anchor: "numInput", z: 2.04 },
        to:   { anchor: "numInput", z: 2.0 }, ease: "o" },
      { t0: 12.6, t1: 14.0, plate: "key-n80",           // result on screen
        from: { cx: 540, cy: 960, z: 1.18 },
        to:   { cx: 540, cy: 900, z: 1.0 }, ease: "io" },
      { t0: 14.0, t1: 15.3, plate: "calc-full",         // descend below the calc
        from: { anchor: "calcResultFull", z: 1.14, rot: -2 },
        to:   { anchor: "puAreaFull", z: 1.08, rot: 1.5 }, ease: "io" },
      { t0: 15.3, t1: 16.15, plate: "pu-plate",
        from: { cx: 540, cy: 1000, z: 1.05 },
        to:   { cx: 540, cy: 960, z: 1.0 }, ease: "o" },
      { t0: 16.15, t1: 17.8, plate: "pu-pinned",        // preset pinned!
        from: { cx: 540, cy: 960, z: 1.0 },
        to:   { cx: 540, cy: 940, z: 1.04 }, ease: "o" },
      { t0: 17.8, t1: 18.9, plate: "pu-pinned", fx: "punch",
        from: { anchor: "puResult", z: 2.0 },
        to:   { anchor: "puResult", z: 2.05 }, ease: "o" },
      { t0: 18.9, t1: 20.0, plate: "pu-pinned",
        from: { anchor: "puResult", z: 2.05 },
        to:   { cx: 540, cy: 960, z: 1.05 }, ease: "io" },
      { t0: 20.0, t1: 20.35, plate: "faq-hub", whip: true, // side quest!
        from: { cx: 540, cy: 900, z: 1.3, rot: 4 },
        to:   { cx: 540, cy: 960, z: 1.0, rot: 0 }, ease: "o" },
      { t0: 20.35, t1: 21.8, plate: "faq-hub",
        from: { cx: 540, cy: 960, z: 1.0 },
        to:   { cx: 540, cy: 1030, z: 1.12 }, ease: "io" },
      { t0: 21.8, t1: 22.2, plate: "faq-page", fx: "punch",
        from: { cx: 540, cy: 700, z: 1.35 },
        to:   { cx: 540, cy: 740, z: 1.28 }, ease: "o" },
      { t0: 22.2, t1: 24.9, plate: "faq-page",
        from: { cx: 540, cy: 740, z: 1.28 },
        to:   { cx: 540, cy: 1150, z: 1.02 }, ease: "io" },
      { t0: 24.9, t1: 30.0, plate: null }               // endcard
    ],

    // quest log (top-right, JetBrains Mono)
    quest: {
      spawn: 0.8,
      items: [
        { label: "find the tool",    check: 6.3 },
        { label: "type it in",       check: 12.9 },
        { label: "steal the answer", check: 18.9 }
      ]
    },

    // XP popups — spring near the interaction point (stage px or anchor)
    xp: [
      { t: 6.4,  anchor: "dropdownMatch", text: "+50 XP — SPEED DEMON" },
      { t: 12.7, anchor: "numInput",      text: "+100 XP — NO CALCULATOR HARMED" },
      { t: 19.0, anchor: "puResult",      text: "+150 XP — LEGAL CHEAT CODE" }
    ],
    achievement: { t: 25.6, text: "🏆 PERCENT WIZARD — UNLOCKED" },

    // error roast — red flash border, 8 px shake, glitch slices, BRUH stamp
    roast: { t0: 7.8, t1: 8.1, stamp: "BRUH.", sub: "not that one." },

    // cursor keyframes (plate coords resolved per anchor; opacity 0 hides)
    cursor: [
      { t: 7.05, anchor: "cardWrongCta", dx: -170, dy: 90, op: 0 },
      { t: 7.25, anchor: "cardWrongCta", dx: -140, dy: 70, op: 1 },
      { t: 7.75, anchor: "cardWrongCta", dx: 0,    dy: 0,  op: 1 },
      { t: 8.1,  anchor: "cardWrongCta", dx: 0,    dy: 0,  op: 0 },
      { t: 8.45, anchor: "cardRightCta", dx: 120,  dy: -60, op: 1 },
      { t: 9.0,  anchor: "cardRightCta", dx: 0,    dy: 0,  op: 1 },
      { t: 9.35, anchor: "cardRightCta", dx: 0,    dy: 0,  op: 0 },
      { t: 15.6, anchor: "puRow", dx: 60, dy: -40, op: 1 },
      { t: 16.05, anchor: "puRow", dx: 0, dy: 0,   op: 1 },
      { t: 16.35, anchor: "puRow", dx: 0, dy: 0,   op: 0 }
    ],
    presses: [ { t: 9.05, anchor: "cardRightCta" }, { t: 16.05, anchor: "puRow" } ],

    // highlight ring on the verified search match
    matchRing: { t0: 6.0, t1: 6.9, anchor: "dropdownMatch" },

    // facecam placeholder — 280×280, bottom-right, above the caption band
    facecam: {
      x: 760, y: 1250, w: 280, h: 280, br: 28,
      windows: [[0, 30]]    // always present; final beat is the 26.8 caption
    },

    // level with the facecam slot, clear of the caption band below 1560
    minimap: { x: 44, y: 1240, w: 200, h: 290, br: 20 },

    captions: [
      { t0: 0.3,  t1: 2.0,  big: "ok so you need 20% off of $80", sub: "and your brain said no." },
      { t0: 4.6,  t1: 6.9,  big: "bro it literally autocompletes your life.", sub: "" },
      { t0: 9.9,  t1: 11.2, big: "level 2. the actual calculator.", sub: "" },
      { t0: 15.5, t1: 17.7, big: "tap a preset. it fills itself.", sub: "this is basically cheating." },
      { t0: 21.2, t1: 24.2, big: "side quest: 64 ready-made answers.", sub: "speedrunners only." },
      { t0: 26.8, t1: 29.2, big: "smash a bookmark on justpercent.com", sub: "" }
    ],

    endcard: {
      t0: 24.9,
      urlPill: { cx: 540, cy: 1122, w: 590, h: 82, br: 41, font: 44 },
      markY: 620, brandY: 760, tagY: 1262, pillsY: 1372,
      stagger: 25.1
    },

    // facecam video placeholder clip
    clip: { name: "facecam", start: 0.0, dur: 30.0 },

    endCopy: {
      brand: "Just Percent",
      url: "justpercent.com",
      tagline: "Every percent problem — solved in seconds.",
      pills: ["Free", "Instant", "No sign-up"]
    }
  };
})();
