/*
 * timeline.js — a minimal, deterministic, seekable tween timeline.
 *
 * Implements the subset of the GSAP timeline interface that HyperFrames'
 * animation adapter relies on: paused construction, .duration(),
 * .totalDuration(), .seek(t), .progress(p), .time().
 *
 * Every visual state is a pure function of time `t` — no wall-clock,
 * no Math.random at seek time — so identical frames render identically.
 * Registered via window.__timelines[compositionId] like a GSAP timeline.
 */
(function (global) {
  'use strict';

  /* ---------- easing ---------- */
  const Ease = {
    linear: (p) => p,
    inQuad: (p) => p * p,
    outQuad: (p) => 1 - (1 - p) * (1 - p),
    inOutQuad: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
    inCubic: (p) => p * p * p,
    outCubic: (p) => 1 - Math.pow(1 - p, 3),
    inOutCubic: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    outQuart: (p) => 1 - Math.pow(1 - p, 4),
    inOutQuart: (p) => (p < 0.5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2),
    outExpo: (p) => (p === 1 ? 1 : 1 - Math.pow(2, -10 * p)),
    inExpo: (p) => (p === 0 ? 0 : Math.pow(2, 10 * p - 10)),
    // classic back overshoot (GSAP back.out(1.7))
    outBack: (p) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
    },
    inBack: (p) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return c3 * p * p * p - c1 * p * p;
    },
    // springy elastic settle
    outElastic: (p) => {
      const c4 = (2 * Math.PI) / 3;
      return p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c4) + 1;
    },
    // small bounce
    outBounce: (p) => {
      const n1 = 7.5625, d1 = 2.75;
      if (p < 1 / d1) return n1 * p * p;
      if (p < 2 / d1) return n1 * (p -= 1.5 / d1) * p + 0.75;
      if (p < 2.5 / d1) return n1 * (p -= 2.25 / d1) * p + 0.9375;
      return n1 * (p -= 2.625 / d1) * p + 0.984375;
    },
  };

  /* ---------- deterministic pseudo-random (mulberry32) ---------- */
  function seededRandom(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- timeline ---------- */
  class Timeline {
    constructor(opts = {}) {
      this._tweens = [];   // {start, dur, ease, apply(p), onceAt}
      this._calls = [];    // {at, fn, fired:Set-independent — recomputed per seek}
      this._t = 0;
      this._end = 0;
      this.paused = opts.paused !== false; // always effectively paused; seek-driven
    }

    /* schedule a tween: apply(easedProgress, rawProgress) called on every seek
       for t within [start, start+dur]; clamped outside so state is stable. */
    tween(start, dur, apply, ease = 'inOutCubic') {
      const fn = typeof ease === 'function' ? ease : (Ease[ease] || Ease.inOutCubic);
      this._tweens.push({ start, dur, ease: fn, apply });
      this._end = Math.max(this._end, start + dur);
      return this;
    }

    /* schedule a set: instant state change at `at` (applies for all t >= at,
       idempotent — re-applied on every seek past `at`) */
    set(at, apply) {
      return this.tween(at, 0.0001, (p) => { if (p >= 1) apply(); }, 'linear');
    }

    /* convenience: numeric interpolation helper */
    static lerp(a, b, p) { return a + (b - a) * p; }

    /* drop every scheduled tween (used to rebuild deterministically
       after document.fonts.ready — layout must be measured with the
       final fonts, or measurements would differ between page loads) */
    clear() { this._tweens = []; this._end = 0; this._lastApplied = undefined; return this; }

    duration() { return this._end; }
    totalDuration() { return this._end; }
    time() { return this._t; }

    /* The core: state at time t is produced by replaying, in insertion
       order, every tween whose start <= t (clamped to p=1 once finished).
       Tweens that haven't started yet contribute NOTHING — an element's
       pre-start look comes from CSS or from earlier tweens. This makes
       seek(t) exact for any monotonically increasing seek sequence
       (which is how both the renderer and playback drive it), and matches
       GSAP's render order semantics for our usage. */
    seek(t) {
      /* Monotonic fast-path: a tween that already FINISHED before the
         previous seek wrote its clamped p=1 state to the DOM then, and
         nothing re-dirties it while time only moves forward — so it can
         be skipped. This turns real-time playback from O(whole timeline)
         per frame into O(active tweens) without changing a single frame:
         the state is still the same pure function of t. Any backward
         seek (scrubbing) falls back to the full replay. */
      const from = this._lastApplied;
      const fullReplay = typeof from !== 'number' || t < from;
      this._t = t;
      for (const tw of this._tweens) {
        if (t < tw.start) continue;               // not started — no effect
        if (!fullReplay && tw.start + tw.dur < from) continue; // finished before last seek — already applied at p=1
        let p = (t - tw.start) / tw.dur;
        if (p > 1) p = 1;
        tw.apply(tw.ease(p), p);
      }
      this._lastApplied = t;
      return this;
    }

    progress(p) {
      if (p === undefined) return this._end ? this._t / this._end : 0;
      return this.seek(p * this._end);
    }

    /* preview playback in a normal browser (not used during rendering) */
    play() {
      const t0 = performance.now() - this._t * 1000;
      const step = (now) => {
        const t = (now - t0) / 1000;
        this.seek(Math.min(t, this._end));
        if (t < this._end && !this.paused) this._raf = requestAnimationFrame(step);
      };
      this.paused = false;
      this._raf = requestAnimationFrame(step);
      return this;
    }
    pause() { this.paused = true; if (this._raf) cancelAnimationFrame(this._raf); return this; }
  }

  global.HFTimeline = Timeline;
  global.HFEase = Ease;
  global.HFSeededRandom = seededRandom;
})(typeof window !== 'undefined' ? window : globalThis);
