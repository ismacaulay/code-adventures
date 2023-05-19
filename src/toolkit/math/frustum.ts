import type { mat4 } from 'gl-matrix';
import { Plane } from './plane';

type FrustumPlanes = [Plane, Plane, Plane, Plane, Plane, Plane];

export type Frustum = {
  planes: FrustumPlanes;

  left: Plane;
  right: Plane;
  bottom: Plane;
  top: Plane;
  near: Plane;
  far: Plane;
};

export module Frustum {
  export function create(): Frustum {
    const planes: FrustumPlanes = [
      Plane.create(),
      Plane.create(),
      Plane.create(),
      Plane.create(),
      Plane.create(),
      Plane.create(),
    ];

    return {
      get planes() {
        return planes;
      },

      get left() {
        return planes[0];
      },
      get right() {
        return planes[1];
      },

      get top() {
        return planes[2];
      },
      get bottom() {
        return planes[3];
      },

      get near() {
        return planes[4];
      },
      get far() {
        return planes[5];
      },
    };
  }

  export function setFromMatrix(out: Frustum, matrix: mat4): Frustum {
    const m03 = matrix[3],
      m13 = matrix[7],
      m23 = matrix[11],
      m33 = matrix[15];

    Plane.setValues(out.left, m03 + matrix[0], m13 + matrix[4], m23 + matrix[8], m33 + matrix[12]);
    Plane.setValues(out.right, m03 - matrix[0], m13 - matrix[4], m23 - matrix[8], m33 - matrix[12]);

    Plane.setValues(out.bottom, m03 + matrix[1], m13 + matrix[5], m23 + matrix[9], m33 + matrix[13]);
    Plane.setValues(out.top, m03 - matrix[1], m13 - matrix[5], m23 - matrix[9], m33 - matrix[13]);

    Plane.setValues(out.near, m03 + matrix[2], m13 + matrix[6], m23 + matrix[10], m33 + matrix[14]);
    Plane.setValues(out.far, m03 - matrix[2], m13 - matrix[6], m23 - matrix[10], m33 - matrix[14]);

    return out;
  }
}
