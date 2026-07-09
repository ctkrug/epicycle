// A single continuous pen-stroke tracing of a block capital "E", centered
// on the origin. Revisits the stem while drawing each arm, same as a human
// hand would without lifting the pen — that's fine for resampling, which
// only cares about arc length along the sequence, not geometric uniqueness.
export function eGlyphPath() {
  return [
    { x: -7, y: 10 },
    { x: -7, y: -10 },
    { x: 7, y: -10 },
    { x: -7, y: -10 },
    { x: -7, y: 0 },
    { x: 3, y: 0 },
    { x: -7, y: 0 },
    { x: -7, y: 10 },
    { x: 7, y: 10 },
  ];
}
