import { vec3 } from 'gl-matrix';
import { BoundingBox } from 'toolkit/geometry/boundingBox';
import type { Frustum } from '../frustum';
import { Plane } from '../plane';

export enum FrustumIntersection {
  Inside,
  Outside,
  Intersect,
}

export function intersectFrustumAABB(frustum: Frustum, aabb: BoundingBox): FrustumIntersection {
  const planes = frustum.planes;

  let result = FrustumIntersection.Inside;
  let tmp = vec3.create();

  for (let i = 0; i < frustum.planes.length; ++i) {
    if (
      Plane.signedDistanceToPoint(
        planes[i],
        BoundingBox.getPositiveVertex(tmp, aabb, planes[i].normal),
      ) < 0
    ) {
      result = FrustumIntersection.Outside;
    } else if (
      Plane.signedDistanceToPoint(
        planes[i],
        BoundingBox.getNegativeVertex(tmp, aabb, planes[i].normal),
      ) < 0
    ) {
      result = FrustumIntersection.Intersect;
    }
  }

  return result;
}
