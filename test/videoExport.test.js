import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VIDEO_MIME_CANDIDATES, pickSupportedMimeType, videoFilename } from '../site/videoExport.js';

test('VIDEO_MIME_CANDIDATES orders codecs vp9 before vp8 before bare webm', () => {
  // Pins the compression-preference order the videoExport.js comment
  // documents — nothing else in this file exercises the array's actual
  // contents/order, so a future edit could quietly regress it (e.g. an
  // alphabetizing refactor) without any test noticing.
  assert.deepEqual(VIDEO_MIME_CANDIDATES, [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]);
});

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
