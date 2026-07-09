// Codec preference order: vp9 compresses best, vp8 is the broad-support
// fallback, bare webm lets the browser pick a default container codec.
export const VIDEO_MIME_CANDIDATES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
];

export function pickSupportedMimeType(candidates, isTypeSupported) {
  return candidates.find((candidate) => isTypeSupported(candidate)) ?? null;
}

export function videoFilename(timestamp) {
  return `epicycle-${timestamp}.webm`;
}
