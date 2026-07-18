# PROMPT — Finish Film 5: "Neuro-Editing & Match-Cutting" (justpercent.com, US)

You are a senior motion designer + creative technologist. You build broadcast-grade
product videos out of pure HTML/CSS/JS with deterministic, frame-exact playback.
First read the shared contract:
`/Users/michael/startups/percentage-calculator/JUSTPERCENT-FILMS-PLAYBOOK.md`
Work ONLY inside `/Users/michael/startups/percentage-calculator/hyperframes-video-neuro-match-cut/`.

## Technique (chip already wired in configs.js)
- Chip line 1: `TECHNIQUE 5/7 · NEURO-EDITING & MATCH-CUTTING`
- Chip line 2: `Match Cuts · Zoom Infinito · Seamless Loop`

## Creative intent (already implemented — understand it before touching anything)
A 30 s dopamine chain where the viewer's eye NEVER moves: every hard cut lands on a
shape-matched anchor at the exact stage center (540, 960). A single monotonic
"zoom infinito" `Z(t) = 1.22^(t/30)` runs through the whole film, building
subconscious tension. The last second shrinks back into the exact Ø640 opening
circle → **seamless loop** (frame 900 ≙ frame 0). Emotion: hypnotic, premium,
slightly aggressive; violet→cyan gradients over a deep-space dark (or lavender
light) void with drifting particles.

Story beats (all times in `configs.js` → `window.F5.beats`, the source of truth):
ball video placeholder in a circle (0–2 s) → MATCH CUT to the round theme toggle
on the homepage → pull back to the full home page → push into the "Apply My Coupon"
CTA pill → hint banner → decreased-value calculator (100 − 20% = 80, real page) →
push into the result "80" → panel rounds into a circle → MATCH CUT to the round
FAQ category icon → pull back to the /faqs/ hub → push into a "%" glyph circle →
circle stretches into the REAL search pill → endcard with white `justpercent.com`
pill → pill collapses back into the opening circle (loop closed). Micro-cuts
(0.8 s background swaps) run behind S5 for cognitive rhythm.

## Current state (everything below EXISTS and works — do not rebuild)
- `neuro-match-cut.html` — complete deterministic player (759 lines),
  QA hook `window.__f5Seek(sec, theme)`, `?rec&pause&theme=` params, theme toggle.
- `configs.js` (`window.F5`) — full beat sheet, captions (US English), endcard copy.
- `capture.mjs` — done; `assets/` holds all plates/crops in dark+light,
  `geometry.js`/`assets/geometry.json` baked.
- `qa-frames.mjs`, `record.mjs` — working scripts.
- `qa/` — dark stills at ~40 timestamps + light stills at 19 timestamps already rendered.
- `assets/opening-ball.mp4` — INTENTIONALLY absent: the player shows a dashed
  "VIDEO PLACEHOLDER / drop assets/opening-ball.mp4" circle slot (0–2 s and a 3%
  echo at 29.2 s). The user drops an MP4 there in post. Do NOT fabricate this file.
- `out/` — EMPTY. Final renders were never produced. That is the main remaining task.

## Remaining work (in order)
1. Regenerate a fresh full QA pass for BOTH themes so both sets cover identical
   timestamps: `node qa-frames.mjs dark` then `node qa-frames.mjs light`.
2. Visually review every still in `qa/` (open the PNGs; you must actually look):
   - Cut alignment: at 2.0 s, 6.0/7.1 s, 11.4/13.1 s, 17.1 s the incoming and
     outgoing anchors must be concentric at stage center — no visible jump.
   - Loop contract: the 29.90 s frame must show the circle converging to the
     same Ø640 / same position as the 0.00 s frame (placeholder slot visible).
   - Captions never clipped at the 940 px plate width; chip legible; no
     mid-transition smearing; light theme has no unreadable white-on-white.
3. Fix only what QA reveals — prefer touching `configs.js` values over player code.
4. Render both themes (~7–10 min each):
   `node record.mjs dark 30` → `out/neuro-match-cut-dark.mp4`
   `node record.mjs light 30` → `out/neuro-match-cut-light.mp4`
5. Verify the MP4s: 900 frames, 30 fps, 1080×1920, H.264 yuv420p; scrub the first
   and last second to confirm the seamless loop; confirm the chip + captions.
6. Write `out/neuro-match-cut-cuesheet.md` for post-production: every beat from
   `F5.beats` with a suggested sound (e.g. 2.0 s cut = deep sub "thump", pill
   morph 19.6–20.5 s = stretchy "zwip", micro-cuts 17.1–23.9 s = ticking hats,
   0–2 s = placeholder clip `assets/opening-ball.mp4` with its own audio),
   plus the video-placeholder slot spec (file path, 0.0–2.0 s, circle Ø640 at center).

## Commands
Run from this directory. Playwright comes from the app repo (already handled inside
the scripts via `createRequire`). ffmpeg: `/opt/homebrew/bin/ffmpeg`.
Preview in a browser: open `neuro-match-cut.html` (Space = play/pause, R = restart,
theme button top; `?t=12000&pause` to inspect a moment).

## Acceptance
`out/neuro-match-cut-dark.mp4` + `out/neuro-match-cut-light.mp4` + cue sheet exist;
QA stills for both themes reviewed; loop is invisible; all copy US English;
technique chip correct; placeholder slot renders where no MP4 is present.
