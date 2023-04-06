import { vec3 } from 'gl-matrix';
import { intersectAABB, intersectRayAABB } from 'toolkit/math/intersect/aabb';
import { intersectTriangleAABB } from 'toolkit/math/intersect/triangleAABB';
import type { Ray } from 'toolkit/math/ray';
import { BoundingBox } from './boundingBox';

// TODO: can we store the octree in some form of flat buffers?

export type OctreeNode = {
  aabb: BoundingBox;
  children: OctreeNode[];
  triangles: Maybe<number[]>;
};

export type Octree = {
  root: OctreeNode;

  intersectAABB(aabb: BoundingBox): boolean;
  intersectRay(ray: Ray): boolean;
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

  let v0: vec3;
  let v1: vec3;
  let v2: vec3;
  let centre: vec3;
  let halfSize: vec3;

  export function fromMesh(mesh: {
    aabb: BoundingBox;
    vertices: number[] | Float32Array | Float64Array;
    triangles: Uint32Array;
  }): Octree {
    v0 = vec3.create();
    v1 = vec3.create();
    v2 = vec3.create();
    centre = vec3.create();
    halfSize = vec3.create();

    const aabb = BoundingBox.create();
    vec3.copy(aabb.min, mesh.aabb.min);
    vec3.copy(aabb.max, mesh.aabb.max);
    BoundingBox.centre(aabb, centre);

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

      intersectAABB(aabb: BoundingBox) {
        return intersectOctreeAABB(root, aabb);
      },
      intersectRay(ray: Ray) {
        return intersectOctreeRay(root, ray);
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
      BoundingBox.centre(childAABB, centre);
      BoundingBox.halfSize(childAABB, halfSize);

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

        if (intersectTriangleAABB(v0, v1, v2, centre, halfSize)) {
          childTris.push(t0, t1, t2);
        }
      }

      parent.children.push(child);

      if (childTris.length > 0) {
        if (depth === maxDepth) {
          child.triangles = childTris;
        } else {
          subdivide(child, vertices, childTris, depth + 1, maxDepth);
        }
      }
    }
  }

  function intersectOctreeAABB(node: OctreeNode, aabb: BoundingBox): boolean {
    if (!intersectAABB(node.aabb, aabb)) {
      return false;
    }

    if (node.children.length === 0) {
      if (node.triangles !== undefined && node.triangles.length > 0) {
        return true;
      }
      return false;
    }

    let child: OctreeNode;
    let result: boolean;
    for (let childIdx = 0; childIdx < node.children.length; ++childIdx) {
      child = node.children[childIdx];
      result = intersectOctreeAABB(child, aabb);
      if (result) {
        return true;
      }
    }

    return false;
  }

  function intersectOctreeRay(node: OctreeNode, ray: Ray): boolean {
    if (!intersectRayAABB(ray, node.aabb)) {
      return false;
    }

    if (node.children.length === 0) {
      if (node.triangles !== undefined && node.triangles.length > 0) {
        return true;
      }
      return false;
    }

    let child: OctreeNode;
    let result: boolean;
    for (let childIdx = 0; childIdx < node.children.length; ++childIdx) {
      child = node.children[childIdx];

      result = intersectOctreeRay(child, ray);
      if (result) {
        return result;
      }
    }

    return false;
  }
}
