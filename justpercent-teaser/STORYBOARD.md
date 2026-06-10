# Storyboard — JustPercent Launch Teaser

**Format:** 1080×1920 (portrait — IG Stories / Reels / TikTok)
**Audio:** Kokoro TTS narration (`am_michael`) + minimal underscore (warm sub-pad + ticking percussive pulse) + tasteful UI clicks/whooshes
**VO direction:** Neutral male, calm-confident, dry. Not infomercial. Silence between sentences is part of the design.
**Style basis:** [DESIGN.md](DESIGN.md) — dark cosmic, frosted glass, purple/indigo aurora, Space Grotesk + IBM Plex + JetBrains Mono.

## Global guardrails

- Every beat lives over `#030712` with at least one large blurred radial gradient layer (purple/indigo/sky-blue) drifting behind content. Background is **never** flat black — always aurora-washed.
- Purple `#7C3AED` is reserved for "the answer." It must appear in every beat that reveals a calculated result.
- Numbers always typeset in JetBrains Mono with `font-variant-numeric: tabular-nums`. They count up, never just fade in.
- Glass panels: white/15 fill, white/25 hairline, `backdrop-filter: blur(20px)`, 8px radius, inner top highlight.
- Minimum 3 layers per scene: aurora BG → glass MG content → FG accent / overlay / particle.
- Pace is calm but the *count-up + click* combo creates urgency without bouncy animation.
- All transitions are short (0.3-0.5s) and velocity-matched. No shader transitions — keep it sleek/utilitarian, not flashy.

## Underscore direction

Warm low pad already playing when video starts. A subtle `tic-tic` rhythmic percussive pulse at ~110 BPM gives the "everything is calculating" feel. The pad gently swells under Beat 5 ("Every percentage. Instantly."), and resolves on a single soft chime under the final URL.

---

## Asset Audit

| Asset | Type | Beat | Role |
|---|---|---|---|
| `closing-a-deal-calculate-your-estimated-.webp` | Lifestyle photo (coin stacks) | Beat 2 | Behind discount/coupon scene as moody background, blurred + tinted purple |
| `in-store-shopping-calculate-the-total-pr.webp` | Lifestyle photo (sneaker shopper) | Beat 2 alt / SKIP | Reserve — coin stack reads "money saved" stronger |
| `dining-out-or-ordering-in-calculate-the-.webp` | Lifestyle photo (waiter at table) | Beat 3 | Behind tip scene, blurred + tinted, Ken Burns slow zoom |
| `got-a-raise-at-work-see-how-much-your-ne.webp` | Lifestyle photo (woman thinking of car/house) | Beat 4 | Behind salary scene, blurred + tinted |
| `percentage-symbol-logo.webp` | Fruit-art `%` (unique brand mark) | SKIP for hero, OPT for Beat 6 corner | Off-brand for the dark UI — use SVG `%` glyph instead. Keep fruit logo as an optional surprise card. |
| `svgs/star-filled.svg` | UI icon | Beat 5 | Drifting accents on the "Every percentage" wall |
| `svgs/solution-hover-arrow-icon.svg` | UI icon | Beat 6 | URL underline reveal |
| All font files (Space Grotesk, IBM Plex Sans, JetBrains Mono) | Fonts | All beats | Embedded automatically |

Lifestyle photos are 256×256 originals — they will be used as **textured background tiles**, heavily blurred (`filter: blur(40px) saturate(1.4)`) and color-shifted toward the purple palette. Never shown sharp/full-bleed.

---

## Beat Timing (from `transcript.json`)

Audio total = 10.52s. Composition total = **12.00s** (1.5s outro hold after VO ends).

| Beat | VO line                               | start  | end    | dur   |
| ---- | ------------------------------------- | ------ | ------ | ----- |
| 1    | Stop guessing the math.               | 0.00s  | 1.85s  | 1.85s |
| 2    | Twenty percent off — done.            | 1.85s  | 3.55s  | 1.70s |
| 3    | The tip — done.                       | 3.55s  | 4.55s  | 1.00s |
| 4    | Your new salary after a raise — done. | 4.55s  | 7.00s  | 2.45s |
| 5    | Every percentage. Instantly.          | 7.00s  | 9.30s  | 2.30s |
| 6    | Just Percent dot com.                 | 9.30s  | 12.00s | 2.70s |

## Beat-by-Beat

### BEAT 1 — HOOK (0.00–1.85s)

**VO:** "Stop guessing the math."

**Concept:** Cold open. The void breathes. A field of faint floating decimal numbers (`23.5%`, `87.4%`, `12.0%`, `66.6%`...) drifts through deep space, all slightly out of focus, in mono — the static of human guesswork. They're CROSSED OUT one by one. The headline lands centered: **"Stop guessing."**

**Visual (1080×1920):**
- BG layer 1: solid `#030712`.
- BG layer 2: two large blurred radial gradients (`#3B0764` 600px top-left + `#1E1B4B` 800px bottom-right), slowly drifting.
- MG: 12 mono-typeset random-looking percentages (`14.7%`, `33%`, `82.4%`, ...) scattered across the canvas at small sizes (32-48px), 35% opacity. They drift slowly downward (y: 0 → +30px over the beat).
- FG: white headline `Space Grotesk 300` "Stop guessing" + bold "the math." on a second line. Word-by-word entrance.
- Each scattered % gets a thin red `1px` strikethrough drawn across it via `strokeDashoffset` 0→0.6s, staggered.

**Mood:** Quiet, intriguing. "Something is wrong, and we're about to fix it." Think Apple keynote opener.

**Animation choreography:**
- Aurora BGs DRIFT (x: -20 → +20 over beat) on `power1.inOut`.
- 12 percentages FADE in 0.0–0.5s staggered.
- Strike-through paths DRAW across them, staggered 0.3-1.0s, `power2.out`.
- Headline word "Stop" RISES (y:60→0, opacity 0→1, 0.45s `power3.out`) at 0.5s. "guessing" follows at 0.75s, "the math." at 1.05s.
- All elements HOLD through 2.0s — no exit (transition handles it).

**Transition OUT:** Velocity-matched upward — exit: `y:-120, blur:24px, opacity:0`, 0.33s `power2.in`, starting at 1.67s so it ends exactly at 2.0s.

**SFX:** Soft pad already playing. Faint subliminal `tic` per strikethrough.

---

### BEAT 2 — DISCOUNT (2.0–4.5s)

**VO:** "Twenty percent off — done."

**Concept:** A receipt-like moment. We are now inside a glass calculator card. A price `$129.00` sits at the top, then a `20%` chip stamps in, and the answer `$103.20` lands in the purple field. Coin-stack imagery (blurred, tinted purple) glows behind the card. The word "done" lands with a soft check-mark stamp.

**Visual:**
- BG: aurora `#3B0764` heavy on left. `closing-a-deal-*.webp` tile, `filter: blur(40px) saturate(1.4) hue-rotate(20deg) brightness(0.5)`, scaled to fill, 0.3 opacity, slow ken-burns zoom (scale 1.05 → 1.15 over beat).
- MG: large glass calculator card 880×680 centered.
- FG content inside card:
  - Top row: label "Price" (IBM Plex 32px, white/70) + value `$129.00` (JetBrains Mono 96px, white).
  - Middle row: minus sign + `20%` chip (purple `#7C3AED` background, 64px JetBrains Mono).
  - Result row in purple answer pill: `$103.20` (JetBrains Mono 132px white, tabular).
- FG decoration: small `— DONE` stamp (Space Grotesk 700, 36px) bottom-right of card, rotated -8°, fades + scales in on "done".

**Mood:** Receipt-printer satisfaction. The math is happening live.

**Animation choreography:**
- Glass card SLIDES UP into place (y:120→0, opacity 0→1, blur 24→0 — velocity-matched entry from Beat 1), 0.5s `power2.out` at 0.0s of beat.
- `$129.00` typesets via per-character reveal 0.45–0.8s.
- `20%` chip STAMPS (scale 1.4→1 + opacity 0→1, 0.25s `back.out(2)`) at 1.1s.
- `$103.20` COUNTS UP from `$0.00` → `$103.20` over 0.7s starting at 1.4s, `power2.out`. Purple pill simultaneously scales 0.92→1, opacity 0→1.
- "— DONE" stamp at 2.1s — scale 1.3→1, rotation -16°→-8°, 0.2s `back.out(2.5)`.

**Transition OUT:** Blur-through with subtle x-drift left — exit: `x:-80, blur:18px, opacity:0`, 0.3s `power2.in`, starting at 4.2s.

**SFX:** Soft cash-register `tic` at chip stamp. Click on result land.

---

### BEAT 3 — TIP (4.5–6.5s)

**VO:** "The tip — done."

**Concept:** Same calculator card system, different content — tight rhythmic continuity. A dinner bill `$84.50` + an `18%` tip slider sliding in from the right, and the purple field reveals `$15.21`. Restaurant photo blurred behind.

**Visual:**
- BG: aurora shifts to warmer `#4A044E`+`#1863DC` mix. `dining-out-*.webp` tile, blurred and tinted, slow opposite-direction pan.
- MG: same glass card design as Beat 2 (consistency).
- Inside card:
  - "Bill" + `$84.50` (JetBrains Mono 96px).
  - Plus row + `18%` (purple chip) — chip slides in from the right.
  - Result pill: `$15.21` (132px) + secondary line `Total $99.71` (IBM Plex 38px, white/80).

**Mood:** Rhythm. Same structure as Beat 2 means the brain instantly recognizes the pattern — "ah, this is what JustPercent does."

**Animation choreography:**
- Glass card carries over from Beat 2 with x-restore (entry: x:80→0, blur 18→0, opacity 0→1, 0.3s `power2.out`).
- `$84.50` per-character reveal 0.25-0.55s.
- `18%` chip SWEEPS in from x:+200, 0.3s `expo.out` at 0.7s.
- `$15.21` COUNTS UP 0→15.21 over 0.55s starting at 1.0s `power2.out`.
- "Total $99.71" FADES IN with subtle y:8→0 at 1.5s, 0.3s `power2.out`.

**Transition OUT:** Same blur+drift, exit at 6.2s.

**SFX:** Soft glass clink on result.

---

### BEAT 4 — RAISE (6.5–9.5s)

**VO:** "Your new salary after a raise — done."

**Concept:** Scale up. The number is bigger now — `$72,000 → $79,200`. Frame the math as a person's life upgrade. "Got a raise" photo blurred + tinted indigo behind. Same calculator card but the result pill is the hero.

**Visual:**
- BG: aurora shifts cool — `#1E1B4B` + `#1863DC` accents. `got-a-raise-*.webp` blurred tile.
- MG: glass card, content:
  - "Current Salary" + `$72,000` (JetBrains Mono 84px).
  - "Raise" + `10%` (purple chip).
  - Result pill: `$79,200` (JetBrains Mono 156px — LARGEST yet, the hero number).
  - Secondary: `+$7,200/yr` (Space Grotesk 700, 44px, white/85) below.

**Mood:** Aspirational. Quiet pride. This is what the math means in real money.

**Animation choreography:**
- Glass card enters 0.0–0.3s.
- "Current Salary $72,000" per-char reveal 0.2-0.55s.
- "10%" chip SCALES IN at 0.8s, `back.out(2)`.
- `$79,200` COUNTS UP from `$72,000` over 1.0s starting at 1.1s, `power3.out`. Purple pill GLOWS (filter `drop-shadow(0 0 32px #7C3AED)`) ramping up during the count, peaking on land.
- `+$7,200/yr` accent slides up from y:24, opacity 0→1, at 2.0s, `power2.out`.
- Tiny `↑` arrow icon to left of `+$7,200`, draws via strokeDashoffset 0→0.4s at 2.1s.

**Transition OUT:** Zoom through outward — exit: `scale:1→1.1, blur:24px, opacity:0`, 0.3s `power2.in` starting at 9.2s.

**SFX:** Subtle low brass swell under the count-up. Soft chime on land.

---

### BEAT 5 — FLEX WALL (9.5–12.0s)

**VO:** "Every percentage. Instantly."

**Concept:** Pull back from the single card to reveal we can do EVERY kind of percentage. A 3×4 wall of mini calculator chips floods the frame — each one a tiny solved calculation: `25% of 80 = 20`, `15% off $50 = $42.50`, `$200 → $230 = +15%`, etc. They CASCADE in rapid-fire. Center reads big text: "Every percentage. Instantly."

**Visual:**
- BG: full aurora wash — large radial gradients all three colors, slow rotation.
- MG: 12 small glass chips in a 3-col × 4-row grid, each 280×140, containing one mini-equation. JetBrains Mono numbers. Purple answer fragment per chip.
- FG: centered headline overlay (Space Grotesk 300 "Every percentage." in white/90, 96px) with second line (Space Grotesk 700 "Instantly." in purple `#7C3AED`, 132px). Overlay sits over a slight dim layer (rgba(3,7,18,0.4)).
- Decorative: 4-5 small `★` icons drifting at very low opacity (0.18) for sparkle.

**Mood:** Abundance. "Look how much we cover." The flex.

**Animation choreography:**
- 12 chips CASCADE in: stagger 0.04s per chip starting at 0.0s, each tween: y:60→0, opacity 0→1, scale 0.94→1, 0.35s `power3.out`. Wave reads as a single sweeping motion.
- Dim overlay fades in 0.6–0.9s.
- Headline "Every percentage." per-word reveal at 0.9s, 1.05s (each word 0.3s `power3.out`).
- "Instantly." SLAMS in at 1.4s — scale 1.4→1, opacity 0→1, 0.3s `back.out(2.2)`, with a subtle purple glow flash.
- ★ icons drift slowly (y: -20 → +20 over beat).

**Transition OUT:** Crossfade with slight zoom — exit: `scale:1→1.06, opacity:0`, 0.4s `power2.in` starting at 11.6s.

**SFX:** Tic-tic-tic rapid as chips cascade. Soft chime on "Instantly".

---

### BEAT 6 — URL OUTRO (12.0–15.0s)

**VO:** "Just Percent dot com."

**Concept:** Calm landing. The URL is the whole frame. Logo (built as clean SVG `%` mark) above a single line: **`justpercent.com`**. Purple underline draws itself. Aurora is at its most restful — a single deep purple gradient. Tagline below: "Free percentage calculators."

**Visual:**
- BG: soft single radial gradient `#3B0764` → `#030712`. Aurora at rest.
- MG center stack (vertical, centered):
  - Logo: clean SVG `%` glyph in purple `#7C3AED`, 220px square. Two circles + diagonal stroke, draws on.
  - Brand wordmark: "Just Percent" Space Grotesk 700, 96px, white.
  - URL: `justpercent.com` IBM Plex Sans 500, 64px, white/80.
  - Purple underline beneath URL, draws via strokeDashoffset, 320px wide.
  - Tagline: "Free percentage calculators." IBM Plex 400, 36px, white/55.

**Mood:** Restful. The receipt-printer rhythm stops. We breathe.

**Animation choreography:**
- BG settles in immediately (carried from Beat 5 fade).
- `%` SVG glyph: two circles SCALE IN (scale 0.6→1, 0.4s `back.out(1.8)`) at 0.1s and 0.2s. Diagonal stroke DRAWS via strokeDashoffset 0→0.5s starting at 0.4s.
- "Just Percent" wordmark per-word reveal: "Just" at 0.7s, "Percent" at 0.9s, 0.4s each `power3.out` from y:30.
- `justpercent.com` URL fades + rises y:20→0 at 1.4s, 0.5s `power2.out`.
- Purple underline DRAWS left-to-right via strokeDashoffset, 0.6s `power2.out` at 1.7s.
- Tagline at 2.1s, fade only, 0.4s.
- HOLD through 3.0s. No exits (final beat).

**SFX:** Single soft chime on glyph land. Pad resolves on a held warm chord.

---

## Production Architecture

```
justpercent-teaser/
├── index.html                        root — orchestrates beats + VO + underscore
├── DESIGN.md                         brand reference (Step 2)
├── SCRIPT.md                         narration text (Step 3)
├── STORYBOARD.md                     this file
├── transcript.json                   word-level timestamps (Step 5)
├── narration.wav                     Kokoro TTS audio (Step 5)
├── capture/                          captured website data (Step 1)
└── compositions/
    ├── beat-1-hook.html
    ├── beat-2-discount.html
    ├── beat-3-tip.html
    ├── beat-4-raise.html
    ├── beat-5-wall.html
    └── beat-6-outro.html
```

## Techniques per beat

| Beat | Techniques (techniques.md) |
|------|-----------------------------|
| 1 | SVG path drawing (strikethroughs) · per-word kinetic typography · velocity transitions |
| 2 | Counter animation (`$0→$103.20`) · per-char typing · velocity transitions |
| 3 | Counter animation · per-char typing · velocity transitions |
| 4 | Counter animation (large number, with glow build) · SVG path drawing (↑ arrow) · velocity transitions |
| 5 | Per-word typography · staggered cascade · scale-slam on key word |
| 6 | SVG path drawing (`%` glyph + underline) · per-word reveal · settle/hold |
