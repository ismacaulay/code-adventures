import { vec2 } from 'gl-matrix';

export function isRightTurn(p0: vec2, p1: vec2, p2: vec2) {
  const p01 = vec2.create();
  const p02 = vec2.create();

  vec2.sub(p01, p1, p0);
  vec2.sub(p02, p2, p0);
  return p01[0] * p02[1] - p01[1] * p02[0] > 0;
}
