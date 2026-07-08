export function complex(re, im = 0) {
  return { re, im };
}

export function add(a, b) {
  return complex(a.re + b.re, a.im + b.im);
}

export function multiply(a, b) {
  return complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
}

export function magnitude(c) {
  return Math.hypot(c.re, c.im);
}

export function phase(c) {
  return Math.atan2(c.im, c.re);
}

export function fromPolar(radius, angle) {
  return complex(radius * Math.cos(angle), radius * Math.sin(angle));
}
