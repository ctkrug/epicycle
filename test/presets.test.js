import { test } from 'node:test';
import assert from 'node:assert/strict';
import { presetPath, PRESETS } from '../site/presets.js';
import { isDrawablePath } from '../site/validation.js';

for (const name of Object.keys(PRESETS)) {
  test(`preset "${name}" returns a drawable path of finite points`, () => {
    const points = presetPath(name);
    assert.ok(isDrawablePath(points));
    for (const point of points) {
      assert.equal(Number.isFinite(point.x), true);
      assert.equal(Number.isFinite(point.y), true);
    }
  });

  test(`preset "${name}" is roughly centered on the origin`, () => {
    const points = presetPath(name);
    const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    assert.ok(Math.abs(meanX) < 50, `meanX was ${meanX}`);
    assert.ok(Math.abs(meanY) < 50, `meanY was ${meanY}`);
  });
}

test('presetPath throws for an unknown preset name', () => {
  assert.throws(() => presetPath('not-a-real-preset'));
});

test('resolution parameter controls point count for parametric presets', () => {
  assert.equal(presetPath('heart', 50).length, 51);
  assert.equal(presetPath('infinity', 50).length, 51);
});

test('star ignores the resolution parameter (fixed vertex count)', () => {
  assert.equal(presetPath('star', 10).length, presetPath('star', 500).length);
});
