import type { BoundingBox } from 'toolkit/geometry/boundingBox';
import type { Ray } from '../ray';

export function intersectAABB(a: BoundingBox, b: BoundingBox): boolean {
  if (a.min[0] > b.max[0] || b.min[0] > a.max[0]) return false;
  if (a.min[1] > b.max[1] || b.min[1] > a.max[1]) return false;
  if (a.min[2] > b.max[2] || b.min[2] > a.max[2]) return false;

  return true;
}

export function intersectRayAABB(ray: Ray, aabb: BoundingBox): boolean {
  // Calculate the inverse direction of the ray direction vector
  const invDirX = ray.dir[0] !== 0 ? 1.0 / ray.dir[0] : 0;
  const invDirY = ray.dir[1] !== 0 ? 1.0 / ray.dir[1] : 0;
  const invDirZ = ray.dir[2] !== 0 ? 1.0 / ray.dir[2] : 0;

  // TODO: read about ray aabb intersections
  const t1 = (aabb.min[0] - ray.origin[0]) * invDirX;
  const t2 = (aabb.max[0] - ray.origin[0]) * invDirX;

  const t3 = (aabb.min[1] - ray.origin[1]) * invDirY;
  const t4 = (aabb.max[1] - ray.origin[1]) * invDirY;

  const t5 = (aabb.min[2] - ray.origin[2]) * invDirZ;
  const t6 = (aabb.max[2] - ray.origin[2]) * invDirZ;

  const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
  const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

  // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
  if (tmax < 0) {
    return false;
  }

  // if tmin > tmax, ray doesn't intersect AABB
  if (tmin > tmax) {
    return false;
  }

  return true;
}

