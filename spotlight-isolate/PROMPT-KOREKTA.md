# PROMPT: Korekta filmu `spotlight-isolate`

Trzy cele: (A) **poprawa logo do zgodnego z aplikacją** (główne zgłoszenie użytkownika),
(B) podmiany treści wg macierzy koordynacji (`../AUDYT-KOORDYNACJA-TRESCI.md`), (C) weryfikacja.

## Zasady bezwzględne
- NIE zmieniaj stylu (spotlight/blur/vignette, letterbox 1600×900), kolejności scen s0–s7 ani
  motywu (cały film DARK — bez zmian).
- Podmieniaj wyłącznie treść w ramach typu elementu. Film składa się ze statycznych zrzutów
  żywej strony (`assets/us-*.png`) — nowe zrzuty wykonaj z https://justpercent.com (lub lokalnego
  builda `/Users/michael/startups/percentage-calculator/handy-percent`) w dark mode, tą samą
  rozdzielczością/kadrem co istniejące, i zaktualizuj geometrię w `spotlight-isolate.json`.
- NIE commituj — o commicie decyduje użytkownik.

## A. LOGO (s0 intro i s7 outro; `index.html:79–84, 256, 356`)

Diagnoza: intro/outro używa wektora CSS — `.pctbadge` 104×104 px z
`conic-gradient(from 210deg, #f59e0b, #ec4899, #8b5cf6, #3b82f6, #f59e0b)` i płaskim znakiem
„%" (Space Grotesk 700). To NIE jest logo aplikacji. Aplikacja używa obrazka
`/images/percentage.webp` — znak „%" ułożony z kolorowych owoców (Navigation.astro:305–314).
W tym samym filmie zrzuty scen pokazują w nagłówku prawdziwe owocowe logo — niespójność.

Naprawa:
1. Zamień `<div class="pctbadge"><span>%</span></div>` (s0 `index.html:256`, s7 `index.html:356`)
   na `<img>` z prawdziwym logo. Gotowy dataURL jest w **`assets/logo-dataurl.json`**
   (oryginalny percentage.webp jako base64) — wstaw jako `src`.
2. Zachowaj dotychczasowy rozmiar (~104 px wysokości), pozycję i timing animacji wejścia.
   Conic-gradient i płaski „%" usuń; subtelny glow/box-shadow może zostać jako poświata pod obrazkiem.
3. Wordmark „Just Percent" (IBM Plex Sans, „Percent" bold) — bez zmian; taglines bez zmian.

## B. Podmiany treści

### 1. BEZ ZMIAN (ten film jest właścicielem tych elementów)
- s1: spotlight karty **Coupon / „Apply My Coupon"** (jedyny film z tą kartą po korekcie).
- s2: Value Decrease **$100 −20% → $80**.
- s4+s5: search „tip" → **Restaurant Tip** 15% × $60 → **$9** (jedyny film z tym PU po korekcie).

### 2. s3 — Practical Use (22–31 s; zrzuty `us-decreased-pu-list.png`, `us-decreased-pu-applied.png`; caption `index.html:301`; geometria `spotlight-isolate.json:45–59`)
„Sale Discount" ($300/30%→$210; dublet z 5 filmami + trzeci motyw rabatu w tym filmie po s1–s2)
→ **„Energy Savings"**: $200 [Original] summer AC bill −18% [Decrease] → **$164** [New].
- Nowe 2 zrzuty: `/decreased-value-calculator/` dark — (a) lista PU z pozycją Energy Savings
  przed kliknięciem, (b) stan pinned: baner „Selected Practical Use Example" + pola **200 / 18 → 164**.
- Zaktualizuj geometrię spotlightu (pozycja wiersza PU, pin, baner) w json i caption
  (analogiczny do obecnego, ten sam styl; wartości 200/18%/164).

### 3. s6 — FAQ (49–58 s; zrzut `us-faq-tip.png`; caption `index.html:348–349`; geometria json:81–93)
„Tip Calculation" (tip byłby 3× w tym filmie; strona tip-FAQ zostaje w hyper-mixed-media)
→ **„Compound Interest — How much will my savings grow over time?"** (personal-home-finances).
- Nowy zrzut strony `/faqs/compound-interest…/` (dark) z wartościami domyślnymi komponentu
  `CompoundInterestFAQ.astro`; spotlight na live wynik.
- Zrzut huba `us-faqs-hub.png` może zostać (pokazuje cały hub). Caption „64 interactive FAQ
  guides" i „the answer updates live" — zostają; jeśli caption wymienia tip, dostosuj.

### 4. Bez zmian
s0/s7 poza logo, s1, s2, s4, s5, tekst outro („Eight calculators. Sixty-four interactive FAQs. /
Exact math, zero fuss.").

## Weryfikacja (obowiązkowa)
1. Przelicz: 100−20%=80; 200−18%=164; 15%×60=9; wartości Compound Interest wg formuły komponentu.
2. Nowe zrzuty: identyczna rozdzielczość, kadr, dark mode i nagłówek z prawdziwym logo jak istniejące us-*.png.
3. Geometrie spotlightów w `spotlight-isolate.json` trafiają dokładnie w elementy na nowych zrzutach — scrub s3 i s6.
4. Logo w s0/s7 = owocowy „%" z aplikacji; animacje wejścia bez zmian.
5. Nie commituj; przedstaw diff użytkownikowi.
