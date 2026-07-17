# PROMPT: QA i korekta istniejącego filmu HyperFrames (JustPercent)

Film w tym katalogu to kompozycja HyperFrames: HTML + oś czasu będąca czystą funkcją
czasu (`seek(t)` w pełni odtwarza stan DOM dla dowolnego t). Twoim zadaniem jest
znaleźć i naprawić typowe wady tej klasy filmów. NIE zmieniaj stylu, kolejności scen
ani timingu scen. NIE commituj — pokaż diff użytkownikowi.

## Zasada nr 1: nie oceniaj filmu po odtwarzaniu na żywo

Podgląd w przeglądarce NIE jest narzędziem QA. Strona jest ciężka (warstwy 3D, blur,
backdrop-filter) i podczas odtwarzania Chrome pokazuje nieaktualne rastry: elementy
"znikają", placeholdery "nie znikają", a po pauzie wszystko nagle jest dobrze.
Renderer mp4 robi `seek(t)` klatka po klatce na ustabilizowanej stronie — jedyną
prawdą jest deterministyczna klatka.

Dlatego KAŻDĄ obserwację weryfikuj przez probe stills:

1. Jeżeli projekt ma `render/probe.mjs` — użyj go. Jeżeli nie ma, napisz:
   Playwright (`chromium.launch({channel:'chrome'})` gdy brak pobranych przeglądarek),
   viewport = rozmiar kompozycji, `goto(file://...)`, `await document.fonts.ready`,
   potem dla każdego t: `window.__timelines.<id>.seek(t)` + screenshot.
2. Zbierz klatki na KAŻDYM beacie interakcji (klik, wpisywanie, pin, toggle, drag)
   oraz 0.2–0.5 s po nim.
3. Klasyfikacja: artefakt widoczny w probe still = PRAWDZIWY BUG (trafi do mp4) →
   napraw kompozycję. Artefakt widoczny tylko przy odtwarzaniu na żywo = problem
   wydajności podglądu → napraw silnik podglądu (patrz sekcja 4), kompozycji nie ruszaj.

Uwaga: timestampy zgłaszane z laggującego podglądu bywają przesunięte o kilka sekund —
zawsze znajdź beat w osi czasu (`js/scenes.js` / timeline), nie ufaj minutnikowi.

## 2. Precyzja kursora i kliknięć (najczęstszy prawdziwy bug)

Symptom: klik ląduje między kartami / obok przycisku / pod polem przy dragu.

Dwie znane przyczyny:

a) **Matematyka stage-space niezgodna z kolejnością transformacji CSS.**
   Dla `transform: translateX(..) translateY(y) .. scale(s)` z `transform-origin: 50% Ypx`
   funkcje działają od prawej: punkt jest NAJPIERW skalowany wokół originu, POTEM
   translowany bez skali. Poprawnie: `stageY = originY + (localY - originY)*s + y`.
   Błędny wzór `originY + (localY + y - originY)*s` daje odchyłkę `y*(s-1)` —
   od ~30 do ~170 px zależnie od kadru.

b) **Celowanie w środek kontenera zamiast w element interaktywny.**
   Kursor ma trafiać w sam przycisk/pole/wiersz (np. "See % Change"), nie w środek
   karty. Jeśli element nie ma id — dodaj id i zmierz go w measure().

Weryfikacja EMPIRYCZNA (obowiązkowa, przed i po poprawce): skrypt Playwright, który
dla każdego kliku robi `seek(t_kliku)`, czyta `getBoundingClientRect()` celu oraz
pozycję kursora (parsując jego `style.transform`), i wypisuje deltę. Cel: czubek
kursora wewnątrz prostokąta celu; rezydualne ±15 px w chwili kliku to celowy
camera-shake (strona drga pod kursorem) — akceptowalne.

## 3. Wierność aplikacji (brakujące elementy UI)

Dla każdego stanu ekranu po interakcji wypisz, co pokazuje PRAWDZIWA aplikacja
(źródła: `/Users/michael/startups/percentage-calculator/handy-percent`, w razie
wątpliwości żywa strona justpercent.com) i porównaj z klatką probe. Znane pułapki:

- Wejście na stronę kalkulatora przez SolutionCard → nad kalkulatorem jest
  **SolutionCardHint** (gradient, przycisk ×, tekst notki karty); dopóki hint jest
  otwarty, etykieta "read-only Answer/Result" jest UKRYTA; przypięcie Practical Use
  ZAMYKA hint (fade ~250 ms) zanim strona doscrolluje i rozwinie prezentację.
- Wpisanie tekstu do inputa → placeholder znika (i nie wraca).
- Pin Practical Use → panel "Selected Practical Use Example" nad formularzem,
  wartości wlatują do inputów, wynik przeliczony poprawnie.
- Animacja wejścia elementu (panel, banner) startuje dopiero PO zakończeniu scrolla,
  w pełni w kadrze — nigdy równolegle ze scrollem.
- Format liczb US: kropka = dziesiętne; wartości i teksty 1:1 z locale aplikacji
  (ale żywa apka pokazuje niektóre liczby BEZ separatorów tysięcy — wzorcem jest apka).

## 4. Wydajność podglądu (gdy artefakty są tylko na żywo)

Jeśli silnik osi czasu przy każdej klatce odgrywa CAŁĄ oś od zera (pełny replay
w `seek()`), dodaj monotoniczną szybką ścieżkę: przy ruchu do przodu pomijaj tweeny
z `start + dur < lastAppliedT` (ich stan p=1 już siedzi w DOM); dowolny seek wstecz
oraz stan po `clear()` = pełny replay. Po zmianie OBOWIĄZKOWO test parzystości na tej
samej stronie: klatki po dojściu przyrostowym vs wymuszony pełny replay w tym samym t
muszą być identyczne co do piksela i DOM (porównanie screenshotów + zrzutu atrybutów
style). Uwaga: porównania między osobnymi załadowaniami strony dają szum rastrowy —
porównuj na jednej stronie.

## 5. Raport końcowy

- Lista znalezionych problemów z podziałem: prawdziwy bug (był w mp4) vs artefakt podglądu.
- Dla każdego buga: przyczyna, poprawka, dowód (delta przed/po, klatka probe przed/po).
- Wyniki: pomiar delt kliknięć, parity test, brak błędów konsoli w probe.
- Diff bez commita.
