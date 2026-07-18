# Just Percent — Technika 9: DoF Fly-Through (Hyperframes)

Kinowy przelot kamery nad przechylonym UI justpercent.com (wersja US) z prawdziwą
głębią ostrości: pasek strony pod kamerą jest ostry, reszta rozmyta gaussianem
proporcjonalnie do odległości od płaszczyzny ostrości.

**Otwórz `dof-fly-through.html` w przeglądarce.** Przyciski 9.1–9.7 przełączają
wersje, `▶ Play all` odtwarza wszystkie po kolei. Spacja — pauza, `R` — od nowa.
Animacja jest deterministyczna (master clock w JS + seek API `window.__dofSeek`).

## Wersje

| # | Wersja | Ujęcie | Źródło (US) |
|---|--------|--------|-------------|
| 9.1 | Classic Cinematic Fly | tilt 75°, lot dół→góra 4 s, focus pod kamerą | Home (pełna strona) |
| 9.2 | Post-Click Data Fly-Over | tilt 72°, 4.5 s, focus rack po kartach danych | Home → SolutionCard „Apply My Coupon" → `/decreased-value-calculator/` ($100 − 20% = $80) |
| 9.3 | Slow Focus Rack | tilt 78°, 5 s, 4 regiony po 0.8 s | `/faqs/bill-splitting-calculator/` (pytanie → inputy 60/40/$250 → Answer $150/$100 → formuła) |
| 9.4 | Fast Trailer Sweep | tilt 70°, 2.2 s, motion blur, focus snap na wynik | `/increased-value-calculator/` po kliku Practical Use „Budget Boost" ($5,000 + 25% = $6,250) |
| 9.5 | Bokeh Ambient Drift | tilt 80°, 6 s linear, bokeh + bloom | Home + Search „tip" (dropdown: Practical Uses / FAQs / kalkulatory) |
| 9.6 | Focus Handoff Chain | tilt 74°, 5 s, S-curve, focus A→B→C | Home Solution Cards: Coupon → Tip → Commission |
| 9.7 | Vertical Timeline Fly | tilt 76°, 5.5 s, środkowy wiersz ostry | `/faqs/` (długa lista pytań, 13 044 px) |

## Pliki

- `dof-fly-through.html` — samodzielny player (HTML/CSS/JS, bez zależności).
- `configs.js` — źródło prawdy 7 configów; `configs/*.json` — eksport
  (`node export-configs.mjs`).
- `capture.mjs` — zrzuty z żywej strony z pełnym **capture guardem**
  (network idle ≥ 500 ms, `document.fonts.ready`, obrazy zdekodowane, brak
  aktywnych animacji, CLS quiet ≥ 500 ms; nigdy w trakcie tranzycji).
  Zapisuje też `assets/geometry.json` (bounding rects → realne cele focusa).
- `qa-frames.mjs` — stopklatki kontrolne do `qa/` przez deterministyczny seek.
- `assets/` — ustabilizowane zrzuty @2x (viewport 1600×900, en-US, `?noredirect`).
- `fonts/` — oryginalne fonty aplikacji (IBM Plex Sans, Space Grotesk, JetBrains Mono).

## Jak działa DoF

Zrzut strony pocięty na paski po 80 px (nakładka 16 px + maska gradientowa —
brak szwów). Co klatkę: `blur = maxBlur · (|y_paska − y_focus| / falloff)²` +
lekkie przygaszenie. Kamera i focus to niezależne ścieżki keyframe'ów
(rack focus). Motion blur (9.4) liczony analitycznie z prędkości kamery
(seek-safe), bokeh (9.5) z seedowanego PRNG — pełna powtarzalność każdej klatki.

## Nagranie MP4 (opcjonalnie)

Film jest deterministyczny — dowolny screen recorder albo Playwright + ffmpeg
po `window.__dofSeek(wersja, t)` klatka po klatce.
