import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saveLastShape, loadLastShape } from '../site/shapePersistence.js';

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }
}

test('loadLastShape returns null when nothing has been saved', () => {
  globalThis.localStorage = new MemoryStorage();
  assert.equal(loadLastShape(), null);
});

test('saveLastShape then loadLastShape round-trips the points', () => {
  globalThis.localStorage = new MemoryStorage();
  const points = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
  saveLastShape(points);
  assert.deepEqual(loadLastShape(), points);
});

test('loadLastShape returns null for malformed stored JSON', () => {
  const storage = new MemoryStorage();
  storage.setItem('epicycle:last-shape', '{not valid json');
  globalThis.localStorage = storage;
  assert.equal(loadLastShape(), null);
});

test('loadLastShape returns null when stored value is not an array', () => {
  const storage = new MemoryStorage();
  storage.setItem('epicycle:last-shape', JSON.stringify({ x: 1 }));
  globalThis.localStorage = storage;
  assert.equal(loadLastShape(), null);
});

test('saveLastShape and loadLastShape are no-ops without localStorage', () => {
  delete globalThis.localStorage;
  assert.doesNotThrow(() => saveLastShape([{ x: 1, y: 1 }]));
  assert.equal(loadLastShape(), null);
});
