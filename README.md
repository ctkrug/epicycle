# Epicycle

**▶ Live demo — [apps.charliekrug.com/epicycle](https://apps.charliekrug.com/epicycle/)**

[![CI](https://github.com/ctkrug/epicycle/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/epicycle/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-informational.svg)](LICENSE)

Draw anything, watch spinning circles retrace it.

Epicycle takes a shape you draw with your mouse or finger, treats it as a path
of complex numbers, and computes its discrete Fourier transform. The resulting
frequencies become a chain of nested, rotating circles (epicycles) whose
combined tip retraces your drawing stroke for stroke. It is the "spinning
circles draw a picture" idea popularized by 3Blue1Brown, made hands-on: it is
*your* shape, computed live, not a canned demo.

## Who it's for

Anyone who watched a Fourier-epicycle explainer and wanted to try it on their
own drawing instead of watching it retrace a hardcoded Homer Simpson. Students
building intuition for Fourier series, generative-art tinkerers, and people who
just want to scribble their name and watch the math rebuild it.

## The wow moment

Scribble your name. A swarm of nested spinning circles springs up and redraws
it, one stroke at a time. Then drag the Circles slider down and watch the trace
melt into a loose, wobbly approximation, or up for a crisp one.

## Features

- **Freehand capture**: mouse and touch, unified through Pointer Events, with
  an instant epicycle retrace of the shape you drew.
- **A visible circle chain**: the actual nested rotating circles, not just the
  traced dot, with a toggle to show or hide them.
- **A circle-count slider**: trade fidelity for simplicity by using fewer
  harmonics.
- **Playback controls**: play, pause, speed from 0.25x to 3x, and restart.
- **Export**: save a PNG of the current frame, or a WebM video covering one
  full retrace loop.
- **Preset shapes**: star, heart, and infinity for people who don't want to
  draw.
- **Synthesized sound**: WebAudio feedback (no audio files) with a mute toggle
  that persists across reloads.
- **Restores your last shape**: the last drawing or preset is saved locally and
  comes back on reload.

## Try it

Open the [live demo](https://apps.charliekrug.com/epicycle/) and draw on the
canvas. No login, no upload; the drawing and the math both run in your browser.

## Running locally

Epicycle is a static site with no build step. The `site/` directory is the whole
app.

```sh
npm install
npm run dev            # serves site/ locally
npm test               # runs the unit + property-based tests
npm run test:coverage  # same, and fails below an 85% line/branch/function floor
npm run lint           # lints the source
```

## How it works

1. Capture the freehand stroke as a series of points.
2. Resample it to a fixed count of evenly spaced points (arc-length
   parameterization).
3. Compute the discrete Fourier transform of those points.
4. Render the frequencies as a chain of nested rotating circles whose combined
   tip retraces the drawing in real time.

The math is a direct O(N²) DFT rather than an FFT: at the point counts a
hand-drawn stroke needs (order of 100 points) it runs well under a frame budget
and stays easy to verify against its round-trip tests. See
[`docs/VISION.md`](docs/VISION.md) for the rationale,
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the modules fit together,
and [`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## Stack

Plain JavaScript and the Canvas 2D API. No framework, no bundler. Every module
under `site/` is both the deployed app and what the Node test suite imports, so
there is one copy of the logic and nothing to keep in sync.

## License

MIT, see [`LICENSE`](LICENSE).

---

More of Charlie's projects → [apps.charliekrug.com](https://apps.charliekrug.com)
</content>
