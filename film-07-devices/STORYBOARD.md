# Film 07 — „Devices" · Storyboard + spec slotów

1080×1920 · 36 s · jedna myśl: **type your situation, not a formula**.
Rytm: PUNCH — build — hold(demo) — PEAK(live) — duo-drift — resolve(end card).
Sync beaty: **2 / 8 / 18 / 28 / 33 s** (siatka 120 BPM, beat = 0.5 s). Typing w nagraniu
iPhone trafia w beat **10.0 s**.

## Beaty

| t (s) | Beat | Co się dzieje |
|---|---|---|
| 0–2 | HOOK | „8 calculators. / Zero guessing." slam + amber rule; velocity-swap w górę |
| 2–8 | WORDS | iPhone wlatuje z prawej-dołu (rotY −48°→−24°), unosi się; słowa **Tips. Sales tax. Raises. Rent.** wchodzą co 1 s (4 różne easingi), stack pulsuje na siatce 0.5 s; 7.0 swap → headline „Type your **situation**." (podkreślenie purple) |
| 8–18 | DEMO PHONE | 7.3–8.5 telefon obraca się frontem (rotY→0, scale 1), ekran „budzi się" (wake-flash na glass) — **SLOT iPhone #1** gra; sway ±2.2°; calloutami: 12.0 „It finds the right calculator.", 15.3 „Shows what goes where." |
| 18–28 | PEAK MAC | telefon odlatuje w głąb (back-left, scale 0.6), MacBook wjeżdża z prawej (rotY 42°→8°→2°) — **SLOT Mac #1** gra; 18.5 chip „Overwrite the defaults."; 20.6 hero „Your numbers. **Live.**" (Live. emerald 122 px, glow-pulsy na beat); 24.9 badge **30%** (mono, emerald, ring-pulse ×2) zsynchronizowany z live-update w nagraniu; emerald glow w tle |
| 28–33 | DUO | oba urządzenia w kadrze (Mac tył-góra scale 0.78, iPhone przód-prawo scale 0.86), parallax w przeciwnych kierunkach; „Phone or laptop. / SAME LIVE RESULT"; amber glow hint |
| 33–36 | END CARD | urządzenia odlatują (finał — exity dozwolone), bloom glow; logo (assets/logo.png) → **justpercent.com** → „Stop guessing. Just Percent." → chip „FREE · NO SIGN-UP" |

## Architektura (WAŻNE — nie zmieniać bez zrozumienia)

Kontrakt mediów HyperFrames: **`<video>` musi być bezpośrednim dzieckiem roota
kompozycji** — w jakimkolwiek wrapperze renderuje się jako pusty/czarny ekran
(silent bug, lint tego nie wykrywa). Dlatego:

- Ramka urządzenia (`#dev-iphone`, `#dev-mac`), slot ekranu (`#screen-*-slot-1`)
  i szkło (`#glass-*`) to **trzy osobne elementy na poziomie roota**, nałożone
  geometrycznie (slot = dokładny rect ekranu w ramce przy transformacji zerowej).
- Każdy tween pozy urządzenia idzie w **tablicę [wrapper, slot, glass] z
  identycznymi wartościami** (stałe `PHONE` / `MAC` w skrypcie).
- `transformOrigin` wszystkich trzech wskazuje **ten sam punkt canvas** (środek
  urządzenia: 540,880): wrapper `50% 50%`, slot/glass w px poza własnym boxem.
  Ten sam `transformPerspective: 1400` → identyczna projekcja 3D → ekran jest
  sztywno „przyklejony" do ramki w każdej pozie.
- Nigdy nie animować slotu/wideo osobno; nigdy nie dodawać tweenu tylko do
  wrappera. Zawsze przez stałe `PHONE` / `MAC`.
- Widocznością slotów zarządza lifecycle klipu (`data-start`/`data-duration`) —
  nie dodawać tweenów opacity na slotach.

Geometria (przy transformacji zerowej):

| Element | Rect globalny | transformOrigin | radius |
|---|---|---|---|
| #dev-iphone (420×900) | (330, 430) | 50% 50% | 66 |
| #screen-iphone-slot-1 + #glass-iphone | (348, 464) 384×832 | 192px 416px | 44 |
| #dev-mac (900×570) | (90, 595) | 50% 50% | lid 24 |
| #screen-mac-slot-1 + #glass-mac | (160, 615) 760×475 | 380px 265px | 10 |

## ETAP 2 — Scenariusze nagrań Screen Studio

Wspólne (checklista z `docs/2026-07-09-video-campaign/04-materialy-zrodlowe.md` §1):
motyw JASNY, locale US (`/`, `$`, kropka), cookie banner zaakceptowany PRZED REC,
czyste localStorage, zakładka All, cursor highlight ON, click effect ON, **eksport
CLEAN** (zero auto-zoomów — kamerą jest kompozycja 3D), 60 fps, mp4 H.264.
Nagrywaj **area capture** (zaznaczenie dokładnie viewportu) — bez paska tytułu.

### SLOT-IPHONE-1 (`#screen-iphone-slot-1`)

| Pole | Wartość |
|---|---|
| Czas w filmie | 8.0 → 33.0 s (25.0 s) |
| Długość nagrania | **29 s** (2 s zapasu z przodu i z tyłu) |
| Okno/crop | Chrome app-mode szer. **390 px**, area capture **390 × 845 px** viewportu (proporcja 0.4615 = ekran 384×832; Retina 2× → plik 780×1690). `open -na "Google Chrome" --args --app=https://justpercent.com --window-size=390,940` |
| Plik | `assets/SS-06-IPHONE_rent-pin_CLEAN.mp4` |

Sekwencja (czasy w nagraniu; akcja rusza w t=2.0):

| t rec | Akcja | t w filmie |
|---|---|---|
| 0–2 | zapas — strona główna, bez ruchu | — |
| 2–4 | kursor płynie do pola search, klik | 8–10 |
| **4.0–6.5** | wpisywanie `rent` znak po znaku (**start dokładnie w 4.0** → trafia w beat 10 s) | 10–12.5 |
| 6.5–9.5 | lista wyników widoczna, pauza (callout „It finds…" gra 12–14.9) | 12.5–15.5 |
| 9.5–11 | klik wynik Practical Use **„$800 rent of $4,000 income"** → **pin** | 15.5–17 |
| 11–15 | otwarty Part-to-Whole z domyślnymi **4000 / 800 → 20%**, etykiety pól czytelne, delikatny scroll (callout „Shows what goes where." 15.3–17.6) | 17–21 |
| 15–27 | spokojny hold na kalkulatorze (telefon jest wtedy małym tłem) | 21–33 |
| 27–29 | zapas | — |

Stan końcowy ekranu: przypięty Part-to-Whole Percentage Calculator, 4000/800, wynik 20%, zero banerów.

### SLOT-MAC-1 (`#screen-mac-slot-1`)

| Pole | Wartość |
|---|---|
| Czas w filmie | 18.2 → 33.0 s (14.8 s) |
| Długość nagrania | **19 s** (2 s zapasu z przodu i z tyłu) |
| Okno/crop | normalne okno desktop, area capture **1216 × 760 px** viewportu (16:10 = ekran 760×475; Retina 2× → 2432×1520). Zoom strony 110–125% |
| Plik | `assets/SS-06-MAC_overwrite-30pct_CLEAN.mp4` |

Przygotowanie przed REC: wykonaj search `rent` → pin „$800 rent of $4,000 income"
→ kalkulator Part-to-Whole otwarty z 4000/800 → 20%. Nagranie zaczyna się już na kalkulatorze.

| t rec | Akcja | t w filmie |
|---|---|---|
| 0–2 | zapas — kalkulator z 4000 / 800 → 20%, bez ruchu | — |
| 2–4 | kursor do pola **Whole**, zaznaczenie 4000 | 18.2–20.2 |
| 4–6 | wpisz **5000** znak po znaku — wynik aktualizuje się na żywo (hero „Your numbers. Live." wchodzi 20.6) | 20.2–22.2 |
| 6–7.2 | kursor do pola **Part**, zaznaczenie 800 | 22.2–23.4 |
| 7.2–**8.7** | wpisz **1500** — live update; **wynik 30% pojawia się w t=8.7** (→ film 24.9 = badge „30%") | 23.4–24.9 |
| 8.7–12 | pauza na wyniku 30% (zielona emfaza w kadrze) | 24.9–28.2 |
| 12–17 | spokojny idle (Mac jest wtedy w tle sceny duo) | 28.2–33 |
| 17–19 | zapas | — |

Stan końcowy: Part-to-Whole 5000 / 1500 → **30%**. (1500/5000 = 30% ✓)

## ETAP 3 — montaż mp4 (gdy pliki będą w assets/)

Każdy placeholder-`<div>` slotu podmienić 1:1 na (przykład dla Maca):

```html
<video
  id="screen-mac-slot-1"
  class="clip"
  src="assets/SS-06-MAC_overwrite-30pct_CLEAN.mp4"
  data-start="18.2"
  data-duration="14.8"
  data-media-start="2"
  data-track-index="3"
  muted
  playsinline
  style="object-fit: cover;"
></video>
```

- `id`, `data-start`, `data-duration`, `data-track-index` — bez zmian (geometria
  i transformy przychodzą z arkusza stylów po id, nic w skrypcie nie ruszamy).
- `data-media-start="2"` ścina 2-sekundowy zapas.
- iPhone: `data-start="8" data-duration="25" data-media-start="2"`.
- Po podmianie: lint → validate → inspect → animation-map → render 60 fps high.

**Co możesz podmieniać sam bez ruszania animacji:** atrybut `src` obu `<video>`
(ścieżki plików w `assets/`) oraz `data-media-start` (gdy zmienisz długość zapasu).
Niczego więcej.

### Zmierzone wartości (Etap 3, wykonane 2026-07-22)

Nagrania mierzone z timestamp-filmstripów; `data-media-start` liczony formułą
(iPhone `= T_type − 2.0`, Mac `= T_res − 6.7`) tak, by beaty spadały na film 10.0
(typing) i 24.9 (30%).

| slot | plik | T_anchor | data-media-start | data-start | data-duration |
|---|---|---|---|---|---|
| screen-iphone-slot-1 | `assets/SS-06-IPHONE_rent-pin_CLEAN.mp4` | T_type = 6.5 s | **4.5** | 8 | 25 |
| screen-mac-slot-1 | `assets/SS-06-MAC_overwrite-30pct_CLEAN.mp4` | T_res = 18.1 s | **11.4** | 18.2 | 14.8 |

QA klatek z `renders/preview-draft.mp4` — 6 beatów B-tabeli zgodne (9.9 puste /
10.4 „r" / 12.5 wyniki / 16.8 pin 20% / 24.8 Mac 3% / 25.1 Mac 30%). Seek OK mimo
ostrzeżenia o rzadkich keyframe'ach — **przed finalnym renderem 60 fps** przekoduj
oba mp4 gęstszym GOP: `ffmpeg -i <in> -c:v libx264 -r 30 -g 30 -keyint_min 30 -movflags +faststart <out>`.

### Najazd kamery na prezentowane urządzenie (2026-07-22)

UI był za daleko, żeby czytać szczegóły → dodany „najazd kamery" = **scale-up całej
grupy `[wrapper, slot, glass]`** przez stałe `PHONE`/`MAC` (origin = środek urządzenia,
więc rośnie w miejscu i pozostaje przyklejone — kontrakt glue nietknięty).

| urządzenie | okno | scale | z-index podczas najazdu |
|---|---|---|---|
| iPhone | 9.0 → 16.8 s | 1 → **1.45** → 1 | 30/31/32 (Mac jeszcze nie wszedł, sam na wierzchu) |
| Mac | 20.4 → 27.7 s | 0.94 → **1.2** → 0.94 | **bump 33/34/35** (nad iPhone), restore 20/21/22 przed duo |

Sekwencja: najazd iPhone (demo) → odjazd (telefon odlatuje, Mac wjeżdża) → najazd Mac
(PEAK, urządzenie na wierzchu bo telefon wisi w rogu) → odjazd + restore z → duo
(iPhone przód-prawo z przodu). Wszystkie tweeny absolutne `.to` = seek-safe. Mac 1.2 →
ramka == szerokość canvas (bez bocznego bleedu). QA klatek 12.5/17.5/25.1/27.5/29.5 OK.

## Muzyka

Brak pliku na etapie budowy — kompozycja trzyma sync na 2/8/18/28/33 s i pulsy na
siatce 0.5 s (stand-in audio-reactive). Gdy będzie instrumental z Suno:

1. wrzuć `assets/bgm.mp3`, odkomentuj `<audio>` w `index.html` (track 10),
2. `python3 <skills>/hyperframes-creative/scripts/extract-audio-data.py assets/bgm.mp3 --fps 30 --bands 16 -o assets/audio-data.json`,
3. podmień pulsy `pulseTimes` na per-frame sampling z `audio-data.json`
   (wzorzec w `hyperframes/references/audio-reactive.md`).

## Pipeline jakości (uruchamiane lokalnie na Macu)

```bash
cd /Users/michael/startups/percentage-calculator/hyperframes-video/film-07-devices
npx --yes hyperframes@0.6.44 lint
npx --yes hyperframes@0.6.44 validate
npx --yes hyperframes@0.6.44 inspect --at 1,3.2,5.6,7.6,10,14,19.5,21.5,25.2,29.5,31.5,34,35.5
npm run render:draft        # podgląd z placeholderami → renders/preview-draft.mp4
```
