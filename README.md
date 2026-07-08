# Epicycle

[![CI](https://github.com/ctkrug/epicycle/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/epicycle/actions/workflows/ci.yml)

Draw any shape with your mouse and watch a chain of spinning circles — a Fourier
series — magically retrace it, then export the animation.

## What it is

Epicycle takes a freehand stroke, treats it as a path of complex numbers, and
computes its discrete Fourier transform. The resulting frequencies become a
chain of nested, rotating circles (epicycles) whose combined tip retraces your
drawing stroke-for-stroke — the same idea popularized by 3Blue1Brown, made
hands-on: it's *your* shape, not a canned demo.

## The wow moment

Scribble your name. A swarm of nested spinning circles instantly springs up
and redraws it, one stroke at a time.

## Planned features

- Freehand drawing capture (mouse + touch) with instant epicycle retrace
- A visible chain of nested, rotating circles — not just the traced dot
- A circle-count slider to trade fidelity for simplicity
- Playback controls: play/pause, speed, loop/restart
- Export the animation as a video file, or a PNG snapshot
- A handful of preset shapes for people who don't want to draw
- Synthesized sound feedback and a persisted mute toggle

See [`docs/VISION.md`](docs/VISION.md) for the full design rationale and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## Stack

Plain JavaScript and the Canvas 2D API — no framework, no bundler. The whole
app is a static site: open `site/index.html` through a local server (or
deploy the `site/` directory as-is) and it runs.

## Running locally

```sh
npm install
npm run dev    # serves site/ locally
npm test       # runs the unit tests for the Fourier math
npm run lint   # lints the source
```

## License

MIT — see [`LICENSE`](LICENSE).
