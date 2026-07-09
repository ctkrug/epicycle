import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStrokeRecorder } from '../site/stroke.js';

test('begin starts an active stroke with a single point', () => {
  const recorder = createStrokeRecorder();
  recorder.begin({ x: 1, y: 2 });
  assert.equal(recorder.isActive, true);
  assert.deepEqual(recorder.points, [{ x: 1, y: 2 }]);
});

test('add is a no-op before begin', () => {
  const recorder = createStrokeRecorder();
  const added = recorder.add({ x: 5, y: 5 });
  assert.equal(added, false);
  assert.deepEqual(recorder.points, []);
});

test('the default minDistance throttles a 1px move but accepts a 3px move', () => {
  // Brackets the module's private DEFAULT_MIN_DISTANCE (2px) without
  // exporting it — nothing else exercises createStrokeRecorder() with no
  // args closely enough to catch that constant drifting to, say, 20px
  // (visibly chunky strokes) or 0.02px (throttling effectively disabled).
  const recorder = createStrokeRecorder();
  recorder.begin({ x: 0, y: 0 });
  assert.equal(recorder.add({ x: 1, y: 0 }), false);
  assert.equal(recorder.add({ x: 3, y: 0 }), true);
});

test('add throttles points closer than minDistance', () => {
  const recorder = createStrokeRecorder(10);
  recorder.begin({ x: 0, y: 0 });
  const added = recorder.add({ x: 1, y: 0 });
  assert.equal(added, false);
  assert.equal(recorder.points.length, 1);
});

test('add records points at or beyond minDistance', () => {
  const recorder = createStrokeRecorder(10);
  recorder.begin({ x: 0, y: 0 });
  const added = recorder.add({ x: 10, y: 0 });
  assert.equal(added, true);
  assert.equal(recorder.points.length, 2);
});

test('end deactivates the recorder and returns the recorded points', () => {
  const recorder = createStrokeRecorder(0);
  recorder.begin({ x: 0, y: 0 });
  recorder.add({ x: 1, y: 1 });
  const result = recorder.end();
  assert.equal(recorder.isActive, false);
  assert.deepEqual(result, [{ x: 0, y: 0 }, { x: 1, y: 1 }]);
});

test('add after end is a no-op until begin is called again', () => {
  const recorder = createStrokeRecorder(0);
  recorder.begin({ x: 0, y: 0 });
  recorder.end();
  const added = recorder.add({ x: 9, y: 9 });
  assert.equal(added, false);
  assert.deepEqual(recorder.points, [{ x: 0, y: 0 }]);
});

test('begin resets any points left over from a previous stroke', () => {
  const recorder = createStrokeRecorder(0);
  recorder.begin({ x: 0, y: 0 });
  recorder.add({ x: 1, y: 1 });
  recorder.end();
  recorder.begin({ x: 5, y: 5 });
  assert.deepEqual(recorder.points, [{ x: 5, y: 5 }]);
});

test('points getter returns a snapshot that does not mutate on further add calls', () => {
  const recorder = createStrokeRecorder(0);
  recorder.begin({ x: 0, y: 0 });
  const snapshot = recorder.points;
  recorder.add({ x: 1, y: 1 });
  assert.equal(snapshot.length, 1);
});
