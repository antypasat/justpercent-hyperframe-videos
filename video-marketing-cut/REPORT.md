# Raport montażowy — Just Percent, marketing cut v3

Krótki, uczciwy spot **31.7 s** (3 sceny + plansza CTA, z lektorem ElevenLabs v3),
zmontowany ze scen projektu `video-technique--cursor-journey`. Player: `index.html`
(offline, `file://`), konfiguracja: `film.js`. Architektura master-clock zachowana:
jeden globalny zegar, każda klatka jest czystą funkcją `t` (`window.__filmSeek(t)`
— deterministyczny seek; audio spięte z zegarem, korekta dryfu co klatkę).

## Zmiana narracji (v3) — najważniejsze

Poprzednie wersje sugerowały, że produkt **autouzupełnia Twoje liczby** ("your
numbers are already there", "Pre-filled: $100 + 8% = $108"). To był fałszywy
przekaz: kalkulatory pokazują wartości **przykładowe** (domyślne lub z ostatniego
obliczenia), a użytkownik sam wpisuje swoje dane. v3 opiera film na prawdziwej
wartości produktu — **wpisujesz własne liczby, wynik liczy się na żywo, bez
submitu** — i pokazuje karty/przykłady uczciwie: jako punkt startowy, który
zmieniasz na swoje.

## Sceny w finalnej kolejności

| # | Scena (id) | Czas globalny | Źródło | Rola |
| --- | --- | --- | --- | --- |
| S1 | `hook-faq` | 0.00–6.20 | 2.4 (FAQ) + asset hover | Hook: realne pytanie, policzone ($150, 10% → $15) — "worked out", nie "live" |
| S2 | `live-typing` | 6.20–24.80 | 2.3 (naprawione typowanie) | Rdzeń: kalkulator otwiera się z przykładem (240+15=276) → wpisujesz swoje (5000, 25) → 6 250 na żywo, bez submitu |
| S3 | `cta` | 24.80–31.70 | nowa plansza | CTA: logo + justpercent.com |

Przejścia: deterministyczny dip-to-black (±0.25 s wokół granicy).

## Uczciwość przekazu (mapa twierdzenie → dowód na ekranie)

| Twierdzenie w filmie | Co realnie widać | Uczciwe? |
| --- | --- | --- |
| "A 10% tip on a $150 bill? → $15, worked out." | Interaktywny FAQ z gotowym, policzonym przykładem | Tak — to policzony przykład, nie żywe wejście użytkownika |
| "It opens with an example — 240 + 15%." | Kalkulator w stanie domyślnym: 240 + 15% = 276 | Tak — to jawnie przykład domyślny |
| "Type your own — live on every keystroke." | Kursor wpisuje 5000, potem 25; wynik przelicza się na każdym znaku (5.75→57.5→575→5750, potem 6250) | Tak — realne wpisywanie własnych wartości |
| "No Enter. No submit. 6,250 — live." | Wynik zmienia się bez żadnego przycisku submit | Tak — kluczowa, prawdziwa cecha produktu |

## Sceny/twierdzenia usunięte jako wprowadzające w błąd

- **search → „gotowy kalkulator, już wypełniony"** (dawne S2): to były wartości
  przykładu practical use, nie liczby użytkownika. Wycięte.
- **kupon → „$100 − 20% = $80, Twoje liczby już są"** (dawne S3): wartości domyślne
  karty, nie dane użytkownika. Wycięte (razem z beatem Save/Copy — wymagał innego
  kalkulatora; można dodać z powrotem jako uczciwe „zapisz swój wynik").
- **sales tax → „Pre-filled: $100 + 8% = $108"** (dawne S4): j.w. Wycięte.

## Co usunięto / zmieniono względem źródła

1. **Meta-warstwa usunięta w całości**: nazwy technik, numeracja 2.1–2.7, przyciski
   wersji, HUD (pozycja kursora/kamery), `#vname`, chipy techniczne, badge
   "STEP 1/2/3" z 2.7. Zostały: UI, kursor, podpisy, watermark, plansza CTA.
2. **Usunięte sceny/fragmenty**: 2.5 w całości (hover Coupon/Tip duplikowały karty
   z S3 i hopu 1 z 2.4; sama scena najsłabsza marketingowo); 2.4 hopy 1–2 (duplikat
   $9 i karty Tip); 2.7 krok 3 (duplikat wyniku 6 250 z S5); powtórka "$100 − 20% = $80"
   z początku 2.6 (scena doklejona bezpośrednio po 2.2 jako kontynuacja).
3. **Naprawione zepsute klatki typowania (2.3)**: źródłowe stany `s-inc-type-50`
   i `s-inc-type-5000` pokazywały w polu "0" / "000" i wynik 0 (artefakt rigu
   przechwytywania — re-selekcja inputu). Zrekonstruowane pixel-perfect z glifów
   istniejących zrzutów: `s-inc-type-50-fixed.png` (pole "50", wynik "57.5"),
   `s-inc-type-5000-fixed.png` (pole "5000", wynik "5750"). Łańcuch jest teraz spójny:
   240 → 5/5.75 → 50/57.5 → 500/575 → 5000/5750 → 2%/5100 → 25%/6250.
4. **Naturalne typowanie**: znaki pojawiają się pojedynczo w rytmie 110–140 ms
   z jitterem (`times[]` w evencie `type`, swapy stanów zsynchronizowane 1:1);
   karetka pozycjonowana z **pomiarów realnej szerokości tekstu** na zrzutach
   (`caret.xs[]` — search: 508/512/521 px; pole 1: 577.5/583/587.5/592 px — tekst
   wyśrodkowany, karetka wędruje za ostatnim znakiem; pole 2: 828/833 px);
   klik w pole zawsze poprzedza start typowania (odstęp ≥ 0.25 s, bez nakładania).
5. **Lektor bez cięć**: take'i grane w całości — bez kompresji pauz i bez
   tempo-stretchu (to powodowało kliki i gubione sylaby w wersji v2). Obróbka =
   tylko łagodny trym ciszy na brzegach (−45 dB) + miękkie fade'y; gdzie mowa nie
   mieściła się w scenie, wydłużano FILM i rozsuwano okna, nie przycinano głosu.
   Miks `audio/voiceover.mp3` (31.7 s, −16 LUFS), audio spięte z master-clockiem.
6. **Nowości**: hover-stan wiersza FAQ, plansza CTA (logo + domena, animowana
   deterministycznie), pasek postępu, dip-to-black między scenami.

## Weryfikacja

`node qa-frames.mjs` renderuje stille kluczowych momentów do `qa/` (zaktualizowany
do 3-scenowej osi). Zweryfikowano w Chrome na żywej osi 31.7 s: karetka przylega do
ostatniego znaku podczas wpisywania 5000 i 25; naprawiony łańcuch 50→57.5 i
5000→5750 renderuje się bezszwowo; podpisy zgodne z tym, co na ekranie (przykład
240+15 pokazany, gdy pada "opens with an example"); audio bez dryfu (2.0 s głosu na
2.0 s zegara), mowa w oknach, przerwy ciche (RMS −inf w luce 24.3 s); plansza CTA
i brak elementów meta potwierdzone.
