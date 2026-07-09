import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSoundEngine, loadMutePreference, saveMutePreference } from '../site/audio.js';

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

test('loadMutePreference defaults to false when nothing is stored', () => {
  globalThis.localStorage = new MemoryStorage();
  assert.equal(loadMutePreference(), false);
});

test('saveMutePreference then loadMutePreference round-trips', () => {
  globalThis.localStorage = new MemoryStorage();
  saveMutePreference(true);
  assert.equal(loadMutePreference(), true);
});

test('sound engine methods do not throw when AudioContext is unavailable', () => {
  globalThis.localStorage = new MemoryStorage();
  assert.equal(typeof globalThis.AudioContext, 'undefined');
  const engine = createSoundEngine();
  assert.doesNotThrow(() => {
    engine.drawStart();
    engine.drawEnd();
    engine.compute();
    engine.loop();
    engine.exportComplete();
  });
});

test('setMuted updates isMuted and persists the preference', () => {
  globalThis.localStorage = new MemoryStorage();
  const engine = createSoundEngine();
  assert.equal(engine.isMuted(), false);
  engine.setMuted(true);
  assert.equal(engine.isMuted(), true);
  assert.equal(loadMutePreference(), true);
});

test('a fresh sound engine picks up a previously persisted mute preference', () => {
  globalThis.localStorage = new MemoryStorage();
  saveMutePreference(true);
  const engine = createSoundEngine();
  assert.equal(engine.isMuted(), true);
});

test('saveMutePreference swallows a quota-exceeded setItem failure', () => {
  const storage = new MemoryStorage();
  storage.setItem = () => {
    throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
  };
  globalThis.localStorage = storage;
  assert.doesNotThrow(() => saveMutePreference(true));
});

test('loadMutePreference returns false when getItem itself throws', () => {
  const storage = new MemoryStorage();
  storage.getItem = () => {
    throw new Error('storage disabled in private browsing');
  };
  globalThis.localStorage = storage;
  assert.equal(loadMutePreference(), false);
});
