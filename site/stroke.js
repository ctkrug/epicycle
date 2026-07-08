const DEFAULT_MIN_DISTANCE = 2;

export function createStrokeRecorder(minDistance = DEFAULT_MIN_DISTANCE) {
  let points = [];
  let active = false;

  function begin(point) {
    points = [{ x: point.x, y: point.y }];
    active = true;
  }

  function add(point) {
    if (!active) return false;
    const last = points[points.length - 1];
    if (last && Math.hypot(point.x - last.x, point.y - last.y) < minDistance) {
      return false;
    }
    points.push({ x: point.x, y: point.y });
    return true;
  }

  function end() {
    active = false;
    return points.slice();
  }

  return {
    begin,
    add,
    end,
    get isActive() {
      return active;
    },
    get points() {
      return points.slice();
    },
  };
}
