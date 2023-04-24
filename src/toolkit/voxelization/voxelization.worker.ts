import { vec3 } from 'gl-matrix';
import { BoundingBox } from 'toolkit/geometry/boundingBox';
import {
  createMeshOctree,
  intersectOctreeAABB,
  NodeType,
  type MeshOctree,
  type MeshOctreeNode,
} from 'toolkit/geometry/octree';
import { VoxelChunk, VoxelState } from 'toolkit/geometry/voxel';
import { createIsAABBInsideMesh } from './utils';

let context:
  | {
      octree: MeshOctree;
      voxelSize: vec3;
      isAABBInsideMesh: (aabb: BoundingBox) => boolean;
    }
  | undefined = undefined;

onmessage = function handleWorkerMessage(msg: MessageEvent) {
  const { data } = msg;

  const { workerId, name, args } = data;
  if (name === 'init') {
    const [buffer, voxelSize] = args;
    const octree = createMeshOctree(buffer);
    const isAABBInsideMesh = createIsAABBInsideMesh(octree);

    // prime the node cache
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
      if (node.type === NodeType.Internal) {
        for (let i = 0; i < node.children.length; ++i) {
          stack.push(node.children[i]);
        }
      }
    }

    context = {
      octree,
      voxelSize,
      isAABBInsideMesh,
    };
    // console.log(context.octree.buffer);
  } else if (name === 'processChunk') {
    if (!context) {
      // todo handle error;
      console.warn('Worker not initialized yet');
      postMessage({ workerId, result: undefined });
      return;
    }

    const [x, y, z, chunkAABB] = args;
    const chunk = VoxelChunk.create();
    const chunkBlockCount = VoxelChunk.CHUNK_SIZE;
    const blockAABB = BoundingBox.create();
    const { octree, voxelSize, isAABBInsideMesh } = context;

    // if the chunkAABB intersects with the mesh, build the chunk leaf nodes
    // by checking if each block intersects with the mesh
    if (intersectOctreeAABB(octree, chunkAABB)) {
      for (let k = 0; k < chunkBlockCount[2]; ++k) {
        for (let j = 0; j < chunkBlockCount[1]; ++j) {
          for (let i = 0; i < chunkBlockCount[0]; ++i) {
            vec3.set(
              blockAABB.min,
              chunkAABB.min[0] + i * voxelSize[0],
              chunkAABB.min[1] + j * voxelSize[1],
              chunkAABB.min[2] + k * voxelSize[2],
            );
            vec3.add(blockAABB.max, blockAABB.min, voxelSize);

            if (intersectOctreeAABB(octree, blockAABB)) {
              chunk.addVoxel(i, j, k, VoxelState.Intersects);
            } else if (isAABBInsideMesh(blockAABB)) {
              chunk.addVoxel(i, j, k, VoxelState.Inside);
            }
          }
        }
      }
    } else if (isAABBInsideMesh(chunkAABB)) {
      chunk.setAllVoxels(VoxelState.Inside);
    }

    const buffer = chunk.buffer;
    const transferables: Transferable[] = [];
    if (buffer) {
      transferables.push(buffer.buffer);
    }

    (postMessage as any)({ workerId, result: { x, y, z, buffer } }, transferables);
  }
};

export default null;
