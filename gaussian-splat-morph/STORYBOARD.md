# JustPercent — Gaussian Splatting & AI Morphing teaser

1080×1920 (9:16), ~36.5 s, 30 fps, silent (autoplay-muted teaser). US locale only —
every piece of on-screen copy is American English, and all app UI is captured 1:1
from the live https://justpercent.com (mobile viewport 432 px, en-US, `?noredirect`).

## Technique

- **Gaussian splat condensation** — every scene materializes out of a seeded cloud of
  soft radial-gradient "splats" that converge and condense into the crisp UI
  (deterministic `rnd(i) = fract(sin(i·127.1+311.7)·43758.5453)`).
- **Impossible 3D fly-throughs** — the real page lives on a plane inside a
  `perspective: 1600px` camera rig; dollies/rotations fly "through" the frozen UI
  with parallax splat-dust layers at different depths.
- **Hallucinatory morphing** — no hard cuts: scene A dissolves into scene B via
  blur + saturation + hue bloom (Sora-style dissolve), scenes share the same frame.
- **Mid-film 3D theme flip** — the page plane rotates 180° in true 3D; the front
  face is the light home page, the back face the dark one; the whole stage
  (background, orbs) crossfades light→dark during the flip with a splat burst.

## Fidelity

Screens are NOT screenshots: `assets/screens/*.html` are full serialized DOM states
of the live app (nav, breadcrumbs, hero, search box, solution cards, calculators,
practical uses, FAQ hub, FAQ page, footer — the complete visible state), restyled
by the site's own compiled CSS bundles + the app's own @fontsource fonts
(IBM Plex Sans / Space Grotesk / JetBrains Mono) + original image assets
(`public/images/*.webp`, incl. the real logo `percentage.webp`).
Each screen renders in a 432 px iframe (correct mobile media queries) scaled ×2.375
to 1026 px (~95 % of frame width). Capture pipeline: `scripts/build-screens.py`
over `capture/dom/*.json` (stabilized live-DOM snapshots: network idle, fonts
ready, images decoded, no animations, +5 s hard margin, cookie banner accepted).

## Beats (root `index.html`)

| # | t (s) | Composition | Content |
|---|-------|-------------|---------|
| 1 | 0.0–3.4 | `b1-hook` | Splat cloud condenses into a "%" glyph → real logo + wordmark. Sequential headlines: "Percent problems?" → "Meet JustPercent." |
| 2 | 3.4–9.2 | `b2-home-flythrough` | Light home page (`justpercent.com/`) materializes; 3D dolly over hero → search → solution cards; spotlight + tap on the coupon card "Have a coupon — e.g. '20% off'?" (CTA **Apply My Coupon**). |
| 3 | 9.2–16.2 | `b3-calc-practical-use` | Morph into `justpercent.com/decreased-value-calculator/`. Scroll to **Practical Uses** under the calculator → tap **Sale Discount** → the selected example appears **above** the calculator (exactly like the app) → only then the fields type themselves ($300, 30 %) and the answer computes live → **$210**. |
| 4 | 16.2–22.4 | `b4-search-to-answer` | Back home. "tip" is typed into the search box → dropdown appears (real practical uses / FAQs / solutions) → tap **Restaurant Tip** → page scrolls to the Basic Percentage calculator, scroll fully settles, the pinned example sits above the form: 15 % of $60 → **$9**. |
| 5 | 22.4–25.2 | `b5-theme-flip` | The page plane flips 180° in 3D — light front, dark back — splat burst at the apex, stage crossfades to dark. |
| 6 | 25.2–32.2 | `b6-faq-live` | Dark `justpercent.com/faqs/` hub (search, category icons, FAQ cards) → glide to the **Bill Splitting** card → tap → morph into `justpercent.com/faqs/bill-splitting-calculator/`. Live edit: bill $250 → **$300**, shares update instantly $150/$100 → **$180/$120**. |
| 7 | 32.2–36.5 | `b7-endcard` | UI dissolves to splats → brand lockup: logo, Just Percent, white `justpercent.com` pill, tagline "Every percent problem — solved in seconds.", pills Free · Instant · No sign-up. |

`chrome-overlay` (track 2, 0–32.6 s): compact URL pill (top, verified canonical
URLs with trailing slash), big sequential captions on glass panels above the
brand bar, and the persistent bottom brand bar (real logo + justpercent.com)
which yields to the endcard.

## Determinism

Every timeline is `gsap.timeline({paused:true})` registered on `window.__timelines`.
All in-page UI state (typed characters, scroll positions, revealed panels, counted
results, taps/ripples) is driven exclusively by proxy tweens whose `onUpdate`
re-renders the state as a pure function of the proxies — seeking to any `t`, in
either direction, reproduces the exact frame. No `Math.random`, no `Date.now`,
no network fetches at play time.

## Preview

```bash
npm run dev          # npx hyperframes preview  (long-running)
```
