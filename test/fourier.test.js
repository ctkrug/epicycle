import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dft } from '../src/fourier.js';

test('returns one coefficient per input point', () => {
  const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const coefficients = dft(points);
  assert.equal(coefficients.length, points.length);
});

test('sorts coefficients by descending amplitude', () => {
  const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const coefficients = dft(points);
  for (let i = 1; i < coefficients.length; i += 1) {
    assert.ok(coefficients[i - 1].amp >= coefficients[i].amp);
  }
});

test('a pure unit circle collapses onto a single frequency-1 coefficient', () => {
  const n = 64;
  const points = Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  });

  const coefficients = dft(points);
  const dominant = coefficients[0];

  assert.equal(dominant.freq, 1);
  assert.ok(Math.abs(dominant.amp - 1) < 1e-9);

  const restEnergy = coefficients.slice(1).reduce((sum, c) => sum + c.amp, 0);
  assert.ok(restEnergy < 1e-9);
});
