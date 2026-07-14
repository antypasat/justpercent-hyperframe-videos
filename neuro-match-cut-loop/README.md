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
  round theme FAB → FAQ category push → endcard badge.
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
| 8.25–15.2 | `/decreased-value-calculator/`: scroll to Practical Uses → tap **Sale Discount** → pinned card appears ABOVE the calculator → fields type 300 / 30 → result counts to **210** (app-faithful order: click → presentation → fill) |
| 15.2–17.45 | Glide to the round theme FAB → tap → **3D flip** light→dark (two calc-pinned faces, transparent shell) |
| 17.45–24.45 | Dark home: type **"tip"** in the SearchBox → dropdown (real portal) → tap **Restaurant Tip** → whoosh to Basic Percentage with pinned practical use above the form → 15 / 60 → **9** |
| 24.45–30.45 | `/faqs/` hub → push into category → match cut → `/faqs/bill-splitting-calculator/`: bill rolls 250→**300**, answers live-update 150/100 → **180/120** (60/40 split) |
| 30.45–36.0 | Endcard (logo badge, Just Percent, justpercent.com pill, tagline, Free·Instant·No sign-up) → collapse into the opening badge → **loop closed** |

## Fidelity

- `capture/*.html` are full-page DOM snapshots of the LIVE site (mobile 432 px, en-US,
  `jp:config:v1 = {theme:'light', locale:'us'}`), serialized with all CSS (CSSOM), fonts and
  images inlined, captured only after full stabilization (fonts.ready, images decoded, network
  idle ≥ 500 ms, no CLS ≥ 500 ms, + hard 5 s margin) — nothing is hand-drawn; proportions are 1:1.
- `b-*.html` are the baked variants actually used by the composition: helper style
  (animations off, scrollbars hidden), dark mode class + static scroll offsets baked in
  (`b-dark-home-target.html` = scrollY 2007.5 with the pinned Restaurant Tip, etc.).
- Dark mode = the app's real Tailwind `.dark` theme (class strategy), not a filter.
- Logo: `assets/logo-percentage.webp` = the app's real `/images/percentage.webp`.
- URLs shown in the chrome bar are verified routes from `handy-percent/src/pages/`
  (canonical, trailing slash).
- Values are real app behavior, verified live: $300 −30% → $210 (Sale Discount practical use),
  15% of $60 → $9 (Restaurant Tip via search), bill split 60/40 of $250→$300 → $150/$100→$180/$120.

## Cue sheet (for post: SFX/music, video is silent)

| t (s) | Event |
|---|---|
| 0.45 / 1.85 | headline in (soft whoosh) |
| 3.10 | cut: badge → home (impact + ring) |
| 7.30 | tap ripple on CTA (click) |
| 8.25 | match cut → calculator (impact) |
| 9.6–11.0 | scroll (paper slide) |
| 11.25 | tap ripple on Sale Discount (click) |
| 11.70 | pinned card pops in (pop) |
| 12.4–13.5 | keystrokes ×5 |
| 13.7–14.3 | result count-up → ding at 14.3 |
| 15.85 | tap on theme FAB (click) |
| 16.1–17.05 | 3D flip (deep whoosh) |
| 17.45 | cut → dark home |
| 18.25–19.30 | keystrokes "tip" ×3 |
| 19.45 | dropdown pop |
| 20.60 | tap on Restaurant Tip (click) |
| 20.95–21.6 | whoosh down |
| 21.9–22.9 | keystrokes ×4 |
| 23.0–23.5 | count-up → ding |
| 24.45 | cut → FAQ hub |
| 26.25 | match cut → bill splitting FAQ |
| 27.6–28.6 | number roll (tick-tick) + live answers |
| 30.45 | page recedes, endcard build (riser) |
| 34.4–35.9 | collapse into badge (reverse whoosh → loop) |

## Files

- `index.html` — the composition (single main timeline, no sub-compositions needed)
- `capture/` — raw + baked (`b-*`) page snapshots, shared `fonts.css` (all real app fonts embedded)
- `assets/logo-percentage.webp` — original app logo
- `capture/AGENT-CAPTURE-BRIEF.md`, `capture/ORCH-SERIALIZER.txt` — capture tooling docs
- `capture/*.json`, `index-qa.html` — intermediates / QA artifacts (safe to delete)
