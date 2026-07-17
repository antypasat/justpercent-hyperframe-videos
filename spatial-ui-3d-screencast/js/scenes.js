/* ============================================================
   scenes.js — choreography for the JustPercent spatial screencast.
   Every visual state is a pure function of time t, driven by the
   seekable HFTimeline registered on window.__timelines.justpercent.

   Narrative (from the app's real behavior):
   1  cold open — "finding the right calculator is the hard part"
   2  homepage assembles (layer peeling in reverse)
   3  SolutionCard "rent hike" click → /percentage-change-calculator/
   4  Practical Use click → the app PINS it: the "Selected Practical
      Use Example" panel appears ABOVE the calculator form (exactly
      like practicalUsePinning.ts does) → THEN the values fill in
   5  theme flip light → dark (3D card flip)
   6  search "stock" → dropdown (Practical Uses → Related FAQs →
      Suggested solutions, the app's real order) → click → the page
      scrolls to the Value Decrease calculator, the pinned example
      appears above the form, values fill in
   7  FAQs hub → /faqs/weight-loss-percentage-calculator/ — live drag
   8  outro
   ============================================================ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const lerp = (a, b, p) => a + (b - a) * p;

  /* ================= scene graph handles ================= */
  const stage = $('stage');
  const camera = $('camera');
  const bgDark = $('bg-dark');
  const cursorEl = $('cursor');
  const cursorShadow = $('cursor-shadow');
  const ripple = $('ripple');
  const specular = $('specular');
  const outro = $('outro');
  const urlpill = $('urlpill');
  const urlPath = $('url-path');
  const presChg = $('pres-chg');
  const presBasic = $('pres-basic');

  const SCREENS = {
    home: $('scr-home'),
    calc: $('scr-calc'),
    hub: $('scr-hub'),
    tip: $('scr-tip'),
  };

  const LAYERS = {
    home: ['hl-nav', 'hl-h1', 'hl-search', 'hl-filter', 'hl-seclabel',
           'hl-card1', 'hl-card2', 'hl-card3', 'hl-card4', 'hl-card5', 'hl-card6',
           'hl-basic'].map($),
    calc: ['cl-nav', 'cl-hint', 'cl-card', 'cl-practical'].map($),
    hub: ['fl-nav', 'fl-h1', 'fl-controls', 'fl-cat', 'fl-hub1', 'fl-hub2', 'fl-hub3'].map($),
    tip: ['tl-nav', 'tl-h1', 'tl-card'].map($),
  };
  const IDX = { basic: 11 };                              // within LAYERS.home
  const FALL = [5, 6, 7, 8, 9, 10];                       // non-matching cards in scene 6 (none match "stock")

  /* move the search-results portal into the home screen, under the search box */
  const dropdown = $('dropdown');
  SCREENS.home.appendChild(dropdown);
  dropdown.style.position = 'absolute';
  dropdown.style.zIndex = '20';
  dropdown.hidden = false;
  dropdown.style.opacity = '0';

  /* ================= measure element positions =================
     Two passes over the untransformed layout:
       POS  — the page as loaded (presentation panels hidden)
       POSP — after "pinning" (presentation panels above the forms
              visible), i.e. the layout the app shows post-click.
     All coordinates are screen-local. */
  const POS = {};
  const POSP = {};
  const PRESH = { chg: 0, basic: 0 };
  function measure() {
    for (const key of Object.keys(SCREENS)) {
      const scr = SCREENS[key];
      scr.hidden = false;
      scr.style.transform = 'none';
      scr.style.display = 'block';
    }
    /* dropdown sits right below the search box (position it BEFORE measuring
       its rows, so their coordinates are the on-screen ones) */
    const s = $('hl-search').getBoundingClientRect();
    const h = SCREENS.home.getBoundingClientRect();
    const kk = h.width / SCREENS.home.offsetWidth;
    dropdown.style.top = ((s.bottom - h.top) / kk + 4) + 'px';
    dropdown.style.left = '10px';
    dropdown.style.right = '10px';

    for (const p of [presChg, presBasic]) {   // pass A = un-pinned layout
      p.style.display = 'none';
      p.style.maxHeight = '';
      p.style.marginBottom = '';
      p.style.opacity = '';
      p.style.transform = '';
    }
    /* pass A = post-navigation layout: the SolutionCardHint is still open
       (the app shows it until a Practical Use gets pinned) */
    $('hint-chg').style.display = 'block';

    function grab(map, id) {
      const el = $(id);
      const scr = el.closest('.screen');
      const r = el.getBoundingClientRect();
      const sr = scr.getBoundingClientRect();
      const k = sr.width / scr.offsetWidth;   // #view scale factor
      map[id] = {
        x: (r.left - sr.left + r.width / 2) / k,
        y: (r.top - sr.top + r.height / 2) / k,
        h: r.height / k,
        screen: scr.id,
      };
    }

    const wantA = [
      'hl-card6', 'card6-cta', 'hl-search', 'hl-basic', 'basic-x', 'basic-y', 'basic-z',
      'cl-card', 'chg-original', 'chg-new', 'chg-result', 'pu-inflation',
      'theme-toggle', 'dd-pu-tip', 'hub-tip', 'tip-pct', 'tip-result', 'cl-practical',
    ];
    for (const id of wantA) grab(POS, id);

    /* pass B: pinned layout (presentation panels shown, natural height;
       the SolutionCardHint is closed by the pin, like in the app) */
    $('hint-chg').style.display = 'none';
    for (const p of [presChg, presBasic]) {
      p.style.display = 'block';
      p.style.maxHeight = 'none';
      p.style.marginBottom = '16px';
      p.style.opacity = '1';
      p.style.transform = 'none';
    }
    PRESH.chg = presChg.getBoundingClientRect().height /
      (SCREENS.calc.getBoundingClientRect().width / SCREENS.calc.offsetWidth);
    PRESH.basic = presBasic.getBoundingClientRect().height /
      (SCREENS.home.getBoundingClientRect().width / SCREENS.home.offsetWidth);
    const wantB = [
      'cl-card', 'chg-original', 'chg-new', 'chg-result', 'pu-inflation',
      'theme-toggle', 'cl-practical',
      'hl-basic', 'basic-x', 'basic-y', 'basic-z',
    ];
    for (const id of wantB) grab(POSP, id);
    for (const p of [presChg, presBasic]) {
      p.style.display = 'none';
      p.style.maxHeight = '';
      p.style.marginBottom = '';
      p.style.opacity = '';
      p.style.transform = '';
    }
    $('hint-chg').style.display = 'block';
  }

  /* ================= mutable scene state ================= */
  const cam = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, shake: 0, punch: 0 };
  const scr = {}; // per-screen {on, x, y, z, ry, s, o}
  for (const k of Object.keys(SCREENS)) scr[k] = { on: 0, x: 0, y: 0, z: 0, ry: 0, s: 1.08, o: 1 };
  scr.home.on = 1;

  const cur = { x: 430, y: 1050, sx: 1, sy: 1, rot: 0, o: 0, press: 0 };
  let cx = 430, cy = 1050; // builder-time cursor position (reset per build)

  /* screen states. The screen's CSS transform is
       translateX(-50%+x) translateY(y) … scale(s)  with origin (50%, 480px),
     and transform functions apply right-to-left: the point is scaled about
     (215, 480) FIRST, then translated by y unscaled. So
       stageY = 480 + (localY - 480) * s + y
       → y = targetStage - 480 - (localY - 480) * s */
  const yFor = (map, id, targetStage, s) => targetStage - 480 - (map[id].y - 480) * s;

  let HOME1, HOME2, HOME4, CALC1, CALC2, CALC3, CALC4, HUB1, TIP1;
  function computeStates() {
    HOME1 = { y: 140, s: 1.2 };
    HOME2 = { y: yFor(POS, 'hl-card6', 610, 1.2), s: 1.2 };     // rent-hike card in view
    HOME4 = { y: yFor(POSP, 'hl-basic', 415, 1.05), s: 1.05 };  // whole pinned Value Decrease calc in frame
    CALC1 = { y: 140, s: 1.2 };
    CALC2 = { y: yFor(POS, 'pu-inflation', 600, 1.2), s: 1.2 }; // Practical Uses in view
    CALC3 = { y: yFor(POSP, 'cl-card', 415, 1.05), s: 1.05 };   // whole pinned calc in frame
    CALC4 = { y: yFor(POSP, 'theme-toggle', 690, 1.05), s: 1.05 }; // page bottom (theme toggle)
    HUB1 = { y: 140, s: 1.2 };
    TIP1 = { y: 140, s: 1.2 };
  }

  /* stage-space position of a measured element under a screen state
     (same right-to-left transform math as yFor: scale about (215,480)
     first, then the unscaled translateY) */
  function pt(id, st, map = POS) {
    const p = map[id];
    return {
      x: 270 + (p.x - 215) * st.s,
      y: 480 + (p.y - 480) * st.s + st.y,
    };
  }

  /* ================= timeline ================= */
  const tl = new HFTimeline({ paused: true });
  const E = HFEase;

  const setText = (t, el, str) => tl.set(t, () => { el.textContent = str; });
  const setCls = (t, el, cls, on) => tl.set(t, () => { el.classList.toggle(cls, on); });

  /* ============================================================
     buildAll() — measures the (font-final) layout and schedules the
     ENTIRE timeline. Runs at load, and once more after
     document.fonts.ready so all measurements are deterministic
     across page loads (frames are identical run-to-run).
     ============================================================ */
  function buildAll() {
  measure();
  computeStates();
  cx = 430; cy = 1050;
  tl.clear();

  /* ============================================================
     MASTER RESET — runs FIRST on every seek (inserted before all
     other tweens), re-establishing every mutable bit of state.
     Because each later tween/set writes absolute values in
     chronological order, seek(t) is a pure function of t in BOTH
     directions — scrubbing backward in a preview is fully safe.
     ============================================================ */
  tl.tween(0, 0.0001, () => {
    stage.classList.remove('dark');
    bgDark.style.opacity = '0';

    Object.assign(scr.home, { on: 1, x: 0, y: HOME1.y, z: -900, ry: 0, s: HOME1.s, o: 0 });
    Object.assign(scr.calc, { on: 0, x: 0, y: CALC1.y, z: 0, ry: 0, s: CALC1.s, o: 1 });
    Object.assign(scr.hub,  { on: 0, x: 0, y: HUB1.y,  z: 0, ry: 0, s: HUB1.s,  o: 1 });
    Object.assign(scr.tip,  { on: 0, x: 0, y: TIP1.y,  z: 0, ry: 0, s: TIP1.s,  o: 1 });
    Object.assign(cam, { x: 0, y: 0, z: -190, rx: 0, ry: 0, rz: 0, s: 1, shake: 0, punch: 0 });
    Object.assign(cur, { x: 430, y: 1050, sx: 1, sy: 1, rot: 0, o: 0, press: 0 });

    for (const key of Object.keys(LAYERS)) {
      for (const el of LAYERS[key]) { el.style.opacity = '0'; el.style.transform = 'none'; }
    }

    /* presentation panels ("Selected Practical Use Example") */
    for (const p of [presChg, presBasic]) {
      p.style.display = 'none';
      p.style.maxHeight = '0px';
      p.style.marginBottom = '0px';
      p.style.opacity = '0';
      p.style.transform = 'scale(0.1)';
    }

    /* percentage-change calculator */
    $('chg-original').textContent = ''; $('chg-original').classList.remove('glow');
    $('chg-new').textContent = ''; $('chg-new').classList.remove('glow');
    const st = $('chg-status'); st.textContent = 'is a change of:'; st.classList.remove('inc');
    const cr = $('chg-result'); cr.classList.add('empty'); cr.style.transform = ''; cr.style.boxShadow = '';
    $('chg-result-val').textContent = 'Change%';
    document.querySelector('#hl-card6 .jp-note').classList.remove('lifted');
    const pu = $('pu-inflation'); pu.classList.remove('hot', 'pinned');

    /* SolutionCardHint above the calculator (open until the pin closes it) +
       the "read-only Answer/Result" label it hides while visible */
    const hint = $('hint-chg');
    hint.style.display = 'block'; hint.style.opacity = '1'; hint.style.transform = 'none';
    $('chg-rlabel').style.opacity = '';

    /* basic calculator */
    $('basic-x').textContent = ''; $('basic-x').classList.remove('glow');
    $('basic-y').textContent = ''; $('basic-y').classList.remove('glow');
    const bzr = $('basic-z'); bzr.classList.add('empty'); bzr.style.transform = ''; bzr.style.boxShadow = '';
    $('basic-z-val').textContent = 'New';

    /* search */
    $('home-search').classList.remove('focused');
    $('search-typed').textContent = '';
    $('search-ghost').style.display = '';
    $('search-cursor').style.display = '';
    dropdown.style.opacity = '0'; dropdown.style.transform = '';
    $('dd-pu-tip').classList.remove('hover');

    /* weight-loss FAQ */
    const tp = $('tip-pct'); tp.textContent = '10'; tp.classList.remove('glow');
    const tr = $('tip-result'); tr.textContent = '18'; tr.style.transform = '';
    $('det-x').textContent = '10'; $('det-x2').textContent = '10';
    $('det-fx').textContent = '10'; $('det-fr').textContent = '18';

    /* screen-space chrome */
    urlPath.textContent = '';
    urlpill.style.opacity = '0'; urlpill.style.transform = 'translateX(-50%)';
    $('brandbar').style.opacity = '0';
    outro.style.opacity = '0'; outro.style.transform = '';
    $('head1').style.opacity = '0'; $('head2').style.opacity = '0';
    for (let i = 1; i <= 6; i++) { $('cap' + i).style.opacity = '0'; }
    $('chip-x').style.opacity = '0'; $('chip-y').style.opacity = '0';
    ripple.style.opacity = '0';
    specular.style.opacity = '0';
  }, 'linear');

  /* ---------- camera ---------- */
  function shake(t0, amp) {
    tl.tween(t0, 0.55, (p) => { cam.shake = amp * (1 - p); cam.punch = 0.035 * amp / 14 * (1 - p); }, 'outQuad');
  }

  /* ---------- cursor ---------- */
  function cursorTo(t0, d, x1, y1, arc = 40) {
    const x0 = cx, y0 = cy;
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.max(1, Math.hypot(dx, dy));
    const pxn = -dy / len, pyn = dx / len;      // perpendicular
    const cxx = mx + pxn * arc, cyy = my + pyn * arc;
    tl.tween(t0, d, (p) => {
      const q = 1 - p;
      cur.x = q * q * x0 + 2 * q * p * cxx + p * p * x1;
      cur.y = q * q * y0 + 2 * q * p * cyy + p * p * y1;
      cur.rot = Math.sin(p * Math.PI) * (dx > 0 ? 7 : -7);
    }, 'inOutCubic');
    cx = x1; cy = y1;
  }
  function click(t0, big = 14) {
    tl.tween(t0 - 0.22, 0.2, (p) => { cur.sx = cur.sy = lerp(1, 1.17, p); }, 'outCubic');
    tl.tween(t0 - 0.02, 0.09, (p) => { cur.sx = lerp(1.17, 0.8, p); cur.sy = lerp(1.17, 0.74, p); cur.rot = lerp(0, -9, p); cur.press = p; }, 'inQuad');
    tl.tween(t0 + 0.07, 0.5, (p) => { cur.sx = lerp(0.8, 1, p); cur.sy = lerp(0.74, 1, p); cur.rot = lerp(-9, 0, p); cur.press = 1 - p; }, 'outElastic');
    /* impact ripple at the cursor tip */
    tl.tween(t0, 0.55, (p) => {
      ripple.style.left = cur.x + 'px';
      ripple.style.top = cur.y + 'px';
      ripple.style.opacity = String(0.9 * (1 - p));
      ripple.style.transform = `scale(${lerp(0.25, 1.7, E.outCubic(p))})`;
    }, 'linear');
    shake(t0, big);
  }
  function cursorShow(t0, d = 0.4) { tl.tween(t0, d, (p) => { cur.o = p; }, 'outCubic'); }
  function cursorHide(t0, d = 0.4) { tl.tween(t0, d, (p) => { cur.o = 1 - p; }, 'outCubic'); }

  /* ---------- layer peeling ---------- */
  function peelIn(t0, layers, stagger = 0.08, dur = 0.62) {
    layers.forEach((el, i) => {
      tl.tween(t0 + i * stagger, dur, (p) => {
        const pb = E.outBack(p);
        const z = lerp(-520, 0, pb);
        const y = lerp(46, 0, pb);
        const rx = lerp(-14, 0, pb);
        el.style.transform = `translate3d(0, ${y}px, ${z}px) rotateX(${rx}deg)`;
        el.style.opacity = String(Math.min(1, p * 1.6));
      }, 'linear');
    });
  }
  function peelOut(t0, layers, stagger = 0.05, dur = 0.5) {
    layers.forEach((el, i) => {
      tl.tween(t0 + i * stagger, dur, (p) => {
        const pe = E.inCubic(p);
        const z = lerp(0, 340, pe);
        const y = lerp(0, -26, pe);
        const ry = lerp(0, i % 2 ? 16 : -16, pe);
        el.style.transform = `translate3d(0, ${y}px, ${z}px) rotateY(${ry}deg)`;
        el.style.opacity = String(1 - pe);
      }, 'linear');
    });
  }
  /* peel-out for layers that already fell into depth in scene 6 —
     they continue from their fallen pose instead of popping back */
  function peelOutFallen(t0, layers, stagger = 0.05, dur = 0.5) {
    layers.forEach((el, i) => {
      tl.tween(t0 + i * stagger, dur, (p) => {
        const pe = E.inCubic(p);
        el.style.transform = `translate3d(0, ${lerp(60, 90, pe)}px, ${lerp(-420, -800, pe)}px) rotateX(-18deg)`;
        el.style.opacity = String(0.25 * (1 - pe));
      }, 'linear');
    });
  }

  function screenOn(t, key) { tl.set(t, () => { scr[key].on = 1; }); }
  function screenOff(t, key) { tl.set(t, () => { scr[key].on = 0; }); }

  /* ---------- presentation panel ("Selected Practical Use Example") ----------
     Mirrors the app's 500ms ease-out grow: opacity 0→1, max-height 0→natural,
     margin-bottom 0→16px, scale(0.1)→scale(1) from the top center. */
  function presIn(t0, el, naturalH, d = 0.7) {
    tl.tween(t0, d, (p) => {
      const pe = E.outCubic(p);
      el.style.display = 'block';
      el.style.maxHeight = (naturalH * pe).toFixed(1) + 'px';
      el.style.marginBottom = (16 * pe).toFixed(1) + 'px';
      el.style.opacity = String(pe);
      el.style.transform = `scale(${lerp(0.1, 1, pe)})`;
    }, 'linear');
  }

  /* ---------- captions / headlines ---------- */
  function capInOut(el, t0, t1) {
    tl.tween(0, t0, () => { el.style.opacity = '0'; }, 'linear');   // hold hidden before entry (scrub-safe)
    tl.tween(t0, 0.55, (p) => {
      const pb = E.outBack(p);
      el.style.opacity = String(p);
      el.style.transform = `translateX(-50%) translateY(${lerp(34, 0, pb)}px) scale(${lerp(0.92, 1, pb)})`;
    }, 'linear');
    tl.tween(t1, 0.4, (p) => {
      el.style.opacity = String(1 - p);
      el.style.transform = `translateX(-50%) translateY(${lerp(0, -22, E.inCubic(p))}px)`;
    }, 'linear');
  }
  function sweep(t0, d = 0.9) {
    tl.tween(t0, d, (p) => {
      specular.style.opacity = String(Math.sin(p * Math.PI) * 0.85);
      specular.style.transform = `translateX(${lerp(-120, 120, p)}%)`;
    }, 'inOutQuad');
  }
  function urlSwap(t, path) {
    tl.tween(t, 0.3, (p) => {
      urlpill.style.transform = `translateX(-50%) scale(${1 + Math.sin(p * Math.PI) * 0.06})`;
    }, 'linear');
    tl.set(t + 0.12, () => { urlPath.textContent = path; });
  }

  /* ============================================================
     SCENE 1 — cold open (0.0 – 4.4) LIGHT
     ============================================================ */
  const frags = ['frag1', 'frag2', 'frag3', 'frag4', 'frag5', 'frag6', 'frag7', 'frag8'].map($);
  const FRAGP = [
    { x: 70, y: 210, z: -260, r: -14, vx: 26, vy: 34, vr: 24 },
    { x: 300, y: 160, z: -90, r: 9, vx: -30, vy: 26, vr: -18 },
    { x: 120, y: 590, z: -150, r: 6, vx: 24, vy: -30, vr: 15 },
    { x: 380, y: 470, z: -320, r: -20, vx: -20, vy: -26, vr: -26 },
    { x: 60, y: 430, z: -40, r: 14, vx: 30, vy: 20, vr: 20 },
    { x: 330, y: 640, z: -200, r: -8, vx: -26, vy: -20, vr: 30 },
    { x: 210, y: 130, z: -420, r: 22, vx: 18, vy: 30, vr: -22 },
    { x: 150, y: 730, z: -110, r: -5, vx: 28, vy: -22, vr: -14 },
  ];
  /* tumble continuously, then get pulled into depth as the app arrives */
  tl.tween(0, 5.4, (p, raw) => {
    const t = raw * 5.4;
    frags.forEach((el, i) => {
      const f = FRAGP[i];
      const drift = Math.sin(t * 0.7 + i * 1.7);
      const suck = t < 4.1 ? 0 : E.inCubic(Math.min(1, (t - 4.1) / 1.1));
      const x = f.x + f.vx * drift - (f.x - 215) * suck;
      const y = f.y + f.vy * Math.cos(t * 0.6 + i) - (f.y - 400) * suck;
      const z = f.z - 700 * suck;
      const r = f.r + f.vr * Math.sin(t * 0.5 + i * 2.1);
      el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${r}deg) rotateY(${(f.vr * 1.3) * Math.sin(t * 0.4 + i)}deg)`;
      el.style.opacity = String(Math.min(1, t * 1.4) * (1 - suck));
    });
  }, 'linear');

  const shards = ['shard1', 'shard2', 'shard3', 'shard4'].map($);
  const SHP = [
    { x: -20, y: 120, z: -420, r: 12 }, { x: 420, y: 260, z: -560, r: -9 },
    { x: 40, y: 700, z: -500, r: 7 }, { x: 400, y: 640, z: -360, r: -14 },
  ];
  tl.tween(0, 40.0, (p, raw) => {
    const t = raw * 40.0;
    shards.forEach((el, i) => {
      const s = SHP[i];
      const x = s.x + 20 * Math.sin(t * 0.22 + i * 2);
      const y = s.y + 26 * Math.sin(t * 0.17 + i * 1.2);
      const r = s.r + 8 * Math.sin(t * 0.12 + i);
      el.style.transform = `translate3d(${x}px, ${y}px, ${s.z}px) rotateZ(${r}deg)`;
      /* stronger presence in the open & outro, subtle mid-film */
      const amb = (t < 5 || t > 36.5) ? 0.9 : 0.4;
      el.style.opacity = String(amb);
    });
  }, 'linear');

  /* persistent bottom brand bar (logo + domain) */
  const brandbar = $('brandbar');
  tl.tween(0, 1.0, () => { brandbar.style.opacity = '0'; }, 'linear');   // scrub-safe hold
  tl.tween(1.0, 0.7, (p) => {
    const pb = E.outBack(p);
    brandbar.style.opacity = String(p);
    brandbar.style.transform = `translateX(-50%) translateY(${lerp(26, 0, pb)}px)`;
  }, 'linear');
  tl.tween(37.9, 0.5, (p) => {
    brandbar.style.opacity = String(1 - p);
    brandbar.style.transform = `translateX(-50%) translateY(${18 * E.inCubic(p)}px)`;
  }, 'linear');

  /* headlines — sequential, never simultaneous */
  const head1 = $('head1'), head2 = $('head2');
  tl.tween(0.5, 0.55, (p) => {
    const pb = E.outBack(p);
    head1.style.opacity = String(p);
    head1.style.transform = `translateX(-50%) translateY(${lerp(30, 0, pb)}px) scale(${lerp(0.93, 1, pb)})`;
  }, 'linear');
  tl.tween(2.05, 0.35, (p) => {
    head1.style.opacity = String(1 - p);
    head1.style.transform = `translateX(-50%) translateY(${-20 * E.inCubic(p)}px) scale(${1 - 0.05 * p})`;
  }, 'linear');
  tl.tween(2.45, 0.55, (p) => {
    const pb = E.outBack(p);
    head2.style.opacity = String(p);
    head2.style.transform = `translateX(-50%) translateY(${lerp(30, 0, pb)}px) scale(${lerp(0.93, 1, pb)})`;
  }, 'linear');
  tl.tween(4.0, 0.4, (p) => {
    head2.style.opacity = String(1 - p);
    head2.style.transform = `translateX(-50%) translateY(${-20 * E.inCubic(p)}px) scale(${1 - 0.05 * p})`;
  }, 'linear');

  /* slow dolly-in from deep space */
  tl.tween(0, 4.6, (p) => { cam.z = lerp(-190, 0, p); }, 'inOutQuad');

  /* ============================================================
     SCENE 2 — homepage assembles (4.4 – 8.6)
     ============================================================ */
  tl.tween(0, 4.5, () => { urlpill.style.opacity = '0'; }, 'linear');   // scrub-safe hold
  tl.set(4.4, () => { scr.home.z = 0; scr.home.o = 1; scr.home.y = HOME1.y; });
  peelIn(4.5, LAYERS.home.slice(0, 11), 0.075, 0.66);
  peelIn(5.4, [LAYERS.home[IDX.basic]], 0, 0.6);   /* the calculator card assembles below the fold */
  tl.tween(4.5, 0.8, (p) => { urlpill.style.opacity = String(p); urlpill.style.transform = 'translateX(-50%)'; }, 'outCubic');
  sweep(5.7);
  capInOut($('cap1'), 6.0, 8.3);

  /* ============================================================
     SCENE 3 — SolutionCard "rent hike" → /percentage-change-calculator/
     (8.6 – 15.6)
     ============================================================ */
  cursorShow(8.7);
  /* scroll down the homepage — the rent-hike card comes into view */
  tl.tween(8.75, 0.95, (p) => {
    scr.home.y = lerp(HOME1.y, HOME2.y, p);
    cam.rx = Math.sin(p * Math.PI) * -2.6;
  }, 'inOutCubic');
  /* aim at the card's "See % Change" CTA button, not the card center */
  const ctaPt = pt('card6-cta', HOME2);
  cursorTo(8.95, 1.0, ctaPt.x + 42, ctaPt.y + 2, 60);
  /* hover: the card lifts toward the camera */
  const card6note = document.querySelector('#hl-card6 .jp-note');
  setCls(9.95, card6note, 'lifted', true);
  tl.tween(9.95, 0.45, (p) => {
    LAYERS.home[10].style.transform = `translate3d(0, 0, ${lerp(0, 46, E.outCubic(p))}px)`;
  }, 'linear');
  tl.tween(9.9, 0.7, (p) => { cam.s = lerp(1, 1.015, p); }, 'inOutQuad');

  click(10.55, 16);

  /* homepage peels apart; calculator page flies in */
  peelOut(10.7, LAYERS.home, 0.05, 0.5);
  screenOff(11.5, 'home');
  screenOn(11.1, 'calc');
  tl.set(11.1, () => { scr.calc.y = CALC1.y; scr.calc.s = CALC1.s; scr.calc.o = 1; LAYERS.calc.forEach((el) => { el.style.opacity = '0'; }); });
  /* while the SolutionCardHint is open the app hides the "read-only
     Answer/Result" label (SolutionCardHint.astro hideReadOnlyLabels) */
  tl.set(11.1, () => { $('chg-rlabel').style.opacity = '0'; });
  tl.tween(10.7, 0.9, (p) => { cam.s = lerp(1.045, 1, p); }, 'inOutQuad');
  peelIn(11.25, LAYERS.calc, 0.12, 0.62);
  urlSwap(11.35, '/percentage-change-calculator/');
  cursorHide(10.9); /* step aside while the page builds */

  /* typing 2000 → 2200 (the rent-hike card's own example values) */
  const chgO = $('chg-original'), chgN = $('chg-new');
  const chgRes = $('chg-result'), chgResVal = $('chg-result-val'), chgStatus = $('chg-status');
  setCls(12.4, chgO, 'glow', true);
  ['2', '20', '200', '2000'].forEach((s, i) => setText(12.45 + i * 0.13, chgO, s));
  setCls(13.05, chgO, 'glow', false);
  setCls(13.1, chgN, 'glow', true);
  ['2', '22', '220', '2200'].forEach((s, i) => setText(13.15 + i * 0.13, chgN, s));
  setCls(13.75, chgN, 'glow', false);
  /* live status + purple answer pop */
  tl.set(13.8, () => {
    chgStatus.textContent = 'is an INCREASE of';
    chgStatus.classList.add('inc');
    chgRes.classList.remove('empty');
    chgResVal.textContent = '10%';
  });
  tl.tween(13.8, 0.6, (p) => {
    const pb = E.outBack(p);
    chgRes.style.transform = `scale(${lerp(0.7, 1, pb)})`;
    chgRes.style.boxShadow = `2px 2px 5px rgba(0,0,0,0.08), -2px -2px 5px rgba(255,255,255,0.8), 0 0 ${lerp(26, 0, p)}px rgba(124,58,237,${0.55 * (1 - p)})`;
  }, 'linear');
  capInOut($('cap2'), 13.0, 15.4);

  /* ============================================================
     SCENE 4 — Practical Use click → PIN → panel above the form →
     values fill (15.6 – 22.0). The app's mandatory order:
     (a) click, (b) "Selected Practical Use Example" appears above
     the calculator, (c) inputs fill and the answer recalculates.
     ============================================================ */
  /* 3D scroll down to Practical Uses, with a gentle punch-in */
  tl.tween(15.7, 1.05, (p) => {
    scr.calc.y = lerp(CALC1.y, CALC2.y, p);
    cam.rx = Math.sin(p * Math.PI) * -3.6;
    cam.s = lerp(1, 1.02, p);
  }, 'inOutCubic');

  cursorShow(16.7);
  const puPt = pt('pu-inflation', CALC2);
  cursorTo(16.75, 0.95, puPt.x + 30, puPt.y + 8, -50);
  setCls(17.6, $('pu-inflation'), 'hot', true);
  /* (a) the click */
  click(17.95, 12);
  setCls(18.0, $('pu-inflation'), 'pinned', true);
  cursorHide(18.35);

  /* pinning closes the SolutionCardHint (practicalUsePinning.ts
     closeSolutionCardHint: 250ms fade, then display:none) and restores
     the "read-only Answer/Result" label */
  const hintChg = $('hint-chg');
  tl.tween(18.0, 0.25, (p) => {
    hintChg.style.opacity = String(1 - p);
    hintChg.style.transform = `translateY(${-8 * p}px)`;
  }, 'linear');
  tl.set(18.3, () => { hintChg.style.display = 'none'; $('chg-rlabel').style.opacity = ''; });

  /* (b) re-frame FIRST so the whole calculator (panel + form + answer)
     is in shot — like the app, the scroll completes BEFORE the pinned
     example unfolds (capture-after-scroll, same rule as scene 6) */
  tl.tween(18.1, 0.95, (p) => {
    scr.calc.y = lerp(CALC2.y, CALC3.y, p);
    scr.calc.s = lerp(CALC2.s, CALC3.s, p);
    cam.rx = Math.sin(p * Math.PI) * 2.8;
    cam.s = lerp(1.02, 1, p);
  }, 'inOutCubic');
  /* scroll has fully settled → the pinned example unfolds ABOVE the
     form, fully in frame, exactly like practicalUsePinning.ts */
  presIn(19.15, presChg, PRESH.chg + 26, 0.7);
  sweep(19.3, 0.8);

  /* (c) value chips fly from the pinned example into the inputs */
  const chipX = $('chip-x'), chipY = $('chip-y');
  const presPt = { x: 270, y: 480 + (POSP['cl-card'].y - POSP['cl-card'].h / 2 + 70 - 480) * CALC3.s + CALC3.y };
  const inOPt = pt('chg-original', CALC3, POSP), inNPt = pt('chg-new', CALC3, POSP);
  function flyChip(el, t0, from, to) {
    tl.tween(t0, 0.75, (p) => {
      const pe = E.inOutCubic(p);
      const x = lerp(from.x, to.x, pe);
      const y = lerp(from.y, to.y, pe) - Math.sin(p * Math.PI) * 70;
      el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.opacity = String(p < 0.9 ? Math.min(1, p * 4) : (1 - (p - 0.9) * 10));
      el.style.transform = `translate(-50%, -50%) scale(${lerp(0.6, 1.05, pe)})`;
    }, 'linear');
  }
  flyChip(chipX, 20.1, { x: presPt.x - 70, y: presPt.y }, inOPt);
  flyChip(chipY, 20.25, { x: presPt.x + 40, y: presPt.y }, inNPt);
  setText(20.8, chgO, '100');
  setText(20.95, chgN, '103');
  tl.set(21.1, () => { chgResVal.textContent = '3%'; });
  tl.tween(21.1, 0.55, (p) => {
    const pb = E.outBack(p);
    chgRes.style.transform = `scale(${lerp(0.75, 1, pb)})`;
    chgRes.style.boxShadow = `2px 2px 5px rgba(0,0,0,0.08), -2px -2px 5px rgba(255,255,255,0.8), 0 0 ${lerp(24, 0, p)}px rgba(124,58,237,${0.5 * (1 - p)})`;
  }, 'linear');
  capInOut($('cap3'), 20.3, 21.8);

  /* ============================================================
     SCENE 5 — theme flip light → dark (22.0 – 24.8)
     ============================================================ */
  /* glide to the page bottom where the (real, fixed) theme toggle lives */
  tl.tween(21.95, 0.75, (p) => {
    scr.calc.y = lerp(CALC3.y, CALC4.y, p);
    cam.rx = Math.sin(p * Math.PI) * -2.2;
  }, 'inOutCubic');
  cursorShow(22.0);
  const togPt = pt('theme-toggle', CALC4, POSP);
  cursorTo(22.05, 0.7, togPt.x, togPt.y, 40);
  click(22.9, 8);
  /* card-flip of the whole page */
  tl.tween(22.95, 0.8, (p) => { cam.s = lerp(1.0, 0.98, Math.sin(p * Math.PI)); }, 'inOutQuad');
  tl.tween(23.05, 0.5, (p) => { scr.calc.ry = lerp(0, 92, p); }, 'inCubic');
  tl.set(23.55, () => { stage.classList.add('dark'); });
  tl.tween(23.55, 0.55, (p) => { scr.calc.ry = lerp(-92, 0, p); }, 'outCubic');
  tl.tween(23.25, 0.9, (p) => { bgDark.style.opacity = String(p); }, 'inOutQuad');
  sweep(23.45, 1.0);
  cursorHide(23.15);
  capInOut($('cap4'), 23.75, 25.0);

  /* ============================================================
     SCENE 6 — search "stock" → dropdown → scroll to the calculator →
     pinned example above the form → values fill (24.9 – 33.1) DARK
     ============================================================ */
  peelOut(25.0, LAYERS.calc, 0.06, 0.45);
  screenOff(25.6, 'calc');
  screenOn(25.4, 'home');
  tl.set(25.4, () => {
    scr.home.y = HOME1.y; scr.home.s = HOME1.s; scr.home.o = 1; scr.home.z = 0;
    LAYERS.home.forEach((el) => { el.style.opacity = '0'; el.style.transform = 'translate3d(0,46px,-520px)'; });
    /* fresh page state: nothing pinned yet */
    $('pu-inflation').classList.remove('hot', 'pinned');
  });
  peelIn(25.5, LAYERS.home.slice(0, 11), 0.055, 0.5);
  peelIn(26.1, [LAYERS.home[IDX.basic]], 0, 0.5);
  urlSwap(25.55, '');

  const searchPt = pt('hl-search', HOME1);
  cursorShow(26.15);
  cursorTo(26.2, 0.75, searchPt.x + 30, searchPt.y + 6, 45);
  click(27.05, 10);
  const searchInput = $('home-search');
  const typed = $('search-typed'), ghost = $('search-ghost'), tcur = $('search-cursor');
  setCls(27.1, searchInput, 'focused', true);
  tl.set(27.1, () => { ghost.style.display = 'none'; });
  ['s', 'st', 'sto', 'stoc', 'stock'].forEach((s, i) => setText(27.35 + i * 0.15, typed, s));
  tl.set(28.0, () => { tcur.style.display = 'none'; });

  /* results dropdown springs open — Practical Uses → Related FAQs →
     Suggested solutions (the app's real section order) */
  tl.tween(28.05, 0.5, (p) => {
    const pb = E.outBack(p);
    dropdown.style.opacity = String(p);
    dropdown.style.transform = `translateY(${lerp(-14, 0, pb)}px) scale(${lerp(0.94, 1, pb)})`;
  }, 'linear');

  /* the non-matching solution cards fall away into depth (none match "stock") */
  FALL.forEach((idx, i) => {
    tl.tween(28.15 + i * 0.05, 0.6, (p) => {
      const pe = E.inCubic(p);
      LAYERS.home[idx].style.transform = `translate3d(0, ${lerp(0, 60, pe)}px, ${lerp(0, -420, pe)}px) rotateX(${lerp(0, -18, pe)}deg)`;
      LAYERS.home[idx].style.opacity = String(1 - 0.75 * pe);
    }, 'linear');
  });

  const ddPt = pt('dd-pu-tip', HOME1);
  cursorTo(28.55, 0.6, ddPt.x + 20, ddPt.y + 8, -35);
  setCls(28.95, $('dd-pu-tip'), 'hover', true);
  click(29.25, 12);
  cursorHide(29.5);

  /* dropdown closes; the page scrolls until the Value Decrease
     calculator stands fully in frame (the scroll finishes COMPLETELY
     before anything else happens — capture-after-scroll rule) */
  tl.tween(29.35, 0.35, (p) => { dropdown.style.opacity = String(1 - p); }, 'linear');
  tl.set(29.35, () => { typed.textContent = 'stock'; });
  tl.tween(29.5, 1.2, (p) => {
    scr.home.y = lerp(HOME1.y, HOME4.y, p);
    scr.home.s = lerp(HOME1.s, HOME4.s, p);
    cam.rx = Math.sin(p * Math.PI) * -4;
  }, 'inOutCubic');

  /* scroll has fully settled → the pinned "Stock Price Drop" example
     appears ABOVE the form, then the values pour in: $45 − 12% → $39.60 */
  presIn(30.85, presBasic, PRESH.basic + 26, 0.7);
  const bx = $('basic-x'), by = $('basic-y'), bz = $('basic-z'), bzv = $('basic-z-val');
  setCls(31.7, bx, 'glow', true);
  ['4', '45'].forEach((s, i) => setText(31.75 + i * 0.12, bx, s));
  setCls(32.05, bx, 'glow', false);
  setCls(32.07, by, 'glow', true);
  ['1', '12'].forEach((s, i) => setText(32.11 + i * 0.12, by, s));
  setCls(32.4, by, 'glow', false);
  tl.set(32.5, () => { bz.classList.remove('empty'); bzv.textContent = '39.60'; });
  tl.tween(32.5, 0.55, (p) => {
    const pb = E.outBack(p);
    bz.style.transform = `scale(${lerp(0.75, 1, pb)})`;
    bz.style.boxShadow = `2px 2px 5px rgba(0,0,0,0.3), -2px -2px 5px rgba(255,255,255,0.05), 0 0 ${lerp(24, 0, p)}px rgba(168,85,247,${0.55 * (1 - p)})`;
  }, 'linear');
  capInOut($('cap5'), 30.9, 33.0);

  /* ============================================================
     SCENE 7 — FAQs: a calculator with an explanation (33.1 – 38.0)
     ============================================================ */
  const notFallen = LAYERS.home.filter((_, i) => !FALL.includes(i));
  peelOut(33.15, notFallen, 0.045, 0.42);
  peelOutFallen(33.15, FALL.map((i) => LAYERS.home[i]), 0.045, 0.42);
  screenOff(33.75, 'home');
  screenOn(33.55, 'hub');
  tl.set(33.55, () => {
    scr.hub.y = HUB1.y; scr.hub.o = 1;
    LAYERS.hub.forEach((el) => { el.style.opacity = '0'; });
  });
  peelIn(33.65, LAYERS.hub, 0.08, 0.5);
  urlSwap(33.75, '/faqs/');

  const hubPt = pt('hub-tip', HUB1);
  cursorShow(34.15);
  cursorTo(34.2, 0.7, hubPt.x + 40, hubPt.y + 10, 50);
  click(35.0, 12);

  peelOut(35.1, LAYERS.hub, 0.045, 0.4);
  screenOff(35.65, 'hub');
  screenOn(35.45, 'tip');
  tl.set(35.45, () => {
    scr.tip.y = TIP1.y; scr.tip.o = 1;
    LAYERS.tip.forEach((el) => { el.style.opacity = '0'; });
  });
  peelIn(35.55, LAYERS.tip, 0.09, 0.5);
  urlSwap(35.65, '/faqs/weight-loss-percentage-calculator/');
  sweep(35.9, 0.8);

  /* drag the goal % — the whole FAQ recalculates live */
  const tipPct = $('tip-pct'), tipRes = $('tip-result');
  const detX = $('det-x'), detX2 = $('det-x2'), detFx = $('det-fx'), detFr = $('det-fr');
  const tipPt = pt('tip-pct', TIP1);
  tl.tween(36.0, 0.9, (p) => { cam.s = lerp(1, 1.025, p); }, 'inOutQuad');
  cursorTo(36.0, 0.55, tipPt.x + 6, tipPt.y + 2, 30);
  /* press & hold */
  tl.tween(36.55, 0.12, (p) => { cur.sx = cur.sy = lerp(1, 0.86, p); cur.press = p; }, 'inQuad');
  setCls(36.6, tipPct, 'glow', true);
  shake(36.6, 6);
  /* drag right: 10 → 15, answer 18 → 27 lb (180 × pct/100), explanation follows */
  const steps = [11, 12, 13, 14, 15];
  const results = ['19.8', '21.6', '23.4', '25.2', '27'];
  tl.tween(36.7, 1.0, (p) => { cur.x = tipPt.x + 6 + 78 * p; cur.y = tipPt.y + 2 + Math.sin(p * 9) * 1.5; }, 'inOutQuad');
  cx = tipPt.x + 84; cy = tipPt.y + 2;
  steps.forEach((v, i) => {
    const t = 36.73 + (i / (steps.length - 1)) * 0.95;
    tl.set(t, () => {
      tipPct.textContent = String(v);
      tipRes.textContent = results[i];
      detX.textContent = detX2.textContent = detFx.textContent = String(v);
      detFr.textContent = results[i];
    });
  });
  /* release */
  tl.tween(37.7, 0.35, (p) => { cur.sx = cur.sy = lerp(0.86, 1, p); cur.press = 1 - p; }, 'outCubic');
  setCls(37.75, tipPct, 'glow', false);
  tl.tween(37.75, 0.5, (p) => {
    const pb = E.outBack(p);
    tipRes.style.transform = `scale(${lerp(0.8, 1, pb)})`;
  }, 'linear');
  capInOut($('cap6'), 36.0, 38.1);
  cursorHide(37.9);

  /* ============================================================
     SCENE 8 — outro (38.0 – 40.0)
     ============================================================ */
  tl.tween(38.1, 1.0, (p) => {
    const pe = E.inOutCubic(p);
    scr.tip.z = lerp(0, -760, pe);
    scr.tip.y = lerp(TIP1.y, TIP1.y + 60, pe);
    scr.tip.o = 1 - 0.94 * pe;
    scr.tip.ry = lerp(0, -12, pe);
    cam.s = lerp(1.025, 1, pe);
  }, 'linear');
  tl.tween(0, 38.4, () => { outro.style.opacity = '0'; }, 'linear');   // scrub-safe hold
  tl.tween(38.4, 0.8, (p) => {
    const pb = E.outBack(p);
    outro.style.opacity = String(p);
    outro.style.transform = `translateY(${lerp(36, 0, pb)}px) scale(${lerp(0.94, 1, pb)})`;
  }, 'linear');
  tl.tween(38.5, 1.3, (p) => { urlpill.style.opacity = String(1 - p); }, 'linear');
  sweep(38.9, 1.1);
  tl.tween(38.4, 1.6, (p) => { cam.z = lerp(0, 40, p); }, 'inOutQuad');
  /* hold the end card */
  tl.tween(39.6, 0.4, () => {}, 'linear');

  /* ============================================================
     continuous camera sway + FINAL APPLIER (runs last every seek)
     ============================================================ */
  tl.tween(0, 40.0, (p, raw) => {
    const t = raw * 40.0;

    /* gentle handheld parallax all film long */
    const swayRY = 1.3 * Math.sin(t * 0.42) + 0.5 * Math.sin(t * 0.9 + 2);
    const swayRX = 0.9 * Math.sin(t * 0.31 + 1.2);
    const swayX = 3 * Math.sin(t * 0.24 + 0.5);
    const swayY = 3 * Math.sin(t * 0.19 + 2.1);

    /* impact shake noise (amplitude driven by cam.shake) */
    const n1 = Math.sin(t * 97.3) + 0.55 * Math.sin(t * 61.7 + 1.3);
    const n2 = Math.cos(t * 83.7 + 0.7) + 0.45 * Math.sin(t * 53.1);
    const shX = cam.shake * 0.95 * n1;
    const shY = cam.shake * 0.75 * n2;
    const shR = cam.shake * 0.05 * Math.sin(t * 77.7);

    camera.style.transform =
      `translate3d(${cam.x + swayX + shX}px, ${cam.y + swayY + shY}px, ${cam.z}px) ` +
      `rotateX(${cam.rx + swayRX}deg) rotateY(${cam.ry + swayRY}deg) rotateZ(${cam.rz + shR}deg) ` +
      `scale(${cam.s + cam.punch})`;

    /* screens */
    for (const key of Object.keys(SCREENS)) {
      const el = SCREENS[key], st = scr[key];
      if (!st.on) { el.style.display = 'none'; continue; }
      el.style.display = 'block';
      el.hidden = false;
      el.style.transformOrigin = '50% 480px';
      el.style.transform =
        `translateX(calc(-50% + ${st.x}px)) translateY(${st.y}px) translateZ(${st.z}px) ` +
        `rotateY(${st.ry}deg) scale(${st.s})`;
      el.style.opacity = String(st.o);
    }

    /* cursor + its contact shadow */
    cursorEl.style.opacity = String(cur.o);
    cursorEl.style.transform = `translate(${cur.x}px, ${cur.y}px) rotate(${cur.rot}deg) scale(${cur.sx}, ${cur.sy})`;
    cursorShadow.style.opacity = String(cur.o * (0.35 + 0.55 * cur.press));
    cursorShadow.style.transform = `translate(${cur.x}px, ${cur.y + 44 - 10 * cur.press}px) scale(${1 + 0.5 * cur.press})`;
  }, 'linear');

  }  /* end buildAll() */

  /* ================= register (HyperFrames contract) ================= */
  window.__timelines = window.__timelines || {};
  window.__timelines.justpercent = tl;

  /* initial state (fallback-font layout, corrected below) */
  buildAll();
  tl.seek(0);

  /* Re-measure + rebuild once the app's real fonts are in — layout
     depends on font metrics, so this keeps every frame a pure,
     reproducible function of t across page loads. The renderer/preview
     waits for document.fonts.ready before capturing, so captures always
     see the font-final timeline. */
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      const t = tl.time();
      buildAll();
      tl.seek(t);
    });
  }

  /* browser preview: open composition/index.html?preview */
  if (typeof location !== 'undefined' && /[?&]preview/.test(location.search)) {
    window.addEventListener('load', () => tl.play());
  }
})();
