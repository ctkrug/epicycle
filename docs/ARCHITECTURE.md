# Architecture

Plain ES modules under `site/`, no framework, no bundler, no build step.
`site/` is both the deployed static app and what the Node test suite
imports directly — one copy of the logic, nothing to keep in sync.

## Data flow

```
pointer events / preset click
        │
        ▼
  stroke.js (throttled point recording)
        │  points: [{x, y}, ...]
        ▼
  resample.js (arc-length resample to a fixed point count)
        │
        ▼
  fourier.js (direct O(N²) DFT → coefficients sorted by amplitude)
        │  [{freq, amp, phase}, ...]
        ▼
  epicycles.js (chainPositions(coefficients, t) each animation frame)
        │  cumulative circle-center positions, tip = last one
        ▼
  main.js render loop (draws circle chain, trail, tip; rAF-driven)
```

`animation.js` owns the pure "what should `t` be this frame" logic
(play/pause, speed, loop-wrap detection) independent of rAF, so it's
unit tested without a DOM.

## Modules (`site/`)

- **complex.js** — complex-number arithmetic primitives.
- **resample.js** — arc-length resampling of an arbitrary polyline to N
  evenly spaced points.
- **fourier.js** — `dft(points)`: the discrete Fourier transform of a
  path, returned as `{freq, amp, phase}` coefficients sorted by
  descending amplitude (largest circle drawn first).
- **epicycles.js** — `chainPositions(coefficients, t)` returns every
  circle's cumulative center for one frame (index 0 is the origin, the
  last entry is the retrace tip). `reconstructAt`/`tracePath` are thin
  wrappers for a single point / a full static path.
- **animation.js** — `advanceAnimation(state, dt)`: pure time-step
  function for play/pause, speed, and loop-wrap detection.
- **stroke.js** — `createStrokeRecorder()`: begin/add/end state machine
  for a freehand stroke, throttling points closer than a minimum
  distance apart.
- **coordinates.js** — converts a client-space pointer position into
  canvas-centered coordinates (matching the origin the renderer
  translates to each frame).
- **validation.js** — `isDrawablePath(points)`: guards the pipeline
  against strokes with fewer than 3 distinct points.
- **presets.js** — parametric/vertex point generators (star, heart,
  infinity) that feed the same resample → DFT pipeline as a hand-drawn
  stroke.
- **shapePersistence.js** — save/load the last-selected shape via
  `localStorage`, feature-detected and try/catch-guarded.
- **audio.js** — `createSoundEngine()`: WebAudio-synthesized SFX
  (oscillator + gain envelope, no audio files), with a persisted mute
  preference. The `AudioContext` is created lazily on the first sound
  call, which only ever happens from a user gesture.
- **wordmarkPath.js** — `eGlyphPath()`: a single-stroke "E" path fed
  through the same resample → DFT pipeline to animate the header
  wordmark glyph. The glyph canvas is `aria-hidden` (it's decorative),
  so `index.html` carries a visually hidden `E` text node alongside it —
  without that, the header's accessible name is "picycle", missing the
  letter the animation stands in for.
- **videoExport.js** — `pickSupportedMimeType`/`videoFilename`: the pure
  codec-negotiation and filename logic behind the "Export video" button,
  isolated from the `MediaRecorder`/`canvas.captureStream` DOM wiring so
  it stays unit tested.
- **main.js** — DOM wiring only: pointer events, control-rail elements,
  the render loop, and the `MediaRecorder` video-export flow. Not unit
  tested (no DOM in the Node test runner); kept thin so the pipeline
  modules it calls carry the test coverage.

## Rendering

`main.js` resizes the canvas backing store to `devicePixelRatio` ×
its CSS size and translates to the canvas midpoint before every draw.
Each frame: `chainPositions` gives the circle chain (drawn if the
"show circle chain" toggle is on), the tip point is pushed onto a
trail array (drawn as a polyline, cleared when a loop completes), and
the tip itself is drawn as a glowing dot. Circle-count slider changes
re-slice the same `fullCoefficients` array — no recomputation needed.

`devicePixelRatio` is re-read inside the `resize()` handler on every
call (both the main canvas and the wordmark glyph canvas), not cached
once at startup — dragging the window to a monitor with a different
pixel density fires the same `resize` event, and a stale dpr would
leave the canvas at the wrong backing-store scale until a full reload.
`prefersReducedMotion` is similarly a live `let` updated via the media
query's `change` event rather than a load-time snapshot, so toggling
the OS/browser setting mid-session takes effect on the next frame.

### Performance

The canvas's CSS-pixel size is cached on resize rather than read via
`getBoundingClientRect()` every frame — calling that inside the render
loop forces a synchronous layout reflow 60 times a second. `drawChain`
batches every circle outline and radius line (up to ~120 at the full
coefficient count) into a single path and one `stroke()` call instead
of one `beginPath()`/`stroke()` pair per segment, since they all share
the same style. Both were verified with a Playwright rAF-counting
harness against a blank-page baseline before/after.

### Video export

"Export video" calls `canvas.captureStream(60)` and feeds it to a
`MediaRecorder` (codec chosen by `videoExport.pickSupportedMimeType`,
feature-detected — the button stays disabled if unsupported). Recording
starts on click and stops on the *second* loop-completion event seen
afterward, so the clip always covers at least one full retrace loop
regardless of where in the loop the user clicked. While recording,
`main.js` disables play/pause/restart and locks out drawing a new
stroke or selecting a preset (both would swap out the coefficients and
reset animation state out from under the active recorder — if the
animation were also paused mid-recording, it would then wait forever
for a loop that will never arrive). The `MediaStreamTrack`s are stopped
explicitly once the recorder stops, rather than left for GC, so the
capture doesn't keep mirroring canvas paints after the export finishes.

## Theming

The design (`docs/DESIGN.md`) is dark-only by choice, so `:root` sets
`color-scheme: dark` — without it browsers fall back to light UA chrome
for anything they theme themselves (notably the scrollbar) wherever the
layout scrolls, which the phone breakpoint reliably does. `index.html`
sets a matching `theme-color` meta tag so mobile browsers paint their
own address-bar chrome with the brand's background rather than their
default, keeping the edge-to-edge gradient feel outside the page too.

## Persistence

`localStorage` holds two independent keys: the last selected shape's
raw points (`epicycle:last-shape`) and the mute preference
(`epicycle:muted`). Both reads are wrapped in feature detection +
try/catch so private browsing or a full quota degrades to "nothing
restored" rather than throwing.

## Running & testing

```sh
npm install
npm run dev            # serves site/ locally (npx serve)
npm test               # node --test test/ — pure-logic modules only
npm run test:coverage  # same, via c8, with a line/branch report
npm run lint            # eslint .  
```

Every module except `main.js` is pure/DOM-free and covered by
`test/*.test.js`, including `*.property.test.js` files that use
`fast-check` to generate random paths/animation states for the DFT
round-trip and resample/animation invariants rather than only hand-picked
examples. `main.js` is verified manually (or via a Playwright driver)
rather than unit tested, since it's wiring, not logic.

### A note on mutation testing `resample.js`

Flipping the segment-advance loop's `<` to `<=` in
`segmentStart + segmentLengths[segmentIndex] < target` survives the full
suite untouched — this is a genuine equivalent mutant, not a coverage
gap. Segment `i`'s endpoint and segment `i+1`'s start are the same input
point by construction, so resolving a boundary-exact `target` against
either segment yields the same coordinate; 20,000 randomized trials
comparing both branches produced zero differing outputs. Don't chase a
test to kill this one.
