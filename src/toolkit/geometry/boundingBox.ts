import { vec3 } from 'gl-matrix';

export type BoundingBox = { min: vec3; max: vec3 };

export module BoundingBox {
  export function create(): BoundingBox {
    return { min: vec3.create(), max: vec3.create() };
  }

  export function clone(bb: BoundingBox): BoundingBox {
    return {
      min: vec3.clone(bb.min),
      max: vec3.clone(bb.max),
    };
  }

  export function copy(out: BoundingBox, bb: BoundingBox): BoundingBox {
    vec3.copy(out.min, bb.min);
    vec3.copy(out.max, bb.max);
    return out;
  }

  export function fromMesh(mesh: {
    vertices: number[] | Float32Array | Float64Array;
    triangles: Uint32Array;
  }): BoundingBox {
    const { triangles, vertices } = mesh;

    const min: vec3 = [
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    ];
    const max: vec3 = [
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ];

    let tri, x, y, z;
    for (let i = 0; i < triangles.length; ++i) {
      tri = triangles[i];
      x = vertices[tri * 3];
      y = vertices[tri * 3 + 1];
      z = vertices[tri * 3 + 2];

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

  export function fromVertices(vertices: number[] | Float32Array | Float64Array): BoundingBox {
    if (vertices.length < 3) {
      throw new Error('[BoundingBox.fromVertices] Not enough vertices to produce a bounding box');
    }

    const min: vec3 = [
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    ];
    const max: vec3 = [
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ];

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

  export function fromBoundingBoxes(boxes: BoundingBox[]): BoundingBox {
    if (boxes.length <= 0) {
      throw new Error('No bounding boxes');
    }

    const min = vec3.clone(boxes[0].min);
    const max = vec3.clone(boxes[0].max);

    let box: BoundingBox;
    for (let i = 1; i < boxes.length; ++i) {
      box = boxes[i];

      if (box.min[0] < min[0]) {
        min[0] = box.min[0];
      }

      if (box.max[0] > max[0]) {
        max[0] = box.max[0];
      }

      if (box.min[1] < min[1]) {
        min[1] = box.min[1];
      }

      if (box.max[1] > max[1]) {
        max[1] = box.max[1];
      }

      if (box.min[2] < min[2]) {
        min[2] = box.min[2];
      }

      if (box.max[2] > max[2]) {
        max[2] = box.max[2];
      }
    }

    return { min, max };
  }

  export function centre(bb: BoundingBox, out?: vec3): vec3 {
    const result = out ?? vec3.create();
    halfSize(bb, result);
    return vec3.add(result, bb.min, result);
  }

  export function halfSize(bb: BoundingBox, out?: vec3): vec3 {
    const result = out ?? vec3.create();
    vec3.sub(result, bb.max, bb.min);
    vec3.scale(result, result, 0.5);
    return result;
  }

  export function diagonal(bb: BoundingBox): number {
    return Math.hypot(bb.max[0] - bb.min[0], bb.max[1] - bb.min[1], bb.max[2] - bb.min[2]);
  }

  export function corners(bb: BoundingBox): vec3[] {
    return [
      vec3.fromValues(bb.min[0], bb.min[1], bb.min[2]),
      vec3.fromValues(bb.min[0], bb.max[1], bb.min[2]),
      vec3.fromValues(bb.max[0], bb.max[1], bb.min[2]),
      vec3.fromValues(bb.max[0], bb.min[1], bb.min[2]),

      vec3.fromValues(bb.min[0], bb.min[1], bb.max[2]),
      vec3.fromValues(bb.min[0], bb.max[1], bb.max[2]),
      vec3.fromValues(bb.max[0], bb.max[1], bb.max[2]),
      vec3.fromValues(bb.max[0], bb.min[1], bb.max[2]),
    ];
  }

  export function getPositiveVertex(out: vec3, bb: BoundingBox, n: vec3): vec3 {
    out[0] = bb.min[0];
    out[1] = bb.min[1];
    out[2] = bb.min[2];

    if (n[0] >= 0) {
      out[0] = bb.max[0];
    }

    if (n[1] >= 0) {
      out[1] = bb.max[1];
    }

    if (n[2] >= 0) {
      out[2] = bb.max[2];
    }

    return out;
  }

  export function getNegativeVertex(out: vec3, bb: BoundingBox, n: vec3): vec3 {
    out[0] = bb.max[0];
    out[1] = bb.max[1];
    out[2] = bb.max[2];

    if (n[0] >= 0) {
      out[0] = bb.min[0];
    }

    if (n[1] >= 0) {
      out[1] = bb.min[1];
    }

    if (n[2] >= 0) {
      out[2] = bb.min[2];
    }

    return out;
  }

  export function toString(bb: BoundingBox) {
    return `min: ${bb.min[0]}, ${bb.min[1]}, ${bb.min[2]} max: ${bb.max[0]}, ${bb.max[1]}, ${bb.max[2]}`;
  }
}
