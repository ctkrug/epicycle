import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dft } from '../site/fourier.js';
import { reconstructAt, tracePath, chainPositions } from '../site/epicycles.js';

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

test('chainPositions returns one more position than coefficients, starting at the origin', () => {
  const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const coefficients = dft(points);
  const positions = chainPositions(coefficients, 0.3);
  assert.equal(positions.length, coefficients.length + 1);
  assert.deepEqual(positions[0], { x: 0, y: 0 });
});

test('chainPositions final position matches reconstructAt at the same t', () => {
  const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const coefficients = dft(points);
  const positions = chainPositions(coefficients, 0.7);
  const tip = positions[positions.length - 1];
  const reconstructed = reconstructAt(coefficients, 0.7);
  assert.deepEqual(tip, reconstructed);
});

test('chainPositions with no coefficients stays at the origin', () => {
  const positions = chainPositions([], 0.5);
  assert.deepEqual(positions, [{ x: 0, y: 0 }]);
});
