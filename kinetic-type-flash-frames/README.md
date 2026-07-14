# kinetic-type-flash-frames — JustPercent teaser (HyperFrames)

37 s · 1080×1920 (9:16) · 30 fps · silent (autoplay-muted teaser) · US English only.

Technique: **kinetic typography & font bending** — Frankenstein type (4 clashing
typefaces), stepped-weight "variable font" pulses, 2-frame subliminal flash
frames — wrapped around **recreated-1:1 live UI** of https://justpercent.com
(real DOM + real CSS + real fonts, not screenshots).

## Preview

```bash
npx hyperframes preview        # from this directory (index.html is the root composition)
```

Scrub freely — every frame is a pure function of `t` (paused GSAP timelines,
no wall-clock state, reverse-scrub verified).

There is also a standalone QA player that needs no CLI:
open `qa/player.html` in a browser (`?t=<seconds>`, ←/→ scrub by frame,
Shift+←/→ by second, `window.__seek(t)` hook for automation).

## Story (the app's differentiator: from *your* life problem to the right tool)

| # | Time | Scene | Real URL shown |
|---|------|-------|----------------|
| 1 | 0.0–4.4 | Kinetic hook: TIPS? TAXES? RAISES? DISCOUNTS? → flash frames → "ONE ANSWER: Just Percent" (real logo) | — |
| 2 | 4.4–11.2 | Home (light): SolutionCards; scroll to "Got a raise at work?"; cursor taps **See My New Pay** | justpercent.com/ |
| 3 | 11.2–15.6 | Value Increase calculator page (light), 240 + 15 % = 276 | justpercent.com/increased-value-calculator/ |
| 4 | 15.6–17.6 | **3D theme flip** light → dark (same page, both captured themes on the two faces of one card) | justpercent.com/increased-value-calculator/ |
| 5 | 17.6–26.4 | Practical Uses (dark): tap **Salary Increase** row → pinned banner appears **above** the calculator → fields type themselves (50000, 8) → answer counts to **54000** (strict order: click → banner → fill) | justpercent.com/increased-value-calculator/ |
| 6 | 26.4–33.2 | FAQs hub (dark) → FAQ page; salary 4000→5000, answer 4200→5250 **live** | justpercent.com/faqs/ → justpercent.com/faqs/salary-raise-calculator/ |
| 7 | 33.2–37.0 | Endcard: logo, wordmark, justpercent.com, tagline, Free · Instant · No sign-up | — |

Persistent brand-bar (real logo + justpercent.com) at the bottom for scenes 1–6;
captions on glass panels above it; compact URL pill on top.

## How the 1:1 UI recreation works

- `capture/*.json` — full-page DOM + CSSOM dumps of the **production** site
  (mobile viewport 432 px, `en-US`, `?noredirect`, theme via `jp:config:v1`,
  stabilized: network idle, `fonts.ready`, images decoded, no CLS, +5 s margin).
- `scripts/build_assets.py` — merges & dedupes the captured CSS, statically
  evaluates media queries for 432×808 mobile, scopes every selector under
  `[data-jp-scope]` (html→`.jp-root`, body→`.jp-body`), rewrites vh/vw to px,
  freezes all CSS animations/transitions (determinism), rewrites asset URLs and
  copies the **original** font/image files from `handy-percent/dist`
  → `assets/jp-app.css`, `assets/app-assets/`, `assets/app-images/`,
  `capture/fragments/*.html`.
- Each scene wraps a fragment in `.f-win > .f-pg > .f-off`:
  `.f-pg` is scaled ×2.375 (432 → 1026 px ≈ 95 % of frame width) and — because
  it has a transform — acts as the containing block for the app's
  `position:fixed` header and floating buttons, i.e. it behaves exactly like
  the phone viewport. Scrolling is animated via `top` on `.f-off` (not
  transform) so the sticky header stays pinned, like on the real site.
- `scripts/inject_fragments.py` — inlines fragments into
  `scripts/scenes/*.html` templates → `compositions/*.html`.
- `scripts/make_qa_player.py` — builds `qa/player.html` (runtime shim).

Regenerate everything after re-capturing:

```bash
python3 scripts/build_assets.py && python3 scripts/inject_fragments.py && python3 scripts/make_qa_player.py
```

## Determinism notes

- All timelines are `gsap.timeline({ paused: true })` registered on
  `window.__timelines`, no `Math.random()`, no `Date.now()`, no media.
- Typing / count-up effects write `input.value` from tween progress
  (pure in `t`, reversible).
- Scenes that measure the recreated DOM (s2, s5, s6) can't measure while the
  clip is unmounted, so they carry a *layout sentinel*: a zero-cost tween over
  the whole scene that retries geometry on each rendered frame until the DOM
  is measurable, then `tl.invalidate()`s once. After that first frame the
  timeline is fully idempotent in both directions (verified by hashing DOM
  state across forward / backward / random seek orders).

## Editing

Edit `scripts/scenes/*.html` (NOT `compositions/*.html` — those are generated),
then run `python3 scripts/inject_fragments.py && python3 scripts/make_qa_player.py`.
All copy lives in the scene templates; timings are GSAP position parameters.
