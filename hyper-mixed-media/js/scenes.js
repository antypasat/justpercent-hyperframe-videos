/* ============================================================
   scenes.js — JustPercent "Hyper-Mixed Media" teaser (36 s, 1080×1920)

   Deterministic, FULLY bidirectional timeline:
   - every tween is replayed with clamped progress on every seek
     (see lib/timeline.js), so seek(t) is a pure function of t;
   - discrete states (screens, URL, theme, text values) are computed
     by pure drive(t) functions — no stored state, no wall clock;
   - all randomness is seeded (HFRnd1) and keyed by frame index.

   Chain rule used below: when several tweens write the SAME property,
   only the FIRST one in insertion order defines the p=0 base state;
   later tweens skip their p===0 apply (the earlier writer already
   covers that time range on every seek). This keeps scrubbing exact
   in both directions.
   ============================================================ */
(function () {
  'use strict';

  const DUR = 36;
  const PHONE = { x: 20, y: 60, w: 500, h: 700 };
  const SCALE = 1.16279;             // 430-space -> phone px
  const VIEW_H = 602;                // phone viewport height in 430-space

  const $ = (s) => document.querySelector(s);
  const lerp = (a, b, p) => a + (b - a) * p;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const px = (v) => v.toFixed(2) + 'px';
  const E = window.HFEase;
  const rnd = window.HFRnd1;

  /* ---------- timing (seconds) ---------- */
  const T = {
    chips: 0.30,
    head1In: 0.50, head1Out: 2.05,
    head2In: 2.35, head2Out: 3.70,
    burst0: 3.95,
    phoneIn: 4.00,
    urlIn: 4.50,
    cap1: [5.00, 9.20],
    scroll1: [5.40, 6.80],
    marker1: 7.00,
    hand1: { start: 7.40, tap: 8.50, end: 9.20 },
    burst1: 9.50,
    wipe1: [9.40, 10.30], wipe1Mid: 9.87,
    decFill: 9.87,
    countUp1: [10.40, 11.00],
    cap2: [10.60, 13.20],
    scroll2: [11.80, 12.90],
    hand2: { start: 13.00, tap: 13.95, end: 14.60 },
    scrollBack: [14.20, 14.90],
    /* pin presentation must grow ON-SCREEN, after scrollBack settles —
       if it grows during the scroll the viewer never sees it appear */
    presDec: [15.05, 15.65],
    cap3: [14.40, 17.60],
    puFillX: [16.05, 16.75],
    puFillY: [16.35, 17.05],
    puAns: [16.55, 17.45],
    burst2: 17.90,
    wipe2: [17.80, 18.70], wipe2Mid: 18.28,
    focus: 18.90,
    type: [19.20, 19.50, 19.80, 20.10],
    cap4: [19.20, 23.40],
    ddIn: 20.30, ddOut: 21.90, ddGone: 22.15,
    hand3: { start: 20.90, tap: 21.75, end: 22.40 },
    pinShow: 23.35,           /* presentation pops AFTER scroll3 lands (same rule as presDec) */
    scroll3: [22.00, 23.30],
    settleHoldEnd: 24.60,
    flip: [24.60, 26.00], flipMid: 25.30,
    burst3: 25.05,
    cap5: [26.10, 27.40],
    scrollHub: [26.40, 27.00],
    hand4: { start: 27.20, tap: 27.95, end: 28.50 },
    burst4: 28.00, tipSwitch: 28.15,
    cap6: [28.60, 32.20],
    scrollTip: [29.00, 29.45],
    faqEdit: [29.40, 30.40],
    marker2: 30.80,
    burst5: 32.30,
    phoneOut: [32.30, 33.00],
    outroIn: 32.70,
    brandOut: 32.50,
    urlOut: 32.20,
  };

  /* ---------- element refs ---------- */
  const els = {};
  function grab() {
    ['stage', 'phone', 'phone-tilt', 'wipe', 'glitch', 'flash', 'hand', 'ripple',
     'urlpill', 'url-path', 'brandbar', 'outro',
     'head1', 'head2', 'chip1', 'chip2', 'chip3',
     'cap1', 'cap2', 'cap3', 'cap4', 'cap5', 'cap6',
     'scr-home', 'scr-calc', 'scr-hub', 'scr-tip',
     'home-search', 'search-typed', 'search-ghost', 'search-cursor',
     'dropdown', 'dd-pu-tip',
     'card-coupon', 'cta-coupon', 'marker-coupon', 'marker-coupon-path',
     'hl-basic', 'pres-basic', 'basic-x', 'basic-y', 'basic-z', 'basic-z-val',
     'cl-card', 'cl-practical', 'pres-dec', 'hint-calc',
     'dec-original', 'dec-decrease', 'dec-new', 'dec-new-val',
     'pu-sale', 'hub-tip',
     'tl-card', 'tip-bill', 'tip-pct', 'tip-result', 'tip-ansline',
     'det-y', 'det-y2', 'det-fy', 'det-fr',
     'marker-answer', 'marker-answer-path',
     'app-bg-light', 'app-bg-dark',
    ].forEach((id) => { els[id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())] = document.getElementById(id); });
    els.couponNote = els.cardCoupon.querySelector('.jp-note');
    els.decRlabel = els.decNew.querySelector('.rlabel');
  }

  /* ---------- geometry (measured; rebuilt after fonts load) ---------- */
  const G = {};
  function measure() {
    const screens = [els.scrHome, els.scrCalc, els.scrHub, els.scrTip];
    const prevDisp = screens.map((s) => s.style.display);
    screens.forEach((s) => { s.style.display = 'block'; });
    /* measure() can run at any timeline state (fonts re-run) — a phone
       mid pop-in/flip is scaled/rotated and would skew every rect */
    const prevTf = [els.phoneTilt.style.transform, els.phone.style.transform];
    els.phoneTilt.style.transform = 'none';
    els.phone.style.transform = 'none';
    const prevPres = [els.presBasic.style.cssText, els.presDec.style.cssText];
    els.presBasic.style.cssText = 'display:none';
    els.presDec.style.cssText = 'display:none';
    /* the search dropdown is display:none outside its beat (a re-measure after
       fonts load would read all-zero rects → garbage tap target); the hint is
       OPEN during the scroll-down + PU tap, so pass 1 measures with it shown */
    const prevDd = els.dropdown.style.cssText;
    els.dropdown.style.cssText = 'display:block;transform:none';
    const prevHint = els.hintCalc.style.cssText;
    els.hintCalc.style.cssText = 'display:block';

    const sAll = 2 * SCALE;          // #view scale(2) × phone scale
    const rel = (el, root) => {
      const a = el.getBoundingClientRect(), b = root.getBoundingClientRect();
      return { x: (a.left - b.left) / sAll, y: (a.top - b.top) / sAll,
               w: a.width / sAll, h: a.height / sAll };
    };
    const H = (sec) => sec.getBoundingClientRect().height / sAll;

    /* --- pass 1: presentation panels COLLAPSED (their state at the time
       these anchors are used on screen) --- */
    G.homeH = H(els.scrHome); G.calcH = H(els.scrCalc);
    G.hubH = H(els.scrHub);  G.tipH = H(els.scrTip);

    const coupon = rel(els.cardCoupon, els.scrHome);
    const couponCta = rel(els.ctaCoupon, els.scrHome);
    const basicCard = rel(els.hlBasic.querySelector('.jp-calc'), els.scrHome);
    const puList = rel(els.clPractical, els.scrCalc);
    const puSale = rel(els.puSale, els.scrCalc);
    const decCard = rel(els.clCard.querySelector('.jp-calc'), els.scrCalc);
    const ddRow = rel(els.ddPuTip, els.scrHome);
    const hubTip = rel(els.scrHub.querySelector('#hub-tip'), els.scrHub);

    /* --- pass 2: presentation panels EXPANDED (state when we scroll to
       the pinned calculators; the pin has closed the hint by then) --- */
    els.presBasic.style.cssText = 'display:block;max-height:none;margin-bottom:12px';
    els.presDec.style.cssText = 'display:block;max-height:none;margin-bottom:12px';
    els.hintCalc.style.cssText = 'display:none';
    const homeH2 = H(els.scrHome), calcH2 = H(els.scrCalc);
    const basicFull = rel(els.hlBasic.querySelector('.jp-calc'), els.scrHome);
    const decFull = rel(els.clCard.querySelector('.jp-calc'), els.scrCalc);
    G.presBasicH = rel(els.presBasic.firstElementChild, els.scrHome).h + 2;
    G.presDecH = rel(els.presDec.firstElementChild, els.scrCalc).h + 2;

    G.scrollCards = clamp(coupon.y - 140, 0, Math.max(0, G.homeH - VIEW_H));
    /* card can be taller than the view — keep its title clear of the pinned nav */
    const navH = rel(els.scrHome.querySelector('.navlayer'), els.scrHome).h;
    G.scrollBasic = clamp(basicFull.y - Math.max(navH + 10, (VIEW_H - basicFull.h) / 2), 0, Math.max(0, homeH2 - VIEW_H));
    G.scrollPu = clamp(puList.y - 235, 0, Math.max(0, G.calcH - VIEW_H));
    G.scrollCalcCard = clamp(decFull.y - Math.max(10, (VIEW_H - decFull.h) / 2), 0, Math.max(0, calcH2 - VIEW_H));
    G.scrollHub = clamp(hubTip.y - 300, 0, Math.max(0, G.hubH - VIEW_H));
    G.scrollTip = Math.max(0, G.tipH - VIEW_H);

    /* tap targets in VIEW space (540×960): view = phone.xy + (430-space − scroll) × SCALE */
    const vp = (r, scroll) => ({ x: PHONE.x + (r.x + r.w / 2) * SCALE,
                                 y: PHONE.y + (r.y + r.h / 2 - scroll) * SCALE });
    G.tapCoupon = vp(couponCta, G.scrollCards);
    G.tapPuSale = vp(puSale, G.scrollPu);
    G.tapDdRow = vp(ddRow, 0);
    G.tapHub = vp(hubTip, G.scrollHub);

    /* marker svg placement (root = .jp-cards, the marker's offset parent) */
    const cc = rel(els.couponNote, els.cardCoupon.parentElement);
    const m1 = els.markerCoupon;
    m1.setAttribute('preserveAspectRatio', 'none');
    m1.style.left = px(cc.x - 7); m1.style.top = px(cc.y - 9);
    m1.style.width = px(cc.w + 14); m1.style.height = px(cc.h + 18);
    G.marker1Len = els.markerCouponPath.getTotalLength();

    const ans = rel(els.tipAnsline, els.tlCard);
    const m2 = els.markerAnswer;
    m2.setAttribute('preserveAspectRatio', 'none');
    m2.style.left = px(ans.x + 6); m2.style.top = px(ans.y + ans.h - 8);
    m2.style.width = px(ans.w - 12); m2.style.height = px(20);
    G.marker2Len = els.markerAnswerPath.getTotalLength();

    els.presBasic.style.cssText = prevPres[0];
    els.presDec.style.cssText = prevPres[1];
    els.dropdown.style.cssText = prevDd;
    els.hintCalc.style.cssText = prevHint;
    els.phoneTilt.style.transform = prevTf[0];
    els.phone.style.transform = prevTf[1];
    screens.forEach((s, i) => { s.style.display = prevDisp[i]; });
  }

  /* ---------- pure helper curves ---------- */
  function ramp(t, t0, t1, v0, v1, ease) {
    const p = clamp((t - t0) / (t1 - t0), 0, 1);
    return lerp(v0, v1, (ease || E.inOutCubic)(p));
  }
  /* stop-motion quantizer */
  const quant = (p, n) => Math.round(clamp(p, 0, 1) * n) / n;
  /* short pulse 0→1→0 around a moment */
  function pulse(t, at, dur) {
    const p = (t - at) / dur;
    if (p < 0 || p > 1) return 0;
    return Math.sin(p * Math.PI);
  }

  /* ---------- glitch burst description (pure) ---------- */
  const BURSTS = [
    { t: T.burst0, d: 0.50, k: 1 },
    { t: T.burst1, d: 0.55, k: 2 },
    { t: T.burst2, d: 0.55, k: 3 },
    { t: T.burst3, d: 0.50, k: 4 },
    { t: T.burst4, d: 0.35, k: 5 },
    { t: T.burst5, d: 0.60, k: 6 },
  ];
  const N_SLICES = 14;
  const sliceEls = [];
  function buildSlices() {
    els.glitch.innerHTML = '';
    sliceEls.length = 0;
    const kinds = ['r', 'c', 'g', 'w', 'd', 'px', 'px', 'r', 'c', 'w', 'd', 'px', 'g', 'px'];
    for (let i = 0; i < N_SLICES; i++) {
      const d = document.createElement('div');
      d.className = 'gs ' + kinds[i % kinds.length];
      els.glitch.appendChild(d);
      sliceEls.push(d);
    }
  }
  function activeBurst(t) {
    for (const b of BURSTS) if (t >= b.t && t < b.t + b.d) return b;
    return null;
  }

  /* ---------- the timeline ---------- */
  const tl = new window.HFTimeline({ paused: true });

  function buildAll() {
    tl.clear();
    measure();

    /* =========================================================
       MASTER LAYOUT DRIVE — screens, scroll, URL, theme
       ========================================================= */
    tl.drive((t) => {
      /* which screen is on the phone */
      const scr = t < T.wipe1Mid ? 'home'
        : t < T.wipe2Mid ? 'calc'
        : t < T.flipMid ? 'home'
        : t < T.tipSwitch ? 'hub'
        : 'tip';
      els.scrHome.style.display = scr === 'home' ? 'block' : 'none';
      els.scrCalc.style.display = scr === 'calc' ? 'block' : 'none';
      els.scrHub.style.display = scr === 'hub' ? 'block' : 'none';
      els.scrTip.style.display = scr === 'tip' ? 'block' : 'none';

      /* per-screen scroll — pure piecewise functions of absolute t */
      let homeScroll;
      if (t < T.wipe1Mid) homeScroll = ramp(t, T.scroll1[0], T.scroll1[1], 0, G.scrollCards);
      else homeScroll = ramp(t, T.scroll3[0], T.scroll3[1], 0, G.scrollBasic, E.outCubic);
      els.scrHome.style.transform = 'translateY(' + px(-homeScroll) + ')';

      let calcScroll = ramp(t, T.scroll2[0], T.scroll2[1], 0, G.scrollPu);
      calcScroll = t < T.scrollBack[0] ? calcScroll
        : ramp(t, T.scrollBack[0], T.scrollBack[1], G.scrollPu, G.scrollCalcCard);
      els.scrCalc.style.transform = 'translateY(' + px(-calcScroll) + ')';

      const hubScroll = ramp(t, T.scrollHub[0], T.scrollHub[1], 0, G.scrollHub);
      const tipScroll = ramp(t, T.scrollTip[0], T.scrollTip[1], 0, G.scrollTip);
      els.scrHub.style.transform = 'translateY(' + px(-hubScroll) + ')';
      els.scrTip.style.transform = 'translateY(' + px(-tipScroll) + ')';

      /* the app's nav bar is position:fixed — counter-translate each
         screen's nav layer so it stays pinned to the viewport top */
      els.scrHome.querySelector('.navlayer').style.transform = 'translateY(' + px(homeScroll) + ')';
      els.scrCalc.querySelector('.navlayer').style.transform = 'translateY(' + px(calcScroll) + ')';
      els.scrHub.querySelector('.navlayer').style.transform = 'translateY(' + px(hubScroll) + ')';
      els.scrTip.querySelector('.navlayer').style.transform = 'translateY(' + px(tipScroll) + ')';

      /* URL path (verified routes, canonical trailing slash) */
      els.urlPath.textContent =
        t < T.wipe1Mid ? '/'
        : t < T.wipe2Mid ? '/basic-percentage-calculator/'
        : t < T.flipMid ? '/'
        : t < T.tipSwitch ? '/faqs/'
        : '/faqs/tip-calculation-calculator/';

      /* theme — flips exactly when the phone is edge-on */
      const dark = t >= T.flipMid;
      els.stage.classList.toggle('dark', dark);
      els.appBgDark.style.opacity = dark ? '1' : '0';
      els.appBgLight.style.opacity = dark ? '0' : '1';
    });

    /* =========================================================
       PHONE transforms: outer (pop-in / jitter / exit) + inner flip
       ========================================================= */
    tl.drive((t) => {
      /* outer */
      let op = 1, ty = 0, sc = 1, rot = 0;
      if (t < T.phoneIn) { op = 0; ty = 140; sc = 0.92; }
      else if (t < T.phoneIn + 0.7) {
        const p = E.outBack((t - T.phoneIn) / 0.7);
        op = clamp(p * 2, 0, 1); ty = lerp(140, 0, p); sc = lerp(0.92, 1, p);
      }
      if (t >= T.phoneOut[0]) {
        const p = E.inCubic(clamp((t - T.phoneOut[0]) / (T.phoneOut[1] - T.phoneOut[0]), 0, 1));
        op = 1 - p; ty = lerp(0, 200, p); sc = lerp(1, 0.9, p); rot = lerp(0, -7, p);
      }
      /* glitch position jitter (quantized, seeded) */
      const b = activeBurst(t);
      let jx = 0, jy = 0;
      if (b && t < T.phoneOut[0]) {
        const f = Math.floor((t - b.t) * 30);
        jx = (rnd(b.k * 977 + f * 13) - 0.5) * 14;
        jy = (rnd(b.k * 499 + f * 29) - 0.5) * 8;
      }
      els.phoneTilt.style.opacity = op.toFixed(3);
      els.phoneTilt.style.transform =
        'translate(' + px(jx) + ',' + px(ty + jy) + ') scale(' + sc.toFixed(4) + ') rotate(' + rot.toFixed(2) + 'deg)';

      /* inner 3D flip: 0→90° then −90→0° (content swaps edge-on) */
      let ry = 0, dip = 1;
      if (t >= T.flip[0] && t <= T.flip[1]) {
        const p = E.inOutQuart(clamp((t - T.flip[0]) / (T.flip[1] - T.flip[0]), 0, 1));
        ry = p < 0.5 ? lerp(0, 90, p * 2) : lerp(-90, 0, (p - 0.5) * 2);
        dip = 1 - 0.10 * Math.sin(p * Math.PI);
      }
      els.phone.style.transform = 'rotateY(' + ry.toFixed(2) + 'deg) scale(' + dip.toFixed(4) + ')';
    });

    /* =========================================================
       GLITCH slices + datamosh filter + flash frames
       ========================================================= */
    tl.drive((t) => {
      const b = activeBurst(t);
      if (!b) {
        for (const s of sliceEls) s.style.opacity = '0';
        els.phone.style.filter = '';
      } else {
        const f = Math.floor((t - b.t) * 30);            // 30 fps steps
        const fade = 1 - clamp((t - b.t) / b.d, 0, 1) * 0.6;
        for (let i = 0; i < sliceEls.length; i++) {
          const s = sliceEls[i];
          const h1 = b.k * 3571 + f * 101 + i * 17;
          const on = rnd(h1) > 0.62;
          if (!on) { s.style.opacity = '0'; continue; }
          const y = rnd(h1 + 1) * 690;
          const h = 4 + rnd(h1 + 2) * 26;
          const dx = (rnd(h1 + 3) - 0.5) * 90;
          s.style.opacity = (0.5 + rnd(h1 + 4) * 0.5) * fade;
          s.style.top = px(y);
          s.style.height = px(h);
          s.style.transform = 'translateX(' + px(dx) + ')';
        }
        const fp = rnd(b.k * 7919 + f * 3);
        els.phone.style.filter =
          fp < 0.28 ? 'url(#mosh1)' : fp < 0.5 ? 'url(#mosh2)' : fp < 0.66 ? 'url(#mosh3)' : '';
      }
      /* white flash frames on hard cuts */
      const fl = Math.max(pulse(t, T.burst0 + 0.12, 0.16), pulse(t, T.flipMid, 0.14),
                          pulse(t, T.burst5 + 0.1, 0.18));
      els.flash.style.opacity = (fl * 0.85).toFixed(3);
    });

    /* torn-paper wipes (one owner for #wipe) */
    tl.drive((t) => {
      let x = -20;                                        // parked offscreen left
      if (t >= T.wipe1[0] && t <= T.wipe1[1]) x = ramp(t, T.wipe1[0], T.wipe1[1], 0, 1290);
      else if (t > T.wipe1[1] && t < T.wipe2[0]) x = 1290;
      else if (t >= T.wipe2[0] && t <= T.wipe2[1]) x = ramp(t, T.wipe2[0], T.wipe2[1], 0, 1290);
      else if (t > T.wipe2[1]) x = 1290;
      els.wipe.style.transform = 'translateX(' + px(x) + ')';
    });

    /* =========================================================
       INTRO — chips (stop-motion) + sequential headlines
       ========================================================= */
    [els.chip1, els.chip2, els.chip3].forEach((chip, i) => {
      const at = T.chips + i * 0.38;
      const baseRot = [-6, 3, -2][i];
      tl.tween(at, 0.6, (pe, p) => {
        const qp = quant(p, 5);                           // 5 stop-motion steps in
        chip.style.opacity = qp > 0 ? '1' : '0';
        const y = lerp(-46, 0, qp), s = lerp(1.18, 1, qp);
        const j = (rnd(900 + i * 31 + Math.round(qp * 5)) - 0.5) * 4;
        chip.style.transform = 'translateY(' + px(y) + ') scale(' + s.toFixed(3) + ') rotate(' + (baseRot + j).toFixed(2) + 'deg)';
      }, 'linear');
      /* stop-motion idle wobble + exit drop */
      tl.drive((t) => {
        if (t < at + 0.6 || t < 0) return;
        if (t < T.burst0) {
          const f = Math.floor(t * 8);                    // 8 fps wobble
          const j = (rnd(700 + i * 57 + f) - 0.5) * 2.4;
          chip.style.transform = 'translateY(0) scale(1) rotate(' + (baseRot + j).toFixed(2) + 'deg)';
        } else {
          const p = E.inQuad(clamp((t - T.burst0) / 0.4, 0, 1));
          chip.style.opacity = (1 - p).toFixed(3);
          chip.style.transform = 'translateY(' + px(p * 120) + ') rotate(' + (baseRot + p * 24) + 'deg)';
        }
      });
    });

    function panelInOut(el, tIn, tOut, baseRot) {
      tl.tween(tIn, 0.45, (pe) => {                       // sole p0 owner
        el.style.opacity = clamp(pe * 1.6, 0, 1).toFixed(3);
        el.style.transform = 'translateX(-50%) translateY(' + px(lerp(26, 0, pe)) + ') rotate(' + lerp(baseRot - 2, baseRot, pe).toFixed(2) + 'deg) scale(' + lerp(0.94, 1, pe).toFixed(3) + ')';
      }, 'outBack');
      tl.tween(tOut, 0.32, (pe, p) => {
        if (p === 0) return;                              // chain rule
        el.style.opacity = (1 - pe).toFixed(3);
        el.style.transform = 'translateX(-50%) translateY(' + px(-18 * pe) + ') rotate(' + baseRot + 'deg)';
      }, 'inQuad');
    }
    panelInOut(els.head1, T.head1In, T.head1Out, -1.4);
    panelInOut(els.head2, T.head2In, T.head2Out, 1.1);

    /* =========================================================
       chrome: brand bar, URL pill, captions
       ========================================================= */
    tl.tween(0.15, 0.5, (pe) => {
      els.brandbar.style.opacity = pe.toFixed(3);
      els.brandbar.style.transform = 'translateX(-50%) translateY(' + px(lerp(16, 0, pe)) + ')';
    }, 'outCubic');
    tl.tween(T.brandOut, 0.5, (pe, p) => {
      if (p === 0) return;
      els.brandbar.style.opacity = (1 - pe).toFixed(3);
      els.brandbar.style.transform = 'translateX(-50%) translateY(' + px(20 * pe) + ')';
    }, 'inQuad');

    tl.tween(T.urlIn, 0.4, (pe) => {
      els.urlpill.style.opacity = pe.toFixed(3);
      els.urlpill.style.transform = 'translateX(-50%) translateY(' + px(lerp(-14, 0, pe)) + ')';
    }, 'outCubic');
    tl.tween(T.urlOut, 0.4, (pe, p) => {
      if (p === 0) return;
      els.urlpill.style.opacity = (1 - pe).toFixed(3);
    }, 'inQuad');

    [[els.cap1, T.cap1, -0.8], [els.cap2, T.cap2, 0.7], [els.cap3, T.cap3, -0.6],
     [els.cap4, T.cap4, 0.8], [els.cap5, T.cap5, -0.7], [els.cap6, T.cap6, 0.6]]
    .forEach(([el, range, r]) => {
      tl.tween(range[0], 0.38, (pe) => {
        el.style.opacity = clamp(pe * 1.5, 0, 1).toFixed(3);
        el.style.transform = 'translateX(-50%) translateY(' + px(lerp(20, 0, pe)) + ') rotate(' + r + 'deg) scale(' + lerp(0.95, 1, pe).toFixed(3) + ')';
      }, 'outBack');
      tl.tween(range[1], 0.3, (pe, p) => {
        if (p === 0) return;
        el.style.opacity = (1 - pe).toFixed(3);
      }, 'inQuad');
    });

    /* =========================================================
       SCENE: home — marker circle, clearance-card tap
       ========================================================= */
    tl.drive((t) => {
      els.markerCoupon.style.opacity = (t >= T.marker1 && t < T.wipe1Mid) ? '1' : '0';
    });
    tl.tween(T.marker1, 0.7, (pe) => {
      els.markerCouponPath.style.strokeDasharray = G.marker1Len;
      els.markerCouponPath.style.strokeDashoffset = G.marker1Len * (1 - pe);
    }, 'inOutQuad');

    tl.drive((t) => {
      els.couponNote.classList.toggle('lifted', t >= T.hand1.tap && t < T.wipe1Mid);
    });
    pressScale(els.couponNote, T.hand1.tap);

    /* =========================================================
       SCENE: /basic-percentage-calculator/ (dec-* els; ids kept)
       ========================================================= */
    /* SolutionCardHint: the real app shows the clicked card's note above the
       calculator (read-only label hidden meanwhile); pinning a PU closes it
       with a ~250 ms fade BEFORE the scroll-back re-frames the calculator */
    tl.drive((t) => {
      const on = t >= T.wipe1Mid && t < T.hand2.tap + 0.25;
      els.hintCalc.style.display = on ? 'block' : 'none';
      els.decRlabel.style.opacity = on ? '0' : '';
    });
    tl.tween(T.wipe1Mid, 0.25, (pe) => {                 // entrance (app: .visible transition)
      els.hintCalc.style.opacity = pe.toFixed(3);
      els.hintCalc.style.transform = 'translateY(' + px(lerp(-8, 0, pe)) + ')';
    }, 'outCubic');
    tl.tween(T.hand2.tap, 0.25, (pe, p) => {             // dismiss on pin
      if (p === 0) return;                               // chain rule
      els.hintCalc.style.opacity = (1 - pe).toFixed(3);
      els.hintCalc.style.transform = 'translateY(' + px(-8 * pe) + ')';
    }, 'inQuad');

    tl.setAt(T.decFill,
      () => { els.decOriginal.textContent = '25'; els.decDecrease.textContent = '80'; },
      () => { els.decOriginal.textContent = ''; els.decDecrease.textContent = ''; });
    tl.drive((t) => {
      const g = t >= T.decFill && t < T.countUp1[1] + 0.5;
      els.decOriginal.classList.toggle('glow', g);
      els.decDecrease.classList.toggle('glow', g);
    });
    /* live count-up to 20 (base owner of #dec-new) — 25% of 80 */
    tl.tween(T.countUp1[0], T.countUp1[1] - T.countUp1[0], (pe, p) => {
      if (p === 0) {
        els.decNew.classList.add('empty'); els.decNewVal.textContent = 'Z';
      } else {
        els.decNew.classList.remove('empty');
        els.decNewVal.textContent = String(Math.round(lerp(0, 20, pe)));
      }
    }, 'outCubic');

    /* practical use pin: a) click  b) presentation ABOVE the form  c) values fill */
    tl.drive((t) => { els.puSale.classList.toggle('pinned', t >= T.hand2.tap && t < T.wipe2Mid); });
    pressScale(els.puSale, T.hand2.tap);

    tl.drive((t) => {
      els.presDec.style.display = (t >= T.presDec[0] && t < T.wipe2Mid) ? 'block' : 'none';
    });
    tl.tween(T.presDec[0], T.presDec[1] - T.presDec[0], (pe) => {
      els.presDec.style.maxHeight = px(lerp(0, G.presDecH, pe));
      els.presDec.style.opacity = pe.toFixed(3);
      els.presDec.style.marginBottom = px(lerp(0, 12, pe));
    }, 'outCubic');

    /* c) fields flip stop-motion to the practical-use values, answer live */
    tl.tween(T.puFillX[0], T.puFillX[1] - T.puFillX[0], (pe, p) => {
      if (p === 0) return;                                 // base '25' set earlier
      const qp = quant(p, 6);
      els.decOriginal.textContent = String(Math.round(lerp(25, 40, qp)));
      const j = qp > 0 && qp < 1 ? (rnd(1200 + Math.round(qp * 6)) - 0.5) * 3 : 0;
      els.decOriginal.style.transform = 'rotate(' + j.toFixed(2) + 'deg)';
    }, 'linear');
    tl.tween(T.puFillY[0], T.puFillY[1] - T.puFillY[0], (pe, p) => {
      if (p === 0) return;
      const qp = quant(p, 5);
      els.decDecrease.textContent = String(Math.round(lerp(80, 2000, qp)));
      const j = qp > 0 && qp < 1 ? (rnd(1300 + Math.round(qp * 5)) - 0.5) * 3 : 0;
      els.decDecrease.style.transform = 'rotate(' + j.toFixed(2) + 'deg)';
    }, 'linear');
    tl.tween(T.puAns[0], T.puAns[1] - T.puAns[0], (pe, p) => {
      if (p === 0) return;                                 // base '20' from count-up
      els.decNewVal.textContent = String(Math.round(lerp(20, 800, pe)));
    }, 'outCubic');
    tl.drive((t) => {
      const g = t >= T.puFillX[0] && t < T.puAns[1] + 0.4;
      if (g) { els.decOriginal.classList.add('glow'); els.decDecrease.classList.add('glow'); }
      /* (the earlier glow drive owns the 'remove' — merge windows) */
    });

    /* =========================================================
       SCENE: search on home
       ========================================================= */
    tl.drive((t) => {
      const typed = t < T.type[0] ? '' : t < T.type[1] ? 'r' : t < T.type[2] ? 're' : t < T.type[3] ? 'ren' : 'rent';
      els.searchTyped.textContent = typed;
      els.searchGhost.style.opacity = typed === '' ? '1' : '0';
      els.homeSearch.classList.toggle('focused', t >= T.focus && t < T.settleHoldEnd);
      /* deterministic cursor blink */
      els.searchCursor.style.opacity = (Math.floor(t * 2.4) % 2 === 0) ? '1' : '0';
    });

    tl.drive((t) => {
      els.dropdown.style.display = (t >= T.ddIn && t < T.ddGone) ? 'block' : 'none';
    });
    tl.tween(T.ddIn, 0.35, (pe) => {
      els.dropdown.style.opacity = pe.toFixed(3);
      els.dropdown.style.transform = 'translateY(' + px(lerp(-10, 0, pe)) + ') scale(' + lerp(0.98, 1, pe).toFixed(3) + ')';
    }, 'outCubic');
    tl.tween(T.ddOut, T.ddGone - T.ddOut, (pe, p) => {
      if (p === 0) return;
      els.dropdown.style.opacity = (1 - pe).toFixed(3);
    }, 'inQuad');
    pressScale(els.ddPuTip, T.hand3.tap);

    /* pinned value-increase calculator (presentation ABOVE the form + values) */
    tl.drive((t) => {
      const on = t >= T.pinShow && t < T.flipMid;
      els.presBasic.style.display = on ? 'block' : 'none';
      if (on) els.presBasic.style.marginBottom = '12px';
      els.basicX.textContent = on ? '1200' : '';
      els.basicY.textContent = on ? '7' : '';
      els.basicZVal.textContent = on ? '1284' : 'New';
      els.basicZ.classList.toggle('empty', !on);
      const glow = t >= T.pinShow && t < T.settleHoldEnd - 0.4;
      els.basicX.classList.toggle('glow', glow);
      els.basicY.classList.toggle('glow', glow);
    });
    tl.tween(T.pinShow, 0.35, (pe) => {
      els.presBasic.style.maxHeight = px(lerp(0, G.presBasicH, pe));
      els.presBasic.style.opacity = pe.toFixed(3);
    }, 'outCubic');

    /* =========================================================
       SCENE: FAQ page — live edit 150 → 220
       ========================================================= */
    tl.tween(T.faqEdit[0], T.faqEdit[1] - T.faqEdit[0], (pe, p) => {
      const qp = quant(p, 7);                              // stop-motion digits
      const bill = Math.round(lerp(150, 220, qp));
      const tip = Math.round(bill * 10) / 100;             // 10% of bill
      const fmt = (v) => (v % 1 === 0 ? String(v) : v.toFixed(1));
      els.tipBill.textContent = String(bill);
      els.tipResult.textContent = fmt(tip);
      els.detY.textContent = String(bill); els.detY2.textContent = String(bill);
      els.detFy.textContent = String(bill); els.detFr.textContent = fmt(tip);
      const j = qp > 0 && qp < 1 ? (rnd(1500 + Math.round(qp * 7)) - 0.5) * 3 : 0;
      els.tipBill.style.transform = 'rotate(' + j.toFixed(2) + 'deg)';
    }, 'linear');
    tl.drive((t) => {
      els.tipBill.classList.toggle('glow', t >= T.faqEdit[0] - 0.2 && t < T.faqEdit[1] + 0.5);
    });
    tl.drive((t) => {
      els.markerAnswer.style.opacity = (t >= T.marker2 && t < T.burst5) ? '1' : '0';
    });
    tl.tween(T.marker2, 0.6, (pe) => {
      els.markerAnswerPath.style.strokeDasharray = G.marker2Len;
      els.markerAnswerPath.style.strokeDashoffset = G.marker2Len * (1 - pe);
    }, 'inOutQuad');
    pressScale(els.hubTip, T.hand4.tap);

    /* =========================================================
       HAND (stop-motion paper cutout) + ripples
       ========================================================= */
    const SEGS = [
      { seg: T.hand1, to: () => G.tapCoupon, k: 1 },
      { seg: T.hand2, to: () => G.tapPuSale, k: 2 },
      { seg: T.hand3, to: () => G.tapDdRow, k: 3 },
      { seg: T.hand4, to: () => G.tapHub, k: 4 },
    ];
    tl.drive((t) => {
      let op = 0, x = 600, y = 920, sc = 1, rot = 0;
      for (const { seg, to, k } of SEGS) {
        if (t < seg.start || t > seg.end) continue;
        const target = to();
        const from = { x: target.x + 190, y: target.y + 300 };
        if (t <= seg.tap) {
          const raw = clamp((t - seg.start) / (seg.tap - seg.start), 0, 1);
          const frames = Math.max(4, Math.round((seg.tap - seg.start) * 8));
          const qp = quant(E.outCubic(raw), frames);
          x = lerp(from.x, target.x, qp);
          y = lerp(from.y, target.y, qp) - Math.sin(qp * Math.PI) * 40;
          rot = lerp(14, 0, qp) + (rnd(k * 811 + Math.round(qp * frames)) - 0.5) * 5;
          op = clamp(raw * 5, 0, 1);
        } else {
          x = target.x; y = target.y;
          const pr = pulse(t, seg.tap, 0.22);
          sc = 1 - 0.12 * pr;
          const fadeOut = clamp((t - (seg.tap + 0.3)) / (seg.end - seg.tap - 0.3), 0, 1);
          op = 1 - fadeOut;
        }
        break;
      }
      els.hand.style.opacity = op.toFixed(3);
      els.hand.style.transform =
        'translate(' + px(x - 50) + ',' + px(y - 8) + ') rotate(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
    });

    SEGS.forEach(({ seg, to }) => {
      tl.tween(seg.tap, 0.5, (pe, p) => {
        if (p === 0) { els.ripple.style.opacity = '0'; return; }
        const target = to();
        els.ripple.style.left = px(target.x); els.ripple.style.top = px(target.y);
        els.ripple.style.opacity = ((1 - pe) * 0.9).toFixed(3);
        els.ripple.style.transform = 'scale(' + lerp(0.25, 1.5, pe).toFixed(3) + ')';
      }, 'outCubic');
    });

    /* =========================================================
       ENDCARD
       ========================================================= */
    tl.tween(T.outroIn, 0.8, (pe) => {
      els.outro.style.opacity = clamp(pe * 1.4, 0, 1).toFixed(3);
      els.outro.style.transform = 'translateY(' + px(lerp(60, 0, pe)) + ') scale(' + lerp(0.92, 1, pe).toFixed(4) + ')';
    }, 'outBack');
    /* gentle idle float so the endcard stays alive until the last frame */
    tl.drive((t) => {
      if (t < T.outroIn + 0.8) return;
      const w = Math.sin((t - T.outroIn) * 1.4) * 4;
      els.outro.style.transform = 'translateY(' + px(w) + ') scale(1)';
    });

    /* total duration marker */
    tl.tween(DUR, 0.0001, () => {}, 'linear');
  }

  /* press-scale micro interaction (sole transform owner of its element) */
  function pressScale(el, at) {
    tl.tween(at - 0.05, 0.3, (pe, p) => {
      const pr = pulse(p, 0.15, 0.7);
      el.style.transform = 'scale(' + (1 - 0.04 * pr).toFixed(4) + ')';
    }, 'linear');
  }

  /* ---------- boot (synchronous — HyperFrames reads __timelines at load) ---------- */
  grab();
  buildSlices();
  buildAll();
  tl.seek(0);

  window.__timelines = window.__timelines || {};
  window.__timelines['jp-hyper-mixed-media'] = tl;

  /* layout depends on font metrics — rebuild once real fonts are in,
     re-seeking to the current time (pure, so the frame stays identical
     across page loads). fonts.ready alone is not enough: faces used only
     by display:none content (the pin presentations) are never requested,
     so measure() would see fallback metrics and clip them — force-load
     every declared face first. */
  if (document.fonts) {
    Promise.all(Array.from(document.fonts, (f) => f.load())).catch(() => {}).then(() => {
      const t = tl.time();
      buildAll();
      tl.seek(t);
    });
  }
})();
