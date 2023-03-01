import { vec3 } from 'gl-matrix';

export type BoundingBox = { min: vec3; max: vec3 };

export function computeBoundingBox(vertices: number[] | Float32Array | Float64Array): BoundingBox {
  if (vertices.length < 3) {
    throw new Error('[computeBoundingBox] Not enough vertices to produce a bounding box');
  }

  const min: vec3 = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  const max: vec3 = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

  let x, y, z;
  for (let i = 0; i < vertices.length; i += 3) {
    x = vertices[i];
    y = vertices[i + 1];
    z = vertices[i + 2];

    if (x < min[0]) {
      min[0] = x;
    }

    if (x > max[0]) {
      max[0] = x;
    }

    if (y < min[1]) {
      min[1] = y;
    }

    if (y > max[1]) {
      max[1] = y;
    }

    if (z < min[2]) {
      min[2] = z;
    }

    if (z > max[2]) {
      max[2] = z;
    }
  }

  return { min, max };
}

export function computeBoundingBoxCentre(boundingBox: BoundingBox): vec3 {
  const result = vec3.create();

  vec3.sub(result, boundingBox.max, boundingBox.min);
  vec3.scale(result, result, 0.5);
  return vec3.add(result, boundingBox.min, result);
}
