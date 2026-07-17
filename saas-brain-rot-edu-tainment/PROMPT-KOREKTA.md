# PROMPT: Korekta treści filmu `saas-brain-rot-edu-tainment`

Dwa cele: (A) podmiany treści wg macierzy koordynacji (`../AUDYT-KOORDYNACJA-TRESCI.md`),
(B) **naprawa wizualizacji/zawartości inputów** (główne zgłoszenie użytkownika).

## Zasady bezwzględne
- NIE zmieniaj stylu (brain-rot, FPV, punche, podpisy cap-*), kolejności scen S1–S8 ani momentu flipu LIGHT→DARK (18.6–19.04 s, `src/timeline.js:298–302`).
- Podmieniaj wyłącznie treść w ramach typu elementu. Snapshoty w `src/snapshots/*.html` — edytuj/regeneruj identyczną techniką z żywej aplikacji `/Users/michael/startups/percentage-calculator/handy-percent`.
- Teksty 1:1 z `src/data/locales/en-US/…`; formuły z `src/utils/calculations.ts`.
- NIE commituj — o commicie decyduje użytkownik.

## A. Podmiany treści

### 1. S2/S3 — pin na Basic Percentage (light, 10.05–17.6 s; `src/snapshots/home-light-search.html`, `home-light-pinned.html`)
PU „Restaurant Tip" (15/60→9, dublet ze wszystkimi filmami) → **„Tax Calculation"**:
8% [X] NYC sales tax on a $250 [Y] purchase → **$20** [Z].
- S2 dropdown: fraza wyszukiwania → **„tax"**; wiersze dropdownu dopasowane (suggested solution:
  karta „In-store shopping?… / Calculate Total Price"; FAQ row: „Income Tax Percentage" lub „VAT Calculation").
- S3: pinned presentation + wartości kalkulatora **8 / 250 → 20**; punch na wynik „is 20".
- Podpis `cap-6` „**$60** dinner. 15% tip → **$9**" → „**$250** haul. 8% tax → **$20**" (ten sam styl brain-rot).

### 2. S5/S6 — pin na Value Decrease (dark, 19.04–26.5 s; `calc-decreased-dark.html`, `calc-decreased-dark-pinned.html`, ring `src/timeline.js:56,66,308`)
PU „Sale Discount" (300/30→210, dublet z 5 filmami) → **„Budget Cut"**:
$10,000 [Original] party budget −25% [Decrease] → **$7,500** [New].
Ring `#ring-pu` przenieś na właściwy indeks pozycji „Budget Cut" na liście (zweryfikuj indeks w DOM snapshotu).
Tekst pinned presentation w snapshocie = dokładny string z `practical-uses/decreased-value.ts`.

### 3. S7/S8 — FAQ (dark) — BEZ ZMIAN
Hub + **Salary Raise FAQ** (4000, 5→8% → 4320) zostaje — unikalny w całym zestawie filmów.

## B. NAPRAWA INPUTÓW (S6; `src/timeline.js:138` FILL, `:167–175` applyDynamic)

Zdiagnozowane problemy:
1. Przez ~1.85 s (wejście S6 ~22.05 s → start FILL 23.9 s) inputy pokazują **240/15/204**,
   sprzeczne z przypiętym przykładem — widz widzi dwie różne kalkulacje naraz.
2. Wynik jest **niemonotoniczny**: original wypełnia się pierwszy, procent drugi, więc wynik
   skacze 204→**255**→210 (cena po rabacie chwilowo ROŚNIE). Mylące.
3. Wartości startowe 240/15 są arbitralne — nie odpowiadają niczemu w aplikacji.

Wymagana naprawa (dla nowych wartości Budget Cut):
- **Usuń stan startowy 240/15.** Od pierwszej klatki S6 inputy mają być spójne z przypiętym
  przykładem: albo puste i napełniane, albo od razu docelowe.
- Napełnianie **monotoniczne**: original i percentage RÓWNOLEGLE (wspólny easing do 10000 i 25),
  a wynik liczony z obu bieżących wartości tak, by nigdy nie przekroczył 7,500 od góry po złej
  stronie — najprościej: wynik pojawia się/liczy dopiero, gdy oba pola osiągną wartości końcowe,
  z krótkim count-upem do **7,500**.
- Zero okresu niespójności między pinned presentation a polami.
- **Szerokości autosize:** inputy mają zapieczone inline `width` z momentu przechwycenia.
  „10,000" i „7,500" mają więcej znaków niż zapieczone 240/300/204 — **zaktualizuj inline width**
  (lub przelicz autosize w timeline.js przy każdej zmianie `.value`), inaczej tekst się utnie.
  Sprawdź to samo w S3 (250 vs zapieczone 60) i S8.
- Weryfikacja quirku: `decimal-result` w S8 pokazuje „0,05"/„0,08" (przecinek). Locale filmu
  to en-US — sprawdź na https://justpercent.com, czy apka rzeczywiście renderuje przecinek;
  jeśli nie, popraw na „0.05"/„0.08".

## Weryfikacja (obowiązkowa)
1. Przelicz: 8%×250=20; 10 000−25%=7 500; 4000+8%=4320.
2. Scrub S6 klatka po klatce 21.8–26.5 s: brak stanu niespójnego, wynik monotoniczny, nic nie jest ucięte.
3. Diff stringów PU z locale apki; styl podpisów cap-* niezmieniony.
4. Flip dark 18.6–19.04 i kolejność S1–S8 bez zmian.
5. Nie commituj; przedstaw diff użytkownikowi.
