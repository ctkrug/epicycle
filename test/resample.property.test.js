import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { resamplePath } from '../site/resample.js';

const coordinate = fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true });
const point = fc.record({ x: coordinate, y: coordinate });
const path = fc.array(point, { minLength: 1, maxLength: 40 });
const count = fc.integer({ min: 1, max: 80 });

test('resamplePath always returns exactly `count` finite points', () => {
  fc.assert(
    fc.property(path, count, (points, n) => {
      const result = resamplePath(points, n);
      assert.equal(result.length, n);
      for (const p of result) {
        assert.ok(Number.isFinite(p.x));
        assert.ok(Number.isFinite(p.y));
      }
    }),
  );
});

test('resamplePath never produces coordinates outside the input bounding box', () => {
  fc.assert(
    fc.property(path, count, (points, n) => {
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
      const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
      const result = resamplePath(points, n);
      for (const p of result) {
        assert.ok(p.x >= minX - 1e-6 && p.x <= maxX + 1e-6);
        assert.ok(p.y >= minY - 1e-6 && p.y <= maxY + 1e-6);
      }
    }),
  );
});
