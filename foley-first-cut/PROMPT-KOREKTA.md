# PROMPT: Korekta treści filmu `foley-first-cut`

Skoryguj TREŚĆ pokazywanych elementów UI w tym filmie zgodnie z macierzą koordynacji
(`../AUDYT-KOORDYNACJA-TRESCI.md`), bez zmiany stylu.

## Zasady bezwzględne
- NIE zmieniaj stylu filmu, animacji, typografii, kolorów, foley/SFX ani timingu scen.
- NIE zmieniaj kolejności scen ani typów elementów; moment przełączenia LIGHT→DARK zostaje na 20.44 s (`js/scenes.js:496`).
- Podmieniaj wyłącznie treść w ramach tego samego typu (Solution Card→inna karta, Practical Use→inny PU, FAQ→inny FAQ) wraz z wynikającą z tego zmianą kalkulatora i wartości.
- Wszystkie teksty i wartości 1:1 z aplikacji `/Users/michael/startups/percentage-calculator/handy-percent`:
  karty: `src/data/locales/en-US/solution-notes.ts` · PU: `src/data/locales/en-US/practical-uses/*.ts` ·
  FAQ: `src/components/faqs/**` · formuły: `src/utils/calculations.ts`. Kopiuj dokładne stringi z tych plików, nie parafrazuj.
- NIE commituj — na końcu pokaż podsumowanie zmian; o commicie decyduje użytkownik.

## Powód zmian (audyt)
Film dubluje motyw TIP 5× wewnętrznie oraz powiela z innymi filmami: kartę „rent hike" i PU
„Inflation Rate" (dublet ze spatial-ui-3d), PU „Restaurant Tip" i stronę FAQ „Tip Calculation"
(dublet z 4–7 filmami).

## Podmiany

### 1. Solution Card klikana (scena Home, light; `index.html:132`)
Karta #6 „Facing a rent hike?… / See % Change" → karta **„Need the pre-tax price? Instantly
calculate the original price before sales tax was added." / CTA „Find Pre-Tax Price"**
(id 11, kolor green, obrazek „Without Sales Tax" webp). Pozostałe 5 kart bez zmian.

### 2. Scena kalkulatora po kliknięciu (light, 9.3–13 s; `js/scenes.js:515–527`)
Percentage Change (2000→2200=10%) → **Original Before Increase Calculator**
(„What was the Original value before an Increase % resulted in the New value?"):
- pola: „Sales tax rate (%)" i „Price with sales tax"; fioletowe pole odpowiedzi (pierwsze): „Net Price"
- typowanie: **8**, potem **108** → wynik **100** (108/1.08=100)
- równanie KaTeX i układ karty odwzoruj z aplikacji (komponent kalkulatora `original-before-increase`).

### 3. Practical Use pinowany (light, 13.3–18.6 s; `index.html:259, 296–316`)
„Inflation Rate" → **„Price Before Hike"** (lista PU kalkulatora original-before-increase):
? +5% = $126 → **$120**. Lista 3 pozycji: Price Before Hike (klikany/pinowany),
Investment Pre-Growth (+12% = $2,240 → $2,000), Salary Before Raise (+8% = $54,000 → $50,000).
Dokładne teksty z `practical-uses/original-before-increase.ts` (markery [X]/[Y]/[Z] jak w apce).

### 4. Scena search (dark, 21.4–27 s; `index.html:157, 200–205`, `js/scenes.js:561–572`)
Fraza „tip" → **„interest"**. Dropdown:
- Practical Use: **„Investment Interest"** (5% [X] APR na $1,000 [Y] → $50 [Z]) — KLIKANY
- Related FAQ (tylko wiersz): „Investment Profit — How do I calculate the original investment amount?"
- Suggested solution (wiersz): karta id 12 „Need a custom calculation? Explore all our percentage calculators for any scenario." / „Let's go" (pasuje do każdej frazy). Jeśli układ dropdownu na to nie pozwala bez zmiany stylu, zostaw sekcję pustą/usuń wiersz.
Po kliknięciu: Basic Percentage pinned **5 / 1000 → 50** (zamiast 15/60→9).

### 5. FAQ hub (dark, 27.75–31.1 s; `index.html:399–424`)
Trzy karty Shopping → trzy karty **Transportation and Travel Costs**:
- **„Car Depreciation — What's my car worth after depreciation?"** — KLIKANA
- „Fuel Costs", „Hotel Budget — How much of my trip budget goes to the hotel?"
Tytuły/podstawy skopiuj z `faqs/transportation-travel-costs/*` i `standalone-metadata.ts`.

### 6. Strona FAQ finałowa (dark, 31.1–35.3 s; `index.html:457, 488–489`, `js/scenes.js:575–584`)
Tip Calculation (drag 150→180) → **Car Depreciation FAQ**: odtwórz 1:1 treść i pola
z `faqs/transportation-travel-costs/CarDepreciationFAQ.astro` (pytanie, inputy, live wynik,
„Calculation Details"). Interakcja: drag na wartości auta analogiczny do dotychczasowego draga
rachunku — wynik i formuła aktualizują się spójnie. Wartości dobierz z komponentu (defaulty apki);
ZWERYFIKUJ formułę i przelicz każdy pokazywany krok.

### 7. Bez zmian
Cold open, flip motywu (20.44 s), endcard, logo (`assets/images/percentage.webp` — zgodne z apką).

## Weryfikacja (obowiązkowa)
1. Każdy pokazany wynik przelicz ręcznie (108/1.08=100; 126/1.05=120; 5%×1000=50; wartości Car Depreciation wg formuły komponentu).
2. Porównaj każdy string z plikiem źródłowym apki (diff słowo w słowo).
3. Odtwórz/wyrenderuj podgląd i przescrubuj sceny 2–8; sprawdź, że żadna animacja/timing/styl się nie zmieniły.
4. Sprawdź, że w całym filmie żaden temat nie występuje w więcej niż jednym typie elementu.
5. Nie commituj; przedstaw listę zmienionych plików i diff użytkownikowi.
