# PROMPT — Build Film 7: "Edu-Tainment: SaaS Brain Rot" (justpercent.com, US)

You are a senior motion designer + creative technologist. You build broadcast-grade
product videos out of pure HTML/CSS/JS with deterministic, frame-exact playback.
First read the shared contract:
`/Users/michael/startups/percentage-calculator/JUSTPERCENT-FILMS-PLAYBOOK.md`
Work ONLY inside `/Users/michael/startups/percentage-calculator/hyperframes-video-saas-brain-rot/`
(this directory is NEW — you create everything in it; `PROMPT.md` is the only file so far).

## Technique (chip)
- Chip line 1: `TECHNIQUE 7/7 · EDU-TAINMENT: SAAS BRAIN ROT`
- Chip line 2: `FPV UI Tour · 200% Zooms · Gamer-Style Narration`

## Core idea — a tutorial that plays like a speedrun
No "Step one: click here." The interface is a GAME MAP: the camera flies over
the real UI like an FPV drone, the narration (first-person, casual, chronically
online) lives in punchy caption cards, a mistake happens ON PURPOSE and gets
roasted, and the fix lands instantly. Gaming HUD garnish everywhere. Emotion:
fast, funny, cocky — but the viewer genuinely LEARNS the app in 30 s.
The real UI stays legible at all times; comedy sits on top of it, not instead of it.

HUD toolkit (reusable deterministic components):
- FPV CAMERA: one continuous transform path over big fullPage plates — banked
  turns (rotate ±3°), speed lines at high velocity, subtle fisheye vignette;
  eases like a drone (slow-in, whip-out).
- 200% PUNCH-IN: instant zoom to a detail rect (from geometry), 2-frame white
  flash, chromatic edge for 4 frames, then micro settle. Never linger >1.5 s.
- QUEST LOG (top-right, JetBrains Mono): objectives that check off —
  `☐ find the tool → ☑`, `☐ type it in → ☑`, `☐ steal the answer → ☑`.
- XP POPUPS: `+50 XP — SPEED DEMON`, `+100 XP — NO CALCULATOR HARMED` pop with
  a spring near the interaction point; achievement toast at the end:
  `🏆 PERCENT WIZARD — UNLOCKED`.
- MINIMAP (bottom-left): a tiny rounded-rect map of the current fullPage plate
  with a moving "you are here" dot mirroring the FPV camera position.
- ERROR ROAST: red flash border, screen-shake 8 px, glitch slices for 0.3 s,
  giant "BRUH." stamp — then instant snap to the correct state.
- FACECAM PLACEHOLDER: rounded-rect slot, bottom-right (280×280 px), dashed
  border, `VIDEO PLACEHOLDER — drop assets/facecam.mp4` (house pattern; video
  slaved to master clock). It sits above the minimap, never covers captions.

## Story / flow (capture these real states — genuine interactions, playbook rules)
Narration lines below are the actual caption copy (US English, lowercase-casual):
1. 0–2 s COLD OPEN mid-flight over the HOME fullPage plate (FPV already moving):
   "ok so you need 20% off of $80 and your brain said no." Quest log spawns.
2. 2–7 s SEARCH (Practical Uses, way #1): punch-in 200% on `#calculator-search`;
   type a real query per-keystroke (e.g. `sale` — per-keystroke plates, fresh
   context each, per the input re-select trap); the matching SolutionCard
   scrolls into view; "bro it literally autocompletes your life."
   `☑ find the tool` + XP popup.
3. 7–9 s THE MISTAKE: cursor drifts to the WRONG card (any other card crop),
   ERROR ROAST fires ("BRUH. not that one."), instant snap-pan to the correct card.
4. 9–14 s CLICK → genuine `.solution-cta-button` navigation (record the real
   destination URL in capture; assert it's a verified calculator route).
   FPV dives INTO the card like entering a level; arrival plate loads;
   "level 2. the actual calculator." 200% punch-ins on each input while values
   fill (captured keystroke states); XP popup on the result. `☑ type it in`.
5. 14–20 s PRACTICAL USES (way #2): FPV descends BELOW the calculator to the
   Practical Uses rows; click one row in capture → pinned state plate;
   "tap a preset. it fills itself. this is basically cheating."
   Punch-in 200% on the result field crop. `☑ steal the answer` + XP.
6. 20–25 s FAQ SIDE-QUEST: whip-pan to `/faqs/` hub plate, then punch into one
   FAQ page related to the calculator (verify slug exists in
   `handy-percent/src/pages/faqs/`); "side quest: 64 ready-made answers.
   speedrunners only." Minimap updates per page.
7. 25–30 s ENDCARD (house style) + achievement toast `🏆 PERCENT WIZARD`;
   facecam placeholder gives a final beat ("smash a bookmark on
   justpercent.com"); quest log shows all checked.

## Build steps
1. `capture.mjs` — copy guard/context helpers from
   `/Users/michael/startups/percentage-calculator/hyperframes-video-neuro-match-cut/capture.mjs`
   (stabilization contract mandatory; both themes; `?noredirect`; US locale;
   `pressSequentially`; fresh context per keystroke state). Capture: home
   fullPage plate, search keystroke states, wrong-card + right-card crops,
   genuine click destination plate (+ its fullPage for FPV), input keystroke
   states, PU rows / pinned / result crop, `/faqs/` hub plate, chosen FAQ page
   plate. Bake `geometry.js` + `assets/geometry.json` (rects, URLs, values).
   BEFORE committing to the search query: verify it actually returns a matching
   SolutionCard on the live site; if not, pick another real query and note it
   in geometry.json.
2. Copy `fonts/` from the film-5 dir; scripts `mkdirSync` `qa/` and `out/`.
3. `configs.js` → `window.F7` (id "7", strings above, 30 s / 30 fps /
   cssToStage 2.5): FPV path keyframes, punch-in windows, quest/XP/roast
   timings, all caption copy, endcard.
4. `saas-brain-rot.html` — deterministic player, house pattern, QA hook
   `window.__f7Seek(sec, theme)`; facecam placeholder slot; HUD toolkit above.
   Model chrome on the film-5 player.
5. `qa-frames.mjs` + `record.mjs` — copy from film-5, rename hook/file/prefix.
6. QA both themes (~18 stills incl. the roast, each punch-in, each HUD state):
   captions readable both themes, HUD never overlaps captions/chip, punch-ins
   land exactly on geometry rects, minimap dot matches camera position.
7. Render both themes → `out/saas-brain-rot-dark.mp4` / `-light.mp4`.
8. `out/saas-brain-rot-cuesheet.md`: facecam placeholder spec
   (`assets/facecam.mp4`, visible windows, 280×280 bottom-right) + VO note (the
   captions double as the VO script — deliver them as a timestamped list for
   recording; cuts assume zero dead air between lines) + SFX: drone whoosh per
   FPV move, mario-style coin on XP, error buzzer + record-scratch on BRUH,
   achievement fanfare at 25 s, keyboard clacks on typed queries.

## Acceptance
Both MP4s + cue sheet in `out/`; genuine click destination asserted against
verified routes; search query verified to match a real card; both PU ways shown
(home search + on-page Practical Use click); facecam slot degrades gracefully;
deterministic; QA reviewed both themes; US English; chip correct.
