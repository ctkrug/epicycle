export const MIN_STROKE_POINTS = 3;

export function isDrawablePath(points) {
  if (!Array.isArray(points)) return false;
  return countDistinctPoints(points) >= MIN_STROKE_POINTS;
}

function countDistinctPoints(points) {
  const seen = new Set();
  for (const point of points) {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
    seen.add(`${Math.round(point.x)},${Math.round(point.y)}`);
  }
  return seen.size;
}
