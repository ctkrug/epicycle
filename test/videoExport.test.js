import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VIDEO_MIME_CANDIDATES, pickSupportedMimeType, videoFilename } from '../site/videoExport.js';

test('pickSupportedMimeType returns the first supported candidate', () => {
  const supported = new Set(['video/webm;codecs=vp8', 'video/webm']);
  const result = pickSupportedMimeType(VIDEO_MIME_CANDIDATES, (type) => supported.has(type));
  assert.equal(result, 'video/webm;codecs=vp8');
});

test('pickSupportedMimeType prefers earlier candidates when several match', () => {
  const result = pickSupportedMimeType(['a', 'b'], () => true);
  assert.equal(result, 'a');
});

test('pickSupportedMimeType returns null when nothing is supported', () => {
  const result = pickSupportedMimeType(VIDEO_MIME_CANDIDATES, () => false);
  assert.equal(result, null);
});

test('pickSupportedMimeType returns null for an empty candidate list', () => {
  const result = pickSupportedMimeType([], () => true);
  assert.equal(result, null);
});

test('videoFilename embeds the given timestamp with a webm extension', () => {
  assert.equal(videoFilename('2026-07-09T00-00-00'), 'epicycle-2026-07-09T00-00-00.webm');
});
