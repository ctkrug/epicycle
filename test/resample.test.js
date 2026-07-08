import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resamplePath } from '../src/resample.js';

test('returns the requested number of points', () => {
  const line = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
  const result = resamplePath(line, 5);
  assert.equal(result.length, 5);
});

test('evenly spaces points along a straight line', () => {
  const line = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
  const result = resamplePath(line, 5);
  assert.deepEqual(
    result.map((p) => Math.round(p.x)),
    [0, 2, 4, 6, 8],
  );
});

test('preserves the shape of a closed square path', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
    { x: 0, y: 0 },
  ];
  const result = resamplePath(square, 40);
  assert.equal(result.length, 40);
  for (const point of result) {
    assert.ok(point.x >= 0 && point.x <= 10);
    assert.ok(point.y >= 0 && point.y <= 10);
  }
});

test('handles a single-point path without dividing by zero', () => {
  const result = resamplePath([{ x: 5, y: 5 }], 3);
  assert.deepEqual(result, [{ x: 5, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 5 }]);
});
