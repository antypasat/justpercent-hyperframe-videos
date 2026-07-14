# Technique 4 — "The State Toggle" (Before & After)

Product films for **justpercent.com** (US locale, American English). Every
version toggles between two (or three) REAL states of the live app — captured
from the live DOM only after full stabilization (network idle ≥ 500 ms,
`document.fonts.ready`, no active transitions, all images decoded, zero layout
shift for ≥ 500 ms). No mock data, no retouching. All URLs verified in
`handy-percent/src/pages`.

## Files

- `state-toggle.html` — self-contained deterministic player (open via `file://`).
  Version buttons `4.1`–`4.7`, **Play all**, `Space` pause, `R` restart.
  QA params: `?rec` (hide controls), `?t=<ms>` (seek paused), `?stop=<ms>`
  (auto-pause), `#4.3` (deep-link a version).
  Seek hook: `window.__stSeek("4.4", 3.1)` → renders that exact frame.
- `configs.js` — the seven timeline configs (`window.ST_CONFIGS`).
- `configs/*.json` — the same configs as JSON deliverables (`node export-configs.mjs`).
- `capture.mjs` / `capture-fix.mjs` — Playwright capture with the stabilization
  guard. Fix pass re-captures in FRESH browser contexts (SolutionCard prefills
  + hint banners persist in localStorage and contaminate later states).
- `qa-frames.mjs` — renders control frames of every version into `qa/`.
- `assets/` — captured source frames (PNG @2x) + `geometry.json`
  (viewport rects of click targets measured at capture time).

## Versions

| # | Toggle | Story (all real app states) |
|---|--------|------------------------------|
| 4.1 | Hard cut | Home grid → cursor clicks **Apply My Coupon** → `/decreased-value-calculator/` prefilled $100 − 20% → **$80** |
| 4.2 | Whip after real DOM mutation | `/increased-value-calculator/`: click Practical Use **Budget Boost** → pinned example + $5,000 + 25% → **$6,250** |
| 4.3 | Directional whip-pan (0.25 s) | Home grid → **Calculate My Tip** → `/basic-percentage-calculator/` 18% of $50 → **$9** |
| 4.4 | Crossfade + slow pan | `/faqs/` hub → **Bill Splitting** interactive FAQ, 60/40 of $250 → **$150 / $100** |
| 4.5 | Empty state → data (2 cuts) | Home search: focused empty → type **“tip”** → results portal → Enter → pinned Restaurant Tip, 15% of $60 → **$9** |
| 4.6 | Split-screen wipe (0.8 s) | `/percentage-change-calculator/`: built-in example vs rent hike $2,000 → $2,200 = **+10%** (banner dismissed so frames register 1:1) |
| 4.7 | Double toggle ×2 | `/increased-value-calculator/`: default ↔ sales-tax state $100 + 8% → **$108**, ends on B with reveal zoom-out |

## Renderer notes

- Single master clock; every frame is a pure function of `t` (seek-safe, QA-able).
- Camera = scale + focus point mapped to stage centre, clamped to plate bounds;
  impact zooms are explicit keyframes (1.8 → 1.85 → 1.8 over 0.2 s per spec).
- Whip travel is computed in SCREEN pixels (`1720 / scale`) so plates stay
  gap-free at any zoom; directional blur via SVG `feGaussianBlur` on X only.
- Wipe reveals B from the RIGHT so BEFORE|AFTER reads left→right; the glowing
  divider + badges are keyed to the wipe window.
- Cursor rides layer A in image space and is gated by `1 − vis(B)` so it can
  never survive a crossfade.
