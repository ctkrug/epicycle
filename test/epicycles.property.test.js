import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { chainPositions } from '../site/epicycles.js';

const coefficient = fc.record({
  freq: fc.integer({ min: -20, max: 20 }),
  amp: fc.double({ min: 0, max: 100, noNaN: true, noDefaultInfinity: true }),
  phase: fc.double({ min: -Math.PI, max: Math.PI, noNaN: true, noDefaultInfinity: true }),
});
const coefficients = fc.array(coefficient, { minLength: 0, maxLength: 20 });
const t = fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true });

// Triangle inequality: the tip is a sum of vectors of length `amp`, so it
// can never land farther from the origin than the sum of all amplitudes.
test('the chain tip never strays farther than the sum of amplitudes', () => {
  fc.assert(
    fc.property(coefficients, t, (coeffs, time) => {
      const positions = chainPositions(coeffs, time);
      const tip = positions[positions.length - 1];
      const distance = Math.hypot(tip.x, tip.y);
      const amplitudeSum = coeffs.reduce((sum, c) => sum + c.amp, 0);
      assert.ok(distance <= amplitudeSum + 1e-6, `distance ${distance} exceeded amplitude sum ${amplitudeSum}`);
    }),
  );
});

test('chainPositions always returns coefficients.length + 1 positions starting at the origin', () => {
  fc.assert(
    fc.property(coefficients, t, (coeffs, time) => {
      const positions = chainPositions(coeffs, time);
      assert.equal(positions.length, coeffs.length + 1);
      assert.deepEqual(positions[0], { x: 0, y: 0 });
      for (const p of positions) {
        assert.ok(Number.isFinite(p.x));
        assert.ok(Number.isFinite(p.y));
      }
    }),
  );
});
