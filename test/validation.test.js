import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isDrawablePath, MIN_STROKE_POINTS } from '../site/validation.js';

test('an empty path is not drawable', () => {
  assert.equal(isDrawablePath([]), false);
});

test('a path with only one distinct point is not drawable', () => {
  assert.equal(isDrawablePath([{ x: 1, y: 1 }, { x: 1, y: 1 }]), false);
});

test('a path with fewer than MIN_STROKE_POINTS distinct points is not drawable', () => {
  const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
  assert.ok(points.length < MIN_STROKE_POINTS);
  assert.equal(isDrawablePath(points), false);
});

test('a path with at least MIN_STROKE_POINTS distinct points is drawable', () => {
  const points = [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }];
  assert.equal(isDrawablePath(points), true);
});

test('non-array input is not drawable', () => {
  assert.equal(isDrawablePath(null), false);
  assert.equal(isDrawablePath(undefined), false);
  assert.equal(isDrawablePath('not a path'), false);
});
