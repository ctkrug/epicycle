import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { createStrokeRecorder } from '../site/stroke.js';

const coordinate = fc.double({ min: -500, max: 500, noNaN: true, noDefaultInfinity: true });
const point = fc.record({ x: coordinate, y: coordinate });
const points = fc.array(point, { minLength: 1, maxLength: 50 });
const minDistance = fc.double({ min: 0, max: 20, noNaN: true, noDefaultInfinity: true });

test('every recorded point is at least minDistance from the previous one', () => {
  fc.assert(
    fc.property(minDistance, point, points, (dist, first, rest) => {
      const recorder = createStrokeRecorder(dist);
      recorder.begin(first);
      for (const p of rest) recorder.add(p);
      const recorded = recorder.points;

      for (let i = 1; i < recorded.length; i += 1) {
        const d = Math.hypot(recorded[i].x - recorded[i - 1].x, recorded[i].y - recorded[i - 1].y);
        assert.ok(d >= dist - 1e-9, `distance ${d} was less than minDistance ${dist}`);
      }
    }),
  );
});

test('end() always returns the same points the recorder held while active', () => {
  fc.assert(
    fc.property(point, points, (first, rest) => {
      const recorder = createStrokeRecorder(0);
      recorder.begin(first);
      for (const p of rest) recorder.add(p);
      const beforeEnd = recorder.points;
      const ended = recorder.end();
      assert.deepEqual(ended, beforeEnd);
      assert.equal(recorder.isActive, false);
    }),
  );
});
