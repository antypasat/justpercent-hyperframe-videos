# PROMPT — Build Film 4: "Hyper-Mixed Media" (justpercent.com, US)

You are a senior motion designer + creative technologist. You build broadcast-grade
product videos out of pure HTML/CSS/JS with deterministic, frame-exact playback.
First read the shared contract:
`/Users/michael/startups/percentage-calculator/JUSTPERCENT-FILMS-PLAYBOOK.md`
Work ONLY inside `/Users/michael/startups/percentage-calculator/hyperframes-video-hyper-mixed-media/`.

## Technique (chip)
- Chip line 1: `TECHNIQUE 4/7 · HYPER-MIXED MEDIA`
- Chip line 2: `Digital Scrapbook · Stop-Motion UI · Glitch & Datamosh`

## Core idea — controlled visual chaos
Viewers are tired of sterile CGI gradients. This film collides FORMATS: pristine
"film footage" (a video placeholder) smash-cuts into a dirty home-printer SCAN of
the real app, someone draws marker arrows on it, UI elements become paper
cutouts animated stop-motion, and scenes decay into datamosh glitches that
resolve into the next shot. Emotion: human, tactile, playful, a little punk —
but the REAL app screenshots stay crisp and legible (chaos frames them, never
destroys the information).

Build these reusable deterministic effect layers:
- SCAN LOOK: plate on a paper-white card, 1–2° rotation, hard drop shadow, torn
  edge (CSS clip-path with a ragged polygon), photocopy grain (SVG feTurbulence
  baked to a repeating PNG or a fixed noise div grid — deterministic, no random
  at runtime), faint halftone dots, a strip of "tape" at two corners.
- MARKER: hand-drawn annotations (SVG paths, round caps, slight wobble) that
  draw on via stroke-dashoffset as a pure function of t. Red/black marker circles
  around the answer, arrows to buttons, underlines under numbers. Add a
  scribbled handwriting caption style (use Space Grotesk italic + rotation —
  do NOT ship a new font).
- STOP-MOTION CUTOUT: UI crops (buttons, result field, category icons) move in
  12 fps steps (`tq = floor(t*12)/12`) with per-step ±1.5° rotation / ±3 px
  offset jitter from the seeded hash — like paper puppets. Same trick for their
  shadows (offset dark copies).
- DATAMOSH TRANSITION: outgoing frame slices into 14–20 horizontal strips that
  displace horizontally with RGB channel split (three tinted copies offset),
  pixel "blocks" (scaled-down-then-up crop tiles) crawl for 0.4 s, then the
  incoming scene resolves out of the noise. Deterministic strip offsets from the
  seeded hash keyed by strip index + frame.
- FORMAT CLASH CUT: video placeholder (pristine) → 2-frame white flash →
  SCAN LOOK version of the next plate.

## Story (use ONLY these captured assets — already in `assets/`, both themes)
FAQ journey + calculator Practical Use — real content:
Bill Splitting FAQ (`$250` bill split `60/40` → `$150` / `$100`) and
decreased-value PU pinned `300 − 30% = 210`.
- 0.0–3.0 s COLD OPEN: full-bleed **VIDEO PLACEHOLDER** `assets/live-action.mp4`
  (dashed slot, house pattern) — intended post-production content: real hands
  splitting a restaurant bill, 4K footage. Handwritten caption scribbles on top:
  "we split it 60/40…" Placeholder slot must show the target file name.
- 3.0–3.2 s FORMAT CLASH CUT → the /faqs/ hub as a SCAN (`faqs-top-*.png`),
  marker circle draws around the Bill Splitting card (`faqs-bill-*.png` shows
  the scrolled state — animate a paper-scroll between the two plates).
- 3.2–8.5 s FAQ HUB scrapbook: cutout category icons wobble stop-motion; a big
  red marker arrow draws toward the Bill Splitting card; caption plate:
  "64 real-life questions. already answered."
- 8.5–9.0 s DATAMOSH → `/faqs/bill-splitting-calculator/`.
- 9.0–15.5 s BILL SPLITTING page (`bill-top`, then a long paper-strip pan down
  the `bill-full` fullPage scan): marker underlines $250, circles $150/$100;
  cutout "$150" and "$100" pop out of the page and stamp down stop-motion.
  Caption: "your share: $150. theirs: $100. no arguments."
- 15.5–16.0 s DATAMOSH → `/decreased-value-calculator/`.
- 16.0–23.0 s PRACTICAL USES, the second way: the PU rows plate (`dec-pu-*.png`)
  as a clean digital plate (format clash back to "crisp"); a paper cutout cursor
  (little hand) taps a row → `dec-pinned-*.png` (pinned 300 − 30%); marker
  slashes "−30%", then punch-zoom into `dec-result-crop-*.png` → cutout "210"
  jumps out with a triple stop-motion bounce. Caption: "tap a real-life example.
  it fills itself in."
- 23.0–23.5 s biggest DATAMOSH of the film (whole frame shreds) →
- 23.5–30.0 s ENDCARD (house style) but scrapbook-flavored: the `%` mark as a
  paper cutout with tape, marker-drawn underline beneath `justpercent.com`,
  pills as torn paper scraps. Everything settles to a clean final frame.

## What already exists (do NOT redo)
- `capture.mjs` DONE; `assets/` complete in both themes (faqs-top, faqs-bill,
  bill-top, bill-full fullPage, dec-pu, dec-pinned, dec-result-crop);
  `geometry.js` + `assets/geometry.json` baked (rects + the values above);
  `fonts/` present. NO configs.js / player / qa / out yet.

## Build steps
1. `configs.js` → `window.F4` (id "4", technique/detail strings above, 30 s,
   30 fps, cssToStage 2.5) — every beat, marker path timing, caption, endcard.
2. `hyper-mixed-media.html` — deterministic player, house pattern, QA hook
   `window.__f4Seek(sec, theme)`. Model on
   `/Users/michael/startups/percentage-calculator/hyperframes-video-neuro-match-cut/neuro-match-cut.html`.
   Include the `#aVideo`-style placeholder for `assets/live-action.mp4`
   (full-bleed rect variant), video `currentTime` slaved to the master clock.
   IMPORTANT: create `qa/` and `out/` directories (`mkdirSync` in scripts).
3. `qa-frames.mjs` + `record.mjs` — copy from the film-5 dir; rename hook/file/prefix.
4. QA both themes at: 0.5, 2.9, 3.1, 4.8, 6.9, 8.6, 9.4, 11.5, 13.8, 15.7,
   16.4, 18.6, 20.9, 22.7, 23.2, 24.5, 27.0, 29.5. Review every PNG: scans
   readable (numbers legible through the grain), marker strokes on the right
   rects (use geometry, don't eyeball), stop-motion steps visible but not
   chaotic, datamosh never lands on a caption, light theme keeps contrast.
5. Render both themes → `out/hyper-mixed-media-dark.mp4` / `-light.mp4`.
6. `out/hyper-mixed-media-cuesheet.md`: video placeholder spec (file
   `assets/live-action.mp4`, 0.0–3.0 s full-bleed, its own location sound);
   foley suggestions — paper crumple/slide on cutout moves, marker squeaks on
   draws, printer/scanner whir under SCAN shots, bitcrush static during
   datamoshes, camera shutter on format clashes, page-flip on the bill pan.

## Acceptance
Both MP4s + cue sheet in `out/`; placeholder slot renders when the MP4 is absent;
all marker/cutout geometry pinned to real rects from `geometry.js`; deterministic
(two renders bit-identical); QA reviewed both themes; US English; chip correct.
