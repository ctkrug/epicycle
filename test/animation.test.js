import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advanceAnimation, DEFAULT_LOOP_SECONDS } from '../site/animation.js';

const baseState = { t: 0, playing: true, speed: 1, loopSeconds: DEFAULT_LOOP_SECONDS };

test('advances t forward proportionally to dt and speed', () => {
  const result = advanceAnimation(baseState, 1);
  assert.ok(result.t > 0 && result.t < 1);
  assert.equal(result.looped, false);
});

test('does not advance t when paused', () => {
  const result = advanceAnimation({ ...baseState, playing: false, t: 0.4 }, 2);
  assert.equal(result.t, 0.4);
  assert.equal(result.looped, false);
});

test('wraps t modulo 1 and reports looped when crossing the boundary', () => {
  const result = advanceAnimation({ ...baseState, t: 0.9 }, DEFAULT_LOOP_SECONDS);
  assert.ok(result.t >= 0 && result.t < 1);
  assert.equal(result.looped, true);
});

test('wraps correctly even when dt skips multiple full loops', () => {
  const result = advanceAnimation({ ...baseState, t: 0 }, DEFAULT_LOOP_SECONDS * 3.25);
  assert.ok(Math.abs(result.t - 0.25) < 1e-9);
  assert.equal(result.looped, true);
});

test('higher speed advances t faster for the same dt', () => {
  const slow = advanceAnimation({ ...baseState, speed: 1 }, 1);
  const fast = advanceAnimation({ ...baseState, speed: 2 }, 1);
  assert.ok(fast.t > slow.t);
});
