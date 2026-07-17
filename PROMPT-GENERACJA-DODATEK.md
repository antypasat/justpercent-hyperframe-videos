# DODATEK do promptów generujących nowe filmy HyperFrames (JustPercent)

Dołącz ten blok do każdego promptu tworzącego nowy film. Wymagania są obowiązkowe —
film nie jest skończony, dopóki bramki QA z sekcji F nie przejdą.

## A. Determinizm osi czasu

- Cały stan wizualny = czysta funkcja czasu: `seek(t)` odtwarza każdą klatkę
  identycznie, niezależnie od historii seeków. Zero zegarów realnych, zero
  nieziarnionego Math.random, zero callbacków zależnych od kierunku odtwarzania.
- Silnik osi czasu od razu z monotoniczną szybką ścieżką: przy seeku do przodu
  pomijaj tweeny zakończone przed poprzednim seekiem; seek wstecz i stan po
  `clear()` = pełny replay. Bez tego podgląd na żywo będzie kłamał (znikające
  panele, nieznikające placeholdery) i QA stanie się niemożliwe.

## B. Geometria kursora i kliknięć

- Wzór mapujący współrzędne elementu na scenę MUSI odwzorowywać dokładną kolejność
  transformacji CSS: funkcje w `transform` działają od prawej — skala wokół
  `transform-origin` NAJPIERW, translacja POTEM, bez skali:
  `stageY = originY + (localY - originY)*s + y`. (Błąd `y*(s-1)` to dziesiątki–setki px.)
- Kursor celuje w SAM element interaktywny (przycisk, pole, wiersz, toggle) — nigdy
  w środek karty/kontenera. Każdy cel kliknięcia ma własne id i jest mierzony
  z `getBoundingClientRect()` po `document.fonts.ready`.
- Offsety stylistyczne od środka celu na tyle małe, żeby czubek kursora został
  wewnątrz prostokąta celu. Ripple kliknięcia dokładnie w czubku kursora.
- Przy dragu (hold & drag) kursor startuje NA polu i przez cały gest trzyma się
  linii pola (y ≈ środek pola), zmienia się głównie x.
- Pomiary layoutu wykonuj przy zneutralizowanych transformacjach ekranu ORAZ kamery;
  pamiętaj, że `document.fonts.ready` nie ładuje fontów treści `display:none` —
  wymuś `Promise.all([...document.fonts].map(f => f.load()))` przed pomiarem.

## C. Wierność aplikacji (stany, nie tylko ekrany)

Przed budową każdej sceny wypisz z kodu aplikacji
(`/Users/michael/startups/percentage-calculator/handy-percent`) PEŁNY stan UI po
danej interakcji — łącznie z efektami ubocznymi — i odwzoruj go 1:1. Minimum:

- Nawigacja przez SolutionCard → na stronie kalkulatora nad formularzem jest
  SolutionCardHint (gradient, ×, tekst notki); hint ukrywa etykietę
  "read-only Answer/Result"; przypięcie Practical Use zamyka hint, POTEM scroll,
  POTEM prezentacja (sekwencja z practicalUsePinning.ts).
- Wpisany tekst = brak placeholdera; caret zgodny ze stanem wpisywania.
- Wyniki kalkulatorów przeliczone poprawnie i sformatowane jak w żywej aplikacji
  (US: kropka dziesiętna; niektóre pola żywej apki pokazują liczby bez separatorów
  tysięcy — wzorcem jest apka, nie plik locale).
- Teksty 1:1 z `src/data/locales/en-US/…`.

## D. Choreografia wejść

- Animacja pojawienia się elementu (panel, hint, banner) startuje dopiero PO
  zakończeniu scrolla/reframe, w całości w kadrze; potem min. ~1.5 s stanu
  ustalonego zanim ruszy kolejny beat. Nigdy nie nakładaj wejścia na scroll —
  widz go nie zobaczy.
- Klik → krótka reakcja (highlight) → scroll/reframe → wejście → wypełnianie wartości.

## E. Narzędzia QA wbudowane w projekt (od pierwszego dnia)

Dostarcz razem z kompozycją:
- `render/probe.mjs` — zrzut deterministycznych klatek dla podanych sekund
  (`seek(t)` + screenshot; fallback `channel:'chrome'` gdy brak przeglądarek Playwright).
- Skrypt pomiaru precyzji: dla każdego kliku `seek(t)`, delta środka celu
  (`getBoundingClientRect`) vs pozycja kursora; wypisuje tabelę.
- Test parzystości seeka: klatki przyrostowe vs pełny replay w tym samym t na tej
  samej stronie — identyczne piksele i DOM.

## F. Bramki końcowe (bez nich film nie jest gotowy)

1. Probe stills na każdym beacie interakcji obejrzane i zgodne ze stanem aplikacji.
2. Wszystkie delty kliknięć: czubek kursora wewnątrz celu (tolerancja ±15 px
   wyłącznie z celowego impact-shake'a).
3. Parity test przechodzi; zero błędów konsoli podczas probe.
4. Wszystkie wartości liczbowe przeliczone i zweryfikowane rachunkiem.
5. QA wyłącznie na klatkach deterministycznych — odtwarzanie na żywo służy tylko
   do oceny tempa/rytmu, nigdy poprawności.
