# Vision

## The problem

The "Fourier series draws a shape with spinning circles" idea is one of the
most beautiful demos in visual math — popularized by 3Blue1Brown's video on
the topic — but almost every implementation online is a fixed demo: it
retraces a hardcoded drawing of Homer Simpson, or a pre-baked SVG path. You
watch someone else's shape. There's no version where the shape is *yours*,
computed live, and something you can tune and take with you.

## Who it's for

People who enjoyed the 3Blue1Brown-style epicycle explainer and want to play
with the idea hands-on — students building intuition for Fourier series,
generative-art tinkerers, and anyone who wants to draw their name or a doodle
and watch the math retrace it, then save the result.

## The core idea

Any closed 2D path can be treated as a function of a complex number over
time (`x + iy`). Sampling that path at N evenly spaced points and taking its
discrete Fourier transform decomposes it into N rotating vectors (epicycles)
of different frequency, amplitude, and phase. Summed together and animated,
the tip of the last vector in the chain retraces the original path exactly.
Epicycle:

1. Captures a freehand stroke as a series of points.
2. Resamples it to N evenly spaced points (arc-length parameterization).
3. Computes the discrete Fourier transform of those points.
4. Renders the resulting frequencies as a chain of nested, rotating circles
   whose combined tip retraces the drawing in real time.

## Key design decisions

- **Direct DFT, not FFT.** At the point counts a hand-drawn stroke needs
  (order of 100–300 points), an O(N²) direct DFT computes in well under a
  frame budget and keeps the implementation simple and easy to verify
  (see `site/fourier.js` and its round-trip tests). Revisit only if profiling
  in the browser shows it's a bottleneck.
- **No framework, no bundler.** The whole app is plain ES modules served as
  static files. This keeps `site/` genuinely self-contained and trivially
  deployable to a static host or subpath — no build step to keep in sync.
- **The core math lives in `site/`, not a separate `src/`.** Modules under
  `site/` are both the deployed app *and* what the Node test suite imports
  directly, so there is exactly one copy of the logic and no risk of the
  deployed code drifting from what's tested.
- **Draw first, configure second.** The freehand-to-retrace loop (epic 1) is
  the entire wow moment and ships before circle-count tuning, playback
  controls, or export — those all build on top of a working core loop.

## What "v1 done" looks like

- Drawing on the canvas (mouse or touch) produces an epicycle retrace of
  that exact shape within about two seconds of finishing the stroke.
- The circle chain itself is visible and rendered — not just the traced
  line — with a slider to control how many circles (how much fidelity) are
  used.
- Playback can be paused, sped up or slowed down, and looped.
- The result can be exported as a video file and as a still PNG.
- The page matches `docs/DESIGN.md`'s direction, feels responsive and alive
  (juice: motion, sound, celebration), and works cleanly at phone, tablet,
  and desktop widths.
