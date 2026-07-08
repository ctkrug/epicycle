# Design direction

## 1. Aesthetic direction

**Epicycle is a vapor-gradient orbital observatory.** The page reads like a
dusk-to-night sky watched through a retro-futurist instrument: a deep violet
gradient falling into near-black indigo, with neon circle traces glowing
against it like orbital rings caught in a long-exposure photograph. It leans
into the subject matter — circles, rotation, orbits — rather than the usual
dark-gray-cards-plus-accent template. Distinct from this portfolio's recent
runs of ink/paper and blueprint themes: no monochrome, no graph-paper grid,
no sepia.

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--bg-top` | `#2d1b4e` | Gradient sky, top |
| `--bg-bottom` | `#0a0518` | Gradient sky, bottom |
| `--surface-1` | `#1c1030` | Panels, cards |
| `--surface-2` | `#2a1a45` | Raised panels, inputs |
| `--text` | `#f5ecff` | Primary text |
| `--text-muted` | `#a996c9` | Secondary text, labels |
| `--accent` | `#ff3ea5` | Primary — drawn stroke, primary buttons, wordmark glyph |
| `--accent-support` | `#38e8ff` | Secondary — traced retrace path, links |
| `--success` | `#4ade80` | Export complete, positive states |
| `--danger` | `#ff5470` | Errors, destructive actions |

**Type pairing:** `Orbitron` (display — wordmark, headings; geometric and a
little sci-fi, echoes orbital motion) + `Inter` (UI — body copy, controls,
labels; stays legible at small sizes). Both from Google Fonts with system
sans-serif fallback.

**Spacing:** 8px scale — 8 / 16 / 24 / 32 / 48 / 64.

**Corner radius:** 12px for cards and buttons; 999px (pill) for toggles and
sliders' thumb.

**Shadow / glow:** layered neon glow via `box-shadow`, e.g.
`0 0 24px rgba(255, 62, 165, 0.35)` on the active drawing stroke and primary
buttons; soft ambient shadow (`0 8px 24px rgba(0,0,0,0.4)`) under raised
panels for depth against the gradient sky.

**Motion:** UI transitions 160ms ease-out; game/toy feedback (stroke ticks,
circle-snap pulses) 80–120ms ease-out. The epicycle animation itself runs
continuously and is not subject to these durations.

## 3. Layout intent

The hero is the canvas — the drawing surface and the epicycle chain that
retraces it. At 1440×900 desktop, the canvas occupies the left ~65% of the
viewport at close to full height, with a slim control rail (circle count,
speed, export, mute) docked on the right ~35%, floating on a `--surface-1`
panel with the glow treatment. A compact header holds the wordmark and
nothing else — no marketing chrome above the fold.

At 390×844 phone, the canvas stacks first and fills ~60vh of the viewport;
the control rail collapses to a horizontal scrollable strip beneath it.
Nothing sits unused — the sky gradient extends edge-to-edge behind both.

## 4. Signature detail

The wordmark's "E" is a live miniature epicycle chain: a tiny two-circle
system continuously retraces the letterform in the header, looping every few
seconds. It's the same engine that powers the whole app, shrunk down to
prove the point before you've drawn anything.

## 5. Juice plan (toy feedback)

- **Movement:** the drawn stroke follows the pointer with zero perceptible
  lag; the retrace animation advances via `requestAnimationFrame`, never a
  stepped/teleporting update.
- **Impact feedback:** when the DFT finishes computing (typically <200ms),
  the circle chain fades and scales in with a soft 100ms pulse rather than
  popping in instantly.
- **Goal/success feedback:** each time the retrace completes one full loop,
  the traced line flashes a brief brighter pulse of `--accent-support`.
- **Win celebration:** exporting an animation shows a completion overlay —
  file size, loop count, a "Save another" CTA — with a short particle burst
  in `--accent`/`--accent-support`, suppressed under `prefers-reduced-motion`.
- **Synth SFX (WebAudio, generated in code, no audio files):**
  - `draw-start` / `draw-end` — a soft short blip (sine, ~880Hz, 40ms) when
    a stroke begins and ends.
  - `compute` — a quick rising swell (sawtooth sweep, ~150ms) while the DFT
    and circle chain are being built.
  - `loop-complete` — a soft two-note chime when the retrace finishes one
    full revolution.
  - `export` — a short camera-shutter-like click (filtered noise burst).
  - All SFX are low-volume and rate-throttled; a mute toggle persists in
    `localStorage` and the `AudioContext` is created lazily on first user
    gesture, guarded for environments where it's unavailable.
