# Audyt i koordynacja treści filmów JustPercent (2026-07-17)

Zakres: foley-first-cut, gaussian-splat-morph, hyper-mixed-media, neuro-match-cut-loop,
saas-brain-rot-edu-tainment, spatial-ui-3d-screencast, spotlight-isolate.
Źródło prawdy: `handy-percent` (deploy https://justpercent.com, potwierdzone web-fetchem).

---

## 1. Wyniki audytu poprawności (obliczenia i UI)

**Obliczenia: wszystkie wyniki liczbowe we wszystkich 7 filmach są matematycznie poprawne** —
zweryfikowano każdą pokazywaną parę input→wynik (m.in. 2200/2000=+10%, 300−30%=210, 15%×60=9,
60%×300=180, 4000×1.08=4320, 150×18%=27, 100−20%=80, 200−18%=164). Zero błędów rachunkowych.

**UI: filmy wiernie odwzorowują aplikację** (teksty kart, PU, FAQ, struktura kalkulatora,
fioletowe pole odpowiedzi, „Selected Practical Use Example" z czerwoną pinezką). Wyjątki:

1. **spotlight-isolate — logo NIEZGODNE z aplikacją.** Intro/outro używa wektora CSS
   (kwadrat z conic-gradient + płaski znak „%"), podczas gdy aplikacja używa obrazka
   `/images/percentage.webp` (znak „%" ułożony z owoców). Gotowy dataURL leży nieużyty
   w `assets/logo-dataurl.json`. Paradoks: zrzuty scen tego samego filmu pokazują prawdziwe logo w nagłówku.
2. **saas-brain-rot — zawartość inputów S6 (Value Decrease, dark):** przez ~2 s inputy
   pokazują 240/15/204 sprzeczne z przypiętym przykładem ($300/30%/$210); wynik podczas
   napełniania jest niemonotoniczny (204→**255**→210 — cena po rabacie chwilowo ROŚNIE);
   wartości startowe 240/15 są arbitralne. Dodatkowo inputy mają zapieczone szerokości
   inline — dłuższe wartości zostaną ucięte.
3. **spatial-ui-3d — synchronizacja pinned Practical Use (scena 4):** rozwinięcie panelu
   (`presIn` 18.05–18.75 s) odbywa się gdy kamera jest jeszcze wykadrowana na listę PU
   (CALC2); panel wjeżdża w kadr dopiero po reframe (~19.25 s), więc animacja pojawienia
   jest niewidoczna w normalnym tempie. Scena 6 tego samego filmu robi to poprawnie
   (rozwinięcie PO zakończeniu scrolla) — wzorzec do skopiowania.
4. **saas-brain-rot — do weryfikacji:** `decimal-result` pokazuje „0,05"/„0,08" z przecinkiem;
   README twierdzi, że to quirk aplikacji, ale locale filmu to en-US (kropka). Sprawdzić z żywą apką.

---

## 2. Wyniki audytu duplikacji (stan PRZED korektą)

| Element | Filmy, w których występuje jako wyeksponowany |
|---|---|
| PU „Restaurant Tip" 15%/$60→$9 | **WSZYSTKIE 7** |
| PU „Sale Discount" $300/−30%→$210 | gaussian, hyper-mixed, neuro, saas-brain-rot, spotlight (5) |
| Solution Card „Apply My Coupon" (klik/spotlight) | gaussian, hyper-mixed, neuro, spotlight (4) |
| FAQ „Tip Calculation" (strona) | foley, hyper-mixed, spatial-ui, spotlight (4) |
| Solution Card „rent hike" (klik) | foley, spatial-ui (2) |
| PU „Inflation Rate" $100→$103 | foley, spatial-ui (2) |
| FAQ „Bill Splitting" | gaussian, neuro (2) |
| Fraza wyszukiwania „tip" | 6 z 7 filmów |

Duplikacje WEWNĄTRZ filmów: motyw tip do 7× w jednym filmie (hyper-mixed), tip 5× (foley,
spatial-ui), discount 3–5× (hyper-mixed, spotlight). Dokładne listy w promptach per film.

Katalog aplikacji do wykorzystania: **9 Solution Cards** (na home), **49 Practical Uses**
(8 kalkulatorów), **85 FAQ** (12 kategorii, hub pokazuje „Showing all 64 FAQs"), 8 kalkulatorów.

---

## 3. Macierz koordynacji (stan DOCELOWY)

Zasada: każdy wyeksponowany (klikany/pinowany/spotlightowany) element występuje w dokładnie
JEDNYM filmie. Ten sam temat może wrócić w innym filmie wyłącznie w innym typie elementu
(np. tip: PU w spotlight, FAQ w hyper-mixed). Kolejność scen i momenty dark/light — bez zmian.

| Film | Solution Card (klik) → kalkulator | PU pin (scena 1) | PU pin (scena search/dark) | FAQ finał |
|---|---|---|---|---|
| foley-first-cut | **Pre-Tax Price** → Original Before Increase (8%, 108→100) | Price Before Hike (+5%, 126→120) | Investment Interest (5% z $1000→$50), search „interest" | **Car Depreciation** |
| gaussian-splat-morph | **Sales Tax** → Value Increase (100, +8%→108) | Population Growth (100 000 +3%→103 000) | Sale Discount/basic (20% z $80→$16), search „discount" | **Bill Splitting** (bez zmian) |
| hyper-mixed-media | **Clearance Savings** → Basic (25% z $80→$20) | Daily Nutritional Value (40% z 2000→800) | Rent Increase ($1200 +7%→$1284), search „rent" | **Tip Calculation** (bez zmian) |
| neuro-match-cut-loop | **Exam Score** → Basic (60% z 50→30) | Grade Points (85% z 120→102) | Revenue Growth ($1M→$1.2M=20%), search „revenue" | **Bank Deposit Interest** |
| saas-brain-rot | (blok kart — bez zmian) | Tax Calculation (8% z $250→$20) | Budget Cut ($10 000 −25%→$7500) | **Salary Raise** (bez zmian) |
| spatial-ui-3d | **Rent hike** → % Change (bez zmian, 2000→2200) | Inflation Rate (bez zmian, 100→103) | Stock Price Drop ($45 −12%→$39.60), search „stock" | **Weight Loss Goal** |
| spotlight-isolate | **Coupon** → Value Decrease (bez zmian, 100 −20%→80) | Energy Savings ($200 −18%→$164) | Restaurant Tip (bez zmian, 15% z $60→$9), search „tip" | **Compound Interest** |

Po korekcie: 7 różnych Solution Cards, 14 różnych Practical Uses, 7 różnych FAQ, 7 różnych
fraz wyszukiwania; pokryte kalkulatory: basic, increased, decreased, percentage-change,
original-before-increase (nieużyte, do przyszłych filmów: original-value, part-to-whole,
original-before-decrease; nieużyte karty: tip, commission, raise).

Uwaga: w większości filmów podmieniane są DWA Practical Uses, bo każdy film ma dwa beaty
z pinowaniem i oba były zdublowane między filmami (Sale Discount + Restaurant Tip).
Jeśli wolisz ściśle „jedna podmiana na typ", priorytet ma beat z Restaurant Tip.

## 4. Prompty

W katalogu każdego filmu leży `PROMPT-KOREKTA.md` z pełnym promptem (co podmienić, dokładne
teksty/wartości, pliki+linie, poprawki specjalne, checklista weryfikacji). Zmian nie commitować —
decyzja należy do użytkownika.
