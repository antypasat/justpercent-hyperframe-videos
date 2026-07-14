# Film 3 / 7 — Foley-First Editing

9:16 (1080×1920, 30 fps, 32 s) YouTube-Shorts product film for **justpercent.com** (US locale).
Technique: the film is cut as if the SOUND was designed first — every visual event lands exactly
on a 140 BPM grid (1 beat = 0.4286 s) and announces its own sound effect with an on-screen SFX
caption, a deterministic waveform HUD (bars spike exactly on events) and beat-counter dots.
The MP4 is silent; the cue sheet below is the post-production contract.

## Files

| File | Purpose |
|------|---------|
| `capture.mjs` | Captures 15 states ×2 themes (per-keystroke rebuilds from fresh pages) into `assets/` + geometry. |
| `assets/` | 30 PNGs + `geometry.json` (inc default 240+15=276, k5→k5000, p2/p25, result clip, home card, arrival 100+8=108, presave/saved/copied). |
| `geometry.js` | `window.F3GEO` — per-theme rects for every zoom zone. |
| `configs.js` | `window.F3` — THE event list (beat-timed), sections, zoom zones, waveform params, captions. |
| `foley-first.html` | The player. Deterministic master clock; pure function of t; seek-safe. |
| `qa-frames.mjs` / `record.mjs` | QA stills / MP4 render (`out/foley-first-<theme>.mp4`). |

## Story / beats

| Time | Beat |
|------|------|
| 0–2 s | "TURN SOUND ON 🔊" + 4-beat count-in dots. |
| 2.1–6.4 s | /increased-value-calculator/: per-keystroke typing 5 → 50 → 500 → 5,000 (CLACK on beats 7–10), percent 2 → 25 (beats 12–13); every landing = 1-frame flash + waveform spike. |
| 6.4–9.9 s | DING! — camera dives into the read-only result 6,250, mint pulse ring; pull back on beat 21. |
| 9.9–10.3 s | WHOOSH — directional whip-pan (motion-blur ghost) out of the calculator… |
| 10.3–12 s | …THUNK — lands on the homepage "Calculate Total Price" card (camera drop + settle). |
| 12–14.6 s | POP — arrival at /increased-value-calculator/ pre-filled 100 + 8% = 108 with the hint banner. |
| 14.6–20.1 s | Success chain: zoom on "+ Save" → TICK (Saved panel expands — "Expand on save" was pre-checked) → glide to "Copy" → SNAP (green "Copied!", held via the scoped setTimeout override). |
| 23.1–26.6 s | Dead-air-free recap: 1-beat re-cuts of k5000 / 6250-DING / 108-POP / Copied-SNAP with captions re-flashing. |
| 27.4–32 s | Bass hit — screen-wide pulse ring + endcard. |

## SFX CUE SHEET (post-production; BPM 140, offset 0.0 s, all cues ON the beat)

| Timecode | Beat | Frame | Event | Suggested sound |
|----------|------|-------|-------|-----------------|
| 3.000 s | 7 | 90 | keystroke "5" | mechanical key CLACK |
| 3.429 s | 8 | 103 | "50" | CLACK |
| 3.857 s | 9 | 116 | "500" | CLACK |
| 4.286 s | 10 | 129 | "5000" | double CLACK·CLACK |
| 5.143 s | 12 | 154 | percent "2" | CLACK |
| 5.571 s | 13 | 167 | percent "25" | CLACK·CLACK |
| 6.429 s | 15 | 193 | result 6,250 | DING! (bright bell) + soft riser before |
| 9.857 s | 23 | 296 | whip-pan out | WHOOSH (airy, pitched down) |
| 10.286 s | 24 | 309 | land on card | THUNK (soft body impact) |
| 12.000 s | 28 | 360 | arrival 100+8=108 | POP (cork) |
| 16.286 s | 38 | 489 | saved entry | TICK (UI tick) |
| 20.143 s | 47 | 604 | Copied! | SNAP (finger snap) |
| 23.143 s | 54 | 694 | recap CLACK | CLACK |
| 24.000 s | 56 | 720 | recap DING! | DING! |
| 24.857 s | 58 | 746 | recap POP | POP |
| 25.714 s | 60 | 771 | recap SNAP | SNAP |
| 27.429 s | 64 | 823 | endcard | BASS HIT (screen-wide pulse ring) |

Music: 140 BPM track, kick on every beat from 0.429 s; the beat-counter dots at the bottom are
the click track. Waveform HUD bars spike exactly at the cue rows above.

## Player controls

- URL params: `?t=<ms>`, `?stop=<ms>`, `?rec`, `?theme=light`, `?pause`. Space/R. Scrub bar.
- QA hook: `window.__f3Seek(seconds, theme)`. Theme button swaps all 12 plates + geometry.

## Determinism & capture guard

- Pure function of t; waveform noise seeded by (bar, frame); no Math.random.
- Captures after the full stabilization guard; per-keystroke states each rebuilt from a FRESH
  page load (`pressSequentially`, ~700 ms settle, shot inside the window before the app
  re-selects the input); "Expand on save" pre-checked BEFORE saving; "Copied!" held via scoped
  `window.setTimeout` override (ms===2000 → -1), restored after; `?noredirect`; theme via
  localStorage `jp:config:v1`; fresh context per section.

## QA verdict (2026-07-13)

- Verified stills: count-in (0.8 s), CLACKs on 5/5000 (3.2/4.4 s), DING ring on 6,250 (6.6 s),
  whip ghost (10.1 s), THUNK card (10.5 s), POP 108 (12.2 s, both themes), TICK saved panel
  (16.5 s), SNAP copied (20.4 s), recap (23.3/24.2/26 s), bass-hit endcard (28/30.5 s).
