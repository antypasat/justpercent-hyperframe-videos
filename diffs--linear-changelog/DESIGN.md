## Style Prompt

A cinematic dark-mode code review interface captured through a macro probe lens. The composition should feel like a floating Linear-style product screen in black 3D space: shallow depth of field, edge blur, subtle bokeh, precise code-review UI, and AI-assisted refactoring moments that feel premium, focused, and technical.

## Colors

- `#09090B` - void background and fade-to-black base
- `#121212` - screen surface
- `#18181B` - UI panels and active states
- `#5E43CE` - primary AI/action accent
- `#2DA44E` - approval and passing checks
- `#CF222E` - failure and requested-change status
- `#3E1A1E` - deletion diff background
- `#1A3B22` - addition diff background
- `#EDEDED` - primary text
- `#A1A1AA` - secondary text

## Typography

- Interface text: `Inter`, geometric sans, with restrained weights from 350 to 700.
- Code text: `JetBrains Mono`, tabular and ligature-free, for Swift/Kotlin snippets.

## Motion

- Macro camera drift in 3D space with focus pulls and edge blur.
- Major state changes use fast cinematic cuts expressed as focus/zoom transitions.
- UI elements enter with varied `gsap.from()` tweens and spring-like easing.
- AI prompt uses sequential typing, shimmer, and a finite blinking cursor.

## What NOT to Do

- Do not use bright blue default SaaS styling or generic neon gradients.
- Do not flatten the interface into a normal web dashboard; keep lens depth and focus falloff.
- Do not use jump cuts between scenes; use focus/zoom/crossfade transitions.
- Do not introduce external media, network fetches, random values, or nondeterministic timing.
