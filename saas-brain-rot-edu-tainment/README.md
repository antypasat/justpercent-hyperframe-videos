# justpercent.com — "SaaS Brain Rot" teaser (HyperFrames)

Edu-tainment / brain-rot style product teaser for **https://justpercent.com** —
FPV camera flights over the real UI, 200% zoom punches, tap rings, a 3D
light→dark flip mid-video, and big glass captions. **1080×1920 (9:16), 36 s,
30 fps, silent (autoplay-muted teaser). US English only.**

## Run the preview

```bash
cd hyperframes-video/saas-brain-rot-edu-tainment
npx hyperframes preview        # or: npm run dev
```

`index.html` is the root composition (single `main` composition, one master
GSAP timeline registered on `window.__timelines`). Duration comes from
`data-duration="36"`.

Do **not** render to MP4 — the deliverable of this project is the preview.

## Quick QA without the CLI

Open `index.html` directly in a browser:

- `index.html?t=14.7` — seek to any second (Arrow keys = ±1 frame, Shift = ±1 s, Space = play/pause)
- `index.html?selftest=1` — runs a forward/backward scrub determinism test and
  writes `SELFTEST OK deterministic` into the tab title.

Both hooks are inert under `hyperframes preview` (no `?t`/`?selftest` there).

## Story (timeline map)

| t (s) | beat |
|-------|------|
| 0.0–2.7 | Cold-open hooks (sequential glass headlines) |
| 2.7–6.4 | Phone flies in → real **home page (light)**, FPV scroll to SolutionCards |
| 6.4–8.3 | 200% zoom punch into the solution cards |
| 8.3–10.0 | Zoom to SearchBox, live typing `tip` (caret + real input) |
| 10.05–11.9 | Real search dropdown state (Practical Uses / FAQ / Solution hits), tap ring |
| 12.0–15.4 | Whip → home auto-scrolled to **Basic Percentage** with pinned "Restaurant Tip"; camera pulls back until the **whole calculator** is in frame (pinned example above the form) |
| 15.4–17.6 | Punch into the result: 15% of 60 **is 9** |
| 17.7–19.5 | Whip → `/decreased-value-calculator/` (light) → **3D flip to dark mode** |
| 19.9–21.8 | Scroll to Practical Uses below the calculator, tap ring on **Sale Discount** |
| 21.85–25.3 | (a) click → (b) example pinned **above** the calculator → (c) fields fill 240→300, 15→30, result recomputes live 204→**210** |
| 26.5–29.2 | Zoom-through → `/faqs/` hub (dark), FPV sweep over categories |
| 29.25–31.8 | `/faqs/salary-raise-calculator/` — raise 5→**8**%, answer updates live 4,200→**4,320** (all explanation spans update) |
| 31.9–36.0 | Endcard: logo, Just Percent, justpercent.com, tagline, chips |

## Fidelity: how the app UI got here

No screenshots. Each phone state is a **1:1 DOM capture of the live site**
(mobile viewport 432 px, forced `en-US` + `{"theme":…,"locale":"us"}` config,
cookie banner accepted, stabilization waits + 5 s hard margin per state):

- `capture/html/*.json` — raw captures: full `<body>` DOM + all CSSOM rules per state
- `build/prepare-snapshots.mjs` — flattens media queries at 432 px, scopes all
  selectors under `.jp-html`/`.jp-body`, rewrites fonts to local `@fontsource`
  woff2 files (`fonts/`) and images to `assets/images/` (copied from the app's
  own `public/`), repairs input values against capture-time meta
- `build/assemble.mjs` — inlines everything into `index.html`
- `npm run build` — full rebuild (prepare + assemble) after editing `src/`

Captured states: home (light: default / dropdown open / pinned+auto-scrolled),
`/decreased-value-calculator/` (light, dark, dark+pinned), `/faqs/` (dark),
`/faqs/salary-raise-calculator/` (dark, default + 8% variant).

All URLs shown in the browser bar are verified routes from
`handy-percent/src/pages/` in canonical trailing-slash form.

## Determinism

Every frame is a pure function of `t`: one paused master timeline, no
`Math.random()`/`Date.now()`, all mutable text (URL path, typed query, input
values, live results, FAQ explanation spans) driven by a single `ease:none`
proxy tween whose `onUpdate` recomputes state from `t` — scrubbing backwards
leaves no stale state (see `?selftest=1`).

## Known app quirk (not a bug in the film)

The live site renders the decimal helper on FAQ pages with a comma
(`0,05` / `0,08`) even for genuine `en-US` visitors — the film mirrors the app.
Worth a look in the app itself if US formatting (`0.05`) is intended.
