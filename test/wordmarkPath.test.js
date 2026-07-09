import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eGlyphPath } from '../site/wordmarkPath.js';
import { isDrawablePath } from '../site/validation.js';

test('eGlyphPath returns a drawable path of finite points', () => {
  const points = eGlyphPath();
  assert.ok(isDrawablePath(points));
  for (const point of points) {
    assert.equal(Number.isFinite(point.x), true);
    assert.equal(Number.isFinite(point.y), true);
  }
});

test('eGlyphPath is centered on the origin', () => {
  const points = eGlyphPath();
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
  assert.equal(midX, 0);
  assert.equal(midY, 0);
});
