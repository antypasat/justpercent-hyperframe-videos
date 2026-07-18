# PROMPT — Build Film 3: "Foley-First Editing" (justpercent.com, US)

You are a senior motion designer + creative technologist. You build broadcast-grade
product videos out of pure HTML/CSS/JS with deterministic, frame-exact playback.
First read the shared contract:
`/Users/michael/startups/percentage-calculator/JUSTPERCENT-FILMS-PLAYBOOK.md`
Work ONLY inside `/Users/michael/startups/percentage-calculator/hyperframes-video-foley-first/`.

## Technique (chip)
- Chip line 1: `TECHNIQUE 3/7 · FOLEY-FIRST EDITING`
- Chip line 2: `ASMR Cuts · Mechanical Keys · Zero Dead Air`

## Core idea — SOUND dictates the picture
The final MP4 is silent; the USER lays hyper-real foley in post. So the film must
be **edited as if the sound already existed**: every visual event sits on an
8th-note grid at 100 bpm (grid step = 0.3 s; beats at t = 0.3·k), every cut/click/
keystroke gets an exaggerated visible "sound signature", and there is ZERO dead
air — something moves in every single frame. The cue sheet (deliverable) is the
actual musical score; the video is its visualization.

Visible sound signatures (build these as reusable pure-function effects):
- KEY THOCK: on each keystroke the whole stage drops 6 px and rebounds in 0.12 s
  (damped), a white ring shockwave expands from the input caret, and a giant
  ghost keycap (rounded rect, JetBrains Mono glyph) stamps down over the plate
  at 8% opacity. The typed digit flashes in the corner HUD.
- CLICK BANG: on card/button clicks — 1-frame white flash + concentric double
  ring + 12 px radial zoom punch centered on the clicked rect (rects are in
  `geometry.js`).
- WHOOSH: between pages the outgoing plate motion-blurs (CSS blur along the move
  axis) and slides off in 0.25 s; incoming overshoots 3% and settles.
- WAVEFORM RIBBON: a fake but deterministic audio waveform strip (canvas or
  divs, amplitude precomputed from the beat grid) runs along the bottom edge the
  entire film; it spikes exactly on every event. This sells "foley-first" visually.
- CAPTION OVERLAP: captions never wait — the next line slides in while the
  previous is still exiting (dead-air-cut editing applied to text).

## Story (use ONLY these captured assets — they already exist in `assets/`, both themes)
Flow: home → SolutionCard click → /increased-value-calculator/ → type → result →
save → copy. Real values: arrival default `240 + 15% = 276`; hero calc
`$5,000 + 25% = $6,250` (sales-tax-style total-price story).
- 0.0–2.4 s COLD OPEN on black: waveform ribbon boots like a VU meter; caption
  "turn your sound ON." then instantly "…every click has a voice." (overlapped).
- 2.4–5.4 s HOME (`ff-home-*.png`): plate snaps in on a CLICK BANG; punch-zoom
  to the "Calculate Total Price" card (`ff-home-card-clip-*.png` crop rect in
  geometry) — hover wobble on the 8th-note grid.
- 5.4–6.6 s CLICK BANG on the card CTA → WHOOSH into `ff-inc-arrival-*.png`
  (genuine click destination /increased-value-calculator/, defaults 240+15%=276).
- 6.6–13.8 s TYPING SOLO — the ASMR centerpiece. Keystroke plates in order:
  `ff-inc-k5`, `k50`, `k500`, `k5000` then percent `p2`, `p25`. One THOCK per
  grid beat with syncopation (5…50…500 fast-fast, 5000 hold, then 2, 25).
  Between keystrokes NOTHING idles: micro drift + waveform spikes keep motion.
  Caption: "$5,000 plus tax…" → "…25%?" (overlapped entries).
- 13.8–17.4 s RESULT: punch-zoom into `ff-inc-result-clip-*.png` ($6,250),
  triple echo pulse on the answer, caption "= $6,250. before you blink."
- 17.4–23.4 s SUCCESS CHAIN, one beat apart, three CLICK BANGs:
  `ff-inc-presave` → `ff-inc-saved` (panel expands) → `ff-inc-copied` (green
  "Copied!" — it reverts after 2 s on the real site, honor that timing).
  Caption: "save it. copy it. paste it anywhere."
- 23.4–24.0 s hard cut to black EXCEPT the waveform (one beat of "silence" —
  the only intentional gap, a foley joke) then…
- 24.0–30.0 s ENDCARD (house style) with the waveform ribbon finishing in a
  flatline → single final spike on the last frame.

## What already exists (do NOT redo)
- `capture.mjs` DONE; `assets/` complete for both themes; `geometry.js` +
  `assets/geometry.json` baked (all rects + values above); `fonts/` present;
  `qa/` and `out/` exist and are empty.

## Build steps
1. `configs.js` → `window.F3` director config: meta (id "3", technique/detail
   strings above, 30 s, 30 fps, stage 1080×1920, cssToStage 2.5), the 100 bpm
   grid, every beat/caption/effect timing from the story above. All copy US English.
2. `foley-first.html` — deterministic player per the playbook house pattern
   (master clock, seeded randomness only, QA hook `window.__f3Seek(sec, theme)`,
   `?rec&pause&theme=` params, controls, chip, captions plate, endcard).
   Model the file structure on
   `/Users/michael/startups/percentage-calculator/hyperframes-video-neuro-match-cut/neuro-match-cut.html`.
   The waveform must be computed from config (beat grid → amplitude envelope),
   never from `Math.random()`.
3. `qa-frames.mjs` + `record.mjs` — copy from the film-5 dir, rename hook/file/prefix.
4. QA both themes at: 0.4, 1.2, 2.5, 3.9, 5.5, 6.7, 7.5, 8.7, 10.2, 11.7, 13.2,
   14.6, 16.8, 17.5, 19.3, 21.4, 23.6, 24.5, 27.0, 29.9 — review every PNG:
   plates aligned, shockwaves centered on the true rects, captions readable both
   themes, waveform spikes only on events, no frame without motion.
5. Render both themes → `out/foley-first-dark.mp4`, `out/foley-first-light.mp4`.
6. `out/foley-first-cuesheet.md` — THE key deliverable. A table of every event:
   `t (s) | visual | suggested foley` (e.g. mechanical keyboard THOCK with pitch
   rising per digit, camera-shutter for plate snap, deep sub for CLICK BANG,
   airy whoosh 6.0 s, triple ding 17.4–19.2 s beats, vinyl-stop for the 23.4 s
   silence gag). Note that captions overlap by design (dead-air cuts) so VO — if
   any — should be cut with zero inter-word gaps. No video placeholder needed in
   this film; state that explicitly.

## Acceptance
Both MP4s + cue sheet in `out/`; every visual event lies exactly on the 0.3 s
grid; QA reviewed in both themes; zero dead frames (except the scripted 23.4 s
gag); all copy US English; chip correct.
