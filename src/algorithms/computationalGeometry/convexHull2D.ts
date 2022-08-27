import { isRightTurn } from 'toolkit/math/vec2';

export function computeConvexHull2D(vertices: Int32Array) {
  // sort the points in the x coordinate
  const sorted = [];
  const count = vertices.length / 2;
  for (let i = 0; i < count; ++i) {
    sorted.push([vertices[i * 2], vertices[i * 2 + 1]]);
  }
  sorted.sort((p1, p2) => {
    const xDiff = p1[0] - p2[0];
    if (xDiff !== 0) {
      return xDiff;
    }

    return p1[1] - p2[1];
  });

  const upper = [];
  upper.push(sorted[0], sorted[1]);
  for (let i = 2; i < count; ++i) {
    upper.push(sorted[i]);

    while (upper.length > 2) {
      const p0 = upper[upper.length - 3];
      const p1 = upper[upper.length - 2];
      const p2 = upper[upper.length - 1];

      if (isRightTurn(p0, p1, p2)) {
        break;
      }

      upper.splice(upper.length - 2, 1);
    }
  }

  const lower = [];
  lower.push(sorted[sorted.length - 1], sorted[sorted.length - 2]);
  for (let i = sorted.length - 3; i >= 0; --i) {
    lower.push(sorted[i]);

    while (lower.length > 2) {
      const p0 = lower[lower.length - 3];
      const p1 = lower[lower.length - 2];
      const p2 = lower[lower.length - 1];

      if (isRightTurn(p0, p1, p2)) {
        break;
      }
      lower.splice(lower.length - 2, 1);
    }
  }

  lower.splice(0, 1);
  lower.splice(lower.length - 1, 1);
  return upper.concat(lower);
}
