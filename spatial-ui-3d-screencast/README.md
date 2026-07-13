# JustPercent — Spatial UI & 3D Screencast (HyperFrames project)

A 40-second vertical (1080×1920, 30 fps) product video for **justpercent.com**,
built as a [HyperFrames](https://github.com/heygen-com/hyperframes)
composition. US English, mobile UI, light **and** dark mode in one film.

## Technique (in the folder name)

**Spatial UI & 3D screencasting** — no flat screenshots. The app's real UI
components (rebuilt pixel-faithfully from the app's own source in
`handy-percent/src`) float as layers in Z-depth:

- **Layer peeling** — screens assemble/disassemble from depth-staggered layers
- **Claymorphic 3D cursor** — squash-and-stretch clay pointer that physically
  hits the UI, with **camera shake** on every impact
- **Glassmorphism** — frosted panels (the app's own `liquid-glass.css`
  values), specular light sweeps across the "glass"

## Story

Other sites make you guess which calculator you need. JustPercent starts
from *your real-life situation*: SolutionCards on the homepage, a search box
that understands "tip", Practical Uses that — exactly like in the app —
first **pin** as a "Selected Practical Use Example" panel above the
calculator and *then* fill it in, and 64 FAQ pages that are each a live
calculator with an explanation.

Scene-by-scene: see [STORYBOARD.md](STORYBOARD.md).

## Layout

```
index.html               the HyperFrames composition (CLI-discoverable at root;
                         data-composition-id="justpercent", 1080×1920, 40 s)
lib/timeline.js          seekable, deterministic timeline engine
                         (GSAP-compatible interface: paused, duration(),
                         seek(), progress(); registered on window.__timelines)
js/scenes.js             all choreography (pure functions of t)
css/app.css              1:1 replicas of the app's components + tokens
css/cinema.css           stage, 3D camera, cursor, captions, chrome
assets/                  original app assets (logo, card images, fonts)
render/render.mjs        frame-accurate renderer (Playwright + FFmpeg) — unused
                         for the preview deliverable
```

## Preview

```bash
npx hyperframes preview   # then open http://localhost:3002/#project/spatial-ui-3d-screencast
```

You can also open `index.html?preview` directly in a browser — it plays once
on load and stays seekable via `window.__timelines.justpercent.seek(t)`.

## Determinism / stabilization

Every frame is a pure function of time `t`:

- The timeline is fully **reversible** — a master reset re-establishes every
  mutable bit of state on each seek, then all writes replay in chronological
  order, so scrubbing backward can never leave stale state behind.
- Layout is measured in **two passes** (page as loaded, and the post-pin
  layout with the "Selected Practical Use Example" panels expanded), so every
  cursor target, scroll position, and chip flight is computed, not eyeballed.
- The whole timeline is **rebuilt once `document.fonts.ready` resolves**, so
  measurements always use the app's real fonts — identical frames across page
  loads (verified byte-identical in QA).
- No `Math.random()` / `Date.now()` at seek time; ambient motion is seeded
  sines of `t`.

## Truthfulness

- Only URLs that exist in the app's `src/pages/` are shown, in canonical
  trailing-slash form.
- All copy is the app's real en-US locale copy: homepage cards in the app's
  real order and wording (`solution-notes.ts`), the real mobile search
  placeholder, the search dropdown's real section order (Practical Uses →
  Related FAQs → Suggested solutions), real Practical Uses and FAQ texts.
- The click-a-Practical-Use flow reproduces `practicalUsePinning.ts`:
  pin → presentation panel above the form → inputs fill → live recalc.
- The logo is the original app asset; fonts are the app's own @fontsource
  files.
