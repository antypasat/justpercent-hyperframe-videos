# Just Percent — Isometric Tilt & Hover · 7.1 Basic Premium Float

Self-contained HTML/CSS product hero for https://justpercent.com/ (US locale, en-US).
Open `index.html` in a browser — the animation plays automatically and loops forever
(16:9 stage, 1600×900, letterboxed).

## Technique (7.1 spec)

- `perspective: 1200px`
- Flat UI → isometric: `rotateX 0→45deg`, `rotateZ 0→-30deg` over **1.4s** `ease-in-out-cubic`
- Simultaneous depth shadow fade-in: `box-shadow: 0 50px 100px rgba(0,0,0,0.3)`
- Infinite floating loop: `translateY -8px → +8px` over **6s**, alternate, ease-in-out-sine
- Bonus layer: Basic Percentage Calculator card docks above the plane (`translateZ 90px`)
  and floats in counter-phase

## Controls & QA

- `Space` / ⏸ — pause · `R` / ↺ — replay
- `?rec` — hides controls · `?stop=<ms>` — auto-pauses at an exact time (for frame QA)

## Files

- `index.html` — the film (local fonts, no network needed)
- `isometric-tilt-hover-71.json` — Hyperframes config: capture guard (network idle ≥500ms,
  fonts ready, images decoded, no transitions, no layout shift ≥500ms), frame map, layers,
  timeline, loops
- `assets/us-home.png` — stabilized dark-mode frame of https://justpercent.com/ (1600×900@2x)
- `assets/crop-calc-card.png` — calculator card crop · `assets/logo-percentage.webp` — original logo
- `fonts/` — IBM Plex Sans, Space Grotesk, JetBrains Mono (same as the app)
