import { resamplePath } from '../src/resample.js';
import { dft } from '../src/fourier.js';
import { tracePath } from '../src/epicycles.js';

const SAMPLE_POINTS = 120;

function samplePlaceholderShape() {
  // A five-pointed star used only to prove the DFT pipeline end-to-end
  // until freehand drawing (docs/BACKLOG.md epic 1) replaces it.
  const points = [];
  const spikes = 5;
  const outerRadius = 140;
  const innerRadius = 60;
  for (let i = 0; i < spikes * 2; i += 1) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
  }
  points.push(points[0]);
  return points;
}

function main() {
  const canvas = document.getElementById('epicycle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const shape = resamplePath(samplePlaceholderShape(), SAMPLE_POINTS);
  const coefficients = dft(shape);
  const traced = tracePath(coefficients, SAMPLE_POINTS);

  let frame = 0;
  function render() {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.save();
    ctx.translate(cx, cy);

    ctx.strokeStyle = 'rgba(56, 232, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    traced.slice(0, frame + 1).forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    const head = traced[frame];
    ctx.fillStyle = '#ff3ea5';
    ctx.beginPath();
    ctx.arc(head.x, head.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    frame = (frame + 1) % traced.length;
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
