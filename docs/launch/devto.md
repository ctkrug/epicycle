---
title: "I built a toy that redraws your doodle with spinning circles"
published: false
tags: javascript, canvas, math, webdev
---

Every "Fourier series draws a picture" demo online retraces the same hardcoded
shape. You watch spinning circles rebuild Homer Simpson, or a pre-baked SVG, and
that is it. The one thing I always wanted was to feed it *my* drawing. So I built
[Epicycle](https://apps.charliekrug.com/epicycle/): draw any shape and a chain of
nested rotating circles rebuilds it live, in the browser.

The idea is the one 3Blue1Brown popularized. Treat a 2D path as a signal of
complex numbers `x + iy` over time, take its discrete Fourier transform, and you
get a set of rotating vectors. Stack the vectors tip to tail, spin each at its own
frequency, and the endpoint of the last one retraces the original path. A few
build decisions turned out to be more interesting than the math itself.

## A direct DFT beat reaching for an FFT

The reflex is to grab an FFT. I didn't. A hand-drawn stroke, resampled to evenly
spaced points, is on the order of 100 points. A direct O(N²) transform over 100
points is a few thousand multiply-adds, which finishes in well under a single
frame budget. Writing it by hand kept the whole thing to a readable loop:

```js
for (let k = 0; k < n; k += 1) {
  let sum = complex(0, 0);
  for (let t = 0; t < n; t += 1) {
    const angle = (-2 * Math.PI * k * t) / n;
    sum = add(sum, multiply(complex(points[t].x, points[t].y), fromPolar(1, angle)));
  }
  // average, then store {freq, amp, phase}
}
```

More importantly, a hand-rolled DFT is trivial to test. I wrote a property-based
round-trip check with fast-check: transform a random path, reconstruct it from the
coefficients, and assert the reconstruction matches the input within a tolerance.
That test caught more mistakes than any amount of staring at the frequency loop
would have.

## One copy of the logic, tested and shipped

There is no `src/` and no build step. The modules under `site/` are the deployed
app *and* exactly what the Node test suite imports. That rules out a whole class of
bug where the tested code drifts from the shipped code. `main.js` is the only file
the tests skip, because it is pure DOM wiring: pointer events, the render loop, and
the MediaRecorder plumbing. Everything with logic in it (the transform, the
resampling, the animation time-step, the codec negotiation) is a small pure module
that runs headless, which is how the project sits at 100% coverage on those files
without a browser in CI.

## The one detail I am quietly proud of

The animated "E" in the wordmark is not a GIF. It is the same engine, shrunk down:
a single-stroke path of the letter, run through the same resample and DFT pipeline,
rendered with a handful of harmonics into a 40px canvas that loops forever. At that
size the corners are too soft to read as a crisp letter, and that trade-off is the
point. The mark tells you what the whole page does before you have drawn anything.

## Video export that always captures a full loop

"Export video" uses `canvas.captureStream()` into a `MediaRecorder`. The catch: the
user clicks at a random moment in the animation, so a naive fixed-duration recording
starts and ends mid-trace. Instead the recorder starts on click and stops on the
*second* loop-completion event it sees afterward, so the clip always covers at least
one clean retrace loop no matter when you pressed the button. While recording, I lock
out drawing and the presets, because swapping the coefficients out from under an
active recorder would reset the animation and the loop it is waiting for would never
arrive.

## What I would do differently

The trail is a growing array cleared every loop; for very slow speeds it can get long
before it resets. A fixed-length ring buffer would be tidier. I would also add SVG
export, since a path is a much better artifact to keep than a WebM.

It is a static page with no dependencies to install. Draw something:
[apps.charliekrug.com/epicycle](https://apps.charliekrug.com/epicycle/) ·
[source on GitHub](https://github.com/ctkrug/epicycle).
</content>
