/* ============================================================
   scenes.js — "Foley-First Cut" (JustPercent teaser, 38.5 s @ 1080×1920)

   Muted foley-first editing: the film is cut AS IF driven by an
   exaggerated ASMR soundtrack — every click lands a THOCK/CLACK
   chip, an impact ring, a camera shake and an EQ spike; every cut
   rides a WHOOSH streak; there is no dead air.

   Determinism contract:
   - One master GSAP timeline (paused) registered on
     window.__timelines["justpercent-foley"].
   - Continuous motion = GSAP tweens (pure functions of the playhead).
   - Every DISCRETE state (theme class, text content, typed input
     characters, visibility windows, camera shake, EQ meter) is
     computed in sync(t) — a pure function of time — driven by a
     getter/setter "driver" tween that GSAP must evaluate on every
     render, including seeks in BOTH directions. Scrubbing backward
     can never leave a hanging state.
   ============================================================ */
(function () {
  'use strict';

  var DUR = 38.5;
  var SCALE = 1.1907;            // 430px app UI -> 512px ≈ 95% of the 540px frame

  var $ = function (s) { return document.querySelector(s); };
  var stage = $('#stage');
  var clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  var lerp = function (a, b, p) { return a + (b - a) * p; };
  var easeIO = function (p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; };
  var fmt = function (n) { return String(Math.round(n * 100) / 100); };

  /* ---------- base transforms (build-time, deterministic) ----------
     NOTE: the x:580 "waiting in the wings" offsets are applied AFTER
     the measurement phase below, so all measured positions are in the
     screens' on-stage coordinate frame. */
  gsap.set('.screen', { scale: SCALE, transformOrigin: '50% 0' });
  gsap.set('.caption, .headline, #urlpill, #brandbar', { xPercent: -50 });
  // staged homepage pieces (revealed one-by-one after the slam)
  gsap.set('#hl-filter, #hl-seclabel, #hl-card1, #hl-card2, #hl-card3, #hl-card4, #hl-card5, #hl-card6', { autoAlpha: 0 });

  var dropdown = $('#dropdown');
  dropdown.style.display = 'none';

  /* ---------- measure targets in the 540×960 view space ---------- */
  var view = $('#view');
  function viewPos(el, scrollComp) {
    var vr = view.getBoundingClientRect();
    var k = vr.width / 540;                       // page zoom × stage scale
    var r = el.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2 - vr.left) / k,
      y: (r.top + r.height / 2 - vr.top) / k - (scrollComp || 0) * SCALE
    };
  }
  function localTop(el, scroller) {
    var sr = scroller.getBoundingClientRect();
    var k = sr.width / 430;                       // scroller is 430 local px wide
    return (el.getBoundingClientRect().top - sr.top) / k;
  }

  var homeScroller = $('#home-scroll'), calcScroller = $('#calc-scroll'),
      hubScroller = $('#hub-scroll'), tipScroller = $('#tip-scroll');

  // scroll destinations (local 430px units)
  var SCROLL_CARD6 = Math.max(0, localTop($('#hl-card6'), homeScroller) - 300);
  var SCROLL_CARD  = Math.max(0, localTop($('#cl-card'), calcScroller) - 6);
  var SCROLL_BASIC = Math.max(0, localTop($('#hl-basic'), homeScroller) - 6);
  var SCROLL_SHOP  = Math.max(0, localTop($('#fl-shop'), hubScroller) - 64);
  var SCROLL_FAQ   = Math.max(0, localTop($('#tl-back'), tipScroller) - 4);

  // field tooltip chips: park each one centered above its target input.
  // Positions are pure build-time constants measured in the exact layout the
  // chips are visible in — never re-measured during playback, so state stays
  // a pure function of t (live re-measure reads the PREVIOUS tick's layout
  // and made frames depend on seek history).
  function placeChip(chipSel, targetSel, lift) {
    var chip = $(chipSel), t = $(targetSel);
    var card = chip.offsetParent;                 // .jp-calc (position: relative)
    var cr = card.getBoundingClientRect();
    var k = cr.width / card.offsetWidth;          // undo page zoom × stage/screen scale
    var tr = t.getBoundingClientRect();
    chip.style.left = ((tr.left - cr.left) / k + tr.width / (2 * k) - chip.offsetWidth / 2) + 'px';
    chip.style.top = ((tr.top - cr.top) / k - chip.offsetHeight - (lift || 7)) + 'px';
  }

  // S3 is entered via the "Find Pre-Tax Price" SolutionCard, so the
  // SolutionCardHint sits above the calculator (app behavior) until the PU
  // pin dismisses it. Everything visible while the hint is open is measured
  // WITH the hint in the flow; the hint-styled tooltips are parked here too.
  var hintEl = $('#card-hint');
  hintEl.style.display = 'block';
  var SCROLL_PU = Math.max(0, localTop($('#cl-practical'), calcScroller) - 70);
  var HINT_M = {
    chgOrig: viewPos($('#chg-original')),         // S3 typing frame (unscrolled)
    chgNew:  viewPos($('#chg-new')),
    puInf:   viewPos($('#pu-inflation'), SCROLL_PU)
  };
  placeChip('#chip-hx', '#chg-original');
  placeChip('#chip-hy', '#chg-new');
  placeChip('#chip-hz', '#chg-result', 1);
  hintEl.style.display = 'none';

  // dropdown sits right under the search box (portal position)
  var ddTop = localTop($('#hl-search'), homeScroller) +
              $('#hl-search').getBoundingClientRect().height / ($('#home-scroll').getBoundingClientRect().width / 430) + 4;
  dropdown.style.position = 'absolute';
  dropdown.style.top = ddTop + 'px';
  dropdown.style.zIndex = '9';

  // click / interaction targets (view space, with scroll compensation).
  // Elements hidden at build time are shown briefly for measurement.
  function measureShown(el, disp, fn) {
    var prev = el.style.display;
    el.style.display = disp;
    var r = fn();
    el.style.display = prev;
    return r;
  }
  var presChgEl = $('#pres-chg'), presBasicEl = $('#pres-basic');
  var P = {
    card6:  viewPos($('#hl-card6 .cta'), SCROLL_CARD6),   // the interactive element: the CTA button
    puInf:  HINT_M.puInf,                                 // hint still open at pin time
    fab:    viewPos($('#calc-fab-theme')),
    search: viewPos($('#hl-search')),
    ddTip:  measureShown(dropdown, 'block', function () { return viewPos($('#dd-pu-tip')); }),
    hubTip: viewPos($('#hub-tip'), SCROLL_SHOP),
    bill:   viewPos($('#tip-bill'), SCROLL_FAQ),
    presChg: measureShown(presChgEl, 'block', function () { return viewPos(presChgEl); }),
    chgOrig: HINT_M.chgOrig,                              // S3 typing frame (hint open, unscrolled)
    chgNew:  HINT_M.chgNew,
    chgOrigPU: measureShown(presChgEl, 'block', function () { return viewPos($('#chg-original'), SCROLL_CARD); }),
    chgNewPU:  measureShown(presChgEl, 'block', function () { return viewPos($('#chg-new'), SCROLL_CARD); }),
    keycap: { x: 270, y: 212 }
  };
  // the presentation itself, measured in the scrolled-to-card frame
  P.presChg.y -= SCROLL_CARD * SCALE;

  // PU-state tooltips, parked once for the layout they are visible in
  // (presentation open, hint dismissed)
  measureShown(presChgEl, 'block', function () {
    placeChip('#chip-cx', '#chg-original');
    placeChip('#chip-cy', '#chg-new');
    placeChip('#chip-cz', '#chg-result', 1);
    return 0;
  });
  measureShown(presBasicEl, 'block', function () {
    placeChip('#chip-bx', '#basic-x');
    placeChip('#chip-by', '#basic-y');
    placeChip('#chip-bz', '#basic-z', 1);
    return 0;
  });

  function place(sel, x, y, rot) {
    var el = $(sel);
    el.style.left = clamp(x, 8, 532) + 'px';
    el.style.top = clamp(y, 70, 880) + 'px';
    if (rot) el.style.transform = 'rotate(' + rot + 'deg)';
  }
  // rings sit on the click point
  place('#ring-key', P.keycap.x, P.keycap.y);
  place('#ring-card', P.card6.x, P.card6.y);
  place('#ring-pu', P.puInf.x, P.puInf.y);
  place('#ring-fab', P.fab.x, P.fab.y);
  place('#ring-search', P.search.x, P.search.y);
  place('#ring-dd', P.ddTip.x, P.ddTip.y);
  place('#ring-hub', P.hubTip.x, P.hubTip.y);
  place('#ring-logo', 270, 430);
  // onomatopoeia chips near (not on) their impact points
  place('#sfx-thock', 352, 140, -7);
  place('#sfx-pop1', 388, 300, 6);
  place('#sfx-whoosh1', 210, 470, -4);
  place('#sfx-taps', 356, 700, 3);
  place('#sfx-clack1', P.card6.x - 190, P.card6.y - 86, -6);
  place('#sfx-tik1', P.chgOrig.x - 120, P.chgOrig.y - 74, -4);
  place('#sfx-tik2', P.chgNew.x + 40, P.chgNew.y - 74, 4);
  place('#sfx-ding1', 380, 560, 6);
  place('#sfx-swoosh1', 430, 420, 8);
  place('#sfx-clack2', P.puInf.x - 210, P.puInf.y - 80, -5);
  place('#sfx-plink', P.puInf.x + 130, P.puInf.y - 60, 7);
  place('#sfx-pop2', 400, P.presChg.y - 40, 5);
  place('#sfx-ding2', 396, 520, -5);
  place('#sfx-click1', P.fab.x - 150, P.fab.y - 60, -4);
  place('#sfx-flip', 224, 420, -8);
  place('#sfx-boom1', 330, 330, 5);
  place('#sfx-clack3', P.search.x - 190, P.search.y - 80, -6);
  place('#sfx-th1', P.search.x - 120, P.search.y + 52, -3);
  place('#sfx-th2', P.search.x - 40, P.search.y + 58, 2);
  place('#sfx-th3', P.search.x + 44, P.search.y + 52, -2);
  place('#sfx-pop3', P.ddTip.x + 150, P.ddTip.y - 66, 6);
  place('#sfx-clack4', P.ddTip.x - 200, P.ddTip.y - 70, -6);
  place('#sfx-whoosh2', 176, 430, -6);
  place('#sfx-thunk', 372, 690, 4);
  place('#sfx-ding3', 398, 470, -5);
  place('#sfx-clack5', P.hubTip.x - 200, P.hubTip.y - 84, -6);
  place('#sfx-brrp', P.bill.x + 96, P.bill.y - 60, 5);
  place('#sfx-ding4', 386, P.bill.y + 130, -4);
  place('#sfx-boom2', 396, 320, 6);

  /* ---------- now park the waiting screens off-stage ---------- */
  gsap.set('#scr-calc', { x: 580, rotationY: 10 });
  gsap.set('#scr-hub',  { x: 580 });
  gsap.set('#scr-tip',  { x: 580 });

  /* ============================================================
     master timeline
     ============================================================ */
  window.__timelines = window.__timelines || {};
  var tl = gsap.timeline({ paused: true });

  var IR = { immediateRender: false };
  function ft(sel, from, to, at) {
    to.immediateRender = false;
    tl.fromTo(sel, from, to, at);
  }
  function pop(sel, at, dur, extra) {
    // onomatopoeia chip: slam in, hang, evaporate
    var d = dur || 0.55;
    ft(sel, { autoAlpha: 0, scale: 1.8, y: 8 },
            { autoAlpha: 1, scale: 1, y: 0, duration: 0.16, ease: 'power4.out' }, at);
    ft(sel, { }, { autoAlpha: 0, scale: 0.9, y: -14, duration: 0.2, ease: 'power2.in' }, at + d);
    if (extra) extra();
  }
  function ring(sel, at, size) {
    ft(sel, { autoAlpha: 0.9, scale: 0.25 },
            { autoAlpha: 0, scale: size || 1.6, duration: 0.5, ease: 'power2.out' }, at);
  }
  function flash(at, o) {
    ft('#flash', { opacity: o || 0.35 }, { opacity: 0, duration: 0.22, ease: 'power1.out' }, at);
  }
  function whooshV(sel, at, dir) {
    ft(sel, { autoAlpha: 0, y: 300 * (dir || 1) },
            { autoAlpha: 0.9, y: -300 * (dir || 1), duration: 0.55, ease: 'power2.in' }, at);
    ft(sel, { }, { autoAlpha: 0, duration: 0.12 }, at + 0.5);
  }
  function whooshH(sel, at) {
    ft(sel, { autoAlpha: 0, x: 320 },
            { autoAlpha: 0.9, x: -320, duration: 0.5, ease: 'power2.in' }, at);
    ft(sel, { }, { autoAlpha: 0, duration: 0.12 }, at + 0.46);
  }
  function press(at) { // cursor press
    ft('#cursor', { }, { scale: 0.84, duration: 0.09, ease: 'power2.in' }, at - 0.09);
    ft('#cursor', { }, { scale: 1, duration: 0.16, ease: 'back.out(3)' }, at + 0.02);
  }

  /* ---------- 0.0–3.55 · cold open ---------- */
  ft('#view', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0);
  ft('#brandbar', { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.8)' }, 0.18);
  // keycap drop → THOCK
  // autoAlpha must live in the TO vars as well: from-only props are a GSAP
  // "startAt" set — reverted on backward seeks and never re-applied on the
  // next forward pass, which made the keycap render invisible after priming
  ft('#keycap', { autoAlpha: 1, y: -520, rotation: -13 },
                { autoAlpha: 1, y: 0, rotation: 3, duration: 0.3, ease: 'power3.in' }, 0.12);
  ft('#keycap', { }, { scaleY: 0.9, scaleX: 1.07, duration: 0.07, ease: 'power2.out' }, 0.42);
  ft('#keycap', { }, { scaleY: 1, scaleX: 1, duration: 0.3, ease: 'elastic.out(1.4,0.45)' }, 0.49);
  ring('#ring-key', 0.42, 2.1); flash(0.42, 0.4);
  pop('#sfx-thock', 0.45, 0.7);
  // sequential headlines — one at a time, same spot, glass panels
  ft('#head1', { autoAlpha: 0, scale: 1.7, y: 24 },
               { autoAlpha: 1, scale: 1, y: 0, duration: 0.34, ease: 'power4.out' }, 0.95);
  ft('#head1', { }, { autoAlpha: 0, y: -34, duration: 0.22, ease: 'power2.in' }, 1.92);
  ft('#keycap', { }, { y: -560, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 1.9);
  ft('#head2', { autoAlpha: 0, scale: 1.6, y: 26 },
               { autoAlpha: 1, scale: 1, y: 0, duration: 0.32, ease: 'power4.out' }, 2.2);
  pop('#sfx-pop1', 2.24, 0.5);
  ft('#head2', { }, { autoAlpha: 0, y: -40, duration: 0.22, ease: 'power2.in' }, 3.42);

  /* ---------- 3.55–8.9 · homepage slam-assembly (LIGHT) ---------- */
  whooshV('#wh-in', 3.5);
  pop('#sfx-whoosh1', 3.58, 0.55);
  ft('#scr-home', { y: 900 }, { y: 0, duration: 0.62, ease: 'power4.out' }, 3.58);
  ft('#urlpill', { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }, 3.8);
  // staged pieces land like drum hits
  ft('#hl-filter',   { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'back.out(2.4)' }, 4.2);
  ft('#hl-seclabel', { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.28, ease: 'power3.out' }, 4.34);
  var cardIds = ['#hl-card1', '#hl-card2', '#hl-card3', '#hl-card4', '#hl-card5', '#hl-card6'];
  for (var ci = 0; ci < 6; ci++) {
    ft(cardIds[ci], { autoAlpha: 0, y: 42, scale: 0.94 },
                    { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2.1)' }, 4.42 + ci * 0.145);
  }
  pop('#sfx-taps', 4.55, 0.85);
  // the app's "beam-run" flash on the Practical Uses button:
  // one dash (dasharray 25/200, pathLength 100) travels once around, then the beam hides again
  function beamFlash(t) {
    ft('#scr-home .jp-pu-btn .beam', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, t);
    ft('#scr-home .jp-pu-btn .beam rect', { strokeDashoffset: 25 }, { strokeDashoffset: -200, duration: 2, ease: 'none' }, t);
    ft('#scr-home .jp-pu-btn .beam', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25 }, t + 1.75);
  }
  beamFlash(3.6);
  beamFlash(20.4);
  ft('#capA', { autoAlpha: 0, y: 44, scale: 1.25 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power4.out' }, 5.7);
  ft('#capA', { }, { autoAlpha: 0, y: 24, duration: 0.24, ease: 'power2.in' }, 8.35);

  /* ---------- 7.9–13.3 · SolutionCard → /original-before-increase-calculator/ ---------- */
  // scroll the homepage down to the pre-tax-price card
  tl.to('#home-scroll', { y: -SCROLL_CARD6, duration: 0.55, ease: 'power2.inOut' }, 7.85, IR);
  ft('#cursor', { autoAlpha: 0, x: 560, y: 900 }, { autoAlpha: 1, x: P.card6.x + 60, y: P.card6.y + 70, duration: 0.42, ease: 'power2.out' }, 8.05);
  tl.to('#cursor', { x: P.card6.x + 14, y: P.card6.y + 8, duration: 0.34, ease: 'power2.inOut' }, 8.42, IR);
  ft('#hl-card6', { }, { scale: 1.035, duration: 0.25, ease: 'power2.out' }, 8.5);   // hover lift
  press(8.92);
  ft('#hl-card6', { }, { scale: 0.97, duration: 0.08, ease: 'power2.in' }, 8.9);
  ft('#hl-card6', { }, { scale: 1, duration: 0.2, ease: 'power2.out' }, 8.99);
  ring('#ring-card', 8.94, 1.9); flash(8.94, 0.22);
  pop('#sfx-clack1', 8.96, 0.6);
  ft('#cursor', { }, { autoAlpha: 0, x: '+=90', y: '+=120', duration: 0.3, ease: 'power2.in' }, 9.12);
  // whip cut: home flies left, calculator page flies in from the right
  whooshH('#wh-side1', 9.1);
  tl.to('#scr-home', { x: -600, rotationY: -9, duration: 0.5, ease: 'power3.in' }, 9.1, IR);
  tl.to('#scr-calc', { x: 0, rotationY: 0, duration: 0.55, ease: 'power3.out' }, 9.3, IR);
  ft('#urlpill', { }, { scale: 1.07, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, 9.5);
  // the SolutionCardHint's field tooltips pop over the fields right after landing
  ft('#chip-hx', { autoAlpha: 0, y: 8, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'back.out(2.2)' }, 9.62);
  ft('#chip-hy', { autoAlpha: 0, y: 8, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'back.out(2.2)' }, 9.7);
  ft('#chip-hz', { autoAlpha: 0, y: 8, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'back.out(2.2)' }, 9.82);
  // the inputs type themselves (characters driven by sync(t)); answer DING
  ft('#capB', { autoAlpha: 0, y: 44, scale: 1.25 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power4.out' }, 10.35);
  pop('#sfx-tik1', 10.05, 0.62);
  pop('#sfx-tik2', 11.05, 0.62);
  ft('#chg-result', { }, { scale: 1.14, duration: 0.13, ease: 'power3.out' }, 11.82);
  ft('#chg-result', { }, { scale: 1, duration: 0.24, ease: 'back.out(2.5)' }, 11.96);
  pop('#sfx-ding1', 11.88, 0.6);
  ft('#capB', { }, { autoAlpha: 0, y: 24, duration: 0.22, ease: 'power2.in' }, 13.05);

  /* ---------- 13.3–18.6 · Practical Use: click → shown ABOVE → fill → live answer ---------- */
  whooshV('#wh-scroll1', 13.32);
  pop('#sfx-swoosh1', 13.42, 0.5);
  tl.to('#calc-scroll', { y: -SCROLL_PU, duration: 0.68, ease: 'power2.inOut' }, 13.35, IR);
  ft('#cursor', { autoAlpha: 0, x: 540, y: 880 }, { autoAlpha: 1, x: P.puInf.x + 40, y: P.puInf.y + 34, duration: 0.4, ease: 'power2.out' }, 13.75);
  tl.to('#cursor', { x: P.puInf.x + 6, y: P.puInf.y + 4, duration: 0.26, ease: 'power2.inOut' }, 14.16, IR);
  // (a) the CLICK on the practical use
  press(14.42);
  ring('#ring-pu', 14.44, 1.8); flash(14.44, 0.2);
  pop('#sfx-clack2', 14.46, 0.55);
  ft('#pu-inflation .jp-pin', { scale: 0.2, rotation: 60 }, { scale: 1, rotation: 20, duration: 0.3, ease: 'back.out(3)' }, 14.5);
  pop('#sfx-plink', 14.66, 0.5);
  ft('#cursor', { }, { autoAlpha: 0, x: '+=80', y: '+=90', duration: 0.28, ease: 'power2.in' }, 14.9);
  // pinning dismisses the SolutionCardHint (app: fade ~250ms, then reflow);
  // the display flip at 15.1 happens inside the scroll so the reflow is masked
  ft('#card-hint', { }, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, 14.6);
  ft('#chip-hx', { }, { autoAlpha: 0, y: -6, duration: 0.24 }, 14.6);
  ft('#chip-hy', { }, { autoAlpha: 0, y: -6, duration: 0.24 }, 14.64);
  ft('#chip-hz', { }, { autoAlpha: 0, y: -6, duration: 0.24 }, 14.68);
  // (b) scroll back up — the pinned example is presented ABOVE the calculator
  tl.to('#calc-scroll', { y: -SCROLL_CARD, duration: 0.6, ease: 'power2.inOut' }, 14.98, IR);
  ft('#pres-chg', { maxHeight: 0, autoAlpha: 0, scaleY: 0.7, transformOrigin: '50% 0' },
                  { maxHeight: 250, autoAlpha: 1, scaleY: 1, duration: 0.5, ease: 'back.out(1.3)' }, 15.62);
  pop('#sfx-pop2', 15.78, 0.5);
  ft('#capC', { autoAlpha: 0, y: 44, scale: 1.25 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power4.out' }, 15.2);
  // (c) only now: the values fly from the example into the fields
  ft('#chip-x', { autoAlpha: 0, x: P.presChg.x - 130, y: P.presChg.y + 6, scale: 0.6, rotation: -10 },
                { autoAlpha: 1, x: P.chgOrigPU.x - 26, y: P.chgOrigPU.y - 14, scale: 1, rotation: 0, duration: 0.34, ease: 'power2.in' }, 16.48);
  ft('#chip-x', { }, { autoAlpha: 0, scale: 0.4, duration: 0.12 }, 16.82);
  ft('#chip-y', { autoAlpha: 0, x: P.presChg.x + 40, y: P.presChg.y + 6, scale: 0.6, rotation: 8 },
                { autoAlpha: 1, x: P.chgNewPU.x - 26, y: P.chgNewPU.y - 14, scale: 1, rotation: 0, duration: 0.34, ease: 'power2.in' }, 16.56);
  ft('#chip-y', { }, { autoAlpha: 0, scale: 0.4, duration: 0.12 }, 16.9);
  ft('#chg-original', { }, { scale: 1.12, duration: 0.1, ease: 'power3.out' }, 16.82);
  ft('#chg-original', { }, { scale: 1, duration: 0.2, ease: 'back.out(2.5)' }, 16.93);
  ft('#chg-new', { }, { scale: 1.12, duration: 0.1, ease: 'power3.out' }, 16.9);
  ft('#chg-new', { }, { scale: 1, duration: 0.2, ease: 'back.out(2.5)' }, 17.01);
  // field tooltips (the app's FieldTooltip chips)
  ft('#chip-cx', { autoAlpha: 0, y: 8, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'back.out(2.2)' }, 16.86);
  ft('#chip-cy', { autoAlpha: 0, y: 8, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'back.out(2.2)' }, 16.94);
  ft('#chip-cz', { autoAlpha: 0, y: 8, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'back.out(2.2)' }, 17.06);
  ft('#chg-result', { }, { scale: 1.16, duration: 0.13, ease: 'power3.out' }, 17.02);
  ft('#chg-result', { }, { scale: 1, duration: 0.26, ease: 'back.out(2.5)' }, 17.16);
  pop('#sfx-ding2', 17.1, 0.6);
  ft('#chip-cx', { }, { autoAlpha: 0, y: -8, duration: 0.2 }, 18.5);
  ft('#chip-cy', { }, { autoAlpha: 0, y: -8, duration: 0.2 }, 18.56);
  ft('#chip-cz', { }, { autoAlpha: 0, y: -8, duration: 0.2 }, 18.62);
  ft('#capC', { }, { autoAlpha: 0, y: 24, duration: 0.22, ease: 'power2.in' }, 18.4);

  /* ---------- 18.6–21.4 · 3D theme flip (LIGHT → DARK) ---------- */
  ft('#cursor', { autoAlpha: 0, x: 540, y: 900 }, { autoAlpha: 1, x: P.fab.x + 8, y: P.fab.y + 6, duration: 0.5, ease: 'power2.out' }, 18.68);
  press(19.38);
  ring('#ring-fab', 19.4, 1.6);
  pop('#sfx-click1', 19.42, 0.5);
  ft('#cursor', { }, { autoAlpha: 0, duration: 0.25 }, 19.6);
  // front face rotates away…
  tl.to('#scr-calc', { rotationY: 92, duration: 0.92, ease: 'power2.in' }, 19.5, IR);
  // …the back face IS the homepage, already in dark mode (rewound to the top)
  tl.set('#scr-home', { x: 0, y: 0, rotationY: -92 }, 19.5);
  tl.set('#home-scroll', { y: 0 }, 19.5);
  tl.to('#scr-home', { rotationY: 0, duration: 0.9, ease: 'power2.out' }, 20.44, IR);
  ft('#bg-dark', { }, { opacity: 1, duration: 1.0, ease: 'power1.inOut' }, 19.9);
  ft('#specular', { autoAlpha: 1, x: '-120%' }, { autoAlpha: 1, x: '120%', duration: 1.5, ease: 'power1.inOut' }, 19.62);
  ft('#specular', { }, { autoAlpha: 0, duration: 0.2 }, 21.05);
  pop('#sfx-flip', 19.98, 0.6);
  flash(20.44, 0.32);
  pop('#sfx-boom1', 21.4, 0.6);
  ft('#capD', { autoAlpha: 0, y: 44, scale: 1.25 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power4.out' }, 20.66);
  ft('#capD', { }, { autoAlpha: 0, y: 24, duration: 0.22, ease: 'power2.in' }, 22.3);

  /* ---------- 21.4–27.75 · search "tip" → dropdown → scroll to the pinned calculator (DARK) ---------- */
  ft('#cursor', { autoAlpha: 0, x: 540, y: 880 }, { autoAlpha: 1, x: P.search.x + 90, y: P.search.y + 12, duration: 0.42, ease: 'power2.out' }, 21.48);
  press(21.95);
  ring('#ring-search', 21.97, 1.5);
  pop('#sfx-clack3', 21.99, 0.5);
  tl.to('#cursor', { x: P.search.x + 130, y: P.search.y + 60, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 22.2, IR);
  // i·n·t·e·r·e·s·t — key thocks (characters land via sync(t))
  pop('#sfx-th1', 22.38, 0.34);
  pop('#sfx-th2', 22.73, 0.34);
  pop('#sfx-th3', 23.08, 0.34);
  // dropdown springs open
  ft('#dropdown', { autoAlpha: 0, y: -16, scaleY: 0.85, transformOrigin: '50% 0' },
                  { autoAlpha: 1, y: 0, scaleY: 1, duration: 0.36, ease: 'back.out(1.8)' }, 23.58);
  pop('#sfx-pop3', 23.72, 0.5);
  ft('#cursor', { autoAlpha: 0, x: P.ddTip.x + 130, y: P.ddTip.y + 90 },
               { autoAlpha: 1, x: P.ddTip.x + 10, y: P.ddTip.y + 8, duration: 0.38, ease: 'power2.out' }, 24.12);
  press(24.75);
  ring('#ring-dd', 24.77, 1.7); flash(24.77, 0.18);
  pop('#sfx-clack4', 24.79, 0.55);
  ft('#cursor', { }, { autoAlpha: 0, x: '+=70', y: '+=90', duration: 0.26, ease: 'power2.in' }, 24.98);
  ft('#capE', { autoAlpha: 0, y: 44, scale: 1.25 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power4.out' }, 24.25);
  // the app scrolls you to the right calculator — long WHOOSH
  whooshV('#wh-scroll2', 25.05);
  pop('#sfx-whoosh2', 25.2, 0.7);
  tl.to('#home-scroll', { y: -SCROLL_BASIC * 1.012, duration: 1.0, ease: 'power2.inOut' }, 25.08, IR);
  tl.to('#home-scroll', { y: -SCROLL_BASIC, duration: 0.3, ease: 'back.out(1.6)' }, 26.08, IR);
  ft('#capE', { }, { autoAlpha: 0, y: 24, duration: 0.22, ease: 'power2.in' }, 25.86);
  pop('#sfx-thunk', 26.18, 0.5);
  // the pinned example unfolds only AFTER the scroll settles — an entrance
  // during the scroll would be masked by the motion and read as page furniture
  ft('#pres-basic', { maxHeight: 0, autoAlpha: 0, scaleY: 0.7, transformOrigin: '50% 0' },
                    { maxHeight: 250, autoAlpha: 1, scaleY: 1, duration: 0.45, ease: 'back.out(1.3)' }, 26.12);
  // the selected Practical Use fills the calculator (values via sync)
  ft('#basic-x', { }, { scale: 1.12, duration: 0.1, ease: 'power3.out' }, 26.36);
  ft('#basic-x', { }, { scale: 1, duration: 0.2, ease: 'back.out(2.5)' }, 26.47);
  ft('#basic-y', { }, { scale: 1.12, duration: 0.1, ease: 'power3.out' }, 26.5);
  ft('#basic-y', { }, { scale: 1, duration: 0.2, ease: 'back.out(2.5)' }, 26.61);
  ft('#chip-bx', { autoAlpha: 0, y: 8, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'back.out(2.2)' }, 26.42);
  ft('#chip-by', { autoAlpha: 0, y: 8, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'back.out(2.2)' }, 26.56);
  ft('#chip-bz', { autoAlpha: 0, y: 8, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'back.out(2.2)' }, 26.74);
  ft('#basic-z', { }, { scale: 1.16, duration: 0.13, ease: 'power3.out' }, 26.68);
  ft('#basic-z', { }, { scale: 1, duration: 0.26, ease: 'back.out(2.5)' }, 26.82);
  pop('#sfx-ding3', 26.78, 0.6);
  ft('#chip-bx', { }, { autoAlpha: 0, y: -8, duration: 0.2 }, 27.5);
  ft('#chip-by', { }, { autoAlpha: 0, y: -8, duration: 0.2 }, 27.56);
  ft('#chip-bz', { }, { autoAlpha: 0, y: -8, duration: 0.2 }, 27.62);

  /* ---------- 27.75–31.1 · /faqs/ hub (DARK) ---------- */
  whooshH('#wh-side2', 27.78);
  tl.to('#scr-home', { x: -600, rotationY: -9, duration: 0.5, ease: 'power3.in' }, 27.78, IR);
  tl.to('#scr-hub', { x: 0, duration: 0.55, ease: 'power3.out' }, 27.98, IR);
  ft('#urlpill', { }, { scale: 1.07, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, 28.15);
  ft('#fl-h1', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' }, 28.5);
  ft('#fl-controls', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power3.out' }, 28.62);
  ft('#fl-cats', { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power3.out' }, 28.74);
  // scroll to Transportation and Travel Costs
  tl.to('#hub-scroll', { y: -SCROLL_SHOP, duration: 0.6, ease: 'power2.inOut' }, 29.4, IR);
  ft('#cursor', { autoAlpha: 0, x: 540, y: 900 }, { autoAlpha: 1, x: P.hubTip.x + 70, y: P.hubTip.y + 50, duration: 0.4, ease: 'power2.out' }, 29.85);
  tl.to('#cursor', { x: P.hubTip.x + 20, y: P.hubTip.y + 8, duration: 0.26, ease: 'power2.inOut' }, 30.2, IR);
  press(30.48);
  ft('#hub-tip', { }, { scale: 0.97, duration: 0.08, ease: 'power2.in' }, 30.46);
  ft('#hub-tip', { }, { scale: 1, duration: 0.18, ease: 'power2.out' }, 30.55);
  ring('#ring-hub', 30.5, 1.8); flash(30.5, 0.2);
  pop('#sfx-clack5', 30.52, 0.55);
  ft('#cursor', { }, { autoAlpha: 0, x: '+=80', y: '+=100', duration: 0.26, ease: 'power2.in' }, 30.72);

  /* ---------- 31.1–35.3 · /faqs/tip-calculation-calculator/ — live FAQ ---------- */
  whooshH('#wh-side3', 31.12);
  tl.to('#scr-hub', { x: -600, rotationY: -9, duration: 0.5, ease: 'power3.in' }, 31.12, IR);
  tl.to('#scr-tip', { x: 0, duration: 0.55, ease: 'power3.out' }, 31.32, IR);
  ft('#urlpill', { }, { scale: 1.07, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, 31.5);
  // settle-scroll so the whole card sits above the caption
  tl.to('#tip-scroll', { y: -SCROLL_FAQ, duration: 0.45, ease: 'power2.inOut' }, 31.95, IR);
  ft('#capF', { autoAlpha: 0, y: 44, scale: 1.25 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power4.out' }, 32.05);
  // scrub the car price: 80000 → 90000, everything recomputes live (sync drives the numbers)
  ft('#cursor', { autoAlpha: 0, x: P.bill.x + 120, y: P.bill.y + 120 },
               { autoAlpha: 1, x: P.bill.x + 4, y: P.bill.y + 6, duration: 0.4, ease: 'power2.out' }, 31.98);
  press(32.42);
  tl.to('#cursor', { x: P.bill.x + 46, duration: 0.72, ease: 'power1.inOut' }, 32.48, IR);
  ft('#cursor', { }, { rotation: -10, duration: 0.2 }, 32.44);
  ft('#cursor', { }, { rotation: 0, duration: 0.2 }, 33.2);
  pop('#sfx-brrp', 32.56, 0.72);
  ft('#tip-result', { }, { scale: 1.18, duration: 0.13, ease: 'power3.out' }, 33.26);
  ft('#tip-result', { }, { scale: 1, duration: 0.26, ease: 'back.out(2.5)' }, 33.4);
  pop('#sfx-ding4', 33.32, 0.6);
  ft('#cursor', { }, { autoAlpha: 0, y: '+=90', duration: 0.3, ease: 'power2.in' }, 33.66);
  ft('#capF', { }, { autoAlpha: 0, y: 24, duration: 0.22, ease: 'power2.in' }, 34.9);

  /* ---------- 35.3–38.5 · finale (the brand bar yields to the end card) ---------- */
  tl.to('#scr-tip', { y: 700, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 35.32, IR);
  ft('#urlpill', { }, { autoAlpha: 0, y: -30, duration: 0.3, ease: 'power2.in' }, 35.38);
  ft('#brandbar', { }, { autoAlpha: 0, y: 60, duration: 0.32, ease: 'power2.in' }, 35.48);
  tl.set('#outro', { autoAlpha: 1 }, 35.8);
  ft('#outro .logo-wrap', { autoAlpha: 0, scale: 2.5 },
                          { autoAlpha: 1, scale: 1, duration: 0.42, ease: 'back.out(1.7)' }, 35.9);
  ring('#ring-logo', 36.26, 2.4); flash(36.26, 0.3);
  pop('#sfx-boom2', 36.34, 0.7);
  ft('#outro .site', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power3.out' }, 36.55);
  ft('#outro .tagline', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power2.out' }, 36.9);
  ft('#outro .logo-wrap', { }, { scale: 1.025, duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 37.25);

  /* ============================================================
     sync(t) — every discrete state as a pure function of time
     ============================================================ */
  var HITS = [
    [0.42, 1.0], [2.2, 0.3], [3.62, 0.5],
    [4.42, 0.16], [4.57, 0.16], [4.71, 0.16], [4.86, 0.16], [5.0, 0.16], [5.15, 0.2],
    [8.94, 0.8], [9.62, 0.3], [11.84, 0.45],
    [13.42, 0.25], [14.44, 0.8], [15.72, 0.3], [16.84, 0.2], [17.05, 0.45],
    [19.4, 0.5], [20.44, 0.4], [21.34, 1.0],
    [21.97, 0.45], [22.38, 0.22], [22.73, 0.22], [23.08, 0.22], [23.62, 0.35],
    [24.77, 0.7], [26.14, 0.9], [26.72, 0.4],
    [27.8, 0.3], [30.5, 0.7], [31.15, 0.3], [33.3, 0.45],
    [35.92, 0.2], [36.26, 1.0]
  ];

  var els = {
    shaker: $('#shaker'),
    eq: document.querySelectorAll('#eq i'),
    urlPath: $('#url-path'),
    scrHome: $('#scr-home'), scrCalc: $('#scr-calc'), scrHub: $('#scr-hub'), scrTip: $('#scr-tip'),
    searchInput: $('#home-search'), searchTyped: $('#search-typed'),
    searchGhost: $('#search-ghost'), searchCursor: $('#search-cursor'),
    chgO: $('#chg-original'), chgN: $('#chg-new'),
    chgRes: $('#chg-result'), chgResVal: $('#chg-result-val'),
    puInf: $('#pu-inflation'), presChg: $('#pres-chg'), presBasic: $('#pres-basic'),
    hint: $('#card-hint'),
    chgRlabel: document.querySelector('#chg-result .rlabel'),
    basicRlabel: document.querySelector('#basic-z .rlabel'),
    basicX: $('#basic-x'), basicY: $('#basic-y'),
    basicZ: $('#basic-z'), basicZVal: $('#basic-z-val'),
    ddTip: $('#dd-pu-tip'),
    card6note: $('#hl-card6').querySelector('.jp-note'),
    tipBill: $('#tip-bill'), tipRes: $('#tip-result'),
    detY: $('#det-y'), detY2: $('#det-y2'), detW: $('#det-w'),
    detFy: $('#det-fy'), detFy2: $('#det-fy2'), detFr: $('#det-fr'),
    detDep2: $('#det-dep2'), detRem: $('#det-rem')
  };

  function typed(t, t0, step, str) {
    if (t < t0) return '';
    return str.slice(0, clamp(Math.floor((t - t0) / step) + 1, 0, str.length));
  }

  function sync(t) {
    /* ----- theme ----- */
    stage.classList.toggle('dark', t >= 20.44);

    /* ----- screen visibility windows ----- */
    els.scrHome.style.visibility = ((t >= 3.55 && t < 9.72) || (t >= 20.42 && t < 28.4)) ? 'visible' : 'hidden';
    els.scrCalc.style.visibility = (t >= 9.28 && t < 20.44) ? 'visible' : 'hidden';
    els.scrHub.style.visibility  = (t >= 27.95 && t < 31.75) ? 'visible' : 'hidden';
    els.scrTip.style.visibility  = (t >= 31.3 && t < 35.95) ? 'visible' : 'hidden';

    /* ----- URL pill (verified routes from src/pages, trailing slash) ----- */
    var path;
    if (t < 9.45) path = '/';
    else if (t < 20.44) path = '/original-before-increase-calculator/';
    else if (t < 28.15) path = '/';
    else if (t < 31.5) path = '/faqs/';
    else path = '/faqs/car-depreciation-calculator/';
    if (els.urlPath.textContent !== path) els.urlPath.textContent = path;

    /* ----- original-before-increase calculator: typing + live recompute ----- */
    var oStr = t >= 16.84 ? '5' : typed(t, 9.95, 0.14, '8');
    var nStr = t >= 16.98 ? '126' : typed(t, 10.95, 0.14, '108');
    if (els.chgO.textContent !== oStr) els.chgO.textContent = oStr;
    if (els.chgN.textContent !== nStr) els.chgN.textContent = nStr;
    els.chgO.classList.toggle('glow', (t >= 9.9 && t < 10.75) || (t >= 16.82 && t < 18.6));
    els.chgN.classList.toggle('glow', (t >= 10.9 && t < 11.7) || (t >= 16.9 && t < 18.6));
    var oV = parseFloat(oStr), nV = parseFloat(nStr);
    var hasRes = t >= 11.55 && oStr.length && nStr.length && oV > -100;
    // the app recomputes on every keystroke of the New field
    if (t >= 11.09 && t < 11.55 && nStr.length) hasRes = true;
    if (hasRes) {
      // Original = New / (1 + Increase/100), rounded to 2 decimals like the app
      els.chgResVal.textContent = fmt(nV / (1 + oV / 100));
      els.chgRes.classList.remove('empty');
    } else {
      els.chgResVal.textContent = 'Original';
      els.chgRes.classList.add('empty');
    }

    /* ----- practical use pinning (order: click → pin → presented above → fill) ----- */
    els.puInf.classList.toggle('pinned', t >= 14.46);
    els.presChg.style.display = t >= 15.58 ? 'block' : 'none';

    /* ----- hover states ----- */
    els.card6note.classList.toggle('lifted', t >= 8.5 && t < 9.3);
    els.ddTip.classList.toggle('hover', t >= 24.3 && t < 24.95);

    /* ----- dark homepage: search focus, typing, dropdown ----- */
    var focused = t >= 21.97 && t < 24.95;
    els.searchInput.classList.toggle('focused', focused);
    var q = typed(t, 22.35, 0.13, 'interest');
    if (t < 21.9) q = '';
    if (els.searchTyped.textContent !== q) els.searchTyped.textContent = q;
    els.searchGhost.style.opacity = (focused || q.length) ? '0' : '1';
    els.searchCursor.style.opacity = (focused && (Math.floor(t * 2.5) % 2 === 0)) ? '1' : '0';
    dropdown.style.display = (t >= 23.55 && t < 25.0) ? 'block' : 'none';

    /* ----- basic calculator (search target): pinned example + fill ----- */
    els.presBasic.style.display = t >= 26.1 ? 'block' : 'none';
    var bx = t >= 26.36 ? '5' : '';
    var by = t >= 26.5 ? '1000' : '';
    if (els.basicX.textContent !== bx) els.basicX.textContent = bx;
    if (els.basicY.textContent !== by) els.basicY.textContent = by;
    els.basicX.classList.toggle('glow', t >= 26.34 && t < 27.6);
    els.basicY.classList.toggle('glow', t >= 26.48 && t < 27.6);
    if (t >= 26.66) {
      els.basicZVal.textContent = '50';
      els.basicZ.classList.remove('empty');
    } else {
      els.basicZVal.textContent = 'Z';
      els.basicZ.classList.add('empty');
    }

    /* ----- FAQ page: scrub the car price 80000 → 90000, everything recomputes live ----- */
    var price = 80000;
    if (t >= 33.2) price = 90000;
    else if (t >= 32.48) price = Math.round(lerp(80000, 90000, easeIO(clamp((t - 32.48) / 0.72, 0, 1))) / 100) * 100;
    var priceS = String(price), depS = fmt(price * 0.15), remS = fmt(price * 0.85);
    if (els.tipBill.textContent !== priceS) {
      els.tipBill.textContent = priceS;
      els.detY.textContent = priceS; els.detY2.textContent = priceS;
      els.detW.textContent = priceS; els.detFy.textContent = priceS; els.detFy2.textContent = priceS;
      els.detFr.textContent = depS; els.detDep2.textContent = depS;
      els.detRem.textContent = remS; els.tipRes.textContent = remS;
    }
    els.tipBill.classList.toggle('glow', t >= 32.35 && t < 33.55);

    /* ----- SolutionCardHint: open on S3 entry, dismissed by the PU pin;
             its reflow (display flip) is hidden inside the 14.98 scroll.
             While the hint or any field tooltips are visible, the app hides
             the "read-only Answer/Result" label (fieldTooltipManager). ----- */
    els.hint.style.display = (t >= 9.26 && t < 15.1) ? 'block' : 'none';
    els.chgRlabel.style.opacity = (t >= 9.26 && t < 20.5) ? '0' : '';
    els.basicRlabel.style.opacity = (t >= 25.55 && t < 28.0) ? '0' : '';

    /* ----- camera shake: decaying sine after every hit + handheld drift ----- */
    var dx = 1.1 * Math.sin(t * 0.8), dy = 0.9 * Math.cos(t * 0.63), rot = 0.12 * Math.sin(t * 0.5);
    var env = 0;
    for (var i = 0; i < HITS.length; i++) {
      var dt = t - HITS[i][0];
      if (dt >= 0 && dt < 0.5) {
        var a = HITS[i][1];
        var decay = Math.exp(-9 * dt);
        dx += a * 10 * decay * Math.sin(34 * dt);
        dy += a * 7 * decay * Math.sin(27 * dt + 1.1);
        rot += a * 0.7 * decay * Math.sin(23 * dt + 0.5);
        env += a * Math.exp(-6 * dt);
      }
    }
    els.shaker.style.transform = 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px) rotate(' + rot.toFixed(3) + 'deg)';

    /* ----- EQ meter in the brand bar: idle wobble + spikes on hits ----- */
    for (var b = 0; b < els.eq.length; b++) {
      var base = 5.5 + 2.6 * Math.sin(t * (5.1 + b * 1.7) + b * 2.1) + 1.6 * Math.sin(t * 2.3 + b);
      var h = clamp(base + env * (9 + 3 * Math.sin(b * 2.7 + t)), 3, 18);
      els.eq[b].style.height = h.toFixed(1) + 'px';
    }
  }

  /* driver: GSAP must write this property on every render (even during
     event-suppressed seeks), so sync always tracks the playhead exactly. */
  var driver = { _p: 0 };
  Object.defineProperty(driver, 'p', {
    get: function () { return this._p; },
    set: function (v) { this._p = v; sync(v * DUR); }
  });
  tl.to(driver, { p: 1, duration: DUR, ease: 'none' }, 0);

  // prime every tween once (records start values and writes the same inline
  // residue a replay would), so the first monotonic play, forced full replays
  // and backward seeks all produce identical frames
  tl.progress(1, true);
  tl.progress(0, true);

  sync(0); // initial state

  window.__timelines['justpercent-foley'] = tl;
})();
