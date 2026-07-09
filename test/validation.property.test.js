import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { isDrawablePath, MIN_STROKE_POINTS } from '../site/validation.js';

const finiteCoordinate = fc.double({ noNaN: true, noDefaultInfinity: true });
const nonFiniteCoordinate = fc.constantFrom(NaN, Infinity, -Infinity);
const finitePoint = fc.record({ x: finiteCoordinate, y: finiteCoordinate });
const nonFinitePoint = fc.record({
  x: fc.oneof(finiteCoordinate, nonFiniteCoordinate),
  y: fc.oneof(finiteCoordinate, nonFiniteCoordinate),
}).filter((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y));

test('a path is never drawable if it has fewer than MIN_STROKE_POINTS finite points, however many non-finite points pad it out', () => {
  fc.assert(
    fc.property(
      fc.array(finitePoint, { minLength: 0, maxLength: MIN_STROKE_POINTS - 1 }),
      fc.array(nonFinitePoint, { minLength: 0, maxLength: 20 }),
      (finitePoints, junk) => {
        const shuffled = [...finitePoints, ...junk];
        assert.equal(isDrawablePath(shuffled), false);
      },
    ),
  );
});

test('a path is drawable exactly when it has at least MIN_STROKE_POINTS distinct finite points', () => {
  fc.assert(
    fc.property(
      fc.uniqueArray(finitePoint, {
        minLength: MIN_STROKE_POINTS,
        maxLength: MIN_STROKE_POINTS + 10,
        selector: (p) => `${Math.round(p.x)},${Math.round(p.y)}`,
      }),
      fc.array(nonFinitePoint, { minLength: 0, maxLength: 20 }),
      (finitePoints, junk) => {
        const shuffled = [...finitePoints, ...junk];
        assert.equal(isDrawablePath(shuffled), true);
      },
    ),
  );
});
