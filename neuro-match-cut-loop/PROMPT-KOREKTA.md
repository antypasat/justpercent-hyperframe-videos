# PROMPT: Korekta treści filmu `neuro-match-cut-loop`

Skoryguj TREŚĆ pokazywanych elementów UI zgodnie z macierzą koordynacji
(`../AUDYT-KOORDYNACJA-TRESCI.md`), bez zmiany stylu.

## Zasady bezwzględne
- NIE zmieniaj stylu (match-cut loop, ripple'y, whoosh), timeline'u `B`/`render(t)` w `index.html` ani momentu flipu LIGHT→DARK (darkMix 16.30–17.10 s) i powrotu do light w pętli (35.05–35.90).
- Podmieniaj wyłącznie treść w ramach typu elementu, wraz z wynikającym kalkulatorem/wartościami.
- Ekrany to snapshoty DOM w `capture/*.html` — nowe generuj identyczną techniką z żywej aplikacji `/Users/michael/startups/percentage-calculator/handy-percent` (teksty: `src/data/locales/en-US/…`, formuły: `src/utils/calculations.ts`).
- NIE commituj — o commicie decyduje użytkownik.

## Powód zmian (audyt)
Dublety międzyfilmowe: karta coupon (4 filmy), PU Sale Discount (5), PU Restaurant Tip (7),
FAQ Bill Splitting (dublet z gaussian-splat-morph, który go zatrzymuje). Wewnątrz filmu:
coupon + Sale Discount = podwójny motyw rabatu.

## Podmiany

### 1. Solution Card bohaterka (scena home light, 3.1–8.25 s; ctaFocus `index.html:296,302`, podpis c4 `index.html:195`)
Coupon → **„Finals coming up? Find the minimum score you need to pass." / CTA „Calculate My
Score"** (id 6, kolor slate, exam.webp). Kamera/ripple `rip1` celują w tę kartę.
Podpis c4 „Have a coupon? **One tap.**" → „Exam coming up? **One tap.**" (ten sam styl/markup).

### 2. Scena kalkulatora (light, 8.25–15.2 s; `index.html:506–515`, sceny `#scCalcDef`/`#flipScene`)
Decreased Value (300/30→210) → **Basic Percentage** prefilled z karty:
- typowanie: „Passing threshold (%)" **60** (`typeOrig`), „Total questions" **50** (`typePct`) → „Minimum Correct" count-up do **30** (`count1`)
- PU tap `rip2` + `pinSwap`: **„Grade Points"**: 85% [X] of 120 [Y] points → **102** [Z] — pin nad kalkulatorem.
- Podpis c5 „**$300** parka − **30%** → **$210**" → „**85%** of **120** points → **102**" (ten sam styl).
- Nowe snapshoty: strona `/basic-percentage-calculator/` light, default + pinned (Grade Points).

### 3. Scena search (dark, 17.45–24.45 s; tap `rip4` `index.html:311–312`, `#scTargetD`, `index.html:517–526`)
Fraza „tip" → **„revenue"**. Dropdown: PU **„Revenue Growth"**: $1,000,000 [Original] →
$1,200,000 [New] = **20%** [Change%] — KLIKANY → pin nad **Percentage Change Calculator** (dark).
Podpis c8 „A **15%** tip on **$60** → **$9**" → „**$1M** → **$1.2M** revenue = **+20%**" (ten sam styl).
Nowe snapshoty dark: home-search + strona percentage-change pinned.

### 4. FAQ (dark, 24.45 s → koniec; `#scFaqHub`, `#scFaqBill`, `index.html:528–534`)
Hub bez zmian strukturalnych. Klikana karta i strona finałowa: Bill Splitting →
**„Bank Deposit Interest — How much interest will I earn on my deposit in a year?"**
(investments-interest-rates). Odtwórz 1:1 treść z `faqs/investments-interest-rates/BankDepositInterestFAQ.astro`.
Interakcja: rolka liczbowa analogiczna do bill 250→300 — np. kwota depozytu **5,000 → 6,000**
przy stopie z defaultów komponentu; wynik odsetek przelicza się live (przy 4%: 200 → 240 —
ZWERYFIKUJ stopę i formułę z komponentu i dobierz wartości tak, by rolka była czytelna).
Zaktualizuj selektory pól (`bill-amount`/`my-result` → pola FAQ depozytowego).

### 5. Bez zmian
Endcard, logo `assets/logo-percentage.webp`, brand bar, pętla powrotu do light.

## Weryfikacja (obowiązkowa)
1. Przelicz: 60%×50=30; 85%×120=102; (1.2M−1M)/1M=20%; odsetki wg formuły komponentu FAQ.
2. Diff stringów z locale apki; etykiety pól karty id 6 z jej fieldMappings.
3. Snapshoty: identyczna technika co istniejące `capture/*.html`; sprawdź fonty/motyw w rendererze.
4. Render/scrub pełnej pętli: match-cuty, ripple, whoosh i darkMix bez zmian.
5. Nie commituj; przedstaw diff użytkownikowi.
