const DEFAULT_RESOLUTION = 200;

function star() {
  const spikes = 5;
  const outerRadius = 150;
  const innerRadius = 60;
  const points = [];
  for (let i = 0; i <= spikes * 2; i += 1) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
  }
  return points;
}

function heart(resolution = DEFAULT_RESOLUTION) {
  const points = [];
  const scale = 9;
  for (let i = 0; i <= resolution; i += 1) {
    const t = (i / resolution) * 2 * Math.PI;
    const x = scale * 16 * Math.sin(t) ** 3;
    const y =
      -scale *
      (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    points.push({ x, y });
  }
  return points;
}

function infinity(resolution = DEFAULT_RESOLUTION) {
  const points = [];
  const scale = 150;
  for (let i = 0; i <= resolution; i += 1) {
    const t = (i / resolution) * 2 * Math.PI;
    const denom = 1 + Math.sin(t) ** 2;
    points.push({
      x: (scale * Math.cos(t)) / denom,
      y: (scale * Math.sin(t) * Math.cos(t)) / denom,
    });
  }
  return points;
}

export const PRESETS = { star, heart, infinity };

export function presetPath(name, resolution = DEFAULT_RESOLUTION) {
  const generator = PRESETS[name];
  if (!generator) {
    throw new Error(`Unknown preset: ${name}`);
  }
  return generator(resolution);
}
