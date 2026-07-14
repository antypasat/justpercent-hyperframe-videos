# Film 7 / 7 — Edu-Tainment ("SaaS Brain Rot")

9:16 (1080×1920, 30 fps, 40 s) YouTube-Shorts product film for **justpercent.com** (US locale).
Technique: first-person gamer-style tutorial — persistent circular facecam placeholder,
200% zoom punches with hard 2-frame hits, an FPV UI fly-over with a per-keystroke arcade
combo counter, a wrong-way gag (freeze-frame, red vignette, big ✕), an XP badge, a rapid
recap montage, endcard.

## Files

| File | Purpose |
|------|---------|
| `capture.mjs` | Captures 10 plates ×2 themes from https://justpercent.com into `assets/` + geometry (rects for every punch target). Sections `hkscif`. |
| `assets/` | 20 plate PNGs + `geometry.json`. |
| `geometry.js` | `window.F7GEO` — viewport rects per theme (search, gag CTA, tip row, calc/inc/faq inputs+results). |
| `configs.js` | `window.F7` — beat sheet, punch mechanics, sweep path, captions. |
| `edu-tainment.html` | The player. Deterministic master clock; pure function of t; seek-safe. |
| `qa-frames.mjs` / `record.mjs` | QA stills / MP4 render (`out/edu-tainment-<theme>.mp4`). |

## Story / beats

| Time | Beat |
|------|------|
| 0–3 s | Cold open on the homepage; two stepped zoom punches into the search box. Caption "bro this site does your math FOR you". |
| 3–9 s | FPV sweep over the page (rotateZ ±2°, motion-blur ghost on fast moves); per-keystroke states t/ti/tip snap in with 1-frame flashes; combo counter ×1 ×2 ×3. |
| 9–15.2 s | WRONG-WAY GAG: fake cursor drifts to "Calculate Total Price" → freeze-frame, red vignette, big red ✕, alert caption "nope. not that one." → snap-cut to the search dropdown with the Restaurant Tip row highlighted (acid-green box) → row press → landed: basic calculator auto-filled 15 / 60 → 9, pinned. |
| 15.2–20.4 s | ZOOM PUNCHES on the re-framed calculator: 15 → 60 → double-punch on 9 (+ expanding hit rings) + gold XP badge "+ TIP MASTER unlocked" with sparks. |
| 20.4–23.2 s | Raise flow: /increased-value-calculator/ Budget Boost pinned; punch on 6,250. Caption "raise math? same site. two taps." |
| 23.2–31 s | FAQ flex: /faqs/tip-calculation-calculator/ (live FAQ, 150/10→15); slow push; punch on the $15 answer. Captions "bro the FAQ page IS a calculator" / "free real estate." |
| 31–35.4 s | Recap montage, 4 cuts ≈1.1 s (dropdown → calc 9 → 6,250 → FAQ 15), each with a mini punch entry; captions "search. / tap. / done. / gg." |
| 36–40 s | Endcard; facecam slides down & away at 36.5 s; caption "go be lazy: justpercent.com". |

## Player controls

- URL params: `?t=<ms>`, `?stop=<ms>`, `?rec`, `?theme=light`, `?pause`. Space/R. Scrub bar.
- QA hook: `window.__f7Seek(seconds, theme)`.
- Theme button swaps all 10 plates + geometry.

## Determinism & capture guard

- Pure function of t; punch shakes/rotations seeded by beat time & frame index (no Math.random).
- Captures after the full stabilization guard; active element blurred before every frame.
- Traps honored: `?noredirect`; theme via localStorage `jp:config:v1`; per-keystroke states each
  rebuilt from a FRESH page (the app re-selects input content ~1 s after typing pauses);
  dropdown row selection ONLY via dispatched `mousedown` on the `li` (click() does nothing);
  fresh context per section (localStorage persistence); **FAQ inputs: do NOT type — the page
  ships with the exact demo state 150/10→15 and its masked inputs mangle programmatic keystrokes.**

## Post-production — VIDEO PLACEHOLDER

| Asset | On screen | Stage region | Expected content |
|-------|-----------|--------------|------------------|
| `assets/facecam.mp4` | 0.0–37.6 s (slides out 36.5–37.6 s) | Circle Ø 300 px, bottom-left at (60, 60) margins (center ≈ (210, 1710)) | Creator facecam, cropped circular; muted; deterministically synced (`currentTime = t`). Any length ≥ 37 s; shorter clips freeze on the last frame. |

Missing file → dashed "VIDEO PLACEHOLDER" circle renders instead; the film records fine either way.

## Suggested SFX (post)

- Zoom punches (0.9, 1.9, 15.6, 16.8, 18.0+18.25, 21.4, 26.4 s): bass hit + camera-shutter snap.
- Keystroke combo (5.0, 6.3, 7.6 s): mechanical key clack + arcade tick; rising pitch per combo.
- Gag freeze (10.8 s): record-scratch + buzzer; ✕ slam at 10.85 s.
- Row press (13.2 s): UI click; landing (13.6 s): whoosh-down.
- XP badge (18.6 s): level-up jingle + sparkle shimmer.
- Recap cuts (31.0/32.1/33.2/34.3 s): four rapid whooshes; endcard (36 s): warm hit.

## QA verdict (2026-07-13)

- Verified stills: cold-open punch (1.2 s), sweep+combo (5.4 s), gag freeze with ✕ (11.2 s, both
  themes), dropdown highlight (12.8 s), punches on 15/60/9 + XP (16.0/18.3 s), 6,250 (21.8 s),
  FAQ $15 (26.7 s), recap (31.5/33.6 s), endcard + low caption (37.5 s, fixed overlap), 39.4 s.
