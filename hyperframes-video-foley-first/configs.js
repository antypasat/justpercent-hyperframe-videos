// Film 3 — Foley-First Editing — director config (source of truth).
// EVERYTHING sits on a 140 BPM grid (1 beat = 60/140 ≈ 0.4286 s). The film is
// cut as if the sound was designed first: every visual event lands exactly on
// a beat and announces its own sound effect (on-screen SFX captions + a
// deterministic waveform strip + beat-counter dots). Silent MP4 — the README
// cue sheet tells post-production exactly what to lay where.
window.F3 = (() => {
  const BPM = 140;
  const bt = (n) => n * (60 / BPM); // beat → seconds
  const DUR = 32;

  return {
    meta: {
      id: "3",
      technique: "FOLEY-FIRST EDITING",
      detail: "Beat-Grid Cuts · On-Screen SFX · Waveform HUD",
      duration: DUR,
      fps: 30,
      bpm: BPM,
      stage: { w: 1080, h: 1920 },
      cssToStage: 2.5,
      captureGuard:
        "network idle ≥500ms; fonts.ready; images decoded; no finite animations; CLS quiet ≥500ms; keystroke states rebuilt from fresh pages"
    },

    bt,

    // intro
    intro: { t0: 0.15, t1: 1.95, text: "TURN SOUND ON 🔊", dots: [bt(1), bt(2), bt(3), bt(4)] },

    // master event list — the film IS this list.
    // kind: plate switch / zoom / fx; sfx: caption word; at: seconds (on grid)
    events: [
      { at: bt(7),  plate: "k5",    sfx: "CLACK",       zone: "original" },
      { at: bt(8),  plate: "k50",   sfx: "CLACK",       zone: "original" },
      { at: bt(9),  plate: "k500",  sfx: "CLACK",       zone: "original" },
      { at: bt(10), plate: "k5000", sfx: "CLACK·CLACK", zone: "original" },
      { at: bt(12), plate: "p2",    sfx: "CLACK",       zone: "percent" },
      { at: bt(13), plate: "p25",   sfx: "CLACK·CLACK", zone: "percent" },
      { at: bt(15), plate: "p25",   sfx: "DING!",       zone: "result", ding: true },
      { at: bt(23), plate: "home",  sfx: "WHOOSH",      whip: true },
      { at: bt(24), plate: "home",  sfx: "THUNK",       zone: "homeCta", thunk: true },
      { at: bt(28), plate: "arrival", sfx: "POP",       zone: "arrivalResult", pop: true },
      { at: bt(34), plate: "presave", sfx: "",          zone: "saveBtn" },
      { at: bt(38), plate: "saved",  sfx: "TICK",       zone: "savedPanel" },
      { at: bt(47), plate: "copied", sfx: "SNAP",       zone: "copied" },
      // recap — 2-beat re-flashes
      { at: bt(54), plate: "k5000", sfx: "CLACK", zone: "original", recap: true },
      { at: bt(56), plate: "p25",   sfx: "DING!", zone: "result", recap: true, ding: true },
      { at: bt(58), plate: "arrival", sfx: "POP", zone: "arrivalResult", recap: true },
      { at: bt(60), plate: "copied",  sfx: "SNAP", zone: "copied", recap: true }
    ],

    // section boundaries (drive the camera program)
    sections: {
      typingStart: bt(5),     // inc default plate on
      dingHold: bt(15),
      pullBack: bt(21),
      whipStart: bt(23),
      whipEnd: bt(24),
      arrivalAt: bt(28),
      saveAt: bt(34),
      tickAt: bt(38),
      copyZoomAt: bt(44),
      snapAt: bt(47),
      recapStart: bt(54),
      recapEnd: bt(62),
      bassHit: bt(64),        // endcard pulse
      end: DUR
    },

    // camera zoom targets (geometry keys; stage px = css × 2.5)
    zones: {
      original:      { geo: "incDefault.original", pad: 3.2 },
      percent:       { geo: "incDefault.percent", pad: 3.2 },
      result:        { geo: "inc.resultClip", pad: 3.0 },
      homeCta:       { geo: "home.card", pad: 1.18 },
      arrivalResult: { geo: "arrival.result", pad: 3.4 },
      saveBtn:       { geo: "presave.saveBtn", pad: 5.5 },
      savedPanel:    { geo: "saved.memos", pad: 1.12 },
      copied:        { geo: "copied.copyBtn", pad: 5.0 }
    },

    waveform: {
      bars: 64, h: 130, bottom: 150, gap: 4,
      idle: 0.14, beatKick: 0.22, eventKick: 1.0, decay: 0.35
    },

    endCopy: {
      brand: "Just Percent",
      url: "justpercent.com",
      tagline: "Every percent problem — solved in seconds.",
      pills: ["Free", "Instant", "No sign-up"]
    },

    captions: [
      { t0: bt(5) + .1,  t1: bt(10) + .3, big: "watch the keys land on the beat", sub: "5,000 — typed for real" },
      { t0: bt(16),      t1: bt(20) + .2, big: "+25% → 6,250", sub: "the DING is the answer" },
      { t0: bt(25),      t1: bt(27) + .3, big: "one card. one THUNK.", sub: "" },
      { t0: bt(29),      t1: bt(33),      big: "$100 + 8% tax = $108", sub: "pre-filled on arrival" },
      { t0: bt(39),      t1: bt(43),      big: "saved. TICK.", sub: "" },
      { t0: bt(48),      t1: bt(52),      big: "copied. SNAP.", sub: "" }
    ]
  };
})();
