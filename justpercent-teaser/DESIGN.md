# Design System — JustPercent

## Overview

JustPercent is a dark, glassy utility surface for instant percentage math. The personality is calm, technical, and premium — like a calculator app reimagined as a cosmic dashboard. The page lives in a near-black field washed with violet/indigo ambient gradients; calculator panels are frosted-glass cards with rounded corners and inset highlights. Typography is precise: a humanist sans (IBM Plex) for UI, a geometric sans (Space Grotesk) for display, and a mono (JetBrains Mono) for numerical readouts. The result feels both quietly utilitarian and quietly futuristic.

## Colors

- **Surface Void**: `#030712` — primary near-black page background
- **Surface Indigo**: `#1E1B4B` — deep indigo for radial gradient washes
- **Surface Plum**: `#3B0764` — deep purple gradient anchor
- **Surface Wine**: `#4A044E` — violet gradient anchor (warm-leaning)
- **Accent Purple**: `#7C3AED` — primary purple, used on answer fields and key CTAs
- **Accent Blue**: `#1863DC` — secondary blue, used for links and consent CTAs
- **Accent Sky**: `#93C5FD` — soft halo blue for highlights
- **Glass Fill**: `rgba(255, 255, 255, 0.15)` — frosted panel background
- **Glass Border**: `rgba(255, 255, 255, 0.25)` — frosted panel hairline
- **Text Primary**: `#FFFFFF` — body and headings
- **Text Quiet**: `#94A3B8` — secondary labels (`Pick a Calculator`)
- **Text Dim**: `#9CA3AF` — captions, hints

## Typography

- **Display**: Space Grotesk (300 light, 700 bold). H1 hero copy at 300 with `-0.025em` tracking; section headers at 700. Calm modern geometric feel.
- **UI / Body**: IBM Plex Sans (300, 400, 500, 600, 700). All button labels, paragraphs, navigation. Sizes 14-20px in the UI; for video bump to 28-60px.
- **Numerical**: JetBrains Mono (400). Reserved for raw numbers in answer fields. Tabular by nature — use with `font-variant-numeric: tabular-nums`.
- **Sizing for video** (1080×1920 portrait): Hero number 360-440px, headline 96-120px, body 40-52px, label 28-32px.

## Elevation

Depth comes from glassmorphism, not drop shadows. Calculator cards use `backdrop-filter: blur(20px)` over translucent white at 15% opacity, framed by a 1px hairline at white/25%, with a faint inner top highlight (`inset 0 1px 0 rgba(255,255,255,0.2)`) and a soft outer shadow (`0 8px 32px rgba(0,0,0,0.4)`). Ambient depth is built with large radial gradients of purple/indigo/sky-blue placed off-canvas, blurring across the void. Border-radius: 8px for cards, 2px for inline pills. No high-contrast box shadows; everything floats.

## Components

- **Glass Calculator Card**: Rounded 8px frosted panel, blur 20px, white/15 fill, white/25 hairline, hosts an `Equation` row with editable number chips and a result chip.
- **Answer Chip (Purple Field)**: Pill-shaped purple `#7C3AED` field with white mono text — the "answer you are looking for" callout.
- **Number Input Chip**: Black/30 rounded rectangle with mono number, slim white/20 border. Inline within equation row.
- **Practical-Use Card**: Square thumbnail (lifestyle .webp) above a one-line CTA chip; arranged in a 2-col bento grid above the calculator wall.
- **CTA Chip**: Compact purple-to-violet gradient pill ("Apply My Coupon", "See My New Pay"), white text, slight inner highlight.
- **Logo Mark**: Stylized purple `%` symbol on dark — the brand glyph.
- **Ambient Aurora**: Background built from 3-4 large blurred radial gradients in `#3B0764`, `#1E1B4B`, `#1863DC` and `#7C3AED` panning slowly across the void.

## Do's and Don'ts

### Do's

- Anchor every scene in deep `#030712` and layer purple/indigo radial gradients on top.
- Use JetBrains Mono with tabular numerals for any literal number on screen.
- Frame readouts in a purple `#7C3AED` pill — it is the brand's "the answer is here" signifier.
- Keep motion smooth and quiet: ease-out for entrances, slow drifting ambient layers behind.
- Use frosted glass with hairline borders, not heavy drop shadows.

### Don'ts

- No bright/light backgrounds — the page must remain in the dark cosmic field.
- No pure neon saturation — purples stay rich but muted (`#7C3AED`, not `#A855F7` electric).
- No drop-shadowed flat cards — every elevated surface must read as glass.
- No serif or display fonts beyond Space Grotesk; no Roboto / Inter / Helvetica.
- No fast snappy bounces — motion is calm, easing power2/power3, not back/elastic at scene level.
