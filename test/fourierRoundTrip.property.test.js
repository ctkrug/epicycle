import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { resamplePath } from '../site/resample.js';
import { dft } from '../site/fourier.js';
import { reconstructAt } from '../site/epicycles.js';

const coordinate = fc.double({ min: -500, max: 500, noNaN: true, noDefaultInfinity: true });
const point = fc.record({ x: coordinate, y: coordinate });
const path = fc.array(point, { minLength: 2, maxLength: 20 });

// The app's whole premise: a full-coefficient DFT is losslessly invertible.
// Reconstructing at each original sample's t must land back on that sample.
test('reconstructing with the full coefficient set recovers every resampled point', () => {
  fc.assert(
    fc.property(path, fc.integer({ min: 4, max: 32 }), (points, n) => {
      const resampled = resamplePath(points, n);
      const coefficients = dft(resampled);
      assert.equal(coefficients.length, n);

      for (let i = 0; i < n; i += 1) {
        const t = i / n;
        const reconstructed = reconstructAt(coefficients, t);
        const original = resampled[i];
        assert.ok(
          Math.abs(reconstructed.x - original.x) < 1e-6,
          `x mismatch at i=${i}: ${reconstructed.x} vs ${original.x}`,
        );
        assert.ok(
          Math.abs(reconstructed.y - original.y) < 1e-6,
          `y mismatch at i=${i}: ${reconstructed.y} vs ${original.y}`,
        );
      }
    }),
    { numRuns: 50 },
  );
});

test('dropping to a single coefficient never throws and stays finite', () => {
  fc.assert(
    fc.property(path, fc.integer({ min: 4, max: 32 }), (points, n) => {
      const resampled = resamplePath(points, n);
      const coefficients = dft(resampled).slice(0, 1);
      const reconstructed = reconstructAt(coefficients, 0.37);
      assert.ok(Number.isFinite(reconstructed.x));
      assert.ok(Number.isFinite(reconstructed.y));
    }),
  );
});
