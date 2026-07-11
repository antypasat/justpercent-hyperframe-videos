# Just Percent — Isometric Tilt & Hover · Product Film (7.4 + 7.2 + 7.3)

Self-contained 56-second HTML/CSS/JS product film for https://justpercent.com/ (US locale,
en-US). Open `index.html` — deterministic master clock, plays in a loop (16:9, 1600×900,
letterboxed).

## Story & techniques

| t | Scene | Technique |
|---|-------|-----------|
| 0:00 | Logo + "Free, online percentage calculators" | intro |
| 0:02.5 | Homepage tilts to `rotateX 48° / rotateZ −32°`, seamless 10s float loop (`translateY ±8px` + micro `rotateZ ±2°`) | **7.4 Landing Hero Loop** |
| 0:11 | Solution cards — cursor clicks **Apply My Coupon** | guided click |
| 0:16.5 | `/decreased-value-calculator/` prefilled ($100 − 20% → $80) settles, then tilts `rotateX 50° / rotateZ −25°` over 1.5s + 8s hover | **7.2 Post-Click State Tilt** |
| 0:23 | Search "tip" — dropdown with practical uses; dual-axis tilt `rotateX 40° / rotateY −10° / rotateZ −28°` (`ease-out-quart`, perspective 1000px) + specular sweep | **7.3 Dual-Axis Studio Light** |
| 0:29.5 | Practical use selected via search — calculator scrolled + prefilled (15% of $60 = $9) | practical uses, way 1 |
| 0:35 | `/increased-value-calculator/` Practical Uses list — cursor clicks **Budget Boost** | practical uses, way 2 |
| 0:40.5 | Calculator prefilled ($5,000 + 25% → $6,250) tilts post-click | **7.2** |
| 0:46 | `/faqs/` hub under studio light; interactive salary-raise FAQ docks in Z-space | **7.3** |
| 0:52 | Outro + CTA justpercent.com | outro |

## Controls & QA

- `Space` / ⏸ — pause · `R` / ↺ — replay
- `?rec` hides controls · `?t=<ms>` seeks the master clock · `?stop=<ms>` auto-pauses
  (e.g. `index.html?rec&t=16500&stop=21000` to QA scene s3)

## Files

- `index.html` — the film · `isometric-tilt-hover-mix.json` — Hyperframes config
  (capture guard, frame map with real URLs/selectors, per-scene timelines and loops)
- `assets/us-*.png` — stabilized dark-mode frames captured from the live site
  (1600×900@2x, network idle ≥500ms, fonts ready, no transitions, no CLS ≥500ms)
- `fonts/` — IBM Plex Sans, Space Grotesk, JetBrains Mono (the app's own fonts)

All URLs shown in the film exist on the live site: `/`, `/decreased-value-calculator/`,
`/increased-value-calculator/`, `/faqs/`, `/faqs/calculate-new-salary-after-percentage-raise/`.
