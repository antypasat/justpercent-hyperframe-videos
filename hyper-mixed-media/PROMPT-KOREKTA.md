# PROMPT: Korekta treści filmu `hyper-mixed-media`

Skoryguj TREŚĆ pokazywanych elementów UI zgodnie z macierzą koordynacji
(`../AUDYT-KOORDYNACJA-TRESCI.md`), bez zmiany stylu.

## Zasady bezwzględne
- NIE zmieniaj stylu (scrapbook, washi tape, kutout-ręka, chipy intro), kolejności scen ani momentu flipu LIGHT→DARK (25.30 s, `js/scenes.js:279`).
- Podmieniaj wyłącznie treść w ramach typu elementu, wraz z wynikającym kalkulatorem/wartościami.
- Teksty i wartości 1:1 z aplikacji `/Users/michael/startups/percentage-calculator/handy-percent`:
  karty `src/data/locales/en-US/solution-notes.ts` · PU `…/practical-uses/*.ts` · FAQ `src/components/faqs/**` · formuły `src/utils/calculations.ts`.
- NIE commituj — o commicie decyduje użytkownik.

## Powód zmian (audyt)
Motyw TIP powtórzony 7× wewnątrz filmu; discount 5×. Dublety międzyfilmowe: karta coupon
(4 filmy), PU Sale Discount (5), PU Restaurant Tip (7). **Strona FAQ „Tip Calculation"
(finał) ZOSTAJE** — po korekcie ten film będzie jedynym z tip-FAQ, a tip zniknie z pozostałych
typów elementów w tym filmie.

## Podmiany

### 1. Solution Card klikana (scena Home light, 4–9.4 s; `index.html:127–186`, klik 8.5 s)
Coupon → **„Shopping the clearance rack? Find out exactly how much you save." / CTA
„See My Savings"** (id 4, kolor teal, sale.webp). Marker-koło i klik ręki przenieś na tę kartę.

### 2. Scena kalkulatora (light, 9.5–17.8 s; `index.html:273, 300–320`, `js/scenes.js:462–511`)
Value Decrease → **Basic Percentage Calculator** prefilled z karty:
- „Discount %" **25**, „Original price" **80** → „Amount Saved" **20** (live count-up jak dotychczas 100/20→80)
- klik/pin PU **„Daily Nutritional Value"**: 40% [X] of 2,000 [Y] calories → **800** [Z] —
  prezentacja „Selected Practical Use Example" nad formularzem (13.95 s beat bez zmian).
- Lista 3 PU (basic): Daily Nutritional Value (klikany), Investment Interest (5% z $1,000 → $50),
  Tax Calculation (8% z $250 → $20). Teksty z `practical-uses/basic-percentage.ts`.

### 3. Scena search (18.3–25.3 s; `index.html:97–104, 209`, `js/scenes.js:549–550`)
Fraza „tip" → **„rent"**. Dropdown:
- Suggested solution (wiersz): karta „Facing a rent hike? Calculate the exact percentage increase." / „See % Change"
- Practical Use: **„Rent Increase"**: $1,200 [Original] +7% [Increase] → **$1,284** [New] — KLIKANY
- Related FAQ (wiersz): „Rent Increase" (personal-home-finances)
Po kliknięciu: pin nad **Value Increase Calculator** (zamiast Basic) — **1200 / 7 → 1284**.

### 4. FAQ hub + strona finałowa (dark, 26–32 s) — BEZ ZMIAN
Hub: Tip Calculation (klik) + Product Discount + Coupon Discount; strona
`/faqs/tip-calculation-calculator/` z dragiem 150→220 → 15→22. Zostaje w całości.

### 5. Chipy intro („20% OFF / +8% TAX / 18% TIP") i napisy
Chipy to element stylu — zostają. Napisy (`index.html:484–489`): zmień tylko
„Or search your situation…" jeśli wymienia „tip"; reszta bez zmian.

## Weryfikacja (obowiązkowa)
1. Przelicz: 25%×80=20; 40%×2000=800; 1200+7%=1284; tip FAQ 10%×220=22.
2. Diff stringów z locale apki (markery [X]/[Y]/[Z], etykiety pól „Amount Saved" itd. z fieldMappings karty id 4).
3. Render/scrub: styl scrapbook, ręka, timingi i flip 25.30 s niezmienione.
4. Sprawdź brak duplikacji tematu wewnątrz filmu (savings/nutrition/rent/tip — każdy raz).
5. Nie commituj; przedstaw diff użytkownikowi.
