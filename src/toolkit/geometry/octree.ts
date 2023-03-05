import { vec3 } from 'gl-matrix';
import { Intersection } from 'toolkit/math/intersection';
import { BoundingBox } from './boundingBox';

export type OctreeNode = {
  aabb: BoundingBox;
  children: OctreeNode[];
  triangles: Maybe<number[]>;
};

export type Octree = {
  root: OctreeNode;

  intersect(aabb: BoundingBox): boolean;
};

export namespace Octree {
  namespace OctreeNode {
    export function create(aabb: BoundingBox): OctreeNode {
      return {
        aabb,
        children: [] as OctreeNode[],
        triangles: undefined,
      };
    }
  }

  export function fromMesh(mesh: {
    vertices: number[] | Float32Array | Float64Array;
    triangles: Uint32Array;
  }): Octree {
    const aabb = BoundingBox.fromMesh(mesh);
    const centre = BoundingBox.centre(aabb);

    const diff = vec3.create();
    vec3.sub(diff, aabb.max, aabb.min);
    const max = 0.5 * Math.max(diff[0], diff[1], diff[2]);

    // make a new aabb that is max size cube, centred on the original centre
    vec3.set(aabb.min, centre[0] - max, centre[1] - max, centre[2] - max);
    vec3.set(aabb.max, centre[0] + max, centre[1] + max, centre[2] + max);

    const root = OctreeNode.create(aabb);
    subdivide(root, mesh.vertices, mesh.triangles, 0, 8);

    return {
      root,

      intersect(aabb: BoundingBox) {
        // aabb octree intersection
        return false;
      },
    };
  }

  function subdivide(
    parent: OctreeNode,
    vertices: ArrayLike<number>,
    triangles: ArrayLike<number>,
    depth: number,
    maxDepth: number,
  ) {
    const parentAABB = parent.aabb;
    const offset = 0.5 * (parentAABB.max[0] - parentAABB.min[0]);
    const v0 = vec3.create();
    const v1 = vec3.create();
    const v2 = vec3.create();
    let t0: number, t1: number, t2: number;

    for (let childIdx = 0; childIdx < 8; ++childIdx) {
      const childAABB = BoundingBox.create();

      vec3.copy(childAABB.min, parentAABB.min);
      switch (childIdx) {
        case 0: {
          break;
        }
        case 1: {
          childAABB.min[0] += offset;
          break;
        }
        case 2: {
          childAABB.min[0] += offset;
          childAABB.min[1] += offset;
          break;
        }
        case 3: {
          childAABB.min[1] += offset;
          break;
        }

        case 4: {
          childAABB.min[2] += offset;
          break;
        }
        case 5: {
          childAABB.min[0] += offset;
          childAABB.min[2] += offset;
          break;
        }
        case 6: {
          childAABB.min[0] += offset;
          childAABB.min[1] += offset;
          childAABB.min[2] += offset;
          break;
        }
        case 7: {
          childAABB.min[1] += offset;
          childAABB.min[2] += offset;
          break;
        }
      }

      vec3.set(
        childAABB.max,
        childAABB.min[0] + offset,
        childAABB.min[1] + offset,
        childAABB.min[2] + offset,
      );

      const child = OctreeNode.create(childAABB);
      const centre = BoundingBox.centre(childAABB);
      const halfSize = BoundingBox.halfSize(childAABB);

      // TODO: should this be a "resizable" ArrayBuffer?
      const childTris: number[] = [];
      for (let tri = 0; tri < triangles.length; tri += 3) {
        t0 = triangles[tri];
        t1 = triangles[tri + 1];
        t2 = triangles[tri + 2];

        v0[0] = vertices[t0 * 3];
        v0[1] = vertices[t0 * 3 + 1];
        v0[2] = vertices[t0 * 3 + 2];

        v1[0] = vertices[t1 * 3];
        v1[1] = vertices[t1 * 3 + 1];
        v1[2] = vertices[t1 * 3 + 2];

        v2[0] = vertices[t2 * 3];
        v2[1] = vertices[t2 * 3 + 1];
        v2[2] = vertices[t2 * 3 + 2];

        if (Intersection.triangleAABB(v0, v1, v2, centre, halfSize)) {
          childTris.push(t0, t1, t2);
        }
      }

      parent.children.push(child);

      // we are at a leaf node so save the triangles
      if (depth === maxDepth || childTris.length === 0) {
        child.triangles = childTris;
      }

      if (childTris.length > 0 && depth < maxDepth) {
        subdivide(child, vertices, childTris, depth + 1, maxDepth);
      }
    }
  }
}
