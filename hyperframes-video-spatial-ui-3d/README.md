# Film 1 — Spatial UI & 3D Screencasting (justpercent.com, US)

9:16 YouTube Shorts product film (1080×1920, 32s) presenting **justpercent.com**
(US locale, American English) with **Technique 1: Spatial UI & 3D Screencasting**:

- **Layer Peeling** — the homepage splits into Z-depth layers (title, search,
  solution cards) that drift in 3D space with glass edges and light sheens.
- **Clay 3D cursor** — a giant claymorphic cursor slams the "Apply My Coupon"
  SolutionCard; the whole frame shakes (camera shake) and ripples.
- **Glassmorphism** — on the Value Decrease calculator page the inputs
  ($100, 20%) and the answer ($80) float as glass panels over the blurred page.

Story: homepage → SolutionCard click → `/decreased-value-calculator/` arrives
pre-filled (100 − 20% = 80) → glass panels present the result → end card.

## Files

| File | Purpose |
| --- | --- |
| `spatial-ui-3d.html` | Deterministic master-clock player (open via `file://`) |
| `configs.js` | Director config — camera keys, peel depths, captions (source of truth) |
| `geometry.js` | Baked element rects from capture (auto-generated) |
| `capture.mjs` | Captures both-theme states from justpercent.com (`node capture.mjs hd`) |
| `qa-frames.mjs` | QA stills → `qa/` (`node qa-frames.mjs [dark|light] [t…]`) |
| `record.mjs` | Deterministic MP4 render → `out/` (`node record.mjs dark 30`) |
| `assets/` | 1080×1920 page states + per-layer clips + `geometry.json` |
| `fonts/` | Local woff2 — player is fully offline |
| `out/` | `spatial-ui-3d-dark.mp4`, `spatial-ui-3d-light.mp4` |

## Dark / Light mode

Every state is captured in **both themes** (site theme forced via
`localStorage jp:config:v1 = {theme, locale:"us"}`). The player's
**🌙/☀️ toggle** (or `?theme=light`) swaps the whole asset set; geometry is
per-theme. Record each theme with `node record.mjs <theme>`.

## Player controls

- `Space` pause/resume, `R` restart, scrub bar, theme toggle.
- URL: `?t=<ms>` seek, `?stop=<ms>` auto-pause, `?rec` hides controls,
  `?theme=light`, `?pause` don't autoplay.
- QA hook: `await window.__f1Seek(seconds, "dark"|"light")` — resolves after
  all frames decoded.

## Determinism & capture guard

- Single master clock; every pixel is a pure function of `t` (no CSS
  animations/transitions in the stage). Seeking reproduces identical frames.
- Every source screenshot was taken only after **full stabilization**:
  network idle ≥ 500 ms, `document.fonts.ready`, all images decoded, no
  active finite animations, zero layout shift ≥ 500 ms; after the SolutionCard
  click the new DOM settled before capture. Never mid-transition.

## Technique chip

Top-left chip renders `TECHNIQUE 1/7 · SPATIAL UI & 3D SCREENCASTING` with the
detail line `Layer Peeling · Clay Cursor · Glassmorphism · Camera Shake`.

## Video placeholders

None needed for this film — all imagery is genuine captured UI.
