import { vec3 } from 'gl-matrix';
import { intersectAABB, intersectRayAABB } from 'toolkit/math/intersect/aabb';
import { intersectTriangleAABB } from 'toolkit/math/intersect/triangleAABB';
import type { Ray } from 'toolkit/math/ray';
import { BoundingBox } from './boundingBox';

// TODO: can we make this better?
type InternalChildNode = {
  aabb: BoundingBox;
  centre: vec3;
  halfSize: vec3;
  triangles: number[];
};

// let missCount = 0;
// let missSet = new Set<[number, number, number]>();

export namespace Octree {
  let v0: vec3;
  let v1: vec3;
  let v2: vec3;
  let centre: vec3;
  let halfSize: vec3;

  export function fromMesh(mesh: {
    aabb: BoundingBox;
    vertices: number[] | Float32Array | Float64Array;
    triangles: Uint32Array;
  }): MeshOctree {
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

    const octreeBuffer = createMeshOctreeBuffer();
    subdivide(octreeBuffer, aabb, mesh.vertices, mesh.triangles, 1, 8);

    // console.log('Misssed triangles: ', missSet.size);

    return createMeshOctree(octreeBuffer.buffer);
  }

  function subdivide(
    octree: MeshOctreeBuffer,
    parentAABB: BoundingBox,
    vertices: ArrayLike<number>,
    triangles: ArrayLike<number>,
    depth: number,
    maxDepth: number,
  ) {
    const offset = 0.5 * (parentAABB.max[0] - parentAABB.min[0]);
    let t0: number, t1: number, t2: number;

    const children: InternalChildNode[] = [];

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

      BoundingBox.centre(childAABB, centre);
      BoundingBox.halfSize(childAABB, halfSize);
      children.push({
        aabb: childAABB,
        centre: vec3.clone(centre),
        halfSize: vec3.clone(halfSize),
        triangles: [],
      });
    }

    let child: InternalChildNode;
    // let found: boolean;
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

      // found = false;
      for (let i = 0; i < children.length; ++i) {
        child = children[i];

        // TODO: There is an edge case missing here
        if (intersectTriangleAABB(v0, v1, v2, child.centre, child.halfSize)) {
          child.triangles.push(t0, t1, t2);
          // found = true;
        }

        // if (!found) {
        //   const value: [number, number, number] = [t0, t1, t2];
        //   if (missSet.has(value)) {
        //     console.log('Already set missed triangle');
        //   } else {
        //     missSet.add(value);
        //   }
        //   missCount++;
        // }
      }
    }

    const ptr = octree.createInternalNode(parentAABB);
    let childPtr: number;
    for (let i = 0; i < children.length; ++i) {
      child = children[i];

      if (child.triangles.length > 0) {
        if (depth === maxDepth) {
          childPtr = octree.writeLeafNode(child.aabb, child.triangles);
        } else {
          childPtr = subdivide(octree, child.aabb, vertices, child.triangles, depth + 1, maxDepth);
        }
      } else {
        childPtr = -1;
      }

      octree.writeInternalNodeChild(ptr, i, childPtr);
    }
    return ptr;
  }
}

export enum NodeType {
  Internal = 0,
  Leaf = 1,
}

type MeshOctreeBuffer = {
  buffer: Float32Array;
  ptr: number;

  createInternalNode(aabb: BoundingBox): number;
  writeInternalNodeChild(ptr: number, idx: number, childPtr: number): void;
  writeLeafNode(aabb: BoundingBox, indices: ArrayLike<number>): number;
};

function createMeshOctreeBuffer(): MeshOctreeBuffer {
  // TODO: should be an ArrayBuffer?
  // TODO: may need to be a Float64Array
  let buffer = new Float32Array(65536);
  let ptr = 0;

  function resizeBuffer() {
    const newBuffer = new Float32Array(buffer.length * 2);
    // console.log('[resizeBuffer] resizing: ', buffer.length, newBuffer.length);
    newBuffer.set(buffer);
    buffer = newBuffer;
  }

  return {
    get buffer() {
      return buffer;
    },
    get ptr() {
      return ptr;
    },

    createInternalNode(aabb: BoundingBox) {
      if (ptr + 15 > buffer.length) {
        resizeBuffer();
      }

      const curPtr = ptr;

      // type
      buffer[ptr] = NodeType.Internal;

      // AABB
      buffer[ptr + 1] = aabb.min[0];
      buffer[ptr + 2] = aabb.min[1];
      buffer[ptr + 3] = aabb.min[2];

      buffer[ptr + 4] = aabb.max[0];
      buffer[ptr + 5] = aabb.max[1];
      buffer[ptr + 6] = aabb.max[2];

      // children pointers
      ptr += 15;

      return curPtr;
    },

    writeInternalNodeChild(ptr: number, idx: number, childPtr: number) {
      buffer[ptr + 7 + idx] = childPtr;
    },

    writeLeafNode(aabb: BoundingBox, indices: ArrayLike<number>) {
      // TODO: might be a bad way, maybe we should build a book system or something?
      if (ptr + 8 + indices.length > buffer.length) {
        resizeBuffer();
      }

      const curPtr = ptr;

      // type
      buffer[ptr] = NodeType.Leaf;

      // AABB
      buffer[ptr + 1] = aabb.min[0];
      buffer[ptr + 2] = aabb.min[1];
      buffer[ptr + 3] = aabb.min[2];

      buffer[ptr + 4] = aabb.max[0];
      buffer[ptr + 5] = aabb.max[1];
      buffer[ptr + 6] = aabb.max[2];

      // indices
      buffer[ptr + 7] = indices.length;

      buffer.set(indices, ptr + 8);
      ptr += 8 + indices.length;

      return curPtr;
    },
  };
}

export type MeshOctreeInternalNode = {
  type: NodeType.Internal;
  aabb: BoundingBox;
  children: ArrayLike<number>;
};

export type MeshOctreeLeafNode = {
  type: NodeType.Leaf;
  aabb: BoundingBox;
  count: number;
  indices: ArrayLike<number>;
};

export type MeshOctreeNode = MeshOctreeInternalNode | MeshOctreeLeafNode;

export type MeshOctree = {
  buffer: Float32Array;
  getRoot(): MeshOctreeInternalNode;
  getNode(ptr: number): MeshOctreeNode;
};

export function createMeshOctree(buf: Float32Array): MeshOctree {
  const buffer = buf;

  let root: MeshOctreeInternalNode | undefined;
  const cache: Map<number, MeshOctreeNode> = new Map();

  return {
    get buffer() {
      return buffer;
    },

    // Assumes the buffer will not change
    getRoot() {
      if (root) {
        return root;
      }

      root = {
        type: NodeType.Internal,
        aabb: {
          min: vec3.fromValues(buffer[1], buffer[2], buffer[3]),
          max: vec3.fromValues(buffer[4], buffer[5], buffer[6]),
        },
        children: buffer.subarray(7, 15),
      };
      return root;
    },

    // Assumes the buffer will not change
    getNode(ptr: number) {
      let node = cache.get(ptr);
      if (node) {
        return node;
      }

      // TODO: validate ptr;
      const type = buffer[ptr];
      const aabb = {
        min: vec3.fromValues(buffer[ptr + 1], buffer[ptr + 2], buffer[ptr + 3]),
        max: vec3.fromValues(buffer[ptr + 4], buffer[ptr + 5], buffer[ptr + 6]),
      };

      if (type === NodeType.Internal) {
        // [ptr: type, ptr+1: aabb, ptr+7: children]
        node = {
          type,
          aabb,
          children: buffer.subarray(ptr + 7, ptr + 15), // start: inclusive, end: exclusive,
        };
      } else if (type === NodeType.Leaf) {
        // [ptr: type, ptr+1: aabb, ptr+7: count, ptr+8: indices]
        node = {
          type,
          aabb,
          count: buffer[ptr + 7],
          indices: buffer.subarray(ptr + 8, ptr + 8 + buffer[ptr + 7]), // start: inclusive, end: exclusive,
        };
      } else {
        throw new Error(`Unknown node type: ${type}`);
      }

      cache.set(ptr, node);
      return node;
    },
  };
}

export function intersectOctreeAABB(octree: MeshOctree, aabb: BoundingBox): boolean {
  return intersectOctreeNodeAABB(octree, octree.getRoot(), aabb);
}

function intersectOctreeNodeAABB(octree: MeshOctree, node: MeshOctreeNode, aabb: BoundingBox) {
  if (!intersectAABB(node.aabb, aabb)) {
    return false;
  }

  if (node.type === NodeType.Leaf) {
    return true;
  }

  let result: boolean;
  let child: number;
  for (let childIdx = 0; childIdx < node.children.length; ++childIdx) {
    child = node.children[childIdx];
    if (child === -1) {
      continue;
    }

    result = intersectOctreeNodeAABB(octree, octree.getNode(child), aabb);
    if (result) {
      return true;
    }
  }

  return false;
}

export function intersectOctreeRay(octree: MeshOctree, ray: Ray): boolean {
  // return intersectOctreeNodeRay(octree, octree.getRoot(), ray);
  return intersectOctreeNodeRay2(octree, ray);
}

function intersectOctreeNodeRay(octree: MeshOctree, node: MeshOctreeNode, ray: Ray): boolean {
  if (!intersectRayAABB(ray, node.aabb)) {
    return false;
  }

  if (node.type === NodeType.Leaf) {
    // TODO: this should technically check all the of child triangles in the octree
    return true;
  }

  let result: boolean;
  let child: number;
  for (let childIdx = 0; childIdx < node.children.length; ++childIdx) {
    child = node.children[childIdx];
    if (child === -1) {
      continue;
    }

    result = intersectOctreeNodeRay(octree, octree.getNode(child), ray);
    if (result) {
      return result;
    }
  }

  return false;
}

function intersectOctreeNodeRay2(octree: MeshOctree, ray: Ray): boolean {
  const stack: number[] = [];
  const root = octree.getRoot();
  for (let i = 0; i < root.children.length; ++i) {
    stack.push(root.children[i]);
  }

  let nodePtr: number;
  let node: MeshOctreeNode;

  while (stack.length > 0) {
    nodePtr = stack.pop()!;
    if (nodePtr === -1) {
      continue;
    }

    node = octree.getNode(nodePtr);
    if (!intersectRayAABB(ray, node.aabb)) {
      continue;
    }

    if (node.type === NodeType.Leaf) {
      return true;
    }

    for (let i = 0; i < node.children.length; ++i) {
      stack.push(node.children[i]);
    }
  }

  return false;
}
