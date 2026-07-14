# Film 5 / 7 — Neuro-Editing & Match-Cutting

9:16 (1080×1920, 30 fps, ~30 s) YouTube-Shorts product film for **justpercent.com** (US locale).
Technique: cognitive-rhythm editing — the viewer's eye never moves. Every cut lands on a
shape-matched anchor at the same screen position; one strictly monotonic zoom (zoom infinito)
runs through the whole film; the last second geometrically equals the first (seamless loop).

## Files

| File | Purpose |
|------|---------|
| `capture.mjs` | Captures all site states from https://justpercent.com (both themes) into `assets/` + `assets/geometry.json`. Playwright, viewport 432×768 @ dsf 2.5 = 1080×1920. |
| `assets/` | 22 capture PNGs (plates + crops, `-dark`/`-light`) + `geometry.json`. |
| `geometry.js` | `window.F5GEO` — per-theme rects baked as JS (file:// cannot fetch JSON). |
| `configs.js` | `window.F5` — director config: beat sheet, zoom, scene poses, captions, clip windows. Source of truth for all timing. |
| `neuro-match-cut.html` | The player. Deterministic master clock; every pixel a pure function of t; seek-safe. |
| `qa-frames.mjs` | Renders exact player frames into `qa/` for visual verification. `node qa-frames.mjs [theme] [t1 t2 …]` |
| `record.mjs` | Frame-by-frame render → ffmpeg → `out/neuro-match-cut-<theme>.mp4`. `node record.mjs [theme] [fps]` |
| `out/` | `neuro-match-cut-dark.mp4`, `neuro-match-cut-light.mp4` (libx264, crf 18, yuv420p, +faststart). |

## Story / beats (master beat sheet in `configs.js` → `F5.beats`)

| Time | Beat |
|------|------|
| 0.0–2.0 s | Opening circle (Ø640): VIDEO PLACEHOLDER `assets/opening-ball.mp4`. Caption "your brain hates math. good thing…" |
| 2.0–6.0 s | MATCH CUT #1 — circle becomes the round site theme-toggle (captured crop, same anchor); pull-back reveals the homepage plate. Caption "…justpercent.com solved it." |
| 6.0–11.4 s | MATCH CUT #2 chain on rounded rects — "Apply My Coupon" CTA pill → hint banner on /decreased-value-calculator/ → pull-back reveals calculator pre-filled 100 − 20% = 80. |
| 11.4–17.1 s | MATCH CUT #3 — result "80" panel rounds into a circle → round FAQ category icon → pull-back reveals the /faqs/ hub. Caption "answers before you finish asking." |
| 17.1–23.2 s | MATCH CUT #4 — FAQ icon circle → "%" brand glyph → homepage search pill; hard background micro-cuts every 0.8 s behind the fixed anchor. |
| 23.2–30.0 s | Finale + LOOP CLOSURE — search pill morphs into the endcard's white justpercent.com pill (endcard staggers in at 24.05 s, holds to 28.9 s); in the final 0.9 s the pill shrinks back into the opening circle (Ø640, same center). |

Zoom infinito: `Z(t) = 1.22^(t/30)` on a global wrapper — strictly monotonic across all 30 s.
Contractual on-screen sizes (the Ø640 loop circle at t=0 and t=30) divide by Z(t) per frame.

## Player controls

- URL params: `?t=<ms>` start, `?stop=<ms>` freeze, `?rec` hide controls, `?theme=light`, `?pause`.
- Keyboard: Space = play/pause, R = restart. Scrub bar at the bottom (hidden by `?rec`).
- QA hook: `window.__f5Seek(seconds, theme)` — synchronous seek + render.
- Theme button (🌙/☀️) swaps the ENTIRE asset set (per-theme PNGs + per-theme `F5GEO`).

## Determinism & capture guard

- Every pixel is a pure function of t; no CSS animations/transitions inside the stage; seeking
  to the same t twice renders identical pixels (required by frame-by-frame recording).
- Every capture was taken after the stabilization guard: network idle ≥500 ms, `document.fonts.ready`,
  images decoded, no active finite animations, layout-shift quiet ≥500 ms; post-click DOM settled.
- Site traps honored: `?noredirect` on every goto; theme forced pre-load via localStorage
  `jp:config:v1`; fresh context per independent section (localStorage persistence); cookie banner
  accepted then revisit-button hidden via `.cky-btn-revisit-wrapper` (never `[class*="cky-"]`).

## Post-production — VIDEO PLACEHOLDER

| Asset | On screen | Stage region | Expected content |
|-------|-----------|--------------|------------------|
| `assets/opening-ball.mp4` | 0.00–2.00 s | Circle, center (540, 960), Ø 640 px (masked) | Live-action round object (ball/coin) flying toward camera; the cut lands when it fills the circle. |
| (echo of its first frame) | 29.20–30.00 s | Same circle | Rendered automatically at 3% opacity inside the loop circle — no action needed. |

Drop the file into `assets/` and the player picks it up automatically: while playing it plays
muted; while paused/scrubbing it is synced via `video.currentTime = clamp(t − 0, 0, 2)`.
If the file is missing, a dashed "VIDEO PLACEHOLDER" slot renders instead (film still records fine).

## Suggested SFX (post)

- 0.0 s soft riser into the cut; whoosh + sub thump on each match cut (2.0 / 6.0 / 7.1 / 11.4 / 13.1 / 17.1 / 20.5 s).
- Ticking micro-cut clicks every 0.8 s during 17.1–23.9 s.
- Warm pad under the endcard (24–29 s); tiny "pop" as the pill snaps back into the circle (~29.8 s).

## QA verdict (2026-07-13)

- Endcard fully composed 25.5–28.9 s, readable in both themes; chip visible throughout.
- Loop pair verified: frame 29.97 vs 0.00 — circle center/diameter identical; the white→dashed-slot
  fill swap is the film's match-cut grammar (shape persists, fill cuts) and reads as intended.
- 46+ QA stills in `qa/` (dark full sweep 0–29.97 s; light at key beats).
