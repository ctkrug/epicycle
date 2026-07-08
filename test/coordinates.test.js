import { test } from 'node:test';
import assert from 'node:assert/strict';
import { centeredCanvasPoint } from '../site/coordinates.js';

test('a click at the canvas center maps to the origin', () => {
  const rect = { left: 100, top: 50, width: 400, height: 200 };
  const point = centeredCanvasPoint(300, 150, rect);
  assert.deepEqual(point, { x: 0, y: 0 });
});

test('a click at the top-left of the canvas maps to negative half-extents', () => {
  const rect = { left: 100, top: 50, width: 400, height: 200 };
  const point = centeredCanvasPoint(100, 50, rect);
  assert.deepEqual(point, { x: -200, y: -100 });
});

test('a click at the bottom-right of the canvas maps to positive half-extents', () => {
  const rect = { left: 0, top: 0, width: 400, height: 200 };
  const point = centeredCanvasPoint(400, 200, rect);
  assert.deepEqual(point, { x: 200, y: 100 });
});
