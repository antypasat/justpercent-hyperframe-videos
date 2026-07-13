# JustPercent — "From Your Problem to Your Answer"
### Spatial UI & 3D Screencast · 1080×1920 (9:16) · 40 s · 30 fps · US English

**Core message (the differentiator):** other calculator sites make you guess
which tool you need. JustPercent starts from *your real-life situation* —
search it, tap it — and takes you straight to the right calculator, or to an
interactive FAQ that *is* a calculator with an explanation.

**Technique:** Spatial UI / 3D screencasting — the app is never shown as a flat
screenshot. Its real, code-faithful UI components live as separate layers in
Z-depth space (layer peeling), viewed through a gently moving camera.
A claymorphic 3D cursor physically *hits* the UI (camera shake on impact).
Glassmorphism: frosted panels, light reflections sweeping across "glass".

---

## Scene 1 · Cold open — the problem (0.0 – 4.4 s) · LIGHT
Deep space with soft gradient. Floating, blurred glass shards drift.
Sequential glass-panel headlines: **"Percentages are easy."** beat
**"Finding the right calculator isn't."** A messy cloud of generic calculator
UI fragments (inputs, % signs) tumbles in depth, slightly chaotic.

## Scene 2 · Arrival (4.4 – 8.6 s) · LIGHT
The chaos snaps into order: the JustPercent mobile homepage assembles from
layers flying in from Z-depth — header/logo, H1, search box
(*"Search 'Tip'..."*), the **All | ⭐Favorites** filter, and the SolutionCards
in the app's real order (Coupon → Sale → Sales Tax → Tip → Commission →
Rent hike) land one by one. Original logo settles in the header.
Caption: **"JustPercent starts from your life — not from math."**

## Scene 3 · SolutionCard → calculator page (8.6 – 15.6 s) · LIGHT
The page scrolls down in 3D; the claymorphic cursor swoops in and hovers the
**"Facing a rent hike?"** card — the card lifts toward the camera. Cursor
SMACKS the card → **camera shake** → the homepage peels apart into layers;
the `/percentage-change-calculator/` page assembles. Inputs type themselves
with the card's own example values (2000 → 2200); the purple ANSWER row pops
**"is an INCREASE of 10%"**.
Caption: **"Tap what you need. Get the tool."**

## Scene 4 · Practical Use → pin → fill (15.6 – 22.0 s) · LIGHT
Camera tilts; the page scrolls (3D parallax) to **Practical Uses** below the
calculator. The mandatory app order, exactly like `practicalUsePinning.ts`:
**(a)** cursor hits the *Inflation Rate* practical use → camera shake, the row
gets its red pin; **(b)** the **"Selected Practical Use Example"** panel
unfolds ABOVE the calculator form (gray panel, pin, close ×, highlighted
values); the camera re-frames so the whole calculator is in shot;
**(c)** only then do glowing value chips fly into the inputs ($100 → $103)
and the answer recalculates live to **3%**.
Caption: **"Real-life examples fill it in for you."**

## Scene 5 · Theme flip (22.0 – 24.8 s) · LIGHT → DARK
The camera glides to the page bottom where the app's real fixed ThemeToggle
lives. Cursor click → the entire page rotates around the Y axis like a card;
mid-flip the palette crosses to dark mode (moon→sun icon). A specular sweep
crosses the glass during the flip.
Caption: **"Day or night."**

## Scene 6 · Search → scroll → pinned calculator (24.9 – 33.1 s) · DARK
Homepage, dark mode. Cursor clicks the Search box; types **"tip"**
letter-by-letter. The dropdown springs open with the app's real section
order — **Practical Uses → Related FAQs → Suggested solutions** — showing the
real *Restaurant Tip* practical use ("A 15% [X] tip on a $60 [Y] Italian
chain dinner bill…"). Non-matching cards fall away into depth. Cursor hits
the practical use → the dropdown closes and the page scrolls until the
**whole Basic Percentage calculator** stands in frame; only after the scroll
fully settles does the pinned **"Selected Practical Use Example"** appear
above the form, and the values pour in: 15 % of $60 → **9**.
Caption: **"Search your situation — it scrolls you to the answer."**

## Scene 7 · FAQ = calculator with an explanation (33.1 – 38.0 s) · DARK
The FAQs hub (`/faqs/`) floats in: title, the hub's search + favorites
controls, the *Shopping and Promotions* category, stacked FAQ cards. Cursor
hits **Tip Calculation** → camera shake → `/faqs/tip-calculation-calculator/`
unfolds: the question's numbers are live inputs. Cursor presses and DRAGS the
tip % from 10 → 18 — the answer ($15 → $27) and the whole explanation
(formula included) update in real time.
Caption: **"64 real-life FAQs. Each one is a live calculator."**

## Scene 8 · Outro (38.0 – 40.0 s) · DARK
The page recedes gracefully into Z-depth. Original logo + wordmark center,
**justpercent.com**, tagline: **"From your problem to your answer.
Instantly."** The bottom brand-bar hands over to the end card.

---

### Motion language
- Camera: slow dolly + 2–4° parallax sway at all times (never static).
- Impacts: ~0.55 s seeded-noise shake (amplitude 6–16 px) + punch-zoom.
- Layer peeling: translateZ stagger (−520→0 px), outBack, 45–120 ms/layer.
- Pin panel: max-height + scale(0.1→1) unfold from top center — the app's own
  500 ms ease-out presentation animation.
- Glass: the app's own liquid-glass values; 45° specular sweep every scene.
- Cursor: claymorphic blob-arrow, squash & stretch on impact, contact shadow.

### Truthfulness constraints
- Only routes that exist in `src/pages/` are shown: `/`,
  `/percentage-change-calculator/`, `/faqs/`, `/faqs/tip-calculation-calculator/`.
- All UI copy is the app's real en-US copy (solution-notes.ts,
  practical-uses/*.ts, faqStandaloneData.ts, home-page.ts, page-strings.ts,
  ui-components.ts); the logo is the original asset.
- Components are rebuilt 1:1 from the app's own markup/CSS (no screenshots),
  including the post-click "Selected Practical Use Example" pinning state.
