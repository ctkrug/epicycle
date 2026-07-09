import { resamplePath } from './resample.js';
import { dft } from './fourier.js';
import { chainPositions } from './epicycles.js';
import { createStrokeRecorder } from './stroke.js';
import { isDrawablePath } from './validation.js';
import { centeredCanvasPoint } from './coordinates.js';
import { advanceAnimation, DEFAULT_LOOP_SECONDS } from './animation.js';
import { saveLastShape, loadLastShape } from './shapePersistence.js';
import { createSoundEngine } from './audio.js';
import { presetPath } from './presets.js';
import { eGlyphPath } from './wordmarkPath.js';
import { VIDEO_MIME_CANDIDATES, pickSupportedMimeType, videoFilename } from './videoExport.js';

const SAMPLE_POINTS = 120;

const prefersReducedMotion =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function main() {
  const canvas = document.getElementById('epicycle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const hint = document.getElementById('hint');
  const strokeMessage = document.getElementById('stroke-message');

  // Cached in CSS pixels and only recomputed on resize — reading
  // getBoundingClientRect() every animation frame would force a synchronous
  // layout reflow on each of the 60 draws per second.
  let canvasWidth = 0;
  let canvasHeight = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const circleCountInput = document.getElementById('circle-count');
  const circleCountValue = document.getElementById('circle-count-value');
  const toggleCircles = document.getElementById('toggle-circles');
  const playPauseButton = document.getElementById('play-pause');
  const restartButton = document.getElementById('restart');
  const speedInput = document.getElementById('speed');
  const speedValue = document.getElementById('speed-value');
  const exportPngButton = document.getElementById('export-png');
  const exportVideoButton = document.getElementById('export-video');
  const muteToggle = document.getElementById('mute-toggle');
  const liveRegion = document.getElementById('live-region');

  const sound = createSoundEngine();

  function reflectMuteState() {
    const muted = sound.isMuted();
    muteToggle.setAttribute('aria-pressed', String(muted));
    muteToggle.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
    muteToggle.innerHTML = muted
      ? '<span aria-hidden="true">&#128263;</span>'
      : '<span aria-hidden="true">&#128266;</span>';
  }
  reflectMuteState();

  const strokeRecorder = createStrokeRecorder();
  const animationState = { t: 0, playing: true, speed: 1, loopSeconds: DEFAULT_LOOP_SECONDS };
  let fullCoefficients = [];
  let activeCoefficients = [];
  let showCircles = toggleCircles.checked;
  let trail = [];
  let lastFrameTime = null;
  let loopCount = 0;
  let flashUntil = 0;
  let mediaRecorder = null;
  let recordingLoopSeen = false;
  let wasPlayingBeforeRecording = true;

  const canRecordVideo =
    typeof canvas.captureStream === 'function' &&
    typeof MediaRecorder !== 'undefined' &&
    typeof MediaRecorder.isTypeSupported === 'function' &&
    Boolean(pickSupportedMimeType(VIDEO_MIME_CANDIDATES, (type) => MediaRecorder.isTypeSupported(type)));

  function announce(text) {
    liveRegion.textContent = text;
  }

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

    playPauseButton.disabled = false;
    restartButton.disabled = false;
    exportPngButton.disabled = false;
    exportVideoButton.disabled = !canRecordVideo;

    applyCircleCount(fullCoefficients.length);
  }

  function setPlaying(playing) {
    animationState.playing = playing;
    playPauseButton.innerHTML = playing
      ? '<span aria-hidden="true">&#10074;&#10074;</span> Pause'
      : '<span aria-hidden="true">&#9654;</span> Play';
    playPauseButton.setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation');
  }

  function selectShape(points) {
    if (mediaRecorder) return;
    clearMessage();
    hideHint();
    loadShape(points);
    saveLastShape(points);
    sound.drawEnd();
    sound.compute();
  }

  function handleStrokeEnd() {
    const points = strokeRecorder.end();
    if (!isDrawablePath(points)) {
      showMessage('Draw a bit more — that stroke was too short to trace.');
      return;
    }
    selectShape(points);
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return centeredCanvasPoint(event.clientX, event.clientY, rect);
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (mediaRecorder) return;
    canvas.setPointerCapture(event.pointerId);
    clearMessage();
    strokeRecorder.begin(pointFromEvent(event));
    sound.drawStart();
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

  playPauseButton.addEventListener('click', () => {
    setPlaying(!animationState.playing);
  });

  restartButton.addEventListener('click', () => {
    animationState.t = 0;
    trail = [];
  });

  speedInput.addEventListener('input', () => {
    const speed = Number(speedInput.value);
    animationState.speed = speed;
    const label = Number.isInteger(speed) ? speed.toFixed(1) : String(speed);
    speedValue.textContent = `${label}×`;
  });

  exportPngButton.addEventListener('click', () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `epicycle-${timestamp}.png`;
    link.click();
    sound.exportComplete();
  });

  function resetRecordingUi() {
    exportVideoButton.disabled = !canRecordVideo;
    exportVideoButton.textContent = 'Export video';
    exportVideoButton.classList.remove('button--recording');
    playPauseButton.disabled = false;
    restartButton.disabled = false;
  }

  exportVideoButton.addEventListener('click', () => {
    if (!canRecordVideo || mediaRecorder) return;

    recordingLoopSeen = false;
    wasPlayingBeforeRecording = animationState.playing;
    if (!animationState.playing) setPlaying(true);
    exportVideoButton.disabled = true;
    exportVideoButton.textContent = 'Recording…';
    exportVideoButton.classList.add('button--recording');
    playPauseButton.disabled = true;
    restartButton.disabled = true;
    announce('Recording video…');

    // A browser can pass the feature-detection in canRecordVideo but still
    // throw synchronously here (e.g. an unsupported constraint combination);
    // without this catch that would leave the UI wedged in the disabled
    // "Recording…" state forever, since no stop event would ever fire.
    try {
      const mimeType = pickSupportedMimeType(VIDEO_MIME_CANDIDATES, (type) =>
        MediaRecorder.isTypeSupported(type)
      );
      const stream = canvas.captureStream(60);
      const chunks = [];
      mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      });
      mediaRecorder.addEventListener('stop', () => {
        mediaRecorder = null;
        resetRecordingUi();
        if (!wasPlayingBeforeRecording) setPlaying(false);
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const link = document.createElement('a');
        link.href = url;
        link.download = videoFilename(timestamp);
        link.click();
        URL.revokeObjectURL(url);
        sound.exportComplete();
        announce('Video export complete.');
      });
      mediaRecorder.start();
    } catch {
      mediaRecorder = null;
      resetRecordingUi();
      if (!wasPlayingBeforeRecording) setPlaying(false);
      showMessage('Video export failed to start in this browser.');
    }
  });

  muteToggle.addEventListener('click', () => {
    sound.setMuted(!sound.isMuted());
    reflectMuteState();
  });

  document.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      selectShape(presetPath(button.dataset.preset));
    });
  });

  // Every circle and radius line shares the same stroke style, so they're
  // batched into a single path and one stroke() call rather than one
  // beginPath()/stroke() pair per segment (up to ~120 circles a frame) —
  // that was costing real frame time (see docs/ARCHITECTURE.md Performance).
  function drawChain(cx, cy, positions) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(245, 236, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < positions.length - 1; i += 1) {
      const center = positions[i];
      const next = positions[i + 1];
      const radius = Math.hypot(next.x - center.x, next.y - center.y);
      if (radius > 0.5) {
        ctx.moveTo(center.x + radius, center.y);
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      }
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(next.x, next.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawTrail(cx, cy, points, flashing) {
    if (points.length < 2) return;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = flashing ? '#9df6ff' : '#38e8ff';
    ctx.lineWidth = flashing ? 3.5 : 2.5;
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
      if (result.looped) {
        trail = [];
        sound.loop();
        loopCount += 1;
        announce(`Loop ${loopCount} complete.`);
        if (!prefersReducedMotion) flashUntil = now + 150;
        if (mediaRecorder) {
          if (recordingLoopSeen) {
            mediaRecorder.stop();
          } else {
            recordingLoopSeen = true;
          }
        }
      }
    }

    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (activeCoefficients.length > 0) {
      const positions = chainPositions(activeCoefficients, animationState.t);
      const tip = positions[positions.length - 1];
      trail.push(tip);
      if (showCircles) drawChain(cx, cy, positions);
      drawTrail(cx, cy, trail, now < flashUntil);
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

// Signature detail (docs/DESIGN.md): the wordmark's "E" is the same
// engine, shrunk down — a tiny epicycle chain retracing the letterform
// on a loop, proving the point before the user has drawn anything.
function initWordmarkGlyph() {
  const canvas = document.getElementById('wordmark-glyph');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 40;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const resampled = resamplePath(eGlyphPath(), 60);
  const coefficients = dft(resampled).slice(0, 14);
  const state = { t: 0, playing: !prefersReducedMotion, speed: 1, loopSeconds: 3 };
  let trail = [];
  let lastTime = null;

  function draw(positions) {
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(0.9, 0.9);

    ctx.strokeStyle = 'rgba(245, 236, 255, 0.3)';
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
    }

    if (trail.length > 1) {
      ctx.strokeStyle = '#38e8ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      trail.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  if (prefersReducedMotion) {
    draw(chainPositions(coefficients, 0));
    return;
  }

  function render(now) {
    if (lastTime === null) lastTime = now;
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    const result = advanceAnimation(state, dt);
    state.t = result.t;
    if (result.looped) trail = [];

    const positions = chainPositions(coefficients, state.t);
    trail.push(positions[positions.length - 1]);
    draw(positions);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
initWordmarkGlyph();
