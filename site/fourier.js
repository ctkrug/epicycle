import { complex, add, multiply, fromPolar, magnitude, phase } from './complex.js';

export function dft(points) {
  const n = points.length;
  const coefficients = [];

  for (let k = 0; k < n; k += 1) {
    let sum = complex(0, 0);
    for (let t = 0; t < n; t += 1) {
      const angle = (-2 * Math.PI * k * t) / n;
      const contribution = multiply(complex(points[t].x, points[t].y), fromPolar(1, angle));
      sum = add(sum, contribution);
    }
    sum = complex(sum.re / n, sum.im / n);

    const freq = k > n / 2 ? k - n : k;
    coefficients.push({ freq, amp: magnitude(sum), phase: phase(sum) });
  }

  return coefficients.sort((a, b) => b.amp - a.amp);
}
