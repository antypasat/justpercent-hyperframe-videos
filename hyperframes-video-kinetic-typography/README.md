# Film 2 / 7 — Kinetic Typography & Font Bending

9:16 (1080×1920, 30 fps, 30 s) YouTube-Shorts product film for **justpercent.com** (US locale).
Technique: type IS the hero — Frankenstein mixed-voice typography, 2–3-frame flash frames on
inverse plates, giant letters that squash-and-stretch into the REAL site search box (synced to
real per-keystroke captures), and a font-bending finale (stepped weight jumps, scaleY breathing,
skew hits, echo copies).

## Files

| File | Purpose |
|------|---------|
| `capture.mjs` | Captures homepage/search/keystroke/selected states (both themes) into `assets/` + geometry. |
| `assets/` | 18 PNGs + `geometry.json` (home-top, search-focused, key-t/ti/tip with live dropdown, selected + banner/card/result crops). |
| `geometry.js` | `window.F2GEO` — per-theme rects (search box, result, banner…). |
| `configs.js` | `window.F2` — hook words, strobe list, letter beats, flashes, bend params, kinetic captions. |
| `kinetic-typography.html` | The player. Deterministic master clock; pure function of t; seek-safe. |
| `qa-frames.mjs` / `record.mjs` | QA stills / MP4 render (`out/kinetic-typography-<theme>.mp4`). |

## Story / beats

| Time | Beat |
|------|------|
| 0–3 s | Frankenstein hook "MATH IS EVERYWHERE" — each word a different type voice (Space Grotesk 700 / Georgia italic / JetBrains Mono / IBM Plex 300), colliding sizes/baselines/rotations, per-word kinetic entrances. |
| 3.05–4.15 s | FLASH FRAMES: TIPS / TAX / SALES / RAISES / DISCOUNTS, 3 frames each, alternating inverse plates. |
| 4.15–5.5 s | Beat pause: "ONE ANSWER: JUST PERCENT". |
| 5.55–13 s | Giant letters "t", "i", "p" punch in (scale 8× → squash into the real search box); behind them the REAL per-keystroke captures (live dropdown) snap in sync (6.75 / 8.95 / 11.15 s) with impact flashes + shakes. Kinetic captions "JUST TYPE…", "WATCH IT FIND THE MATH." |
| 13.35–19.35 s | Real captured post-select state: basic calculator auto-filled 15 / 60 → 9, pinned banner; slow push toward the answer; word-by-word caption "15% OF $60 = $9 — instantly." |
| 19.35–25.3 s | FONT-BENDING finale on "$9.00": scaleY breathing pulses on a 120 bpm grid, stepped weight jumps 300→400→600→700, alternating skew hits, echo copies. Caption "TYPE. TAP. DONE." word-per-beat. |
| 25.4–30 s | Endcard (Film 1 layout) over the dimmed UI plate. |

## Player controls

- URL params: `?t=<ms>`, `?stop=<ms>`, `?rec`, `?theme=light`, `?pause`. Space/R. Scrub bar.
- QA hook: `window.__f2Seek(seconds, theme)`. Theme button swaps the full asset set.

## Determinism & capture guard

- Pure function of t; strobe/flash timings quantized to whole frames; no CSS animations in stage.
- Captures after the full stabilization guard; keystroke states each rebuilt from a fresh page
  (the app re-selects input content ~1 s after typing pauses — shot inside that window);
  `?noredirect`; theme via localStorage `jp:config:v1`; fresh context per section.

## Suggested SFX (post)

- Hook word slams (0.2/0.7/1.2 s): three deepening thuds; strobe (3.05–4.15 s): 10 camera-shutter ticks.
- Letter landings (6.75/8.95/11.15 s): typewriter clack + boom; selected snap (13.35 s): whoosh-pop.
- Font-bending beats (19.6 s, every 0.5 s): 120 bpm kick; weight jumps: sub hits; endcard: warm hit.

## QA verdict (2026-07-13)

- Verified stills: hook (0.6 s), strobe inverse plates (3.3/4.0 s), letters + dropdown states
  (5.8–12.6 s), selected 15/60→9 (14–18 s, both themes), $9.00 bending + echoes (19.8–24.6 s),
  endcard (26.5/29.5 s). MP4 frame check at 21.5 s matches QA still.
- Player centering fixed to the series-wide pattern (`absolute + translate(-50%,-50%) scale`).
