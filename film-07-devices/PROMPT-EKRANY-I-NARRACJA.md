# PROMPT: Etap 3 — wypełnij ekrany urządzeń + dodaj narrację (film-07-devices)

Jesteś wykonawcą etapu 3 filmu „Devices" (1080×1920, 36 s, kompozycja HyperFrames
GSAP w `index.html`). Źródłem prawdy są `STORYBOARD.md` i `DESIGN.md` w tym
katalogu — przeczytaj oba w całości zanim cokolwiek zrobisz. Masz trzy zadania:

1. Wyprodukować dwa nagrania ekranu żywej aplikacji **https://justpercent.com**
   i wmontować je w placeholdery `#screen-iphone-slot-1` i `#screen-mac-slot-1`.
2. Wygenerować narrację (ElevenLabs v3 przez podłączony MCP) według scenariusza
   z sekcji C i wmontować ją jako klipy `<audio>`.
3. Zweryfikować całość deterministycznie (probe/capture, nie podgląd na żywo)
   i pokazać raport + diff. **NIE commituj.**

## Zasady żelazne

- **Nie ruszaj** tweenów pozy urządzeń (stałe `PHONE`/`MAC`), beatów scen
  (2 / 8 / 18 / 28 / 33 s), wake-flashy (8.0, 18.3), badge'a „30%" (24.9),
  wejść słów (2.5/3.5/4.5/5.5) ani geometrii slotów. Architektura
  wrapper+slot+glass jest opisana w STORYBOARD §Architektura — sloty animuje
  wyłącznie istniejący skrypt.
- Widocznością slotów zarządza lifecycle klipu (`data-start`/`data-duration`) —
  zero tweenów opacity na slotach.
- Jedyne dozwolone korekty osi czasu to mikro-przesunięcia WYJŚĆ napisów
  wymienione w sekcji C4. Nic poza tą listą.
- Podgląd na żywo w przeglądarce NIE jest narzędziem QA (ciężka strona, stare
  rastry). Prawdą jest deterministyczna klatka: `npx hyperframes capture --at …`
  albo probe Playwright z `window.__timelines.main.seek(t)`.
- Długie skrypty Playwright uruchamiaj na PIERWSZYM planie (background bash
  potrafi umrzeć w połowie nagrania).
- Jeżeli brakuje krytycznego zasobu (MCP ElevenLabs / quota — patrz C0, Chrome,
  ffmpeg) — zatrzymaj się i zapytaj użytkownika, nie improwizuj zamienników
  (w szczególności NIE zjeżdżaj cicho na inny model/silnik TTS dla narracji).

---

## A. Nagrania ekranów (żywe justpercent.com, Playwright)

Scenariusze, okna czasowe i stany końcowe obu nagrań są w STORYBOARD §ETAP 2 —
wykonaj je 1:1 (tam: sekwencja iPhone „rent → pin PU → 4000/800 → 20%",
sekwencja Mac „nadpisz 4000→5000, 800→1500 → 30%", długości 29 s / 19 s,
proporcje okien). Etap 2 był pisany pod ręczne Screen Studio; Ty nagrywasz to
samo automatycznie:

### A1. Wspólny setup

- Playwright z systemowym Chrome: `chromium.launch({ channel: "chrome" })`.
  Import z `/Users/michael/startups/percentage-calculator/percentage-calculator-app/node_modules/playwright/index.mjs`
  (fallback: pnpm store handy-percent — patrz pamięć projektu).
- Kontekst: `locale: "en-US"`, `colorScheme: "light"`, oraz initScript:
  `localStorage["jp:config:v1"] = JSON.stringify({locale:"us",theme:"light"})`
  (bez klucza `theme` strona wstaje CIEMNA).
- `goto(..., { waitUntil: "load" })` — `networkidle` nigdy nie odpala
  (keep-alive analityki).
- CookieYes: kliknij `.cky-btn-accept` i poczekaj aż `.cky-overlay` zniknie
  ZANIM zaczniesz jakąkolwiek interakcję (overlay połyka wszystkie pointer
  eventy po cichu).
- Interakcje aplikacyjne (klik w search, klik w wiersz Practical Use) muszą być
  PRAWDZIWYMI klikami locatorów Playwright — `el.click()` w `evaluate` nie
  uruchamia flow search→pin. Po pinie czekaj na
  `.practical-use-presentation-container.is-visible`.
- **Kursor jest wstrzykiwany**: Playwright nie renderuje wskaźnika, więc dodaj
  do strony element-nakładkę (`position:fixed`, `z-index:999999`,
  `pointer-events:none`) i prowadź go rAF-em po waypointach z easingiem.
  iPhone: półprzezroczysty okrąg ~26 px (dotyk) + ripple przy tapie.
  Mac: strzałka macOS (SVG, ~22 px, delikatny cień) + krótki scale-dip przy
  kliku. Ruch kursora i realne akcje Playwright synchronizuj w tym samym
  skrypcie (najpierw dojazd kursora, potem `locator.click()` w tym punkcie).
- Nagrywanie: `recordVideo` na kontekście (rozmiar = 2× viewport, jeżeli
  encoder nie przyjmie — 1× wystarczy, sloty wyświetlają 384×832 / 760×475).
- Tempo wpisywania: `page.keyboard.type` z delayem ~550 ms/znak dla `rent`
  (okno 2.5 s), ~350 ms/znak dla `5000` i `1500` (okna 2 s / 1.5 s).
  Zaznaczenie starej wartości pola: potrójny klik w input.

### A2. Parametry per slot

| | iPhone | Mac |
|---|---|---|
| Viewport | 390×845, `isMobile`, `hasTouch`, dpr 2.5 | 1216×760, desktop, dpr 2 |
| Zoom strony | — | `document.documentElement.style.zoom = "1.15"` po load (czytelność pól przy skali 62.5%) |
| Plik docelowy | `assets/SS-06-IPHONE_rent-pin_CLEAN.mp4` | `assets/SS-06-MAC_overwrite-30pct_CLEAN.mp4` |
| Stan startowy | strona główna, cookie zaakceptowany | kalkulator Part-to-Whole z przypiętym PU „$800 rent of $4,000 income" (4000/800→20%) — przygotuj NA TYM SAMYM page przed sekcją nagraniową, trim zrobi resztę |
| Kotwica beatu | pierwszy znak `r` w polu search → **film t=10.0** | pojawienie się wyniku **30%** → **film t=24.9** |

Nagrywaj jednym ciągiem (przygotowanie + akcja + hold), a potem przytnij
transkodem tak, żeby przed pierwszą akcją zostały ~2 s spokojnego stanu
(zgodnie z „zapasem" ze STORYBOARD).

### A3. Transkod i wyrównanie do beatów

1. Transkod: H.264 `yuv420p`, `-crf 18`, `-r 60`, `+faststart`, bez audio.
2. Wyznacz kotwice PO KLATKACH, nie z logów (recordVideo ma jitter): wyciągnij
   ffmpeg-iem klatki wokół szacowanego momentu i znajdź (a) pierwszą klatkę
   z literą `r` w search — to `T_type`; (b) pierwszą klatkę z `30%` — to `T_res`.
   Czasy liczone w PRZYCIĘTYM pliku.
3. Oblicz:
   - iPhone: `data-media-start = T_type − 2.0` (klip startuje w filmie t=8.0,
     typing ma trafić w 10.0),
   - Mac: `data-media-start = T_res − 6.7` (klip startuje 18.2, wynik w 24.9).
   Wymogi: `data-media-start ≥ 0`; długość pliku ≥ `data-media-start +
   data-duration + 0.3` (25.0 s iPhone / 14.8 s Mac).
4. Kryteria akceptacji nagrania (sprawdź na klatkach):
   - motyw jasny, locale US (kropka dziesiętna, `$`), **zero banerów**;
     wartości liczbowe 1:1 z żywą apką (żywa apka pokazuje część liczb BEZ
     separatorów tysięcy — wzorcem jest apka, nie locale source),
   - kursor widoczny, klik trafia w element (nie obok),
   - stan końcowy iPhone: przypięty Part-to-Whole 4000/800→20%;
     Mac: 5000/1500→**30%**,
   - tekst pól czytelny po przeskalowaniu do rozmiaru slotu.
   Jeżeli po renderze fragmentu 8–13 s ruch kursora wyraźnie się zacina
   (recordVideo ~25 fps), przejdź na CDP screencast (`Page.startScreencast`,
   składanie klatek ffmpeg-iem wg timestampów) — a gdyby i to zawiodło,
   zatrzymaj się i zaproponuj użytkownikowi ręczną sesję Screen Studio wg
   STORYBOARD §ETAP 2.

## B. Montaż wideo do index.html

Podmień każdy placeholder-`<div>` slotu 1:1 na `<video>` według wzoru ze
STORYBOARD §ETAP 3: te same `id`, `data-start`, `data-duration`,
`data-track-index`, `class="clip"`, `muted playsinline`,
`style="object-fit: cover;"` — a `data-media-start` z Twojego pomiaru (A3),
nie sztywne „2". CSS i skrypt zostają nietknięte (geometria i transformy idą
po id z arkusza).

Weryfikacja beatów po montażu (`npx hyperframes capture --at ...`):

| t | oczekiwanie |
|---|---|
| 9.9 | pole search puste (typing jeszcze nie ruszył) |
| 10.4 | w polu widać ≥1 znak |
| 12.5 | lista wyników widoczna |
| 16.8 | PU przypięte, kalkulator 4000/800→20% |
| 24.8 | wynik na Macu jeszcze ≠ 30% |
| 25.1 | wynik = 30% |

Tolerancja ±0.15 s; jeżeli beat ucieka dalej, skoryguj `data-media-start`
o zmierzoną różnicę i powtórz.

## C. Narracja (ElevenLabs v3 przez MCP)

Narrację generuje MCP ElevenLabs (server podłączony, klucz w configu). Wołasz
narzędzia MCP jako agent — nie z basha. **Każde `text_to_speech` to płatny call**
(ostrzeżenie w toolu) — generuj rozważnie, ale wolno regenerować segment za długi.

### C0. Preflight (zrób najpierw)

1. `check_subscription` — potwierdź, że klucz żyje i jest quota (character_count
   vs limit). Brak/wyczerpany → **stop i zapytaj użytkownika**.
2. `list_models` — potwierdź, że `eleven_v3` jest dostępny na koncie. Gdyby nie
   był — stop i zapytaj (v3 to sedno tego kierunku, nie podmieniaj po cichu na
   `eleven_multilingual_v2`).
3. Głos: `search_voices` (szukaj ciepłego, energicznego US narratora, np.
   „warm", „friendly", „narration"). Wybierz JEDEN `voice_id` i użyj go dla
   WSZYSTKICH segmentów. Zapisz który głos wybrałeś (do raportu D).

### C1. Wywołanie i parametry (jednakowe dla wszystkich segmentów)

`text_to_speech` z:
- `text`: z tabeli C2 (razem z tagami `[...]`),
- `voice_id`: wybrany w C0,
- `model_id`: `"eleven_v3"`,
- `output_directory`: **bezwzględna** ścieżka do `assets/vo/`,
- `output_format`: `"mp3_44100_128"`,
- `stability`: `0.4` (v3: niżej = szerszy zakres emocji; 0.4 ≈ „Natural"),
- `style`: `0.15`, `use_speaker_boost`: `true`, `speed`: `1.0`.

Tool sam nadaje nazwę pliku i zwraca zapisaną ścieżkę — **odczytaj ją i zmień
nazwę** na `assets/vo/<id>.mp3` (id z tabeli C2). Nazwa musi być dokładnie taka,
bo `src` w C5 na niej stoi.

Kierunek głosu: US English, ciepły „smiling voice", ton przyjaznej rekomendacji
— nie hype, nie lektor reklamowy. Copy na ekranie NIE zmieniamy — narracja to
jego cieplejsze echo (słownictwo: DESIGN §What NOT to Do; „free", „no sign-up",
„instant", „live" są OK).

### C2. Segmenty

Każdy segment = osobny plik `assets/vo/<id>.mp3` (osobne pliki = twarda
synchronizacja; jeden długi plik by dryfował). Tagi w nawiasach kwadratowych to
znaczniki ekspresji **eleven_v3** — zostają w polu `text`. Jeżeli tag wychodzi
jako artefakt (wypowiedziany na głos / dziwna proza), usuń sam tag i regeneruj.

| id | start (film) | koniec okna | tekst dla TTS (primary) | fallback (gdy za długi) |
|---|---|---|---|---|
| vo-01 | 0.30 | 2.35 | `[confident] Eight calculators. [amused] Zero guessing.` | — |
| vo-02a | 2.55 | 3.45 | `[casual] Tips.` | — |
| vo-02b | 3.55 | 4.45 | `[casual] Sales tax.` | — |
| vo-02c | 4.55 | 5.45 | `[curious] Raises.` | — |
| vo-02d | 5.55 | 6.60 | `[excited] Rent.` | — |
| vo-03 | 7.15 | 9.70 | `[warm] You just type your situation.` | — |
| vo-04 | 12.05 | 14.85 | `[impressed] It finds the right calculator for you.` | `It finds the right calculator.` |
| vo-05 | 15.40 | 17.60 | `[warm] And shows you what goes where.` | `Shows what goes where.` |
| vo-06 | 18.55 | 20.40 | `[confident] Now overwrite the defaults.` | — |
| vo-07 | 20.70 | 23.90 | `[excited] Put in your numbers — the answer updates live.` | `Your numbers. Live.` |
| vo-08 | 24.88 | 27.70 | `[impressed] Thirty percent. [satisfied] Just like that.` | `Thirty percent.` |
| vo-09 | 28.60 | 32.60 | `[warm] Phone or laptop — you get the same live result.` | `Phone or laptop — same live result.` |
| vo-10 | 33.30 | 35.90 | `[confident] Stop guessing. [warm] Just Percent — free, no sign-up.` | `Stop guessing. Just Percent.` |

Okna ciszy są celowe: 10.0–12.0 (typing na ekranie — oddech; słychać tylko
przyszłą muzykę) i 26.0–28.2 (hold na 30%).

### C3. Dopasowanie długości (obowiązkowe, to jest sedno zadania)

1. MCP nie zwraca word-timestamps → przytnij wiodącą/końcową ciszę i zmierz
   `ffprobe -show_entries format=duration`:
   `ffmpeg -i <in> -af silenceremove=start_periods=1:start_silence=0.1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_silence=0.1:start_threshold=-45dB,areverse <out>`
2. Warunek: **czas netto ≤ (koniec okna − start − 0.15 s)**. Tempo sanity:
   ≤ ~3.0 słowa/s; wolniej = lepiej, okna mają luz.
3. Za długi segment → regeneruj (v3 ma wariancję tempa; do 2 prób) → nadal za
   długi → użyj fallbacku z tabeli → nadal za długi → dopiero wtedy sekcja C4.
4. Nigdy nie przyspieszaj `atempo` ani nie tnij w środku słowa. Poziom głośności
   wyrównaj TYLKO jeśli segmenty wyraźnie się różnią:
   `ffmpeg -i <in> -af loudnorm=I=-16:TP=-1.5:LRA=11 <out>` (mp3→mp3).

### C4. Dozwolone mikro-korekty osi czasu (tylko te, tylko gdy C3 wyczerpane)

| Element | teraz | wolno przesunąć DO |
|---|---|---|
| wyjście `#c1` | 14.9 (+set 15.22) | 15.15 (+set 15.28) |
| wyjście `#c2` | 17.6 (+set scene-3 17.95) | 17.9 (set bez zmian) |
| wyjście `#s4-chip` | 20.3 (+set 20.62) | 20.55 (set bez zmian) |
| start `vo-10` | 33.30 | 33.10 |

Nic innego. Napisy WCHODZĄ tam gdzie wchodziły; end-card i beaty stoją.

### C5. Montaż audio

Po jednym klipie na segment, jako bezpośrednie dzieci roota (kontrakt mediów):

```html
<audio id="vo-01" class="clip" src="assets/vo/vo-01.mp3"
       data-start="0.30" data-duration="(zmierzone netto)"
       data-track-index="11" data-volume="1.0"></audio>
```

`data-start` z tabeli C2 (po ewentualnej korekcie C4), `data-duration` =
zmierzony czas netto (C3.1). Track 10 zarezerwowany dla przyszłego bgm
(komentarz w index.html) — gdy muzyka dojdzie, jej `data-volume` zejdzie do
~0.6 pod narracją; teraz nic z tym nie robisz.

## D. QA końcowe i raport

1. `npx hyperframes lint` i `npx hyperframes validate` — czysto (znane
   wyjątki: patrz pamięć projektu o KaTeX-404, jeśli wystąpią).
2. `npx hyperframes capture --at 1,3.2,5.6,7.6,9.9,10.4,12.5,16.8,19.5,21.5,24.8,25.1,29.5,34.5`
   — przejrzyj każdą klatkę pod: beaty z sekcji B, poprawny format US,
   czytelność ekranów, brak placeholderów.
3. Render kontrolny: `npx hyperframes render renders/preview-draft.mp4`
   (30 fps wystarczy) — odsłuchaj synchronizację VO z napisami i badge'em.
4. Raport dla użytkownika:
   - tabela VO: segment | okno | czas netto | tempo (słów/s) | primary/fallback
     | użyte korekty C4 (jeśli żadne — napisz „żadne"),
   - zmierzone `T_type`, `T_res` i wynikowe `data-media-start`,
   - wyniki weryfikacji beatów (delta per beat),
   - lista klatek QA z werdyktem,
   - ścieżka do preview-draft.mp4,
   - pełny diff `index.html` — **bez commita**.
5. Zaktualizuj `TODO.txt` (co zrobione, co zostało: bgm z Suno + finalny
   render 60 fps) i dopisz w STORYBOARD §ETAP 3 zmierzone wartości
   `data-media-start`.
