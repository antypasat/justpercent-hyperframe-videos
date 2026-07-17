# PROMPT: Korekta filmu `spatial-ui-3d-screencast`

Trzy cele: (A) **naprawa synchronizacji pinned Practical Use** (główne zgłoszenie użytkownika),
(B) podmiany treści wg macierzy koordynacji (`../AUDYT-KOORDYNACJA-TRESCI.md`), (C) weryfikacja.

## Zasady bezwzględne
- NIE zmieniaj stylu (spatial 3D, kamera, DOF), kolejności scen 1–8 ani momentu flipu
  LIGHT→DARK (~23.55 s, `js/scenes.js:618`).
- Podmieniaj wyłącznie treść w ramach typu elementu. Teksty/wartości 1:1 z aplikacji
  `/Users/michael/startups/percentage-calculator/handy-percent` (`src/data/locales/en-US/…`, `src/utils/calculations.ts`).
- NIE commituj — o commicie decyduje użytkownik.

## A. NAPRAWA SYNCHRONIZACJI (Scena 4, `js/scenes.js:549–601`)

Diagnoza: po kliku PU „Inflation Rate" (17.95 s) panel „Selected Practical Use Example"
rozwija się `presIn(18.05, …, 0.7)` gdy kamera stoi jeszcze w **CALC2** (kadr na liście PU,
`scenes.js:167`) — panel jest NAD formularzem, poza górną krawędzią kadru. Reframe do **CALC3**
(`scenes.js:168`, 18.30–19.25) wprowadza panel do kadru dopiero PO zakończeniu animacji
rozwinięcia (18.75). Efekt: pojawienie się panelu jest niewidoczne w normalnym tempie.

Naprawa — zastosuj wzorzec „capture-after-scroll" ze Sceny 6 (tam `presIn(30.85)` startuje
po zakończeniu scrolla 29.5–30.7, `scenes.js:681–689`):
1. Kolejność beatów: klik (17.95) → krótki beat reakcji (highlight `pinned` 18.0) →
   **reframe do CALC3 NAJPIERW** (18.10–19.05) → **`presIn` dopiero od ~19.15** (0.7 s,
   w pełni w kadrze) → puls/tooltips → chipy.
2. Odwzoruj rzeczywistą sekwencję aplikacji: pin → smooth scroll (0.6 ms/px, clamp 80–450 ms)
   → prezentacja 500 ms ease-out (scale 0.1→1, transform-origin top center) → pulse-scale-down
   600 ms. Film ma oddawać, że apka najpierw scrolluje, potem rozwija panel.
3. Panel w pełni rozwinięty i widoczny przez min. ~1.5–2 s zanim ruszy wypełnianie chipów —
   przesuń start chipów (obecnie 19.30, `scenes.js:591–592`) na ~20.1–20.3 i dosuń kolejne
   beaty sceny 4; scena kończy się 22.0, w razie potrzeby skróć hold przed klikiem (16.9–17.95).
4. Weryfikacja klatka po klatce (scrub 17.8–22.0 s w normalnym i zwolnionym tempie): rozwinięcie
   panelu MUSI być w całości widoczne w kadrze.

## B. Podmiany treści

### 1. BEZ ZMIAN (ten film jest właścicielem tych elementów)
- Solution Card „Facing a rent hike?… / See % Change" (klik, sc. 3) + Percentage Change 2000→2200=10%.
- PU „Inflation Rate" 100→103=3% (sc. 4, po naprawie synchronizacji).

### 2. Scena search (dark, sc. 6; `index.html:164–173, 292–307`, `js/scenes.js:692–697`)
Fraza „tip" → **„stock"**. Dropdown:
- Practical Use: **„Stock Price Drop"**: $45 [Original] stock −12% [Decrease] → **$39.60** [New] — KLIKANY
- Related FAQ (wiersz): „Stock Price Decrease" (investments-interest-rates)
- Suggested solution (wiersz): karta id 12 „Need a custom calculation? Explore all our percentage
  calculators for any scenario." / „Let's go" (albo usuń wiersz, jeśli układ na to pozwala bez zmiany stylu).
Po kliknięciu: pin nad **Value Decrease Calculator** (dark) — **45 / 12 → 39.60**
(zamiast Basic 15/60→9). Pinned presentation `pres-basic` → odpowiednik dla decreased-value.

### 3. FAQ hub + strona finałowa (dark, sc. 7; `index.html:355–431`, `js/scenes.js:747–748`)
Trzy karty Shopping → trzy karty **Health & Diet**:
- **„Weight Loss Goal — Calculate Pounds to Lose from a Percentage Goal"** — KLIKANA
- „Calorie Calculation", „Recipe Scaling"
Strona FAQ: odtwórz 1:1 z `faqs/health-diet/WeightLossFAQ.astro` (zweryfikuj, który komponent
odpowiada tytułowi „Weight Loss Goal" w `standalone-metadata.ts`). Interakcja drag analogiczna
do 10→18%: np. przy wadze **180 lbs** drag procentu celu **10→15%** → wynik **18→27 lbs**
(kroki co 1% przeliczaj jak dotychczasowa tabela kroków; ZWERYFIKUJ pola/formułę z komponentu).

### 4. Bez zmian
Logo/branding (`assets/images/percentage.webp` — zgodne z apką), sceny 1–5, 8, flip motywu.

## Weryfikacja (obowiązkowa)
1. Przelicz: 10%; 3%; 45−12%=39.60; wszystkie kroki draga FAQ (180×pct/100).
2. Diff stringów z locale apki.
3. Scrub sceny 4 (17.8–22.0) — rozwinięcie panelu w kadrze; scrub sceny 6–7 po podmianach.
4. Styl, kamera, DOF, timing scen i flip — bez zmian.
5. Nie commituj; przedstaw diff użytkownikowi.
