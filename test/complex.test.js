import { test } from 'node:test';
import assert from 'node:assert/strict';
import { complex, add, multiply, magnitude, phase, fromPolar } from '../site/complex.js';

test('add sums real and imaginary parts', () => {
  const result = add(complex(1, 2), complex(3, -4));
  assert.deepEqual(result, { re: 4, im: -2 });
});

test('multiply follows complex multiplication rules', () => {
  const result = multiply(complex(2, 3), complex(4, -1));
  // (2+3i)(4-1i) = 8 - 2i + 12i - 3i^2 = 8 + 10i + 3 = 11 + 10i
  assert.deepEqual(result, { re: 11, im: 10 });
});

test('magnitude returns the euclidean length', () => {
  assert.equal(magnitude(complex(3, 4)), 5);
});

test('phase returns the angle in radians', () => {
  assert.equal(phase(complex(0, 1)), Math.PI / 2);
});

test('fromPolar reconstructs re/im from radius and angle', () => {
  const result = fromPolar(2, Math.PI / 2);
  assert.ok(Math.abs(result.re) < 1e-10);
  assert.ok(Math.abs(result.im - 2) < 1e-10);
});
