import { complex, add, fromPolar } from './complex.js';

export function reconstructAt(coefficients, t) {
  let sum = complex(0, 0);
  for (const { freq, amp, phase: coefficientPhase } of coefficients) {
    const angle = freq * 2 * Math.PI * t + coefficientPhase;
    sum = add(sum, fromPolar(amp, angle));
  }
  return { x: sum.re, y: sum.im };
}

export function tracePath(coefficients, steps) {
  const path = [];
  for (let i = 0; i < steps; i += 1) {
    path.push(reconstructAt(coefficients, i / steps));
  }
  return path;
}
