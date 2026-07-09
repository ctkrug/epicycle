import { resamplePath } from './resample.js';
import { dft } from './fourier.js';
import { chainPositions } from './epicycles.js';
import { createStrokeRecorder } from './stroke.js';
import { isDrawablePath } from './validation.js';
import { centeredCanvasPoint } from './coordinates.js';
import { advanceAnimation, DEFAULT_LOOP_SECONDS } from './animation.js';
import { saveLastShape, loadLastShape } from './shapePersistence.js';

const SAMPLE_POINTS = 120;

function main() {
  const canvas = document.getElementById('epicycle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const hint = document.getElementById('hint');
  const strokeMessage = document.getElementById('stroke-message');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const circleCountInput = document.getElementById('circle-count');
  const circleCountValue = document.getElementById('circle-count-value');
  const toggleCircles = document.getElementById('toggle-circles');

  const strokeRecorder = createStrokeRecorder();
  const animationState = { t: 0, playing: true, speed: 1, loopSeconds: DEFAULT_LOOP_SECONDS };
  let fullCoefficients = [];
  let activeCoefficients = [];
  let showCircles = toggleCircles.checked;
  let trail = [];
  let lastFrameTime = null;

  function showMessage(text) {
    strokeMessage.textContent = text;
    strokeMessage.hidden = false;
  }

  function clearMessage() {
    strokeMessage.hidden = true;
  }

  function hideHint() {
    hint.hidden = true;
  }

  function applyCircleCount(count) {
    activeCoefficients = fullCoefficients.slice(0, count);
    circleCountValue.textContent = String(count);
    trail = [];
  }

  function loadShape(points) {
    const resampled = resamplePath(points, SAMPLE_POINTS);
    fullCoefficients = dft(resampled);
    animationState.t = 0;

    circleCountInput.min = '1';
    circleCountInput.max = String(fullCoefficients.length);
    circleCountInput.value = String(fullCoefficients.length);
    circleCountInput.disabled = false;

    applyCircleCount(fullCoefficients.length);
  }

  function handleStrokeEnd() {
    const points = strokeRecorder.end();
    if (!isDrawablePath(points)) {
      showMessage('Draw a bit more — that stroke was too short to trace.');
      return;
    }
    clearMessage();
    hideHint();
    loadShape(points);
    saveLastShape(points);
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return centeredCanvasPoint(event.clientX, event.clientY, rect);
  }

  canvas.addEventListener('pointerdown', (event) => {
    canvas.setPointerCapture(event.pointerId);
    clearMessage();
    strokeRecorder.begin(pointFromEvent(event));
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!strokeRecorder.isActive) return;
    strokeRecorder.add(pointFromEvent(event));
  });

  canvas.addEventListener('pointerup', () => {
    if (!strokeRecorder.isActive) return;
    handleStrokeEnd();
  });

  canvas.addEventListener('pointercancel', () => {
    if (!strokeRecorder.isActive) return;
    handleStrokeEnd();
  });

  circleCountInput.addEventListener('input', () => {
    applyCircleCount(Number(circleCountInput.value));
  });

  toggleCircles.addEventListener('change', () => {
    showCircles = toggleCircles.checked;
  });

  function drawChain(cx, cy, positions) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(245, 236, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < positions.length - 1; i += 1) {
      const center = positions[i];
      const next = positions[i + 1];
      const radius = Math.hypot(next.x - center.x, next.y - center.y);
      if (radius > 0.5) {
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTrail(cx, cy, points) {
    if (points.length < 2) return;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = '#38e8ff';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawTip(cx, cy, point) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#ff3ea5';
    ctx.shadowColor = 'rgba(255, 62, 165, 0.6)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function render(now) {
    if (lastFrameTime === null) lastFrameTime = now;
    const dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    if (activeCoefficients.length > 0) {
      const result = advanceAnimation(animationState, dt);
      animationState.t = result.t;
      if (result.looped) trail = [];
    }

    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (activeCoefficients.length > 0) {
      const positions = chainPositions(activeCoefficients, animationState.t);
      const tip = positions[positions.length - 1];
      trail.push(tip);
      if (showCircles) drawChain(cx, cy, positions);
      drawTrail(cx, cy, trail);
      drawTip(cx, cy, tip);
    }

    requestAnimationFrame(render);
  }

  const restored = loadLastShape();
  if (restored && isDrawablePath(restored)) {
    hideHint();
    loadShape(restored);
  } else {
    hint.hidden = false;
  }

  requestAnimationFrame(render);
}

main();
