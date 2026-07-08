import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dft } from '../site/fourier.js';
import { reconstructAt, tracePath } from '../site/epicycles.js';

function closeTo(a, b, epsilon = 1e-9) {
  return Math.abs(a - b) < epsilon;
}

test('reconstructing a pure circle round-trips the original points', () => {
  const n = 64;
  const points = Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  });

  const coefficients = dft(points);

  for (const i of [0, 16, 32, 48]) {
    const reconstructed = reconstructAt(coefficients, i / n);
    assert.ok(closeTo(reconstructed.x, points[i].x));
    assert.ok(closeTo(reconstructed.y, points[i].y));
  }
});

test('tracePath returns the requested number of steps', () => {
  const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const coefficients = dft(points);
  const traced = tracePath(coefficients, 50);
  assert.equal(traced.length, 50);
});
