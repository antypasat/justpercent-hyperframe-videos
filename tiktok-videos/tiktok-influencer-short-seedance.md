# TikTok short fabularny — justpercent.com (Seedance 2.0)

## BRIEF (master prompt)

Chcę wypromować moją aplikację https://justpercent.com krótkim shortem fabularnym na TikToka,
wyglądającym jak naturalne, autentyczne nagranie influencerki/influencera — bez wprost
reklamowego tonu. Co robi aplikacja, dowiesz się z jej kodu i dokumentacji
(~/startups/percentage-calculator/handy-percent).

PROJEKT I STRUKTURA
- KATALOG_PROJEKTU: (pusty)
- Materiały projektu (scenariusz, prompty, klatki referencyjne, inserty ekranowe, wersje montażowe)
  trzymaj w ~/startups/percentage-calculator/tiktok-video/<katalog>.
- Jeżeli KATALOG_PROJEKTU jest pusty — utwórz nowy podkatalog (kebab-case, po angielsku),
  którego nazwa odzwierciedla koncept/styl filmu.

PARAMETRY FILMU
- Format: 9:16 pion, docelowo 1080×1920 (Seedance generuje 720p — upscaling w postprodukcji).
- Długość całości ~30–40 s. Seedance 2.0 generuje klipy do ~15 s, więc film składa się
  z 3 generacji (A/B/C) + pełnoekranowych insertów z prawdziwej aplikacji, sklejonych w montażu.
- Z dźwiękiem: naturalny dialog po amerykańsku (Seedance generuje zsynchronizowany lip-sync),
  room tone, bez muzyki w generacji (trend sound ewentualnie dołożony cicho w montażu).
- Widownia: amerykański TikTok. Cały język — casual American English, styl UGC.

BOHATER (kluczowe: anty-AI, naturalność)
- Zwyczajna osoba, nie "modelka z AI": późne 20-tki/30-tki, minimalny makijaż lub jego brak,
  nieidealna cera z widoczną fakturą, lekko potargane włosy, codzienne ubranie (hoodie/t-shirt),
  zwykłe amerykańskie wnętrze (samochód na parkingu, kanapa, kuchnia) z bałaganem życia w tle.
- Zdjęcia "z ręki" front-kamerą telefonu: lekkie drżenie, naturalne światło z okna, delikatny
  szum/ziarno, obiektyw szerokokątny selfie. Zakaz języka typu "beautiful, flawless, cinematic,
  perfect" w promptach — zamiast tego "natural skin texture, candid, unpolished, amateur
  smartphone footage".
- Ta sama osoba we wszystkich generacjach: najpierw wygeneruj klatkę referencyjną postaci,
  potem podawaj ją jako @Image1 w każdej kolejnej generacji.

NARRACJA (oś fabularna = wyróżnik aplikacji)
Historia prowadzi od ŻYCIOWEGO przypadku użycia do aplikacji — influencer nie reklamuje wprost,
tylko opowiada anegdotę, w której aplikacja naturalnie rozwiązuje jego problem:
1. HOOK (0–4 s): problem z procentami z życia ("prawie mnie naciągnęli na wyprzedaży").
2. HISTORIA (4–12 s): krótka relacja, próba liczenia w głowie, frustracja.
3. ZWROT (12–17 s): "siostra podesłała mi taką stronę…" — telefon w dłoni, ekran NIEczytelny.
4. DEMO — INSERT (17–27 s): pełnoekranowe nagranie PRAWDZIWEJ aplikacji (nie generowane!):
   wpisanie życiowego przypadku w Search, kliknięcie w wynik, kalkulator wypełnia się,
   odpowiedź + objaśnienie liczą się na żywo.
5. PUENTA (27–34 s): reakcja + rozwiązanie zagadki z hooka ("40% + 20% to 52%, nie 60%").
6. MIĘKKIE CTA (34–38 s): rzucone od niechcenia "it's free, justpercent dot com", machnięcie,
   sięgnięcie po wyłączenie nagrywania. Bez planszy reklamowej — ewentualnie subtelny
   tekst-nakładka z domeną w montażu.

EKRAN TELEFONU (żelazna zasada)
- NIGDY nie generuj czytelnego UI aplikacji w Seedance — model wyhalucynuje teksty i layout.
- W generowanych ujęciach ekran telefonu jest odwrócony od kamery, pod ostrym kątem, albo
  widoczna jest tylko poświata na twarzy bohatera.
- Prawdziwe UI pojawia się wyłącznie jako pełnoekranowe inserty: nagranie ekranu realnej
  aplikacji (mobile, en-US), wmontowane między klipy. Opcjonalnie na czas demo — natywny
  tiktokowy "green screen effect" z głową bohatera w rogu (wycinka z klipu B).

WIERNOŚĆ MARCE (dla insertów ekranowych)
- Inserty tylko z prawdziwej aplikacji: rzeczywisty adres strony w pasku, teksty wyłącznie
  z plików locale en-US, oryginalne logo (rzeczywisty asset).
- Używaj tylko adresów zweryfikowanych w kodzie (src/pages/), kanonicznie z końcowym "/".
- Przypadek użycia z fabuły (podwójny rabat 40% + 20%) ZWERYFIKUJ w aplikacji — jeżeli nie ma
  dokładnie takiego kalkulatora/Practical Use/FAQ, wybierz najbliższy istniejący i dopasuj
  do niego dialogi (liczby w dialogu muszą zgadzać się z tym, co widać w insercie).

MONTAŻ
- Cięcia proste, rytm UGC (ujęcia 2–4 s), duże czytelne napisy dialogowe (auto-captions style),
  nic nie nachodzi na UI w insertach.
- Kolor i ziarno insertów dopasuj do klipów generowanych (żeby ekran nie wyglądał "za czysto").

---

## SCENARIUSZ (shot-by-shot, ~36 s)

| # | Czas | Źródło | Treść |
|---|------|--------|-------|
| 1 | 0–4 s | Seedance GEN A / shot 1 | Selfie w ruchu, parking: "Okay, so this store almost got me today." |
| 2 | 4–8 s | GEN A / shot 2 | W samochodzie: "Forty percent off, then an extra twenty at the register. That's sixty percent off… right?" |
| 3 | 8–12 s | GEN A / shot 3 | Pauza, deadpan do kamery: "It's not. It's not sixty." |
| 4 | 12–17 s | GEN B | Kanapa, telefon w dłoni (ekran niewidoczny): "My sister sends me this site — you literally type in your exact situation…" spogląda w telefon, parska śmiechem: "…and it just tells you. With the math. Like I'm five." |
| 5 | 17–27 s | INSERT (prawdziwa aplikacja) | Nagranie ekranu: Search box → wpisanie przypadku → klik w wynik z dropdownu → kalkulator z sekcją Practical Use nad polami → wartości wypełniają pola → odpowiedź + objaśnienie na żywo. |
| 6 | 27–33 s | GEN C / shot 1 | Kanapa: "Turns out forty plus another twenty is fifty-two percent off. Not sixty. They're literally counting on you not doing the math." |
| 7 | 33–38 s | GEN C / shot 2 | Wzruszenie ramion, casual: "Anyway. It's free. Justpercent dot com. Okay bye." — macha, sięga ręką do kamery, obraz się urywa. |

---

## PROMPTY NA POSTAĆ — Nano Banana Pro / GPT Image 2

Zanim ruszysz z generacją wideo, przygotuj PAKIET REFERENCYJNY postaci — to on gwarantuje,
że w GEN A/B/C występuje ta sama osoba. Do wideo potrzebujesz:

| Ref | Kadr | Do czego |
|-----|------|----------|
| R1 | selfie en face, samochód (jak GEN A) | główna tożsamość → @Image1 w Seedance |
| R2 | półprofil 3/4, ta sama sceneria | stabilizacja twarzy przy ruchu głowy → @Image2 |
| R3 | plan średni na kanapie (jak GEN B/C) | tożsamość + wnętrze i światło sceny domowej |
| R4 | jak R1, ale szczery śmiech | mimika do shotów z parsknięciem/puentą |

Workflow: wygeneruj R1, a R2–R4 rób jako EDYCJE z R1 podpiętym jako referencja (nie od zera) —
oba modele trzymają wtedy tożsamość znacznie lepiej. Wszystko w 9:16, fotorealizm bez retuszu.

### WSPÓLNY OPIS TOŻSAMOŚCI (wklejaj identycznie w każdym prompcie)

```
An American woman in her late 20s with an average, everyday appearance: light brown hair
loosely pulled back with a plastic claw clip, loose strands framing her face, no makeup,
natural skin texture with visible pores, faint under-eye circles and a couple of small
blemishes, slightly uneven skin tone, friendly slightly tired eyes, subtle natural facial
asymmetry, wearing an oversized heather-gray hoodie.
```

### NANO BANANA PRO

R1 — baza (pełny prompt, język naturalny — ten model woli opis akapitem):

```
A candid vertical 9:16 smartphone selfie photo taken on a front-facing phone camera with
slight wide-angle distortion. [WSPÓLNY OPIS TOŻSAMOŚCI] She sits in the driver's seat of an
ordinary parked car with a shopping bag tossed on the passenger seat, soft overcast daylight
coming through the windshield. Neutral, relaxed expression, looking straight into the lens,
face fully visible and in sharp focus. The photo must look unedited and unpolished: mild
sensor grain, true-to-life muted colors, no retouching, no beauty filter, no studio lighting,
not glamorous, not a professional model. This is a character reference photo for a UGC-style
TikTok video, so her identity must read clearly.
```

R2–R4 — edycje (podepnij R1 jako Image 1):

```
Keep the person's facial features, hair with the claw clip, and gray hoodie exactly the same
as Image 1. Same amateur front-camera smartphone look, vertical 9:16, no retouching.
[R2] Turn her to a left three-quarter view, eyes toward the camera, same car interior and light.
[R3] Now a medium shot: she sits cross-legged on a lived-in couch in a normal apartment, warm
window light from the side, a blanket and a water glass in the background.
[R4] Same framing as Image 1, but she bursts into a genuine unposed laugh, eyes slightly
squinted, natural teeth (slightly imperfect), head tilted a touch back.
```

### GPT IMAGE 2

R1 — baza (ten model lubi strukturę Scene → Subject → Details → Use case → Constraints):

```
Scene: interior of an ordinary parked car in soft overcast daylight, shot from the driver's
seat as a front-facing phone camera selfie, slight wide-angle distortion, shopping bag on the
passenger seat.
Subject: [WSPÓLNY OPIS TOŻSAMOŚCI]
Important details: neutral relaxed expression, looking straight into the lens, face fully
visible and in sharp focus; mild sensor grain; true-to-life muted colors; light bounces
naturally off the windshield.
Use case: character identity reference frame for an AI video generator (UGC-style TikTok),
so facial identity clarity is the priority.
Constraints: vertical 9:16, photorealistic; no retouching, no beauty filter, no studio
lighting, no model-like perfection, no makeup, image must look like an unedited amateur
smartphone photo.
```

R2–R4 — tryb edit (R1 jako input; osobna edycja na każdy kadr):

```
Change: [R2] rotate her to a left three-quarter view, eyes toward the camera. /
[R3] move her to a lived-in couch in a normal apartment, medium shot, cross-legged, warm side
window light, blanket and water glass in the background. /
[R4] same framing, but a genuine unposed laugh, eyes slightly squinted, slightly imperfect
natural teeth.
Keep locked: same face, same natural skin texture with pores and small blemishes, same light
brown hair with the plastic claw clip, same oversized heather-gray hoodie, same amateur
smartphone selfie aesthetic, vertical 9:16, no retouching.
```

### Kontrola jakości pakietu

- Odrzuć każdy wynik, który wygląda "za ładnie": porcelanowa cera, idealna symetria, zęby
  z reklamy, studyjne światło — to zabija wiarygodność całego shorta.
- R1–R4 muszą przedstawiać JEDNĄ osobę bez wątpliwości (porównaj nos, linię szczęki, brwi,
  przedziałek). Jeśli edycja "odpływa", wróć do R1 i powtórz edycję, wzmacniając listę
  "Keep locked" / "exactly the same as Image 1".
- Hoodie, spinka i fryzura identyczne na wszystkich referencjach — Seedance kotwiczy się
  na nich tak samo mocno jak na twarzy.

---

## PROMPTY SEEDANCE 2.0 (EN)

> Ustawienia dla wszystkich generacji: 9:16, 720p, audio ON, duration ~12–15 s.
> Jako @Image1 podaj R1, jako @Image2 — R2 z pakietu referencyjnego (sekcja wyżej).
> Poniższy REF (wariant wideo) to zapasowa droga, gdybyś wolał referencję prosto z Seedance.

### REF — klatka referencyjna postaci (image lub 4 s klip, z niego stopklatka)

```
Candid vertical smartphone selfie photo of an American woman in her late 20s, average
everyday appearance, light brown hair loosely pulled back with a claw clip with loose
strands, no makeup, natural skin texture with visible pores and a few minor blemishes,
slightly tired friendly eyes, wearing an oversized heather-gray hoodie. Sitting in a
parked car, daylight through the windshield, soft natural light. Shot on a front-facing
phone camera, slight wide-angle distortion, mild grain, unpolished amateur look. Neutral
relaxed expression, looking into the lens. Not retouched, not glamorous, not a model.
```

### GEN A — hook + historia (~14 s, 3 shoty)

```
@Image1 is the main character: keep her face, hair, hoodie and overall look exactly
consistent. Vertical 9:16 amateur smartphone selfie video, front camera, handheld with
natural shake, realistic daylight, visible skin texture, unpolished UGC style. She speaks
casual American English directly to the camera with natural lip sync, small pauses and
filler words. Audio: her voice close to the mic, faint parking lot ambience, car door thunk,
no music.

Shot 1: She walks across a strip-mall parking lot holding the phone at arm's length,
slightly out of breath, says: "Okay. So this store almost got me today." Quick glance back
over her shoulder toward the store.

Shot 2: Cut to her sitting in the driver's seat of a parked car, phone propped a bit lower,
shopping bag tossed on the passenger seat. She says: "Forty percent off... then an EXTRA
twenty percent at the register. So that's sixty percent off, right?" She raises her eyebrows.

Shot 3: Same car seat, tighter framing. A two-second deadpan pause, then flat delivery:
"It's not. It's not sixty." Tiny head shake, jump-cut ending.
```

### GEN B — zwrot: telefon, ekran nieczytelny (~10 s, 2 shoty)

```
@Image1 is the main character: same woman, same hoodie, keep her appearance exactly
consistent. Vertical 9:16 handheld smartphone video, UGC style, now indoors on a lived-in
couch, warm window light from the side, a blanket and a water glass in the background,
natural skin texture, no retouching. Casual American English, natural lip sync. Audio:
quiet room tone, soft couch rustle, no music.

Shot 1: Selfie framing, she holds a second phone in her other hand tilted away from the
camera so its screen is never readable — only a faint glow. She says: "So my sister sends
me this website where you just... type in your exact situation."

Shot 2: She glances down at the phone in her hand, huffs a small genuine laugh, looks back
at the camera: "And it just tells you. With the math. Like I'm five. I love it." The phone
screen stays angled away from the lens the entire time, never visible.
```

### GEN C — puenta + miękkie CTA (~12 s, 2 shoty)

```
@Image1 is the main character: same woman, same couch, same hoodie and lighting as before,
appearance exactly consistent. Vertical 9:16 handheld smartphone selfie video, UGC style,
natural window light, visible skin texture, casual American English with natural lip sync.
Audio: room tone only, no music.

Shot 1: She leans slightly toward the camera, half amused, half outraged: "Turns out forty
percent plus ANOTHER twenty is fifty-two percent off. Not sixty. They're literally counting
on you not doing the math." Small disbelieving laugh.

Shot 2: She flops back into the couch cushion, shrugs, totally offhand: "Anyway. It's free.
Justpercent dot com. Okay bye." She gives a lazy two-finger wave and reaches toward the
camera to stop recording; the frame tilts and cuts off mid-motion.
```

### Wskazówki generacyjne

- Generuj każdy klip 3–5 razy i wybieraj take z najbardziej naturalną mimiką; odrzucaj
  ujęcia ze "szklanym" spojrzeniem lub zbyt idealną cerą.
- Jeśli twarz "pływa" między generacjami — dodaj trzecią referencję (@Image3) ze stopklatki
  najlepszego take'a GEN A albo z R3/R4 pakietu referencyjnego.
- W GEN B pilnuj w wynikach, żeby ekran drugiego telefonu nie był czytelny; jeśli model
  uparcie pokazuje ekran, dopisz: "the phone's screen faces away from the camera at all times,
  its display content is never visible".
- Dialogi trzymaj dokładnie w brzmieniu z promptów — liczby (40/20/52/60) muszą zgadzać się
  z insertem z prawdziwej aplikacji.

---

## INSERT EKRANOWY (nie-Seedance)

Segment 17–27 s to nagranie ekranu prawdziwej aplikacji (mobile viewport, en-US):
1. Strona główna → Search box → wpisanie frazy odpowiadającej fabule (podwójny rabat).
2. Klik w pozycję dropdownu → pełne doscrollowanie do kalkulatora (sekcja wybranego
   Practical Use nad polami formularza, kalkulator w całości w kadrze).
3. Wartości wypełniają pola → odpowiedź i objaśnienie aktualizują się na żywo.
Przed każdym przechwyceniem odczekaj na pełną stabilizację strony (koniec scrollowania
i animacji, załadowane fonty i obrazy) + zapas 5 s.
Opcjonalnie: na czas insertu nałóż wycinek głowy bohaterki (z GEN B) w rogu — natywny
tiktokowy "green screen effect".
