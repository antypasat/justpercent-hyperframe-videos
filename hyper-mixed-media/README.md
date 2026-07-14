# JustPercent — Hyper-Mixed Media teaser

HyperFrames composition, **1080×1920 (9:16), ~36 s, 30 fps, silent** (autoplay-muted teaser).
US English only; all app UI copy comes from the app's real `en-US` locale files.

## Preview

```bash
cd hyperframes-video/hyper-mixed-media
npx hyperframes preview
```

(The deliverable is the composition + preview; no file rendering.)

## Style — Hyper-Mixed Media (digital scrapbooking)

- Paper scrapbook backdrop, washi tape, torn-paper scraps, photocopy-style panels with hard offset shadows.
- Stop-motion paper cutouts: intro chips (20% OFF / +8% TAX / 18% TIP), a cutout pointing hand (quantized 8 fps movement with seeded jitter), digit flips in inputs.
- Marker annotations drawn on live (circle around the coupon card, underline under the FAQ answer).
- Digital glitch & datamosh: seeded RGB slice bars + SVG feTurbulence/feDisplacementMap bursts on scene cuts.
- Mid-film **3D flip of the phone → dark mode** (theme + screen swap exactly edge-on).

## Story (the app's differentiator: from YOUR situation to the right calculator)

1. **0–4 s** — scrapbook cold open, sequential headline panels.
2. **4–9.5 s** — light-mode home (`/`): full page, marker circles the coupon SolutionCard, cutout hand taps **Apply My Coupon**.
3. **9.5–17.8 s** — `/decreased-value-calculator/`: opens pre-filled (100 − 20 % → 80, live count-up). Practical Uses below the card: hand **(a) clicks** "Sale Discount", **(b)** the "Selected Practical Use Example" appears **above the form**, **(c)** fields fill (300 / 30) and the answer recalculates live → 210.
4. **17.8–24.6 s** — home search: types "tip", liquid-glass dropdown (practical use + FAQ + solution rows), tap → page scrolls to the **Basic Percentage** calculator; scroll fully settles with the pinned example above the form (15 % of 60 → 9), whole calculator in frame.
5. **24.6–26 s** — 3D flip + datamosh → **dark mode**, `/faqs/` hub.
6. **26–32 s** — hub card tap → `/faqs/tip-calculation-calculator/`: live FAQ edit, bill 150 → 220, answer 15 → 22, formula text updates live, marker underline.
7. **32–36 s** — glitch out → torn-paper endcard: original logo, Just Percent, justpercent.com, tagline, pills.

Persistent chrome: compact browser URL pill (real, verified routes with trailing `/`), bottom brand-bar
(original `percentage.webp` logo + justpercent.com) that yields to the endcard, big glass captions above
the brand bar.

## Determinism

`lib/timeline.js` is a seekable timeline whose `seek(t)` replays **every** tween with progress clamped
to [0,1] (plus pure `drive(t)` functions for discrete state) — the frame at time *t* is a pure function
of *t*, forwards **and backwards** (no hung states when scrubbing). No `Math.random()`/`Date.now()`;
all jitter uses a seeded mulberry32 keyed by frame index. Registered as
`window.__timelines["jp-hyper-mixed-media"]`. Layout is re-measured and the timeline rebuilt once
`document.fonts.ready` resolves (then re-seeked to the same t).

## Fidelity

- UI recreated 1:1 from the app's own sources (`handy-percent/src`): tokens from `card-colors.css` /
  `liquid-glass.css` / Tailwind config, components per `Navigation`, `SearchBox`, `SolutionCard`,
  `CalculatorCard`, `PracticalUse`, `BaseFAQ` (+ the pinning presentation container), fixed theme
  toggle, footer. See `css/app.css`.
- Fonts: the app's own @fontsource woff2 files (IBM Plex Sans, Space Grotesk) in `assets/fonts/`.
- Logo: the app's real asset `public/images/percentage.webp` (also used by the nav, brand bar, endcard).
- Full-viewport states (nav pinned like the real fixed nav, hero, search, filter, cards, footer,
  floating theme toggle) — not isolated components.
