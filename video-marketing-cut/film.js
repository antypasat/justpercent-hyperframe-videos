// Just Percent — Marketing Cut v3 (single film, HyperFrames master-clock).
// Honest narrative: the product does NOT auto-fill YOUR numbers. Calculators open
// with an EXAMPLE (default / last calculation); YOU type your own and the answer
// recomputes live on every keystroke — no submit. This cut centers that truth:
//   hook (a real question, worked out) → live typing (example → your own) → CTA.
//
// Coordinate space: CSS pixels of the captured 1600×900 viewport states
// (assets are @2x). Cursor waypoints travel on cubic Bezier segments; `jump`
// snaps the cursor with the content when a swap shifts the page.
// Typing: `times[]` = per-keystroke timestamps (human rhythm w/ jitter);
// `caret.xs[]` = caret x AFTER each typed char (measured from the real
// screenshots — the caret always hugs the last character).

window.FILM = {
  hyperframes: "1.0",
  name: "justpercent-marketing-cut",
  product: "Just Percent",
  scenes: [

    /* ── S1 · HOOK — a real everyday question, worked out (FAQ) ───────── */
    {
      id: "hook-faq",
      duration: 6.2,
      states: {
        faqs:  { asset: "assets/s-faqs-tip-row.png", w: 1600, h: 900 },
        hover: { asset: "assets/s-faqs-tip-row-hover.png", w: 1600, h: 900 },
        faq:   { asset: "assets/s-faq-tip.png", w: 1600, h: 900 }
      },
      swaps: [
        { t: 0.0,  state: "faqs",  fx: "cut",  dur: 0 },
        { t: 0.95, state: "hover", fx: "fade", dur: 0.2 },
        { t: 2.0,  state: "faq",   fx: "whip", dur: 0.28 }
      ],
      cursor: [
        { t: 0.0,  x: 880, y: 820 },
        { t: 0.95, x: 801, y: 744, cp: [[-120, -10], [90, 70]] },
        { t: 1.9,  x: 801, y: 744 },
        { t: 2.06, x: 750, y: 360, jump: true },
        { t: 2.75, x: 700, y: 472, cp: [[-60, 30], [60, -50]] },
        { t: 6.2,  x: 700, y: 472 }
      ],
      camera: {
        follow: { mode: "cursor", stiffness: 110, damping: "tight" },
        scaleTrack: [
          { t: 0.0, s: 1.35 },
          { t: 0.7, s: 1.7, ease: "ease-out-quart" },
          { t: 6.2, s: 1.7 }
        ]
      },
      events: [
        { kind: "click", t: 1.9, x: 801, y: 744 },
        { kind: "ring", t0: 2.9, t1: 5.9, rect: { x: 656, y: 444, w: 90, h: 56 } }
      ],
      fx: { trail: true },
      overlays: [
        { kind: "caption", text: "A 10% tip on a $150 bill?", in: 0.25, out: 3.3 },
        { kind: "caption", text: "$15 — worked out.", in: 3.5, out: 6.0, emphasis: true }
      ]
    },

    /* ── S2 · THE HERO — example → your own numbers, live recalc ──────── */
    {
      id: "live-typing",
      duration: 18.6,
      states: {
        empty: { asset: "assets/s-inc-empty.png", w: 1600, h: 900 },
        c1: { asset: "assets/s-inc-type-5.png", w: 1600, h: 900 },
        c2: { asset: "assets/s-inc-type-50-fixed.png", w: 1600, h: 900 },
        c3: { asset: "assets/s-inc-type-500.png", w: 1600, h: 900 },
        c4: { asset: "assets/s-inc-type-5000-fixed.png", w: 1600, h: 900 },
        p1: { asset: "assets/s-inc-type-25-2.png", w: 1600, h: 900 },
        p2: { asset: "assets/s-inc-type-25-25.png", w: 1600, h: 900 }
      },
      swaps: [
        { t: 0.0,  state: "empty", fx: "cut", dur: 0 },
        { t: 6.20, state: "c1", fx: "cut", dur: 0 },
        { t: 6.33, state: "c2", fx: "cut", dur: 0 },
        { t: 6.46, state: "c3", fx: "cut", dur: 0 },
        { t: 6.59, state: "c4", fx: "cut", dur: 0 },
        { t: 10.90, state: "p1", fx: "cut", dur: 0 },
        { t: 11.03, state: "p2", fx: "cut", dur: 0 }
      ],
      cursor: [
        { t: 0.0,  x: 1180, y: 680 },
        { t: 4.60, x: 1180, y: 680 },
        { t: 5.55, x: 573, y: 324, cp: [[-320, -90], [130, 160]] },
        { t: 6.90, x: 573, y: 324 },
        { t: 10.10, x: 824, y: 324, cp: [[80, 90], [-80, 90]] },
        { t: 11.30, x: 824, y: 324 },
        { t: 12.10, x: 1016, y: 324, cp: [[60, -80], [-70, -80]] },
        { t: 18.6, x: 1016, y: 324 }
      ],
      camera: {
        follow: { mode: "cursor", stiffness: 42, damping: "soft", offset: { x: -110, y: 0 } },
        scaleTrack: [
          { t: 0.0, s: 1.05 },
          { t: 4.4, s: 1.05 },
          { t: 5.4, s: 1.4, ease: "ease-in-out-cubic" },
          { t: 12.0, s: 1.4 },
          { t: 13.0, s: 1.58, ease: "ease-in-out-cubic" }
        ]
      },
      events: [
        { kind: "click", t: 5.85, x: 573, y: 324 },
        { kind: "glow", t0: 5.90, t1: 6.9, rect: { x: 509, y: 303, w: 128, h: 42 } },
        { kind: "type", times: [6.20, 6.33, 6.46, 6.59], x: 540, y: 324, text: "5000",
          caret: { y: 315, h: 18, xs: [577.5, 583, 587.5, 592] } },
        { kind: "click", t: 10.40, x: 824, y: 324 },
        { kind: "glow", t0: 10.45, t1: 11.1, rect: { x: 760, y: 303, w: 128, h: 42 } },
        { kind: "type", times: [10.90, 11.03], x: 800, y: 324, text: "25",
          caret: { y: 315, h: 18, xs: [828, 833] } },
        { kind: "ring", t0: 13.0, t1: 18.4, rect: { x: 950, y: 296, w: 132, h: 52 } }
      ],
      fx: {},
      overlays: [
        { kind: "caption", text: "It opens with an example — 240 + 15%.", in: 0.4, out: 5.6 },
        { kind: "caption", text: "Type your own — live on every keystroke.", in: 6.0, out: 10.1 },
        { kind: "caption", text: "Now the boost: 25%.", in: 10.3, out: 13.0 },
        { kind: "caption", text: "No Enter. No submit. 6,250 — live.", in: 13.3, out: 18.4, emphasis: true }
      ]
    },

    /* ── S3 · CTA plate ──────────────────────────────────────────────── */
    {
      id: "cta",
      duration: 6.9,
      plate: true,
      hideCursor: true,
      hideWm: true,
      states: {},
      swaps: [],
      cursor: [
        { t: 0.0, x: 800, y: 450 },
        { t: 6.9, x: 800, y: 450 }
      ],
      camera: {
        follow: { mode: "cursor", stiffness: 60, damping: "critical" },
        scaleTrack: [
          { t: 0.0, s: 1.0 },
          { t: 6.9, s: 1.05, ease: "linear" }
        ]
      },
      events: [],
      fx: {},
      overlays: [
        { kind: "caption", text: "Every percentage — answered.", in: 0.7, out: 3.6, emphasis: true },
        { kind: "caption", text: "Free at justpercent.com", in: 3.8, out: 6.7 }
      ]
    }
  ]
};
