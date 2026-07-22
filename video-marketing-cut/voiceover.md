# Voiceover — Just Percent, marketing cut v3 (31.7 s)

Silnik: **ElevenLabs v3** (`eleven_v3`). Jeden prompt = jedna linia lektora,
generowana osobno, potem układana na osi filmu wg offsetów poniżej.

## Uczciwa narracja (v3)

Produkt **nie** autouzupełnia Twoich liczb. Kalkulatory otwierają się z
**przykładem** (wartości domyślne / z ostatniego obliczenia); to Ty wpisujesz
własne dane, a wynik przelicza się na żywo na każdym znaku — bez „Enter"/submitu.
Ten cut pokazuje właśnie to: **hook (realne pytanie, policzone) → wpisywanie na
żywo (przykład → Twoje liczby) → CTA**. Wycięto wcześniejsze sceny sugerujące
„Twoje liczby same się pojawiają" (search-prefill, kupon $80, tax $108).

## Ustawienia (energetyczny spot produktowy)

| Parametr | Wartość |
| --- | --- |
| Model | `eleven_v3` |
| Voice | domyślny expressive konta, ID `cgSgspJ2msm6clMCkdW9` (wybór po nazwie był w sesji niedostępny — uszkodzony moduł MCP) |
| Stability | 0.4 · Similarity 0.75 · Style 0.5 |

**Montaż audio:** take'i grane w całości — bez kompresji pauz i bez tempo-stretchu
(to powodowało kliki i gubione sylaby). Obróbka = tylko łagodny trym ciszy na
brzegach (−45 dB) + miękkie fade'y. Gdzie mowa nie mieściła się w scenie —
wydłużono FILM i rozsunięto okna, nie przycinano głosu. Finalny miks:
`audio/voiceover.mp3` (31.7 s, loudnorm −16 LUFS), podpięty do playera
(`index.html`; `?mute` wyłącza lektora).

---

## S1 · Hook — realne pytanie, policzone (0.0–6.2)

**V1** · start 0.25 · podpis: "A 10% tip on a $150 bill?"
```
[curious] A ten percent tip on a one-fifty bill?
```

**V2** · start 3.50 · podpis: "$15 — worked out." *(emphasis)*
```
[warm] Fifteen bucks — worked out for you.
```

## S2 · Wpisywanie na żywo — przykład → Twoje liczby (6.2–24.8)

**V3** · start 6.70 · podpis: "It opens with an example — 240 + 15%."
```
[warm] It starts with an example — two-forty plus fifteen percent.
```

**V4** · start 12.20 · podpis: "Type your own — live on every keystroke."
```
[excited] Type your own — live, on every keystroke.
```

**V5** · start 16.50 · podpis: "Now the boost: 25%."
```
[playful] Now the boost — twenty-five percent.
```

**V6** · start 19.50 · podpis: "No Enter. No submit. 6,250 — live." *(emphasis)*
```
[excited] No Enter. No submit. Six thousand two-fifty — live!
```

## S3 · CTA (24.8–31.7)

**V7** · start 25.50 · podpis: "Every percentage — answered." *(emphasis)*
```
[confident] Every percentage — answered.
```

**V8** · start 28.60 · podpis: "Free at justpercent.com"
```
[warm] Free — at just-percent-dot-com.
```

---

Pliki: surowe take'i (`L01/V2/V3/V4/L14/L15/L16/L17` .mp3), czyste wersje
`*c.wav`, miks `voiceover.mp3`. Podmiana głosu = regeneracja tych 8 linii i
ponowny remix tym samym pipeline'em (offsety globalne jak wyżej). Starsze,
niewykorzystane take'i (L02–L13 z wersji prefill) pozostają w `audio/` jako
materiał źródłowy.
