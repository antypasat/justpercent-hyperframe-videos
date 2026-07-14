# Just Percent — Technique 8: Layer Explosion / Z-Axis Separation

Seven Hyperframes configs (8.1–8.7) that slice real, live-captured justpercent.com
(US locale, American English) pages into depth layers and separate them on the
Z axis under a 3D camera. Open **`layer-explosion.html`** in a browser — no server
needed.

## Controls

- Version buttons **8.1–8.7**, **▶ Play all** — plays all versions in sequence
- **Space** pause/resume · **R** restart current version
- URL params: `#8.3` select version · `?rec` hide controls · `?t=<ms>` seek paused ·
  `?stop=<ms>` auto-pause at exact time
- QA hook: `window.__leSeek("8.5", 2.5)` renders a deterministic frame (returns a
  promise that resolves when layer images are decoded)

## The seven versions

| # | Name | Source scene (all URLs verified in the app code) |
|---|------|--------------------------------------------------|
| 8.1 | Classic 4-Layer Explosion | Home SolutionCards grid; cursor clicks **Apply My Coupon** (`/` → cards) |
| 8.2 | Post-Click Modal Explosion | `/increased-value-calculator/` after clicking Practical Use **Budget Boost** ($5,000 + 25% → $6,250) |
| 8.3 | Slow Elastic Bloom | `/decreased-value-calculator/` reached by the SolutionCard click, prefilled 100 − 20% → 80 |
| 8.4 | Reverse Assembly (Implosion) | `/faqs/tip-calculation-calculator/` builds itself from exploded layers |
| 8.5 | Deep Parallax Fly | `/faqs/` — 5 layers to Z=600, 30° orbit |
| 8.6 | Staggered Cascade | Home search “tip” → results portal cascade → page scrolled to the matched calculator (two shots) |
| 8.7 | Component Architecture Showcase | `/increased-value-calculator/` split into labeled semantic layers (PAGE / NAV / CALCULATOR / PRACTICAL USES) |

Product requirements covered: individual calculators shown via SolutionCard click
(8.1 → 8.3), Practical Uses both ways — homepage search box + scroll (8.6) and
click below the calculator (8.2, 8.7) — and FAQ index (8.5) + a sensible FAQ
subpage (8.4).

## Files

- `layer-explosion.html` — deterministic master-clock player (1600×900 letterboxed
  stage, analytic per-frame render, seek-safe)
- `configs.js` — source of truth for all 7 configs + baked layer geometry
- `configs/*.json` — exported Hyperframes JSON configs (`node export-configs.mjs`)
- `capture.mjs` — layered source capture from justpercent.com (Playwright).
  **Capture guard**: screenshots only after full DOM stabilization — network idle
  ≥ 500 ms, `document.fonts.ready`, all images decoded, no active finite
  animations, zero layout shift for ≥ 500 ms; post-click captures additionally
  wait for the triggered mutation to settle. Per scene it hides the elevated
  elements for a clean background plate, then clips each layer + writes a
  bounding-box manifest (`assets/layers/<scene>.json`).
- `qa-frames.mjs` — renders control stills of every version into `qa/`
- `assets/layers/` — background plates + per-layer PNGs (light theme, 1600×900 @2x)

## Capture notes (hard-won)

- The PWA service worker serves the offline page on direct sub-page `goto` —
  block it (`serviceWorkers: "block"`).
- Never remove consent UI with `[class*="cky-"]` — it also matches
  `solution-sti**cky-**note` and deletes all SolutionCards. Use `[class^="cky-"]`.
- SolutionCards mount ~1–2 s after load (template clone); wait for
  `#solution-desktop-grid .solution-sticky-note`.
- Search results live in `#search-results-list-portal`; select the first result
  with ArrowDown + Enter (the app's own demo pattern).
- Practical Uses mount deferred (IntersectionObserver) — scroll down in steps.
