# PROMPT: Korekta treści filmu `gaussian-splat-morph`

Skoryguj TREŚĆ pokazywanych elementów UI zgodnie z macierzą koordynacji
(`../AUDYT-KOORDYNACJA-TRESCI.md`), bez zmiany stylu.

## Zasady bezwzględne
- NIE zmieniaj stylu (gaussian morph, spotlight, orby, kolorystyka fiolet→cyan), timingu scen b1–b7 (`hyperframes.json`) ani momentu flipu LIGHT→DARK (scena b5).
- Podmieniaj wyłącznie treść w ramach typu elementu (karta→karta, PU→PU, FAQ→FAQ) wraz z wynikającym z tego kalkulatorem/wartościami.
- Teksty i wartości 1:1 z aplikacji `/Users/michael/startups/percentage-calculator/handy-percent`:
  karty `src/data/locales/en-US/solution-notes.ts` · PU `…/practical-uses/*.ts` · FAQ `src/components/faqs/**` · formuły `src/utils/calculations.ts`.
- Ekrany w tym filmie to serializowane snapshoty DOM (`assets/screens/*.html`) ładowane do iframe'ów; nowe ekrany generuj tą samą metodą co istniejące (zob. `scripts/`, `capture/`) z żywej aplikacji, z zachowaniem identycznej techniki.
- NIE commituj — o commicie decyduje użytkownik.

## Powód zmian (audyt)
Dublety międzyfilmowe: karta „Apply My Coupon" (4 filmy), PU „Sale Discount 300/30→210"
(5 filmów), PU „Restaurant Tip 15/60→9" (7 filmów). Wewnątrz filmu: kupon (b2) + Sale
Discount (b3) to podwójny motyw rabatu; w b4 tip występuje 4× jednocześnie.
FAQ **Bill Splitting (b6) zostaje** — po korekcie będzie unikalny w całym zestawie.

## Podmiany

### 1. Solution Card (scena b2, light; `compositions/b2-home-flythrough.html:77–84, 163`)
Spotlight+tap przenieś z karty coupon na kartę **„In-store shopping? Calculate the total price
with Sales Tax." / CTA „Calculate Total Price"** (id 1, kolor yellow, tax-calc.webp).
Karta jest w siatce home (`assets/screens/home-light.html`) — zmień tylko cel spotlightu/tapu.

### 2. Scena kalkulatora (b3, light; obecnie `assets/screens/calc-decreased-light.html`, `compositions/b3-*.html`)
Value Decrease → **Value Increase Calculator** (`/increased-value-calculator/`), nowy snapshot light:
- prefill z karty: „Price before tax" **100**, „Tax rate (%)" **8** → „Final Price" **108**
- klik PU **„Population Growth"**: 100,000 [Original] +3% [Increase] → **103,000** [New] —
  prezentacja „Selected Practical Use Example" nad formularzem + count-up wyniku (analogicznie
  do dotychczasowego 300/30→210). Lista PU zgodna z apką (`practical-uses/increased-value.ts`).

### 3. Scena search (b4, light; `compositions/b4-*.html`, `assets/screens/home-light-pinned.html`)
Fraza „tip" → **„discount"**. Dropdown:
- Suggested solutions: karta coupon i/lub karta „Shopping the clearance rack?…" (wiersze, nieklikane)
- Practical Use: **„Sale Discount"** wariant basic-percentage: 20% [X] off $80 [Y] → **$16** [Z] — KLIKANY
- Related FAQ (wiersz): „Product Discount — How much will I pay for a product after applying a percentage discount?"
Po kliknięciu: Basic Percentage pinned **20 / 80 → 16** (zamiast 15/60→9). Nowy snapshot pinned.

### 4. FAQ (b6, dark) — BEZ ZMIAN
Hub `/faqs/` → **Bill Splitting** (250→300; 60%/40% → 180/120) zostaje w całości.

### 5. Napisy (`compositions/chrome-overlay.html:13–20`)
Dostosuj minimalnie tylko te, które wymieniają konkretną frazę/temat:
„Or just type what happened: „tip"." → „…: „discount"." Pozostałe bez zmian. Zaktualizuj
adresy w pasku URL, jeśli wskazują na `/decreased-value-calculator/` (→ `/increased-value-calculator/`).

## Weryfikacja (obowiązkowa)
1. Przelicz: 100+8%=108; 100 000+3%=103 000; 20%×80=16; bill split 60/40×300=180/120.
2. Diff stringów z plikami locale apki (dokładne brzmienie PU z markerami [X]/[Y]/[Z]).
3. Nowe snapshoty: identyczna technika serializacji co istniejące ekrany; sprawdź w iframe, że fonty/kolory/motyw renderują się jak dotychczas.
4. Render/scrub b2–b4: styl, morphy i timingi niezmienione; flip dark w b5 bez zmian.
5. Nie commituj; przedstaw diff użytkownikowi.
