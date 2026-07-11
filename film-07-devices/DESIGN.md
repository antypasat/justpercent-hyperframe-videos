# Design System — Film 07 „Devices" (Just Percent)

Device-showcase spot: kinetic typography + CSS-drawn 3D devices + real UI recordings
mounted on device screens. Dark, technical, confident. The devices are the actors;
the type is the voiceover; emerald is always and only "the result".

## Canvas

- 1080 × 1920 (9:16), 36 s, 30 fps preview / 60 fps final.
- Safe zones: top ~220 px and bottom ~320 px free of key content (TikTok/Shorts UI).
  Key text and device screens live inside y ≈ 220–1600.

## Colors

- **Base Void**: `#0b1220` — page background (family: `#0f172a` panels, `#050a14` deep)
- **Screen Off**: `#0a0f1a` — device screens before/after recordings
- **Primary Sky**: `#0ea5e9` — primary accent, glows, periods, underlines
- **Brand Purple**: `#a855f7` — brand moments, "situation" emphasis, end-card glow
- **Result Emerald**: `#10b981` — RESULT/emphasis ONLY ("Live.", "30%", progress). Green = answer, never decoration.
- **Accent Amber**: `#f59e0b` — small sharp accents (rules, one period), never large fills
- **Text Primary**: `#f8fafc`
- **Text Quiet**: `#94a3b8` — labels, metadata, placeholder text
- **Device Frame**: `#1e293b` body / `#334155` edge highlight / `#0f172a` bezel

## Typography

- **Display / headlines**: Space Grotesk 700 (500 for sub-lines). Tracking −0.03em at display sizes.
- **Body / callout chips**: IBM Plex Sans 400/600.
- **Numbers + metadata**: JetBrains Mono 500/700. ALWAYS `font-variant-numeric: tabular-nums`.
- Video sizes: hook lines 100–120px, kinetic words 90–100px, headlines 68–90px,
  chips 34–40px, metadata 20–24px. Nothing below 20px.

## Depth & Texture

- Background = layered radial glows (sky top-left, purple bottom-right, emerald only
  during the result beat, amber hint in the duo beat) + oversized ghost "%" glyph
  (Space Grotesk, ~6% opacity) + faint dot grid + static grain + vignette.
- Devices are drawn in CSS: solid fills, 2px edge highlights, inset bezels.
  Screen glass = 1px inner ring + diagonal reflection streak at ≤8% opacity.
- Motion: entrances `.out` eases (expo/power4/back), transitions velocity-matched
  (accelerating exit + blur ↔ decelerating entry), device pose moves power2/power3.inOut.
  Device rotation angles moderate: |rotationY| ≤ 25° whenever a recording is on screen.

## Beat Grid (music sync)

Assumed 120 BPM (beat = 0.5 s). Hard sync points: **2 s, 8 s, 18 s, 28 s, 33 s**.
Typing in the iPhone recording must land on the 10 s beat. Word pulses ride the
0.5 s grid (scale 1.00→1.045, decay 0.38 s). When the Suno track arrives, replace
the grid pulses with pre-extracted `audio-data.json` (see STORYBOARD.md §Music).

## What NOT to Do

- **No full-screen linear gradients** — H.264 banding. Radial glows + solid base only.
- **No stock glow-blobs / lens flares / particle confetti / equalizer bars.**
- **Numbers always `tabular-nums`**, always JetBrains Mono.
- No emerald for anything that is not a result/answer.
- No pure-white flashes, no strobing.
- No App Store / Google Play badges — it's a web app. End card = logo + domain.
- No banned ad-copy words (guaranteed, always, #1, best, financial advice, …) —
  allowed: free, no sign-up, instant, live.
- Don't animate the future `<video>` elements' geometry — all device motion lives on
  the wrapper + mirrored slot transforms (see STORYBOARD.md §Architecture).
