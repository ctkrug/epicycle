export function resamplePath(points, count) {
  if (!Array.isArray(points) || points.length === 0) {
    throw new Error('resamplePath requires at least one point');
  }
  if (points.length === 1) {
    return Array.from({ length: count }, () => ({ ...points[0] }));
  }

  const segmentLengths = [];
  let totalLength = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const length = Math.hypot(dx, dy);
    segmentLengths.push(length);
    totalLength += length;
  }

  if (totalLength === 0) {
    return Array.from({ length: count }, () => ({ ...points[0] }));
  }

  const step = totalLength / count;
  const result = [];
  let segmentIndex = 0;
  let segmentStart = 0;

  for (let i = 0; i < count; i += 1) {
    const target = i * step;
    while (
      segmentIndex < segmentLengths.length - 1 &&
      segmentStart + segmentLengths[segmentIndex] < target
    ) {
      segmentStart += segmentLengths[segmentIndex];
      segmentIndex += 1;
    }
    const segmentLength = segmentLengths[segmentIndex] || 1;
    const t = Math.min(1, Math.max(0, (target - segmentStart) / segmentLength));
    const a = points[segmentIndex];
    // The while loop above never advances segmentIndex past
    // segmentLengths.length - 1, so segmentIndex + 1 always indexes a real
    // point — no fallback needed here.
    const b = points[segmentIndex + 1];
    result.push({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    });
  }

  return result;
}
