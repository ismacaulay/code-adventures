import { vec3 } from 'gl-matrix';

export type Plane = {
  normal: vec3;
  constant: number;
};

export module Plane {
  export function create(): Plane {
    return {
      normal: vec3.create(),
      constant: 0,
    };
  }

  export function setValues(out: Plane, a: number, b: number, c: number, d: number): Plane {
    out.normal[0] = a;
    out.normal[1] = b;
    out.normal[2] = c;
    out.constant = d;

    return out;
  }

  export function normalize(out: Plane, p: Plane): Plane {
    const invMag =
      1.0 /
      Math.sqrt(p.normal[0] * p.normal[0] + p.normal[1] * p.normal[1] + p.normal[2] * p.normal[2]);

    out.normal[0] = p.normal[0] * invMag;
    out.normal[1] = p.normal[1] * invMag;
    out.normal[2] = p.normal[2] * invMag;
    out.constant = p.constant * invMag;

    return out;
  }

  export function signedDistanceToPoint(pl: Plane, p: vec3): number {
    return pl.normal[0] * p[0] + pl.normal[1] * p[1] + pl.normal[2] * p[2] + pl.constant;
  }
}
