import type { BoundingBox } from 'toolkit/geometry/boundingBox';

export function intersectAABB(a: BoundingBox, b: BoundingBox): boolean {
  if (a.min[0] > b.max[0] || b.min[0] > a.max[0]) return false;
  if (a.min[1] > b.max[1] || b.min[1] > a.max[1]) return false;
  if (a.min[2] > b.max[2] || b.min[2] > a.max[2]) return false;

  return true;
}
