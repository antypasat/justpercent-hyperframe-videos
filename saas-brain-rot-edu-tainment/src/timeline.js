/* =====================================================================
   SaaS Brain Rot — justpercent.com teaser (1080x1920, 36s, silent)
   One master GSAP timeline; every frame is a pure function of t.
   Snapshots S1..S8 are 1:1 DOM captures of the live app (see capture/).
   ===================================================================== */
(function () {
  'use strict';

  var DUR = 36;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ---------- measurement helpers (run once, synchronously) ---------- */
  function pageRect(snapId, sel) {
    var s = $('#' + snapId);
    var el = s ? s.querySelector(sel) : null;
    if (!el) return null;
    var body = s.querySelector('.jp-body');
    var r = el.getBoundingClientRect(), b = body.getBoundingClientRect();
    var scale = b.width / 432 || 1;
    return {
      x: (r.left - b.left) / scale, y: (r.top - b.top) / scale,
      w: r.width / scale, h: r.height / scale, el: el
    };
  }

  /* phone geometry */
  var PHONE = { w: 1026, h: 1560, x: -513, y: 200 };       // default framing
  var BASE = 2.375;                                        // .phone-scale factor (432 -> 1026)

  /* camera: .zoom uses transform-origin 0 0; screen = p*BASE*z + t   */
  function cam(z, px, py, vx, vy, phoneW, phoneH) {
    // place page point (px,py) at phone-local (vx,vy)
    var S = BASE * z;
    return { scale: z, x: vx - px * S, y: vy - py * S };
  }
  function camCenter(z, focus, phoneW, phoneH) {
    return cam(z, focus.x + focus.w / 2, focus.y + focus.h / 2, phoneW / 2, phoneH / 2);
  }
  /* keep the page edges glued to the phone window (no void above/left) */
  function clampCam(c, phoneW, phoneH) {
    var S = BASE * c.scale;
    c.x = Math.min(0, Math.max(c.x, (phoneW || PHONE.w) - 432 * S));
    c.y = Math.min(0, c.y);
    return c;
  }

  /* ---------- measured layout constants ---------- */
  var mCards   = pageRect('S1', '#solution-card-container-wrapper');
  var mSearch  = pageRect('S1', '#calculator-search');
  var mSearchCard = pageRect('S1', '#calculator-search') || { x: 24, y: 170, w: 384, h: 48 };
  var mDropRow = pageRect('S2', 'li.search-dropdown-item');
  var mCardS3  = pageRect('S3', '#basic-percentage-section');
  var mResS3   = pageRect('S3', '#basic-percentage-result');
  var mPUlist  = pageRect('S5', '.practical-use--interactive');
  var mPUcard  = (function(){ var els = $$('#S5 .practical-use--interactive'); return els[0] || null; })(); // Budget Cut = first PU
  var mPanelS6 = pageRect('S6', '.practical-use-presentation-wrapper');
  var mCardS6  = pageRect('S6', '#decreased-value-section') || pageRect('S6', '.calculator-card');
  var mResS6   = pageRect('S6', '#decreased-value-result');
  var mFaqLink = (function(){ var el = document.querySelector('#S7 a[href*="salary-raise-calculator"]'); return el; })();
  var mFaqLinkR= pageRect('S7', 'a[href*="salary-raise-calculator"]');
  var mQuesS8  = pageRect('S8', '#salary-raise-example') || pageRect('S8', 'h1');
  var mRaiseS8 = pageRect('S8', '#raise-percent');
  var mResS8   = pageRect('S8', '#new-salary-result');

  var mPU4 = (function(){
    var els = $$('#S5 .practical-use--interactive');
    if (!els[0]) return null;
    var body = $('#S5 .jp-body');
    var r = els[0].getBoundingClientRect(), b = body.getBoundingClientRect();
    var sc = b.width / 432 || 1;
    return { x:(r.left-b.left)/sc, y:(r.top-b.top)/sc, w:r.width/sc, h:r.height/sc };
  })();
  var SCROLL_CARDS = mCards ? Math.max(0, mCards.y - 96) : 620;
  var SCROLL_PU    = mPU4 ? Math.max(0, mPU4.y - 330) : (mPUlist ? Math.max(0, mPUlist.y - 210) : 900);
  var SCROLL_FAQ   = mFaqLinkR ? Math.max(0, mFaqLinkR.y - 320) : 1500;
  var SCROLL_S8    = mQuesS8 ? Math.max(0, mQuesS8.y - 60) : 0;

  /* ---------- inject presentation-layer helpers (tap rings, caret) ---------- */
  function ring(host, id, xPct, yPct) {
    if (!host) return null;
    var r = document.createElement('div');
    r.className = 'tap-ring'; r.id = id;
    r.style.left = (xPct || 50) + '%'; r.style.top = (yPct || 50) + '%';
    var cs = getComputedStyle(host);
    if (cs.position === 'static') host.style.position = 'relative';
    host.appendChild(r);
    return r;
  }
  var ringDrop  = ring(mDropRow && mDropRow.el, 'ring-drop', 50, 50);
  var ringPU    = ring(mPUcard, 'ring-pu', 50, 40);
  var ringFaq   = ring(mFaqLink, 'ring-faq', 40, 50);
  var ringRaise = ring(mRaiseS8 && mRaiseS8.el && mRaiseS8.el.parentElement, 'ring-raise', 50, 50);
  if (ringRaise && mRaiseS8) {
    /* host is the input's parent row (an <input> can't contain children) —
       re-center the ring on the input itself, not the wider row */
    var rp = mRaiseS8.el.parentElement.getBoundingClientRect();
    var ri = mRaiseS8.el.getBoundingClientRect();
    var sc8 = ($('#S8 .jp-body').getBoundingClientRect().width / 432) || 1;
    ringRaise.style.left = ((ri.left - rp.left + ri.width / 2) / sc8) + 'px';
    ringRaise.style.top = ((ri.top - rp.top + ri.height / 2) / sc8) + 'px';
  }

  /* typing caret inside the S1 search input */
  var searchInput = document.querySelector('#S1 #calculator-search');
  var typewriter  = document.querySelector('#S1 #animated-placeholder');
  var caret = null, caretBaseX = 0, charW = 8;
  if (searchInput) {
    var wrap = searchInput.parentElement;
    if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
    caret = document.createElement('div');
    caret.className = 'type-caret'; caret.id = 'type-caret';
    var inR = searchInput.getBoundingClientRect(), wrR = wrap.getBoundingClientRect();
    var sc = (document.querySelector('#S1 .jp-body').getBoundingClientRect().width / 432) || 1;
    var padL = parseFloat(getComputedStyle(searchInput).paddingLeft) || 0;
    caretBaseX = (inR.left - wrR.left) / sc + padL;
    caret.style.left = caretBaseX + 'px';
    caret.style.top = ((inR.top - wrR.top) / sc + ((inR.height / sc) - 26) / 2) + 'px';
    // deterministic char width via canvas
    var ctx = document.createElement('canvas').getContext('2d');
    var f = getComputedStyle(searchInput);
    ctx.font = f.fontWeight + ' ' + f.fontSize + ' ' + f.fontFamily;
    charW = ctx.measureText('tax').width / 3;
    wrap.appendChild(caret);
  }

  /* ---------- dynamic (text) state: pure function of t ---------- */
  var elUrlPath = $('#url-path');
  var sInput  = searchInput;
  var s6o = document.querySelector('#S6 #decreased-value-original-input');
  var s6p = document.querySelector('#S6 #decreased-value-percentage-input');
  var s6r = document.querySelector('#S6 #decreased-value-result');
  var s8raise = document.querySelector('#S8 #raise-percent');
  var s8res   = document.querySelector('#S8 #new-salary-result');
  var s8dec   = document.querySelector('#S8 #decimal-result');
  var s8amt   = document.querySelector('#S8 #raise-amount-result');
  var s8amtD  = document.querySelector('#S8 #raise-amount-display');
  var s8newD  = document.querySelector('#S8 #new-salary-display');
  var s8raiseDs = $$('#S8 [id^="raise-display"]');

  function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
  function cubicOut(p){ return 1 - Math.pow(1 - p, 3); }
  function seg(t, a, b){ return clamp01((t - a) / (b - a)); }
  function lerp(a, b, p){ return a + (b - a) * p; }

  var TYPE = { t1: 8.9, t2: 9.3, t3: 9.7, on: 8.55, off: 10.05 };
  /* S6 fill: both inputs rise in parallel (a..b), result counts up after both land (rA..rB) */
  var FILL = { a: 23.9, b: 24.6, rA: 24.65, rB: 25.0 };
  var RAISE = { a: 30.2, b: 30.7 };

  function urlFor(t) {
    if (t < 17.9)  return '';
    if (t < 26.72) return 'decreased-value-calculator/';
    if (t < 29.47) return 'faqs/';
    return 'faqs/salary-raise-calculator/';
  }

  function applyDynamic(t) {
    /* URL bar */
    if (elUrlPath) {
      var p = urlFor(t);
      if (elUrlPath.textContent !== p) elUrlPath.textContent = p;
    }
    /* search typing */
    if (sInput) {
      var n = t < TYPE.t1 ? 0 : t < TYPE.t2 ? 1 : t < TYPE.t3 ? 2 : 3;
      var v = 'tax'.slice(0, n);
      if (sInput.value !== v) sInput.value = v;
      if (typewriter) typewriter.style.visibility = (t >= TYPE.on && t <= TYPE.off + 26) ? 'hidden' : '';
      if (caret) {
        var vis = t >= TYPE.on && t <= TYPE.off;
        caret.style.visibility = vis ? 'visible' : 'hidden';
        caret.style.opacity = vis ? (((t * 2) % 1) < 0.62 ? 1 : 0) : 0;
        caret.style.left = (caretBaseX + charW * n + 1) + 'px';
      }
    }
    /* S6 practical-use fill (Budget Cut): empty until FILL.a, then original+percentage
       count up IN PARALLEL to 10000/25; result appears only after both land and counts
       up to 7500 — monotonic, never approaches 7500 from above */
    if (s6o) {
      var fe = cubicOut(seg(t, FILL.a, FILL.b));
      var o = t < FILL.a ? '' : String(Math.round(10000 * fe));
      var p2 = t < FILL.a ? '' : String(Math.round(25 * fe));
      var r2 = t < FILL.rA ? '' : String(Math.round(7500 * cubicOut(seg(t, FILL.rA, FILL.rB))));
      if (s6o.value !== o) s6o.value = o;
      if (s6p.value !== p2) s6p.value = p2;
      if (s6r && s6r.value !== r2) s6r.value = r2;
    }
    /* S8 salary raise 5 -> 8 (4200 -> 4320) */
    if (s8raise) {
      var r = Math.round(lerp(5, 8, cubicOut(seg(t, RAISE.a, RAISE.b))));
      var ns = 4000 + 40 * r, amt = 40 * r;
      if (s8raise.value !== String(r)) s8raise.value = String(r);
      if (s8res && s8res.value !== String(ns)) s8res.value = String(ns);
      if (s8dec) { var d = '0.0' + r; if (s8dec.textContent !== d) s8dec.textContent = d; } // en-US decimal point
      if (s8amt && s8amt.textContent !== String(amt)) s8amt.textContent = String(amt);
      if (s8amtD && s8amtD.textContent !== String(amt)) s8amtD.textContent = String(amt);
      if (s8newD && s8newD.textContent !== String(ns)) s8newD.textContent = String(ns);
      for (var i = 0; i < s8raiseDs.length; i++) {
        if (s8raiseDs[i].textContent !== String(r)) s8raiseDs[i].textContent = String(r);
      }
    }
  }

  /* the captured placeholder typewriter froze mid-word; show the full phrase
     the app types (as captured in the S2 state) so stills read cleanly */
  var twText = document.querySelector('#S1 #typewriter-text');
  var twFull = document.querySelector('#S2 #typewriter-text');
  if (twText) twText.textContent = (twFull && twFull.textContent.length > 8) ? twFull.textContent : "Dinner out? Search 'Tip!'...";

  /* ---------- initial states ---------- */
  gsap.set('.phone-unit', { width: PHONE.w, height: PHONE.h, xPercent: -50, x: 0, y: PHONE.y, transformOrigin: '50% 50%' });
  gsap.set('.zoom', { scale: 1, x: 0, y: 0, transformOrigin: '0 0' });
  gsap.set('.snap', { autoAlpha: 0 });
  gsap.set('#S1', { autoAlpha: 1 });
  gsap.set(['#S3 .jp-body'], { marginTop: -2008 });          // captured scroll position (settled auto-scroll)
  gsap.set(['#S6 .jp-body'], { marginTop: -12 });            // captured scroll position after pin
  gsap.set(['#S8 .jp-body'], { marginTop: -SCROLL_S8 });

  /* ---------- master timeline ---------- */
  window.__timelines = window.__timelines || {};
  var tl = gsap.timeline({ paused: true });

  /* dynamic-state driver across the whole duration (scrub-safe both ways) */
  var proxy = { t: 0 };
  tl.to(proxy, { t: DUR, duration: DUR, ease: 'none', onUpdate: function () { applyDynamic(proxy.t); } }, 0);

  /* ambient background (finite, seekable) */
  tl.fromTo('.bg-orb.violet', { x: -40, y: -30 }, { x: 60, y: 40, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: 5 }, 0);
  tl.fromTo('.bg-orb.cyan',   { x: 30, y: 20 },  { x: -50, y: -40, duration: 7.2, ease: 'sine.inOut', yoyo: true, repeat: 4 }, 0);
  tl.fromTo('.bg-ghost', { rotation: -4, scale: 0.98 }, { rotation: 3, scale: 1.04, duration: 12, ease: 'sine.inOut', yoyo: true, repeat: 2 }, 0);
  tl.fromTo('.floaty', { y: -6 }, { y: 6, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: 12 }, 2.8);

  /* ============ B0: cold open (0 - 2.7) ============ */
  tl.fromTo('#intro-1', { autoAlpha: 0, scale: 0.72, y: 60 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(2.2)' }, 0.28);
  tl.to('#intro-1', { autoAlpha: 0, scale: 1.25, filter: 'blur(14px)', duration: 0.3, ease: 'power2.in' }, 1.5);
  tl.fromTo('#intro-2', { autoAlpha: 0, scale: 0.72, y: 60 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(2)' }, 1.85);
  tl.to('#intro-2', { autoAlpha: 0, y: -120, filter: 'blur(16px)', duration: 0.32, ease: 'power2.in' }, 2.62);

  tl.fromTo('.brandbar', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.7);

  /* ============ B1: phone flies in, home (2.7 - 6.3) ============ */
  tl.fromTo('.phone-unit',
    { autoAlpha: 0, y: PHONE.y + 1500, rotationX: -22, scale: 0.82, filter: 'blur(22px)' },
    { autoAlpha: 1, y: PHONE.y, rotationX: 0, scale: 1, filter: 'blur(0px)', duration: 0.95, ease: 'expo.out', immediateRender: false }, 2.72);
  tl.fromTo('.urlbar', { autoAlpha: 0, y: -80 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 3.0);

  cap('cap-1', 4.0, 6.35);
  /* user scroll to solution cards */
  tl.fromTo('#S1 .jp-body', { marginTop: 0 }, { marginTop: -SCROLL_CARDS, duration: 1.8, ease: 'sine.inOut', immediateRender: false }, 4.45);

  /* ============ B1b: punch into solution cards (6.4 - 7.9) ============ */
  if (mCards) {
    // focus point in *scrolled* page space: subtract scroll offset
    var pcx = mCards.x + mCards.w / 2, pcy = (mCards.y - SCROLL_CARDS) + Math.min(mCards.h, 520) / 2;
    var c1 = cam(1.55, pcx, pcy, PHONE.w / 2, PHONE.h / 2);
    tl.fromTo('.zoom', { scale: 1, x: 0, y: 0 }, { scale: c1.scale, x: c1.x, y: c1.y, duration: 0.85, ease: 'expo.out', immediateRender: false }, 6.5);
  }
  cap('cap-2', 6.7, 8.35);

  /* ============ B2: back to search + typing (8.3 - 12) ============ */
  var sFocus = mSearch ? clampCam(cam(1.1, mSearch.x + mSearch.w / 2, mSearch.y + mSearch.h / 2, PHONE.w / 2, PHONE.h * 0.30)) : { scale: 1.1, x: 0, y: 0 };
  tl.to('#S1 .jp-body', { marginTop: 0, duration: 0.6, ease: 'power2.inOut' }, 8.15);
  tl.to('.zoom', { scale: sFocus.scale, x: sFocus.x, y: sFocus.y, duration: 0.75, ease: 'power3.inOut' }, 8.15);
  cap('cap-3', 8.75, 10.35);

  /* dropdown appears: S1 -> S2 (captured dropdown state) */
  cut(10.05, '#S1', '#S2');
  tl.fromTo('.zoom', { scale: sFocus.scale }, { scale: sFocus.scale * 1.05, duration: 0.35, ease: 'back.out(3)', immediateRender: false }, 10.05);
  cap('cap-4', 10.6, 12.0);
  tap('#ring-drop', 11.45);

  /* whip down: S2 -> S3 (app auto-scrolled to the calculator) */
  whip(11.98, '#S2', '#S3', +1);

  /* ============ B3: pinned calculator, full-card reveal (12.2 - 16.3) ============ */
  /* landing: near top of pinned card */
  var s3top = mCardS3 ? clampCam(cam(1.05, 216, (mCardS3.y - 2008) + 240, PHONE.w / 2, PHONE.h * 0.34)) : { scale: 1.05, x: 0, y: 0 };
  tl.set('.zoom', { scale: s3top.scale, x: s3top.x, y: s3top.y }, 12.2);

  /* pull back to reveal the WHOLE calculator (phone morphs slimmer/taller) */
  var FC = (function () {
    if (!mCardS3) return null;
    var h = mCardS3.h + 24;                     // card + breath
    var S = Math.min(1580 / h, 2.0);
    var w = Math.ceil(432 * S), ph = Math.ceil(h * S);
    var z = S / BASE;
    var ty = -((mCardS3.y - 2008) - 12) * S;
    return { w: w, ph: ph, z: z, tx: 0, ty: ty, y: Math.max(120, (1920 - ph) / 2 - 50) };
  })();
  if (FC) {
    tl.to('.phone-unit', { width: FC.w, height: FC.ph, y: FC.y, duration: 1.5, ease: 'power3.inOut' }, 12.75);
    tl.to('.phone', { borderRadius: 34, duration: 1.5, ease: 'power3.inOut' }, 12.75);
    tl.to('.zoom', { scale: FC.z, x: FC.tx, y: FC.ty, duration: 1.5, ease: 'power3.inOut' }, 12.75);
  }
  cap('cap-5', 12.85, 14.1);   /* out before the clean full-calculator hold */

  /* punch into the result ("is 9") */
  var s3res = mResS3 ? cam(1.9, mResS3.x + mResS3.w / 2, (mResS3.y - 2008) + mResS3.h / 2, PHONE.w / 2, PHONE.h * 0.44) : null;
  tl.to('.phone-unit', { width: PHONE.w, height: PHONE.h, y: PHONE.y, duration: 0.9, ease: 'power3.inOut' }, 15.45);
  tl.to('.phone', { borderRadius: 46, duration: 0.9, ease: 'power3.inOut' }, 15.45);
  if (s3res) tl.to('.zoom', { scale: s3res.scale, x: s3res.x, y: s3res.y, duration: 0.9, ease: 'power3.inOut' }, 15.45);
  cap('cap-6', 15.9, 17.6);

  /* ============ B4: calculator page + 3D theme flip (17.7 - 19.6) ============ */
  whip(17.7, '#S3', '#S4', +1);
  tl.set('.zoom', { scale: 1, x: 0, y: 0 }, 17.92);
  tl.set('#S4 .jp-body', { marginTop: 0 }, 17.92);

  /* flip: light -> dark at 90deg */
  tl.to('.phone-unit', { rotationY: 92, scale: 0.94, duration: 0.44, ease: 'power2.in' }, 18.6);
  cut(19.04, '#S4', '#S5');
  tl.set('#S5 .jp-body', { marginTop: 0 }, 19.04);
  tl.set('.phone-unit', { rotationY: -92 }, 19.04);
  tl.to('.phone-unit', { rotationY: 0, scale: 1, duration: 0.5, ease: 'power2.out' }, 19.04);
  cap('cap-7', 19.7, 21.15);

  /* ============ B5: practical use, the RIGHT order (19.9 - 26.4) ============ */
  tl.fromTo('#S5 .jp-body', { marginTop: 0 }, { marginTop: -SCROLL_PU, duration: 1.15, ease: 'sine.inOut', immediateRender: false }, 20.0);
  cap('cap-8', 20.5, 22.1);
  tap('#ring-pu', 21.35);

  /* (a) click -> (b) panel appears pinned ABOVE the calculator */
  whip(21.85, '#S5', '#S6', -1);
  cap('cap-9', 22.55, 24.15);
  if (mPanelS6) {
    var g = mPanelS6.el;
    tl.fromTo(g, { boxShadow: '0 0 0 0 rgba(167,139,250,0)' },
      { boxShadow: '0 0 0 6px rgba(167,139,250,.65), 0 0 42px rgba(167,139,250,.5)', duration: 0.42, ease: 'power2.out', yoyo: true, repeat: 3, immediateRender: false }, 22.5);
  }

  /* (c) fields fill + live recompute (values driven by applyDynamic) */
  cap('cap-10', 24.35, 26.3);
  if (s6r) tl.fromTo(s6r, { scale: 1 }, { keyframes: [{ scale: 1.22, duration: 0.16, ease: 'power2.out' }, { scale: 1, duration: 0.22, ease: 'back.out(2)' }], immediateRender: false }, 25.05);

  /* punch the dark result */
  var s6res = mResS6 ? cam(1.8, mResS6.x + mResS6.w / 2, mResS6.y - 12 + mResS6.h / 2, PHONE.w / 2, PHONE.h * 0.45) : null;
  if (s6res) tl.to('.zoom', { scale: s6res.scale, x: s6res.x, y: s6res.y, duration: 0.8, ease: 'expo.out' }, 25.35);

  /* ============ B6: FAQs hub + live FAQ (26.5 - 31.8) ============ */
  zoomThrough(26.5, '#S6', '#S7');
  tl.set('#S7 .jp-body', { marginTop: 0 }, 26.72);
  tl.fromTo('#S7 .jp-body', { marginTop: 0 }, { marginTop: -SCROLL_FAQ, duration: 1.7, ease: 'sine.inOut', immediateRender: false }, 27.05);
  cap('cap-11', 26.95, 28.95);
  tap('#ring-faq', 28.85);

  zoomThrough(29.25, '#S7', '#S8');
  cap('cap-12', 29.75, 31.7);
  tap('#ring-raise', 30.0);
  if (s8res) tl.fromTo(s8res, { scale: 1 }, { keyframes: [{ scale: 1.18, duration: 0.15, ease: 'power2.out' }, { scale: 1, duration: 0.2, ease: 'back.out(2)' }], immediateRender: false }, 30.75);

  /* ============ B7: endcard (31.9 - 36) ============ */
  tl.to('.phone-unit', { y: PHONE.y + 260, scale: 0.9, autoAlpha: 0, filter: 'blur(18px)', duration: 0.75, ease: 'power2.in' }, 31.95);
  tl.to('.urlbar', { autoAlpha: 0, y: -70, duration: 0.4, ease: 'power2.in' }, 31.95);
  tl.to('.brandbar', { autoAlpha: 0, y: 60, scale: 0.9, duration: 0.4, ease: 'power2.in' }, 32.15);

  tl.fromTo('.ec-logo', { autoAlpha: 0, scale: 0.3, rotation: -14 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.55)', immediateRender: false }, 32.55);
  tl.fromTo('.ec-name', { autoAlpha: 0, y: 70, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out', immediateRender: false }, 32.9);
  tl.fromTo('.ec-domain', { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2.4)', immediateRender: false }, 33.25);
  tl.fromTo('.ec-tag', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', immediateRender: false }, 33.6);
  tl.fromTo('.ec-chip', { autoAlpha: 0, y: 34, scale: 0.85 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.12, immediateRender: false }, 33.9);
  tl.fromTo('.bg-orb.violet', { opacity: 1 }, { opacity: 1.0, scale: 1.15, duration: 2.4, ease: 'sine.inOut', immediateRender: false }, 33.2);

  /* ---------- helpers used above ---------- */
  function cap(id, tIn, tOut) {
    tl.fromTo('#' + id, { autoAlpha: 0, y: 70, scale: 0.82 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: 'back.out(2.4)', immediateRender: false }, tIn);
    tl.to('#' + id, { autoAlpha: 0, y: -46, scale: 0.94, filter: 'blur(8px)', duration: 0.28, ease: 'power2.in' }, tOut);
  }
  function cut(t, from, to) {
    tl.set(from, { autoAlpha: 0 }, t);
    tl.set(to, { autoAlpha: 1 }, t);
  }
  function whip(t, from, to, dir) {
    tl.to('.whip', { y: -150 * dir, filter: 'blur(26px)', duration: 0.2, ease: 'power2.in' }, t);
    cut(t + 0.2, from, to);
    tl.fromTo('.whip', { y: 170 * dir, filter: 'blur(26px)' }, { y: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out', immediateRender: false }, t + 0.2);
  }
  function zoomThrough(t, from, to) {
    tl.to('.whip', { scale: 1.5, filter: 'blur(22px)', opacity: 0.55, duration: 0.22, ease: 'power3.in' }, t);
    cut(t + 0.22, from, to);
    tl.set('.zoom', { scale: 1, x: 0, y: 0 }, t + 0.22);
    tl.fromTo('.whip', { scale: 0.78, filter: 'blur(22px)', opacity: 0.55 }, { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.45, ease: 'expo.out', immediateRender: false }, t + 0.22);
  }
  function tap(sel, t) {
    if (!document.querySelector(sel)) return;
    tl.fromTo(sel, { autoAlpha: 1, scale: 0.35 }, { scale: 1.5, autoAlpha: 0, duration: 0.55, ease: 'power2.out', immediateRender: false }, t);
    tl.set(sel, { autoAlpha: 0 }, t + 0.56);
  }

  window.__timelines['main'] = tl;

  /* expose deterministic seek hook for QA */
  window.__brSeek = function (sec) {
    tl.pause();
    tl.seek(Math.max(0, Math.min(DUR, sec)), false);
    return tl.time();
  };
})();
