# Just Percent — Marketing Cut

Krótki (~31.7 s) film reklamowy justpercent.com (HyperFrames / Cursor Journey),
zmontowany ze scen `video-technique--cursor-journey`. W pełni offline —
otwórz `index.html` przez `file://`. Lektor: ElevenLabs v3 (`audio/voiceover.mp3`).

Narracja (v3, uczciwa): produkt nie autouzupełnia Twoich liczb — kalkulatory
otwierają się z przykładem, a Ty wpisujesz swoje dane i widzisz wynik na żywo
(bez submitu). Film: hook (realne pytanie, policzone) → wpisywanie na żywo
(przykład → Twoje liczby → 6 250) → CTA.

| Plik | Rola |
| --- | --- |
| `index.html` | Deterministyczny player master-clock (jeden globalny zegar na cały film) |
| `film.js` | Źródło prawdy: 6 scen + plansza CTA, podpisy, typowanie, kamera |
| `voiceover.md` | Skrypt lektorski ElevenLabs v3 (17 linii, 1:1 z podpisami, okna czasowe) |
| `audio/voiceover.mp3` | Wygenerowany lektor (eleven_v3), zmiksowany do osi filmu; grany przez player (`?mute` wyłącza) |
| `audio/L01–L17*` | Pojedyncze take'i (mp3 surowe, wav po obróbce) |
| `REPORT.md` | Raport montażowy: kolejność scen, mapa dedupe, lista zmian |
| `qa-frames.mjs` | Stille QA kluczowych momentów (`node qa-frames.mjs`) |
| `assets/` | Tylko potrzebne stany @2x (w tym 2 naprawione klatki typowania `*-fixed.png`) |
| `fonts/` | Lokalne woff2 |

Sterowanie: `Space` pauza, `R` restart, `?t=<ms>` seek, `?stop=<ms>` stop-klatka,
`window.__filmSeek(sekundy)` — deterministyczny seek QA.
