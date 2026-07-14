# Smooth Scroll Reveal — Technique 6 (justpercent.com, US)

Seven Hyperframes configs presenting justpercent.com with the **Smooth Scroll
Reveal** technique: the camera is locked horizontally (`x:0`), slightly zoomed
(`scale 1.2–1.3`), and glides vertically over a full-page capture inside a
browser-chrome panel. American English, US locale only, only URLs verified in
the codebase (`src/pages/`).

## Files

- `smooth-scroll-reveal.html` — standalone deterministic player (open from
  `file://`, no server needed). Version buttons 6.1–6.7, **Play all**,
  `Space` pause, `R` restart. QA hooks: `window.__ssrSeek(key, tSeconds)`,
  URL params `?rec` (hide controls), `?t=<ms>` (seek), `?stop=<ms>`
  (auto-pause at exact master-clock time).
- `configs.js` — single source of truth for all 7 configs.
- `configs/*.json` — exported deliverables (`node export-configs.mjs`).
- `capture.mjs` — captures source frames from justpercent.com with the full
  stabilization guard (network idle ≥ 500 ms, `document.fonts.ready`, images
  decoded, no active animations, zero layout shift ≥ 500 ms — never
  mid-transition). Sections: `home postclick faqindex pu searchpin faqsub`.
- `qa-frames.mjs` — renders control frames of every version into `qa/`.
- `assets/` — @2x full-page captures + `geometry.json` (page-space rects).

## Versions

| # | Name | Page (verified URL) | Camera |
|---|------|--------------------|--------|
| 6.1 | Classic Vertical Scan | `/` homepage | y 0→800, ×1.3, 3.5 s, sine; subtle margin cursor |
| 6.2 | Post-Click Loaded List | `/decreased-value-calculator/` after clicking Solution Card “Apply My Coupon” ($100 − 20% = $80) | y 0→1000, ×1.3, 4 s |
| 6.3 | Slow Log Read | `/faqs/` index read like a ledger | y 0→1200, ×1.25, 5 s |
| 6.4 | Parallax-Free Long Form | `/increased-value-calculator/` after clicking Practical Use “Budget Boost” ($5,000 + 25% = $6,250) | y 0→1500, ×1.2, 4.5 s |
| 6.5 | Cursor-Assisted Scroll | `/` after searching “tip” and picking the first result (pinned Restaurant Tip: 15% of $60 = $9) | y 0→1880, ×1.3, 4.3 s; guiding cursor rides the right margin |
| 6.6 | Highlight-on-Scroll | `/` homepage Solution Cards | y 0→1000, ×1.3, 4 s; cards glow crossing frame center (gaussian falloff) |
| 6.7 | Scroll + Zoom Finish | `/faqs/bill-splitting-calculator/` | y 0→300 ×1.3 over 3 s, then zoom to ×2.0 on the Answer ($150 / $100), 1 s hold |

## Requirements covered (series-wide)

- Calculator pages shown via SolutionCard click (6.2).
- Practical Uses both ways: search box on home (6.5) and click below a
  calculator page (6.4).
- FAQ index (6.3) and a meaningful FAQ subpage (6.7).
- Every capture only after full DOM stabilization (see `meta.captureGuard`
  in each config).

## Player model

`camera.path` keys `{t, y, s}`: `y` = page-space scrollTop (CSS px of the
1600-wide capture), `s` = zoom (1.0 = page fits panel width), per-key `ease`
overrides `camera.easing` for the segment ending at that key. The renderer is
a pure function of (config, t) — deterministic and seek-safe. Extras rendered
per config: scrollbar indicator (velocity-reactive), guiding cursor
(panel-space keys), highlight rects (page-space, glow ∝ exp(−(d/σ)²) from
frame center).
