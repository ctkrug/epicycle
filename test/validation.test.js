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

test('an array containing null/non-point entries does not throw and is not drawable', () => {
  assert.doesNotThrow(() => isDrawablePath([1, 2, 3, 'x', null]));
  assert.equal(isDrawablePath([1, 2, 3, 'x', null]), false);
  assert.doesNotThrow(() => isDrawablePath([null, undefined, {}]));
});

test('ignores garbage entries but still counts the valid points among them', () => {
  const points = [null, { x: 0, y: 0 }, 'garbage', { x: 5, y: 0 }, undefined, { x: 5, y: 5 }];
  assert.equal(isDrawablePath(points), true);
});

test('rejects points with non-finite coordinates', () => {
  // typeof NaN and typeof Infinity are both 'number', so a naive typeof
  // check lets them through; a hand-edited/corrupted localStorage entry
  // like `1e400` parses to Infinity via JSON.parse without throwing.
  const points = [
    { x: Infinity, y: 0 },
    { x: -Infinity, y: 1 },
    { x: NaN, y: NaN },
  ];
  assert.equal(isDrawablePath(points), false);
});

test('counts a mix of finite and non-finite points using only the finite ones', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 5, y: 0 },
    { x: Infinity, y: Infinity },
    { x: NaN, y: NaN },
  ];
  assert.equal(isDrawablePath(points), false);
});
