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
- **main.js** — DOM wiring only: pointer events, control-rail elements,
  the render loop. Not unit tested (no DOM in the Node test runner);
  kept thin so the pipeline modules it calls carry the test coverage.

## Rendering

`main.js` resizes the canvas backing store to `devicePixelRatio` ×
its CSS size and translates to the canvas midpoint before every draw.
Each frame: `chainPositions` gives the circle chain (drawn if the
"show circle chain" toggle is on), the tip point is pushed onto a
trail array (drawn as a polyline, cleared when a loop completes), and
the tip itself is drawn as a glowing dot. Circle-count slider changes
re-slice the same `fullCoefficients` array — no recomputation needed.

## Persistence

`localStorage` holds two independent keys: the last selected shape's
raw points (`epicycle:last-shape`) and the mute preference
(`epicycle:muted`). Both reads are wrapped in feature detection +
try/catch so private browsing or a full quota degrades to "nothing
restored" rather than throwing.

## Running & testing

```sh
npm install
npm run dev    # serves site/ locally (npx serve)
npm test       # node --test test/ — pure-logic modules only
npm run lint   # eslint .
```

Every module except `main.js` is pure/DOM-free and covered by
`test/*.test.js`. `main.js` is verified manually (or via a Playwright
driver) rather than unit tested, since it's wiring, not logic.
