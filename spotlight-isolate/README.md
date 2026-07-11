# Just Percent — „Spotlight & Isolate" (HyperFrames, Technika 3)

Samodzielny film HTML/CSS/JS (~64,5 s, 1600×900, letterbox) prezentujący justpercent.com
(wersja **US**, dark mode, copy po amerykańsku). Jeden film łączy warianty techniki 3:
**3.1 Classic Spotlight · 3.3 Metric Highlight · 3.4 Sequential Spotlights ·
3.5 Vignette Focus · 3.6 Blur-the-Rest · 3.7 Click-Reveal**.

Otwórz `index.html` w przeglądarce — odtwarza się automatycznie w pętli.

## Sterowanie / QA

* Spacja / ⏸ — pauza, `R` / ↺ — od początku.
* `?rec` — ukrywa HUD (do nagrywania), `?t=<ms>` — seek master clocka,
  `?stop=<ms>` — automatyczna pauza w zadanym momencie.
* **Seek zawsze do granicy sceny** (`?t=<sceneStart>` + `?stop=`) — animacje CSS w scenie
  startują w chwili nadania `.on`.

## Sceny

| # | Czas | Wariant | Treść |
|---|------|---------|-------|
| s0 | 0:00–0:04.5 | intro | znak % + wordmark „Just Percent", tagline |
| s1 | 0:04.5–0:13 | 3.1 Classic Spotlight | homepage; overlay 0.6 + cutout (pad 16, r 12) na karcie **Apply My Coupon**, kamera 1.2, klik kursorem w CTA |
| s2 | 0:13–0:22 | 3.7 + 3.3 | `/decreased-value-calculator/` otwarty klikiem w SolutionCard — hint banner → karta kalkulatora → **Metric Highlight na wyniku $80** (pulsujący glow, kamera 1.3) |
| s3 | 0:22–0:31 | 3.7 Click-Reveal | Practical Uses pod kalkulatorem; klik w pin „Sale Discount" → crossfade do stanu pinned: autofill **300 / 30 → 210** + banner „Selected Practical Use Example" |
| s4 | 0:31–0:40 | 3.6 Blur-the-Rest | homepage; blur na wszystkim poza **Search boxem**; crossfade do otwartego dropdownu po wpisaniu „tip", glow na wierszu **Restaurant Tip**, klik |
| s5 | 0:40–0:49 | 3.4 Sequential Spotlights | homepage przewinięty do Basic Percentage Calculator (autofill z PU): cutout wędruje **15% → $60 → $9** (morph 0.6 s, hold 1 s), kamera panoramuje w skali 1.2 |
| s6 | 0:49–0:58 | 3.5 Vignette Focus | `/faqs/` (hub, 64 podstrony) z miękką winietą → `/faqs/tip-calculation-calculator/` — winieta + glow na żywym wyniku **15** |
| s7 | 0:58–1:04.5 | outro | brand + „Eight calculators. Sixty-four interactive FAQs." + justpercent.com |

## Użyte, zweryfikowane adresy URL

* `https://justpercent.com/` (homepage US)
* `https://justpercent.com/decreased-value-calculator/` (otwierana klikiem w SolutionCard)
* `https://justpercent.com/faqs/`
* `https://justpercent.com/faqs/tip-calculation-calculator/`

## Capture guard (zgodnie ze specyfikacją)

Każdy kadr źródłowy (`assets/us-*.png`, 1600×900, dark) zrobiony **wyłącznie po pełnej
stabilizacji**: network idle ≥ 500 ms, `document.fonts.ready`, zdekodowane obrazy, brak
aktywnych transitions/animations, zero layout shift ≥ 500–600 ms; kadry po kliknięciu —
dopiero po zakończeniu animacji i mutacji DOM. Nawigacje bezpośrednie z `?noredirect`,
izolowany kontekst przeglądarki, `jp:config:v1 = { theme:"dark", locale:"us" }`.

## Zasoby

* `assets/us-*.png` — kadry źródłowe z żywej strony (geometria elementów w `spotlight-isolate.json`).
* `assets/logo-dataurl.json` — oryginalne logo `/images/percentage.webp` jako dataURL
  (opcjonalne; intro/outro używa wektorowego znaku % w CSS, więc plik nie jest wymagany).
* Fonty: IBM Plex Sans, Space Grotesk, JetBrains Mono (Google Fonts CDN, z fallbackami).

## Nagranie do MP4

Film jest deterministyczny (master clock w JS) — `?rec` + dowolny screen recorder
albo Playwright + ffmpeg.
