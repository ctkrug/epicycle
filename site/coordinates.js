// Converts a client-space pointer position into canvas-local coordinates
// centered on the canvas's own midpoint, matching the origin the renderer
// translates to before drawing each frame.
export function centeredCanvasPoint(clientX, clientY, rect) {
  return {
    x: clientX - rect.left - rect.width / 2,
    y: clientY - rect.top - rect.height / 2,
  };
}
