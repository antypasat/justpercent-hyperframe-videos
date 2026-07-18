# Cursor Journey — Technique 2 (justpercent.com, US)

Seven Hyperframes-style product films presenting **justpercent.com** (US locale,
American English) with the **Cursor Journey** technique: an animated cursor
travels the real UI on cubic Bezier paths (never linear), a damped-spring
camera follows it, clicks ripple, text types itself, and every DOM state shown
is a genuine screenshot of the live site.

## Files

| File | Purpose |
| --- | --- |
| `cursor-journey.html` | Deterministic master-clock player (open directly via `file://`) |
| `configs.js` | Source of truth — 7 configs (2.1–2.7) |
| `configs/*.json` | Mirrored JSON exports (`node export-configs.mjs`) |
| `capture.mjs` | Captures viewport states from justpercent.com (`node capture.mjs [abcdefg]`) |
| `qa-frames.mjs` | Renders QA stills of the player into `qa/` (`node qa-frames.mjs [2.1 …]`) |
| `assets/` | Captured 1600×900 @2x page states + `geometry.json` (element rects) |
| `fonts/` | Local woff2 (player is fully offline) |

## Versions

| # | Name | Story | Camera |
| --- | --- | --- | --- |
| 2.1 | Classic Guided Flow | Search box → typewriter “tip” → click “Restaurant Tip” → page scrolls to the pre-filled calculator (15% of $60 = $9) | ×1.5, critical damping |
| 2.2 | Post-Click Chain Capture | Home → click “Apply My Coupon” card → Value Decrease arrives pre-filled ($100 − 20% = $80) | ×1.6, spring (slight overshoot) |
| 2.3 | Form Fill Walkthrough | Calculator greets with a live example (240 + 15% = 276); cursor types 5000, then 25 — result recomputes on every keystroke → 6250 | ×1.4, soft follow |
| 2.4 | Fast Demo Reel | 4 hops with whip cuts: Tip card → $9 answer → FAQ index row → live FAQ answer ($150 bill, 10% → $15) | ×1.7, tight + cursor trail |
| 2.5 | Hover-Reveal Tour | Cursor glides over Solution Cards; each hover glow (violet halo, arrow) captured after the reveal settled | ×1.5 |
| 2.6 | Two-Step Success Flow | $100 − 20% = $80 → click “+ Save” → entry lands in the Saved panel (with quick stats) → click “Copy” → green “Copied!” | ×1.5 |
| 2.7 | Onboarding Path | STEP 1 pick a card → STEP 2 land pre-filled ($100 + 8% = $108) → STEP 3 practical use “Budget Boost” ($5,000 + 25% = $6,250) | ×1.5, step badges |

## Player controls

- Buttons **2.1–2.7**, **▶ Play all**; `Space` pause/resume, `R` restart.
- URL: `#2.4` selects a version, `?rec` hides controls, `?t=<ms>` seeks,
  `?stop=<ms>` auto-pauses at an exact time.
- QA hook: `window.__cjSeek("2.3", 5.5)` renders that exact frame
  (returns a promise that resolves when all state images are decoded).

## Determinism

- Single master clock; every visual is a pure function of `t`.
- The camera spring integrates at a fixed 240 Hz from `t = 0` (with a
  monotonic-playback cache), so seeking to any `t` reproduces identical
  pixels — no wall-clock state anywhere.
- Typewriter = real per-keystroke page states captured from the site
  (masked-input formatting and live result included), swapped on the clock.

## Capture guard

Every screenshot was taken **only after full stabilization**: network idle
≥ 500 ms, `document.fonts.ready`, all images decoded, no active
CSS/JS animations/transitions, and zero layout shift for ≥ 500 ms; after every
click that mutates the DOM the new structure settles first. Never captured
mid-transition. (See `stabilize()` in `capture.mjs` and `meta.captureGuard`
in each config.)

Capture-rig notes (not user-visible deception, just rig mechanics):
- “Copied!” reverts after 2 s — its revert timeout is suppressed during the
  screenshot so the genuine post-click state can be captured calmly.
- “Expand on save” is pre-checked before the first Value-Decrease shot so
  the Saved panel truly expands on save and all three 2.6 states stay
  visually consistent.
- Typewriter states are rebuilt from scratch per keystroke (fresh context +
  reload + `pressSequentially`) because the app re-selects input content
  after a typing pause and persists values in localStorage.

## Known site behaviors baked into the films

- Value Increase greets with default demo values **240 + 15% = 276**.
- Solution-card clicks prefill the target calculator and show its banner.
- Search selection (ArrowDown+Enter) scrolls the homepage to the matching
  calculator and pins the practical use.
- Timestamps in the Saved panel show the capture date (Jul 9, 2026).
