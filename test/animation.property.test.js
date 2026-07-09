import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { advanceAnimation } from '../site/animation.js';

const state = fc.record({
  t: fc.double({ min: 0, max: Math.fround(0.999999), noNaN: true }),
  playing: fc.boolean(),
  speed: fc.double({ min: 0, max: 10, noNaN: true, noDefaultInfinity: true }),
  loopSeconds: fc.double({ min: 0.1, max: 60, noNaN: true, noDefaultInfinity: true }),
});
const dt = fc.double({ min: 0, max: 120, noNaN: true, noDefaultInfinity: true });

test('t always stays within [0, 1) after advancing', () => {
  fc.assert(
    fc.property(state, dt, (s, delta) => {
      const result = advanceAnimation(s, delta);
      assert.ok(result.t >= 0 && result.t < 1, `t was ${result.t}`);
    }),
  );
});

test('a paused animation never changes t and never reports a loop', () => {
  fc.assert(
    fc.property(state, dt, (s, delta) => {
      const result = advanceAnimation({ ...s, playing: false }, delta);
      assert.equal(result.t, s.t);
      assert.equal(result.looped, false);
    }),
  );
});
