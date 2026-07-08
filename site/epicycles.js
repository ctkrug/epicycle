import { complex, add, fromPolar } from './complex.js';

// The cumulative positions of every circle's center in the chain, in
// nesting order: index 0 is always the origin, and the final entry is the
// combined tip used to trace the shape. Rendering the circle chain and
// reconstructing the tip are the same computation viewed at two grain sizes.
export function chainPositions(coefficients, t) {
  const positions = [complex(0, 0)];
  let sum = complex(0, 0);
  for (const { freq, amp, phase: coefficientPhase } of coefficients) {
    const angle = freq * 2 * Math.PI * t + coefficientPhase;
    sum = add(sum, fromPolar(amp, angle));
    positions.push(sum);
  }
  return positions.map((p) => ({ x: p.re, y: p.im }));
}

export function reconstructAt(coefficients, t) {
  const positions = chainPositions(coefficients, t);
  return positions[positions.length - 1];
}

export function tracePath(coefficients, steps) {
  const path = [];
  for (let i = 0; i < steps; i += 1) {
    path.push(reconstructAt(coefficients, i / steps));
  }
  return path;
}
