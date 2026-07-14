/*
 * timeline.js — a minimal, deterministic, seekable tween timeline.
 *
 * Implements the subset of the GSAP timeline interface that HyperFrames'
 * animation adapter relies on: paused construction, .duration(),
 * .totalDuration(), .seek(t), .progress(p), .time().
 *
 * FULLY BIDIRECTIONAL: seek(t) is a pure function of t. On every seek,
 * EVERY tween is replayed in insertion order with its progress clamped
 * to [0,1] — tweens that haven't started yet apply their p=0 state, and
 * finished tweens apply their p=1 state. Scrubbing backwards therefore
 * never leaves stale ("hung") states: the frame at time t is identical
 * no matter what seek sequence preceded it. No wall-clock, no
 * Math.random at seek time.
 *
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
    outBack: (p) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
    },
    inBack: (p) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return c3 * p * p * p - c1 * p * p;
    },
    outElastic: (p) => {
      const c4 = (2 * Math.PI) / 3;
      return p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c4) + 1;
    },
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
  /* one deterministic random number for an integer key (no state carried) */
  function rnd1(key) { return seededRandom(0x9E3779B9 ^ key)(); }

  /* ---------- timeline ---------- */
  class Timeline {
    constructor(opts = {}) {
      this._tweens = [];   // {start, dur, ease, apply}
      this._t = 0;
      this._end = 0;
      this.paused = opts.paused !== false; // always effectively paused; seek-driven
    }

    /* Schedule a tween. apply(easedP, rawP, absT) is called on EVERY seek,
       with p clamped to [0,1] (p=0 before start, p=1 after end). Because
       every tween is always applied, authors must write tweens fromTo-style
       (state fully determined by p) — which makes each frame a pure
       function of t, forwards and backwards. */
    tween(start, dur, apply, ease = 'inOutCubic') {
      const fn = typeof ease === 'function' ? ease : (Ease[ease] || Ease.inOutCubic);
      this._tweens.push({ start, dur: Math.max(dur, 1e-6), ease: fn, apply });
      this._end = Math.max(this._end, start + dur);
      return this;
    }

    /* Discrete two-state switch: before `at` applyOff() runs, at/after `at`
       applyOn() runs — re-evaluated on every seek, so fully reversible. */
    setAt(at, applyOn, applyOff) {
      return this.tween(at, 1e-6, (p) => { if (p >= 1) applyOn(); else if (applyOff) applyOff(); }, 'linear');
    }

    /* Full-length driver: fn(t) called every seek with the absolute time.
       Useful for state that is naturally a function of absolute time. */
    drive(fn) {
      const self = this;
      this._tweens.push({ start: 0, dur: Infinity, ease: Ease.linear, apply: (_p, _r, t) => fn(t), drive: true });
      return this;
    }

    static lerp(a, b, p) { return a + (b - a) * p; }

    clear() { this._tweens = []; this._end = 0; return this; }

    duration() { return this._end; }
    totalDuration() { return this._end; }
    time() { return this._t; }

    /* Pure state reconstruction: replay ALL tweens in insertion order with
       clamped progress. Same t in => same frame out, regardless of history. */
    seek(t) {
      this._t = t;
      for (const tw of this._tweens) {
        if (tw.drive) { tw.apply(0, 0, t); continue; }
        let p = (t - tw.start) / tw.dur;
        if (p < 0) p = 0; else if (p > 1) p = 1;
        tw.apply(tw.ease(p), p, t);
      }
      return this;
    }

    progress(p) {
      if (p === undefined) return this._end ? this._t / this._end : 0;
      return this.seek(p * this._end);
    }

    /* preview playback in a plain browser (not used during rendering) */
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
  global.HFRnd1 = rnd1;
})(typeof window !== 'undefined' ? window : globalThis);
