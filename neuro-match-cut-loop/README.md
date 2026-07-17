# neuro-match-cut-loop — justpercent.com teaser (Technique: Neuro-Editing & Match-Cutting)

36 s · 30 fps · 1080×1920 (9:16, authored natively) · silent (autoplay-muted teaser) · US English only.

## Run the preview (the deliverable)

```bash
cd hyperframes-video/neuro-match-cut-loop
npm run dev        # = npx hyperframes@0.6.44 preview  (long-running server)
```

The composition is `index.html` (`data-composition-id="main"`, 36 s). Every pixel is a pure
function of `t`: one GSAP timeline (`window.__timelines.main`) drives a setter-proxy that calls
`render(t)`, so scrubbing backwards/forwards always reproduces the exact frame (verified by
random-order seek tests — no hysteresis, loop frame 36.0 ≡ frame 0.0).

> `index-qa.html` is a QA-only variant with the page snapshots inlined as `srcdoc`
> (works from `file://` where cross-file iframe access is blocked). Don't ship it; the
> real composition is `index.html`, which needs the preview server (same-origin iframes).

## Technique (STYL WIDEO #5)

- **Match cuts on a center anchor** — every hard cut lands on a shape-matched element at
  stage center: fruity `%` badge → home page → "Apply My Coupon" pill → result chip →
  round theme FAB → FAQ card push (Bank Deposit Interest) → endcard badge.
- **Zoom Infinito** — monotonic `1 + 0.0062·t` base zoom runs under all scenes until the endcard.
- **Seamless loop** — the endcard collapses back into the opening `%` badge; the last frame
  equals the first (badge scale 1, brand-bar visible, URL bar hidden, light background).
- **Neuro-editing rhythm** — tap ripples, 2-frame flashes + expanding cut rings on every cut,
  a vertical whoosh into the search-target calculator.

## Story beats (source of truth: `B` object in index.html)

| t (s) | Beat |
|---|---|
| 0.0–3.1 | Hook: `%` badge + sequential glass headlines ("Math class? No." / "Your life — in percent.") |
| 3.1–8.25 | Home (light), URL `justpercent.com/` — "Start from your life — not from a formula."; tap **Apply My Coupon**, push-in match cut |
| 8.25–15.2 | `/basic-percentage-calculator/`: scroll to Practical Uses → tap **Grade Points** → pinned card appears ABOVE the calculator → fields type 85 / 120 → result counts to **102** (app-faithful order: click → presentation → fill) |
| 15.2–17.45 | Glide to the round theme FAB → tap → **3D flip** light→dark (two calc-pinned faces, transparent shell) |
| 17.45–24.45 | Dark home: type **"revenue"** in the SearchBox → dropdown (real portal) → tap **Revenue Growth** → whoosh to Percentage Change with pinned practical use above the form → 1,000,000 / 1,200,000 → **+20%** |
| 24.45–30.45 | `/faqs/` hub → type **"deposit"** into Search FAQs → filtered state pops (2 of 82) → scroll to the **Bank Deposit Interest** card → tap → match cut → `/faqs/bank-deposit-interest-calculator/`: deposit rolls 5000→**6000**, interest live-updates 150 → **180** (3% rate) |
| 30.45–36.0 | Endcard (logo badge, Just Percent, justpercent.com pill, tagline, Free·Instant·No sign-up) → collapse into the opening badge → **loop closed** |

## Fidelity

- `capture/*.html` are full-page DOM snapshots of the LIVE site (mobile 432 px, en-US,
  `jp:config:v1 = {theme:'light', locale:'us'}`), serialized with all CSS (CSSOM), fonts and
  images inlined, captured only after full stabilization (fonts.ready, images decoded, network
  idle ≥ 500 ms, no CLS ≥ 500 ms, + hard 5 s margin) — nothing is hand-drawn; proportions are 1:1.
- `b-*.html` are the baked variants actually used by the composition: helper style
  (animations off, scrollbars hidden), dark mode class + static scroll offsets baked in
  (`b-dark-change-pinned.html` = scrollY 60 with the pinned Revenue Growth, etc.);
  `b-dark-faqs-hub.html` / `b-dark-faqs-filtered.html` are the same-session pair behind the
  FAQ search journey (filtered = "deposit" typed live into `#faq-search`, 2 of 82 shown).
- Dark mode = the app's real Tailwind `.dark` theme (class strategy), not a filter.
- Logo: `assets/logo-percentage.webp` = the app's real `/images/percentage.webp`.
- URLs shown in the chrome bar are verified routes from `handy-percent/src/pages/`
  (canonical, trailing slash).
- Values are real app behavior, verified live: 85% of 120 → 102 (Grade Points practical use),
  $1,000,000 → $1,200,000 = +20% (Revenue Growth via search), bank deposit interest at 3%:
  $5,000→$6,000 → $150→$180. The FAQ filter really shows 2 of 82 for "deposit".

## Cue sheet (for post: SFX/music, video is silent)

| t (s) | Event |
|---|---|
| 0.45 / 1.85 | headline in (soft whoosh) |
| 3.10 | cut: badge → home (impact + ring) |
| 7.30 | tap ripple on CTA (click) |
| 8.25 | match cut → calculator (impact) |
| 9.6–11.0 | scroll (paper slide) |
| 11.25 | tap ripple on Grade Points (click) |
| 11.70 | pinned card pops in (pop) |
| 12.4–13.5 | keystrokes "85" + "120" ×5 |
| 13.7–14.3 | result count-up → ding at 14.3 |
| 15.85 | tap on theme FAB (click) |
| 16.1–17.05 | 3D flip (deep whoosh) |
| 17.45 | cut → dark home |
| 18.25–19.30 | keystrokes "revenue" ×7 |
| 19.45 | dropdown pop |
| 20.60 | tap on Revenue Growth (click) |
| 20.95–21.6 | whoosh down |
| 21.9–22.9 | keystrokes "1000000" + "1200000" ×14 |
| 23.0–23.5 | count-up → ding |
| 24.45 | cut → FAQ hub |
| 24.9–25.7 | keystrokes "deposit" ×7 |
| 25.85 | filter results pop (2 of 82) |
| 26.0–26.6 | scroll to the card (paper slide) |
| 26.75 | tap ripple on Bank Deposit card (click) |
| 27.45 | match cut → bank deposit FAQ |
| 28.3–29.3 | number roll (tick-tick) + live answers |
| 30.45 | page recedes, endcard build (riser) |
| 34.4–35.9 | collapse into badge (reverse whoosh → loop) |

## Files

- `index.html` — the composition (single main timeline, no sub-compositions needed)
- `capture/` — raw + baked (`b-*`) page snapshots, shared `fonts.css` (all real app fonts embedded)
- `assets/logo-percentage.webp` — original app logo
- `capture/AGENT-CAPTURE-BRIEF.md`, `capture/ORCH-SERIALIZER.txt` — capture tooling docs
- `capture/*.json`, `index-qa.html` — intermediates / QA artifacts (safe to delete)
