const SHAPE_KEY = 'epicycle:last-shape';

export function saveLastShape(points) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SHAPE_KEY, JSON.stringify(points));
  } catch {
    // Storage unavailable (private browsing, quota exceeded) — drawing
    // still works this session, it just won't be restored on reload.
  }
}

export function loadLastShape() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SHAPE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
