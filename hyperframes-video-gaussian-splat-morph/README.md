# Film 6 / 7 — Gaussian Splatting & AI Morphing

9:16 (1080×1920, 30 fps, 35 s) YouTube-Shorts product film for **justpercent.com** (US locale).
Technique: frozen-time fly-throughs — real full-page captures sliced into depth strips and
flown through with an impossible 2.5D camera (gaussian-splat feel) — chained by hallucinatory
AI-morph transitions (video placeholder slots with a stepped CSS morph fallback beneath),
ending in a pull-back that reveals all three page-moments floating in a void.

## Files

| File | Purpose |
|------|---------|
| `capture.mjs` | Captures full-page textures (`tex-*`) + viewport plates (`top-*`) from https://justpercent.com, both themes, into `assets/` + `assets/geometry.json`. Auto-lowers the texture dsf when pageH × dsf would exceed Chromium's 16384 px texture limit (`texScale` in geometry). |
| `assets/` | 12 PNGs (tex/top × home/inc/faq × dark/light) + `geometry.json`. |
| `geometry.js` | `window.F6GEO` — page heights, texScale, document-space hero rects per theme. |
| `configs.js` | `window.F6` — beats, strip params, camera key paths, morph fx, slab poses, captions. |
| `gaussian-splat-morph.html` | The player. Deterministic master clock; pure function of t; seek-safe. |
| `qa-frames.mjs` | QA stills → `qa/`. `node qa-frames.mjs [theme] [t1 t2 …]` |
| `record.mjs` | Frame-by-frame render → `out/gaussian-splat-morph-<theme>.mp4`. |

## Story / beats

| Time | Beat |
|------|------|
| 0.0–7.4 s | FROZEN MOMENT #1 — homepage strip fly-through (camera descends h1 → search → solution cards, rotateX ~8–11°, DoF racks). Caption "imagine your math… already done." |
| 7.0–10.0 s | MORPH #1 — VIDEO PLACEHOLDER `assets/morph-home-to-calc.mp4` (full-frame); stepped CSS hallucination beneath (6-step crossfade, blur 0→14→0, hue ±6°). |
| 9.6–17.4 s | FROZEN MOMENT #2 — /increased-value-calculator/ with Budget Boost pinned (5,000 + 25% = 6,250); ends with the 6,250 result strip in crisp focus + cyan glow. Caption "a raise, frozen mid-air." |
| 17.0–20.0 s | MORPH #2 — VIDEO PLACEHOLDER `assets/morph-calc-to-faq.mp4` + same fallback. |
| 19.6–27.5 s | FROZEN MOMENT #3 — /faqs/tip-calculation-calculator/ (live FAQ, default demo state 150 / 10 → 15); ends on the answer region. Caption "even the FAQ does the math." |
| 26.8–31.4 s | THE IMPOSSIBLE PULL-BACK — three page slabs (top plates) tilted ±20°, floating with reflections, slow ±3° orbit. Caption "every moment, one site." |
| 31.0–35.0 s | Endcard — "%" mark, Just Percent, justpercent.com pill, tagline, Free/Instant/No sign-up. |

## The strip-scene ("gaussian splat") recipe

Full-page texture sliced into 96 px strips with 20 px feathered overlap (mask-image gradients →
seams invisible); per-strip static translateZ from a depth profile (hero rects from geometry come
toward the camera, body recedes on a sin wave + seeded jitter); camera = container transform
(translateY + rotateX + overscan scale ≥1.15 to cover far-strip perspective shrink) with dynamic
transform-origin at the current window center; per-strip blur ∝ |depth − focusDepth| quantized to
0.5 px. Strips outside camY ± cullPad are display:none (deterministic culling).

## Player controls

- URL params: `?t=<ms>`, `?stop=<ms>`, `?rec`, `?theme=light`, `?pause`. Space/R. Scrub bar.
- QA hook: `window.__f6Seek(seconds, theme)`.
- Theme button swaps the ENTIRE asset set (textures, plates, geometry) and rebuilds the strip scenes.

## Determinism & capture guard

- Every pixel is a pure function of t; no CSS animations/transitions in the stage; glitch-free
  seeking (record = seek every frame).
- Captures taken only after the full stabilization guard (network idle ≥500 ms, fonts.ready,
  images decoded, no finite animations, CLS quiet ≥500 ms) with the active element blurred
  (the app re-selects inputs ~1 s after autofill — a bare click leaves a text-selection highlight).
- Site traps honored: `?noredirect`; theme pre-load via localStorage `jp:config:v1`; fresh context
  per section; PU lazy-mount scroll loop; **FAQ tip page ships with the demo state 150/10→15 —
  do NOT type into its masked inputs (typing mangles them), the default is exactly the state we need.**

## Post-production — VIDEO PLACEHOLDERS

| Asset | On screen | Stage region | Expected content |
|-------|-----------|--------------|------------------|
| `assets/morph-home-to-calc.mp4` | 7.00–10.00 s | Full frame 1080×1920 | AI morph (Sora/Luma/Runway) homepage → calculator. First frame ≈ `qa/f6-dark-7.20s.png`, last ≈ `qa/f6-dark-9.80s.png` (per theme). |
| `assets/morph-calc-to-faq.mp4` | 17.00–20.00 s | Full frame 1080×1920 | AI morph calculator → FAQ page. Edge frames ≈ `qa/f6-dark-17.20s.png` / `qa/f6-dark-18.50s.png`. |

Drop a file into `assets/` and the player uses it automatically (muted, deterministically synced:
`currentTime = clamp(t − clipStart, 0, 3)` while scrubbing). Missing file → dashed
"VIDEO PLACEHOLDER" slot over the CSS fallback morph; the film records fine either way.

## Suggested SFX (post)

- Airy hovering pad through the fly-throughs; sub-bass swell + reverse cymbal into each morph
  (7.0, 17.0 s); soft chime when the 6,250 result racks into focus (~15.0 s); low whoosh on the
  pull-back (26.8 s); warm pad + soft hit for the endcard (31.0 s).

## QA verdict (2026-07-13)

- Strip relief + DoF focus racks verified at 0.5/2.5/5.0/13/15.8/23.5 s; morph fallback + slots at
  8.5/18.5 s; slabs with reflections at 28.6 s; endcard at 34.4 s — both themes at key beats.
- Known minor: at the very first beat the homepage H1 is horizontally cropped by the overscan
  (leading "F" off-frame) — intended trade-off of the ≥1.15 overscan that prevents far-strip edge gaps.
