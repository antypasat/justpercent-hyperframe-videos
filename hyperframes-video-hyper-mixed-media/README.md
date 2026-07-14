# Film 4 / 7 — Hyper-Mixed Media

9:16 (1080×1920, 30 fps, 35 s) YouTube-Shorts product film for **justpercent.com** (US locale).
Technique: polished UI colliding with paper, markers, tape, stop-motion cutouts and a datamosh
finale. A digital scrapbook: real page captures live inside paper frames with torn edges and
tape strips; hand-drawn marker circles/arrows animate stroke-by-stroke; cutout captions move on
an 8 fps stop-motion clock; the finale melts into an RGB-split/slice datamosh that resolves into
the clean answer.

## Files

| File | Purpose |
|------|---------|
| `capture.mjs` | Captures 7 states ×2 themes into `assets/` + geometry. |
| `assets/` | 14 PNGs + `geometry.json` (faqs-top, faqs-bill @scroll 1044, bill-top, bill-full fullPage, dec-pu, dec-pinned 300−30%=210, dec-result-crop). |
| `geometry.js` | `window.F4GEO` — bill row/answer rects, PU row, banner, dec inputs/result. |
| `configs.js` | `window.F4` — beats, stop-motion clock, mosh params, captions. |
| `hyper-mixed-media.html` | The player. Deterministic master clock; pure function of t; seek-safe. |
| `qa-frames.mjs` / `record.mjs` | QA stills / MP4 render (`out/hyper-mixed-media-<theme>.mp4`). |

## Story / beats

| Time | Beat |
|------|------|
| 0–3 s | VIDEO PLACEHOLDER #1 (full-screen) + marker scribble "ugh… math again??" (stop-motion jitter). |
| 3–10 s | /faqs/ as a PHOTOCOPIED SCAN — paper frame rotated −2°, grayscale + contrast(1.35), tape strips; at 5.2 s the scan "re-scans" to the Bill Splitting row; a rough red marker ellipse draws itself around the row (stroke-dashoffset, 6.4–7.2 s). |
| 10–17 s | /faqs/bill-splitting-calculator/ in a second paper frame; the full-page texture pans down to the worked answer (60/40 split of $250 → you owe $150, they owe $100); paper-cutout captions "REAL FAQ", "NO APP NEEDED" jitter on the 8 fps stop-motion clock; VIDEO PLACEHOLDER #2 (polaroid, bottom-left). |
| 17–26 s | /decreased-value-calculator/: marker arrow draws toward the Sale Discount PU row → stop-motion press dip → pinned state (300 − 30% = 210 + banner) with a marker circle on the banner and a big "$90 SAVED" scribble. |
| 26–29.6 s | DATAMOSH — RGB channel split (screen-blended tinted copies, seeded per-frame offsets ±26 px), 5 displaced slices (±46 px), scanline flicker; peaks at 27.6 s, resolves while zooming into the clean result 210. Caption "from paper mess → instant answer." |
| 30.2–35 s | Endcard with a torn-paper top edge and a 2-frame glitch blink (invert + hue-rotate) at 30.4 s. |

## Determinism notes

- Stop-motion = time quantized to 8 fps (`q8(t)`); jitter seeded by (element, step) — no Math.random.
- Datamosh offsets seeded by frame index; scanline flicker seeded; everything replays identically on seek.
- Marker strokes are SVG ellipses/paths revealed via `stroke-dashoffset` as a pure function of t;
  the arrow/circle geometry is computed from `F4GEO` per theme.
- Paper noise is a baked SVG feTurbulence data-URI (static, seed=7) — not per-frame.

## Player controls

- URL params: `?t=<ms>`, `?stop=<ms>`, `?rec`, `?theme=light`, `?pause`. Space/R. Scrub bar.
- QA hook: `window.__f4Seek(seconds, theme)`. Theme button swaps all plates + geometry.

## Post-production — VIDEO PLACEHOLDERS

| Asset | On screen | Stage region | Expected content |
|-------|-----------|--------------|------------------|
| `assets/opening-live-action.mp4` | 0.00–3.00 s | Full frame 1080×1920 (dashed slot until provided) | Live action: a person staring at a receipt, confused. |
| `assets/hands-cutout.mp4` | 10.00–17.00 s | Polaroid slot, bottom-left, ~470×350 px at (56, bottom 210), rotated −4°, stop-motion jitter | Hands cutting paper / handling receipts (cutout aesthetic). |

Both are muted and deterministically synced (`currentTime = clamp(t − clipStart, 0, dur)`).
Missing files → dashed placeholder slots; the film records fine either way.

## Suggested SFX (post)

- Paper rustle on every frame entrance (3.0 / 10.0 / 17.0 s); photocopier whir 3.0–5.2 s + scan beep at 5.2 s.
- Marker squeaks during strokes (6.4–7.2, 18.2–18.9, 20.9–21.6, 22.4 s); tape rip at 10.0 s.
- Stop-motion clicks (8 fps ticks) under cutout captions; camera-press click at 20.0 s.
- Datamosh: bit-crushed static riser 26.0–27.6 s, glitch stutters to 28.8 s, clean "pop" at 29.6 s.
- Endcard: warm hit at 30.2 s + tiny glitch zap at 30.4 s.

## QA verdict (2026-07-13)

- Verified stills: opening slot + scribble (0.9/2.0 s), photocopy scan + marker circle (4.2–9.4 s,
  both themes), bill pan + cutouts + polaroid slot (11.2–15.5 s), PU arrow (19.0 s), pinned +
  "$90 SAVED" (21.5/23.5 s, both themes), datamosh peak with RGB split + slices (27.0/27.6 s),
  resolve (29.9 s), torn-paper endcard + glitch blink (31.2/33.8 s, both themes).
