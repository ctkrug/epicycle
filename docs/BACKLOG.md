# Backlog

Epics and stories for the build. Every story has 1–3 verifiable acceptance
criteria. Story 1.1 is the wow moment and must land before anything else.

## Epic 1 — Draw it, watch it spin (the wow moment)

- [ ] **1.1 (WOW) Freehand drawing instantly retraces via epicycles.**
  - [ ] Drawing a stroke on the canvas with the mouse (down → move → up)
        records a path of points.
  - [ ] On release, the app computes the DFT and animates a chain of
        rotating circles whose combined tip retraces the drawn shape,
        starting within 2 seconds of finishing the stroke.
  - [ ] The retrace overlays the original stroke closely enough that the
        two are visually indistinguishable at a glance (average point error
        under a few pixels at the rendered scale).

- [ ] **1.2 Touch and pointer support.**
  - [ ] Drawing works via touch on a 390px-wide viewport, using the same
        code path as mouse input (unified via Pointer Events).
  - [ ] A stroke started with one input method (mouse or touch) completes
        correctly even if the pointer briefly leaves the canvas bounds.

- [ ] **1.3 Render the visible circle chain, not just the traced dot.**
  - [ ] Each epicycle's circle outline and radius line are drawn, nested in
        frequency order, every animation frame.
  - [ ] A toggle shows/hides the circle chain independent of the traced
        path, and the setting is reflected immediately.

- [ ] **1.4 Circle-count control.**
  - [ ] A slider lets the user choose how many frequencies (circles) are
        used, from a low-fidelity minimum up to the full count from the
        current drawing.
  - [ ] Moving the slider updates the rendered chain and retrace in real
        time, with the current count shown as a label.

## Epic 2 — Playback and export

- [ ] **2.1 Playback controls.**
  - [ ] A play/pause control freezes and resumes the animation at the
        current frame with no visible jump.
  - [ ] A speed control changes the retrace's revolutions-per-second
        smoothly, without restarting the animation.

- [ ] **2.2 Loop and restart.**
  - [ ] The retrace loops continuously by default once a shape is drawn.
  - [ ] A restart control resets the animation to frame 0 and clears any
        accumulated trail before redrawing.

- [ ] **2.3 Export the animation and a still snapshot.**
  - [ ] An "Export video" action produces a downloadable video file (e.g.
        WebM) covering at least one full retrace loop, with the button
        showing a progress state while encoding.
  - [ ] A "Save PNG" action downloads a snapshot of the current canvas
        frame named with the project and a timestamp.

## Epic 3 — Polish, feel, and design

- [ ] **3.1 (Design polish) Apply `docs/DESIGN.md` across the app.**
  - [ ] The page's palette, typography, spacing, and the animated wordmark
        flourish match `docs/DESIGN.md`.
  - [ ] The page passes the D3 self-review checklist at 390px, 768px, and
        1440px widths with nothing broken or cramped.

- [ ] **3.2 Synthesized sound feedback with a persisted mute toggle.**
  - [ ] WebAudio-synthesized sounds fire for stroke start/end, DFT compute,
        loop completion, and export, without any audio files.
  - [ ] The mute toggle's state persists across page reloads via
        `localStorage`, and audio setup never throws in environments
        without `AudioContext`.

- [ ] **3.3 Full interaction states on every control.**
  - [ ] Every control (buttons, sliders, toggles) has themed hover,
        focus-visible, active, and disabled states — no naked native
        widgets.
  - [ ] Tab order reaches every control in a sane sequence with a visible
        focus ring at each stop.

- [ ] **3.4 Reduced motion and accessibility basics.**
  - [ ] With `prefers-reduced-motion` enabled, the circle-chain animation
        keeps functioning but decorative effects (particles, shake) are
        suppressed.
  - [ ] Icon-only controls have `aria-label`s, and a live region announces
        when a retrace completes a loop.

## Epic 4 — Presets and robustness

- [ ] **4.1 Preset shapes.**
  - [ ] A small menu of preset shapes (e.g. star, heart, infinity symbol)
        is available for users who don't want to draw.
  - [ ] Selecting a preset runs the same DFT pipeline and animates the
        retrace exactly as a hand-drawn stroke would.

- [ ] **4.2 Graceful handling of degenerate input.**
  - [ ] Drawing fewer than 3 distinct points shows an inline message
        instead of crashing or producing a divide-by-zero.
  - [ ] The last successfully drawn or selected shape persists across page
        reloads via `localStorage`, restoring automatically.

- [ ] **4.3 First-time visitor hint.**
  - [ ] On first visit (no saved shape in `localStorage`), a short
        instruction ("Draw anything, watch it spin") is shown over the
        empty canvas.
  - [ ] The hint disappears permanently after the first completed stroke or
        preset selection.
