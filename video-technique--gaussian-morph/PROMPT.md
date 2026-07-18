# PROMPT — Build Film 6: "Gaussian Splatting & AI Morphing" (justpercent.com, US)

You are a senior motion designer + creative technologist. You build broadcast-grade
product videos out of pure HTML/CSS/JS with deterministic, frame-exact playback.
First read the shared contract:
`/Users/michael/startups/percentage-calculator/JUSTPERCENT-FILMS-PLAYBOOK.md`
Work ONLY inside `/Users/michael/startups/percentage-calculator/hyperframes-video-gaussian-morph/`
(this directory is NEW — you create everything in it; `PROMPT.md` is the only file so far).

## Technique (chip)
- Chip line 1: `TECHNIQUE 6/7 · GAUSSIAN SPLATTING & AI MORPHING`
- Chip line 2: `Splat Fly-Through · Hallucinatory Morphs · Frozen Time`

## Core idea — flat screenshots become frozen 3D worlds
Ken Burns is dead. Here every page of justpercent.com behaves like a **frozen
splat scene**: the screenshot decomposes into thousands of soft gaussian dots
(splats) with depth, the camera flies THROUGH the frozen moment (impossible
dolly between the dots), and scenes never cut — scene A **dissolves and
re-condenses** into scene B like a Sora/Midjourney morph hallucination.
Emotion: awe, weightlessness, dreamlike; slow luxurious camera against the
usual violet→cyan palette. This is the "premium" film of the series — no hard
cuts at all, one continuous camera breath for 30 s.

## The splat engine (the heart of the film — build it well)
- `capture.mjs` additionally exports, per captured plate and theme, a
  downsampled pixel grid `assets/splats-<scene>-<theme>.json`: sample the PNG
  on a ~90×160 grid (≈14k points; tune for 60 fps canvas perf), storing per
  point `{x, y, rgb, lum}`. Do the sampling in Node (Playwright page with an
  offscreen canvas, or `createImageBitmap` in a scratch page) so the player
  never depends on CORS-tainted canvases from `file://`.
- Player renders splats on a single `<canvas>` 1080×1920: each point is a
  radial-gradient sprite (pre-rasterized to an offscreen sprite sheet in 8
  tint buckets — do NOT create gradients per point per frame).
- Depth: `z = f(lum, region)` — brighter UI (cards, inputs) floats closer;
  add per-point seeded jitter so surfaces feel volumetric. Camera is a simple
  perspective projection (`scale = fov/(fov+z-camZ)`) with a scripted dolly
  path; parallax does the 3D storytelling.
- ASSEMBLE state: points sit exactly at their sampled positions → the canvas
  becomes pixel-faithful to the real screenshot; crossfade to the actual PNG
  plate whenever the page must be read (text legibility rule!). DISSOLVE state:
  points drift apart along seeded velocity fields + curl noise (deterministic,
  function of t only).
- MORPH A→B: index-matched interpolation — sort both clouds by a shared
  space-filling order (e.g. Hilbert/Z-order on the grid), then lerp position AND
  color per index with a per-point stagger (0–0.6 s spread). Mid-morph, points
  briefly form a "%"-glyph silhouette (sample a rendered "%" mask as target
  positions) — the hallucination moment.

## Story / flow (capture these real states — genuine clicks, per playbook rules)
1. 0–2.5 s: **VIDEO PLACEHOLDER** `assets/product-still.mp4` inside a floating
   card (dashed slot, house pattern) — intended post content: slow-mo lifestyle
   shot (e.g. a receipt on a table). Splats begin leaking out of its edges.
2. 2.5–8 s: the placeholder dissolves into splats that re-condense into the
   HOME page plate; camera flies through the cloud while it assembles; settle
   crossfades to the crisp `home-*.png`; caption: "every percent tool.
   one frozen world."
3. 8–13 s: dolly INTO the SolutionCards grid; pick one not-yet-featured
   SolutionCard (`#solution-mobile-grid .solution-sticky-note`), click its
   `.solution-cta-button` in capture and record the genuine destination URL
   (must be one of the verified calculator routes — assert it in capture).
   The card's crop lifts off the plate as a dense mini-cloud → MORPH into the
   destination calculator page plate. Caption: "tap a card…"
4. 13–19 s: on the calculator page, scroll plate to the **Practical Uses** rows
   below the calculator; click one row in capture (pins its values) and capture
   the pinned state. In the player: splat-swirl between unpinned → pinned
   plates; punch the result field crop forward in z. Caption: "…or a real-life
   example. numbers appear before doubts do."
5. 19–25 s: the calculator cloud dissolves and re-condenses into a `/faqs/<slug>/`
   page related to that calculator (verify the slug exists in
   `handy-percent/src/pages/faqs/`); mid-morph the "%"-glyph hallucination
   appears. Caption: "64 answers, frozen mid-air."
6. 25–30 s: cloud collapses into the ENDCARD (house style); the last splats
   orbit the white `justpercent.com` pill and freeze on the final frame.

## Build steps
1. `capture.mjs` — copy the guard/context helpers from
   `/Users/michael/startups/percentage-calculator/hyperframes-video-neuro-match-cut/capture.mjs`
   (stabilization contract is mandatory, both themes, `?noredirect`, US locale).
   Capture: home plate, chosen card crop + genuine click destination plate,
   PU rows plate, pinned plate, result crop, FAQ page plate — PLUS the
   `splats-*.json` grids for every plate. Write `geometry.js` +
   `assets/geometry.json` (rects, destination URL, pinned values).
2. Copy `fonts/` from the film-5 dir. Create `qa/`, `out/` via scripts.
3. `configs.js` → `window.F6` (id "6", strings above, 30 s / 30 fps /
   cssToStage 2.5): camera path keyframes, morph windows, stagger spreads,
   captions (US English), endcard.
4. `gaussian-morph.html` — deterministic player, house pattern, QA hook
   `window.__f6Seek(sec, theme)`; canvas splat engine as specified; PNG plates
   crossfade in whenever text must be readable; `?rec&pause&theme=` params.
   Model chrome (controls/chip/captions/endcard/placeholder) on the film-5 player.
5. `qa-frames.mjs` + `record.mjs` — copy from film-5, rename hook/file/prefix.
   Canvas frames must be reproducible: render from config + seeded hash only.
6. QA both themes at ~18 spread timestamps incl. every morph midpoint and every
   assembled-plate moment. Check: assembled clouds are pixel-faithful, text is
   never presented as splats longer than 0.5 s without the crisp plate,
   morphs read as transformation (not noise), 60 fps-able (record.mjs is
   frame-stepped so runtime perf only matters for preview).
7. Render both themes → `out/gaussian-morph-dark.mp4` / `-light.mp4`.
8. `out/gaussian-morph-cuesheet.md`: placeholder spec (`assets/product-still.mp4`,
   0–2.5 s, floating card) + sound design: airy granular shimmer during
   dissolves, sub swell on each re-condense, choir pad at the "%" hallucination,
   silence-then-heartbeat on the final freeze.

## Acceptance
Both MP4s + cue sheet in `out/`; splat data + geometry generated by capture (not
hand-typed); genuine click destinations asserted against verified routes; morphs
continuous (zero hard cuts in the whole film); deterministic; QA reviewed in both
themes; US English; chip correct.
