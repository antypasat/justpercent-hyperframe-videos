# JustPercent — "Foley-First Cut"
### 1080×1920 (9:16) · 38.5 s · 30 fps · muted (autoplay teaser) · US English

**Technique — Foley-First Editing (muted):** the film is cut as if an
exaggerated ASMR soundtrack were driving it. Because the teaser plays
muted, every sound is rendered VISIBLY: each click lands an onomatopoeia
chip (THOCK!, CLACK!, DING!…), an impact ring, a camera shake and a spike
on the small EQ meter inside the brand bar; every cut rides WHOOSH
streaks; there is no dead air — captions and moves overlap.

**Core message (the differentiator):** other calculator sites make you
guess which tool you need. JustPercent starts from *your real-life
situation* — tap it or search it — and takes you straight to the right
calculator, or to an interactive FAQ that *is* a calculator with an
explanation.

**Fidelity:** all app UI is recreated 1:1 from the app's own sources
(`handy-percent/src`): light/dark tokens, IBM Plex Sans / Space Grotesk
(@fontsource woff2), liquid-glass, SolutionCards, SearchBox + dropdown
portal, calculator cards with FieldTooltip chips, Selected Practical Use
Example presentation, FAQ hub + interactive FAQ, floating search/theme
buttons, original logo (`percentage.webp`). Copy comes only from the
en-US locale files; layouts verified against the live site
(justpercent.com, mobile 430 px, light + dark, with full stabilization
waits) on 2026-07-13.

---

## Timeline

1. **0.0–3.55 · Cold open (LIGHT).** A giant mechanical keycap "%" slams
   down — THOCK!, ring, flash, shake. Two sequential glass headlines
   (never simultaneous): "Percentages are easy." → "Finding the right
   calculator isn't." Brand bar (logo + EQ + justpercent.com) is present
   from the start; it stays until the finale.
2. **3.55–8.9 · Homepage slam-assembly.** WHOOSH up; `justpercent.com/`
   in the compact URL pill. Filter, section label and the six real
   SolutionCards land one-by-one like drum hits (tap·tap·tap). Caption:
   "JustPercent starts from your life — not from math." The page scrolls
   to the *"Facing a rent hike?"* card.
3. **8.9–13.3 · SolutionCard → calculator page.** Clay cursor CLACK! on
   the card → whip cut to `/percentage-change-calculator/`. The inputs
   type themselves (2000 → 2200, live recompute on each keystroke) →
   "is an INCREASE of **10%**" — DING! Caption: "Tap your situation.
   Get the right tool."
4. **13.3–18.6 · Practical Use, in the app's exact order.** Scroll down
   to Practical Uses; (a) CLACK! on *Inflation Rate* → red pin pops
   (PLINK!); (b) scroll back up — the **Selected Practical Use Example**
   unfolds ABOVE the calculator; (c) only then the values fly in
   ($100 / $103) with the app's gold/lime/pink FieldTooltip chips →
   live answer **3%** — DING! Caption: "Real examples fill it in — live."
5. **18.6–21.4 · 3D theme flip.** CLICK on the floating theme toggle →
   the calculator page rotates away and the **back face is the homepage
   in dark mode** (specular sweep, flash at edge-on, BOOM! on landing).
   Caption: "One tap. Day or night."
6. **21.4–27.75 · Search → dropdown → pinned calculator (DARK).**
   CLACK! on the SearchBox, "t·i·p" typed with three key thocks, the
   liquid-glass dropdown springs open (real section order: Practical
   Uses → Related FAQs → Suggested solutions, plus the results status
   line). CLACK! on *Restaurant Tip* → long WHOOOOSH scroll; the page
   settles (THUNK!) with the **whole Basic Percentage calculator in
   frame**, the pinned example above the form; 15 / 60 fill in → **9** —
   DING! Caption (during the scroll only): "Search it — it scrolls you
   to the answer."
7. **27.75–31.1 · /faqs/ hub.** Whip cut; H1 + INTERACTIVE FAQ
   CALCULATORS badge, hub search, category carousel, "Showing all 64
   FAQs", scroll to *Shopping and Promotions*; CLACK! on **Tip
   Calculation**.
8. **31.1–35.3 · Interactive FAQ.** `/faqs/tip-calculation-calculator/`:
   the real question sentence with inline inputs. The cursor **drags**
   the bill 150 → 180 (brrrp…): answer 15 → 18 and the whole formula
   explanation update live — DING! Caption: "64 real-life FAQs. Each one
   is a live calculator."
9. **35.3–38.5 · Finale.** The brand bar yields to the end card: logo
   BOOM! + ring + shake, "Just Percent", justpercent.com, tagline
   "Calculate any percentage in seconds."

## Determinism

One master GSAP timeline (paused) registered as
`window.__timelines["justpercent-foley"]`. All discrete state (theme
class, screen visibility, typed characters, live-computed numbers, URL
path, pin/hover classes, camera shake, EQ heights) lives in `sync(t)` —
a pure function of time driven by a getter/setter tween that GSAP must
evaluate on every render, including backward seeks. Scrubbing in either
direction reproduces identical frames (verified programmatically).

## Preview

```bash
cd hyperframes-video/foley-first-cut
npx hyperframes preview
```
