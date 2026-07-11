# Call-Out Title Overlay Design

## Style Prompt

Flat 2D aerial-video overlay with animated white call-out titles tracking a moving object. The graphic language is monochrome, technical, crisp, and editorial: thin vector leaders, outlined target dots, open geometric frames, masked typography, and smooth cubic easing.

## Colors

- `#FFFFFF` — primary type and strokes
- `rgba(255,255,255,0.88)` — secondary type
- `rgba(255,255,255,0.72)` — inactive guide strokes
- `rgba(8,10,9,1)` — deep background shade
- `rgba(131,123,95,1)` — muted aerial texture

## Typography

- Primary: Montserrat, Proxima Nova, Avenir Next, system sans-serif
- Bold uppercase names with wide tracking contrast against smaller regular descriptors

## Motion

- Smooth cubic motion using `power3.out`, `expo.out`, and `circ.out`
- Line work reveals through trim-path style stroke drawing and transform masks
- Text reveals from clipping masks, never hard appearing

## What NOT to Do

- No saturated accent colors in the overlay graphics
- No 3D depth, blur-heavy lens effects, or soft bokeh decoration
- No random or time-derived visual logic
- No stock UI cards or rounded panels
