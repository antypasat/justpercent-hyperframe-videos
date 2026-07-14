# PROMPT — Finish Film 2: "Kinetic Typography & Font Bending" (justpercent.com, US)

You are a senior motion designer + creative technologist. You build broadcast-grade
product videos out of pure HTML/CSS/JS with deterministic, frame-exact playback.
First read the shared contract:
`/Users/michael/startups/percentage-calculator/JUSTPERCENT-FILMS-PLAYBOOK.md`
Work ONLY inside `/Users/michael/startups/percentage-calculator/hyperframes-video-kinetic-typography/`.

## Technique (chip already wired in configs.js)
- Chip line 1: `TECHNIQUE 2/7 · KINETIC TYPOGRAPHY & FONT BENDING`
- Chip line 2: `Frankenstein Type · Beat-Driven Stretch · Flash Frames`

## Creative intent (already implemented — understand it, then finish it)
Text IS the actor. Aggressive, confident, rhythmic — a type-poster come alive.
Emotion: swagger; the calculator answers before you finish asking. Palette:
brand violet→cyan gradient headlines over the dark void (light theme = lavender),
real UI screenshots punching through as full-bleed plates.

Scene flow (all timing in `configs.js` → `window.F2`, the source of truth):
1. 0–3 s HOOK — "MATH is EVERY WHERE" in **Frankenstein typography**: 4 clashing
   voices (Space Grotesk slam / Georgia serif slide / JetBrains Mono spin /
   IBM Plex Light rise), deterministic jitter wobble per word.
2. 3.05–4.15 s **Flash frames**: 3-frame subliminal full-screen plates —
   TIPS / TAX / SALES / RAISES / DISCOUNTS — inverse color pairs, strobing.
3. 4.15–5.5 s "ONE ANSWER: JUST PERCENT".
4. 5.55–13 s TYPING: the REAL home page search box (`#calculator-search`
   screenshot plates); giant letters `t`, `i`, `p` fly along a bezier arc and
   punch INTO the real input (per-keystroke plates `key-t/ti/tip-*.png`),
   impact shake 10 px + white flash on each landing. This is the homepage
   "Practical Uses via search" showcase.
5. 13.35–19.35 s SELECT — keyboard-select "Restaurant Tip" → the REAL pinned
   basic calculator (15% of $60 → $9) with a slow punch-zoom to the answer.
6. 19.35–25.3 s **Font bending finale** — "$9.00" at 300 px pulses on an implied
   120 bpm grid: stepped weights 300→400→600→700, scaleY punch + alternating
   skew ±8°, double echo outlines. (Variable-font bending simulated with
   weight steps + transforms — keep it deterministic.)
7. 25.4–30 s endcard (house style, copy in configs).
Captions are kinetic word-by-word pop-ons: "JUST TYPE…", "WATCH IT FIND THE
MATH.", "15% OF $60 = $9 — instantly.", "TYPE. TAP. DONE."

## Current state
- `capture.mjs` DONE — `assets/` has all plates in dark+light (home top, search
  focused, per-keystroke t/ti/tip, selected result/banner/card), `geometry.js` baked.
- `configs.js` (`window.F2`) COMPLETE — hook words, strobe, letter beats,
  bend, captions, endcard.
- `kinetic-typography.html` BUILT (652 lines) — deterministic player with
  QA hook `window.__f2Seek(sec, theme)`, `?rec&pause&theme=` params.
- `qa/` EMPTY, `out/` EMPTY — QA and renders never ran. No `qa-frames.mjs`,
  no `record.mjs` yet. That is the remaining work.

## Remaining work (in order)
1. Create `qa-frames.mjs` and `record.mjs` by copying them from
   `/Users/michael/startups/percentage-calculator/hyperframes-video-neuro-match-cut/`
   and renaming: hook `__f5Seek` → `__f2Seek`, file `neuro-match-cut.html` →
   `kinetic-typography.html`, output prefix `f2`/`kinetic-typography`.
   Good QA timestamps: 0.5, 1.4, 2.6, 3.1, 3.35, 4.6, 5.7, 6.7, 8.9, 11.2,
   12.9, 14.0, 16.5, 19.4, 20.1, 21.6, 23.9, 25.6, 27.5, 29.5.
2. Run QA for BOTH themes and review every still (actually open the PNGs):
   - Frankenstein words land composed, nothing clipped at stage edges.
   - Flash-frame plates fill 100% of the screen; strobe words legible even at 3 frames.
   - Flying letters visually LAND inside the real search box (check `land.xBase`
     / `charAdv` against the light AND dark search plates — the input glyph
     start differs subtly per theme).
   - $9.00 bend never leaves the safe area; echoes don't cover the chip.
   - Light theme: strobe inverse pairs still readable, captions plate keeps contrast.
3. Fix findings by editing `configs.js` values first; only touch the player if a
   mechanism (not a number) is wrong.
4. Render: `node record.mjs dark 30` and `node record.mjs light 30` →
   `out/kinetic-typography-dark.mp4`, `out/kinetic-typography-light.mp4`.
5. Verify MP4s (900 frames, 1080×1920, clean start/end, chip visible).
6. Write `out/kinetic-typography-cuesheet.md`: word-slam hits (0.12/0.55/0.92/1.22 s),
   strobe ticks every 0.1 s from 3.05 s, letter impacts (6.75/8.95/11.15 s →
   heavy mechanical THOCK), select ding 13.35 s, 120 bpm pulse 19.6–25.3 s,
   endcard whoosh 25.4 s. No video placeholder is needed in this film — text and
   real UI carry it; state that explicitly in the cue sheet.

## Acceptance
Both MP4s + cue sheet in `out/`; QA stills reviewed for both themes; all copy
US English; chip correct; flash frames exactly ≤3 frames each; letters visibly
land in the real search input in both themes.
