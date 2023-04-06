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

  // function intersectRayAABB(rayOrigin, rayDirection, aabbMin, aabbMax) {
  //   // Calculate the inverse direction of the ray direction vector
  //   var invDirX = 1.0 / rayDirection[0];
  //   var invDirY = 1.0 / rayDirection[1];
  //   var invDirZ = 1.0 / rayDirection[2];
  //
  //   // Calculate the t-values for the two planes intersected by the ray and the AABB
  //   var txMin = (aabbMin[0] - rayOrigin[0]) * invDirX;
  //   var txMax = (aabbMax[0] - rayOrigin[0]) * invDirX;
  //   var tyMin = (aabbMin[1] - rayOrigin[1]) * invDirY;
  //   var tyMax = (aabbMax[1] - rayOrigin[1]) * invDirY;
  //   var tzMin = (aabbMin[2] - rayOrigin[2]) * invDirZ;
  //   var tzMax = (aabbMax[2] - rayOrigin[2]) * invDirZ;
  //
  //   // Find the maximum and minimum t-values for the AABB intersection
  //   var tMin = Math.max(Math.max(Math.min(txMin, txMax), Math.min(tyMin, tyMax)), Math.min(tzMin, tzMax));
  //   var tMax = Math.min(Math.min(Math.max(txMin, txMax), Math.max(tyMin, tyMax)), Math.max(tzMin, tzMax));
  //
  //   // Check if the ray actually intersects the AABB
  //   if (tMax < 0 || tMin > tMax) {
  //     return null;
  //   }
  //
  //   // If tMin is negative, the ray originates inside the AABB
  //   var distance = tMin >= 0 ? tMin : tMax;
  //
  //   // Calculate the point of intersection
  //   var intersection = [
  //     rayOrigin[0] + distance * rayDirection[0],
  //     rayOrigin[1] + distance * rayDirection[1],
  //     rayOrigin[2] + distance * rayDirection[2]
  //   ];
  //
  //   return intersection;
  // }
}
