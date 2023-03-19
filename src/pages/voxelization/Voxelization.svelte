<script lang="ts">
  import { mat4, vec3 } from 'gl-matrix';
  import WebGpuScene from 'pages/webgpu/components/WebGPUScene.svelte';
  import { onDestroy } from 'svelte';
  import type { WebGPUApplication } from 'toolkit/application/webgpu';
  import { CameraType } from 'toolkit/camera/camera';
  import { CameraControlType } from 'toolkit/camera/controls';
  import { createBufferGeometryComponent } from 'toolkit/ecs/components/geometry';
  import {
    createLineBasicMaterial,
    createMeshDiffuseMaterialComponent,
  } from 'toolkit/ecs/components/material';
  import { createTransformComponent } from 'toolkit/ecs/components/transform';
  import { BoundingBox } from 'toolkit/geometry/boundingBox';
  import { Octree, type OctreeNode } from 'toolkit/geometry/octree';
  import { createVoxelContainer, VoxelChunk } from 'toolkit/geometry/voxel';
  import { loadObj } from 'toolkit/loaders/objLoader';
  import {
    createBoundingBoxRenderer,
    type RenderableBoundingBox,
  } from 'toolkit/rendering/boundingBoxRenderer';
  import { BufferAttributeFormat } from 'toolkit/rendering/buffers/vertexBuffer';
  import { RendererType } from 'toolkit/rendering/renderer';
  import { createSceneGraphNode } from 'toolkit/sceneGraph/node';

  let app: Maybe<WebGPUApplication>;
  $: {
    if (app) {
      loadObj('/models/bunny.obj').then((data) => {
        if (!app) {
          console.log('App destroyed while loading obj');
          return;
        }

        const boundingBox = BoundingBox.fromMesh({
          vertices: data.vertices,
          triangles: data.faces,
        });
        const centre = BoundingBox.centre(boundingBox);
        const diff = vec3.create();
        const scale = vec3.create();
        vec3.sub(diff, boundingBox.max, boundingBox.min);
        vec3.scale(scale, diff, 0.5);

        const longest = Math.max(diff[0], Math.max(diff[1], diff[2]));
        const voxelSize = longest / 100.0;

        // TODO handle result of the voxelization
        const voxels = voxelizeMesh(
          { aabb: boundingBox, triangles: data.faces, vertices: data.vertices },
          voxelSize,
        );

        const {
          entityManager,
          renderer,
          sceneGraph,
          bufferManager,
          shaderManager,
          cameraController,
        } = app;
        renderer.clearColour = [0.1, 0.1, 0.1];
        renderer.type = RendererType.WeightedBlended;

        cameraController.cameraType = CameraType.Orthographic;
        cameraController.controlType = CameraControlType.Orbit;
        cameraController.position = [0, 0, 1];
        if (cameraController.camera.type === CameraType.Orthographic) {
          cameraController.camera.zoom = 12;
          cameraController.camera.updateProjectionMatrix();
        }

        // render the bunny
        const entityId = 'bunny';
        entityManager.add(entityId);
        const transform = createTransformComponent({
          position: [-centre[0], -centre[1], -centre[2]],
        });
        entityManager.addComponent(entityId, transform);

        const geometry = createBufferGeometryComponent({
          boundingBox,
          count: data.faces.length,
          indices: data.faces,
          buffers: [
            {
              array: data.vertices,
              attributes: [
                {
                  format: BufferAttributeFormat.Float32x3,
                  location: 0,
                },
              ],
            },
          ],
        });
        entityManager.addComponent(entityId, geometry);

        const material = createMeshDiffuseMaterialComponent({
          transparent: true,
          opacity: 0.25,
          colour: [0.988, 0.58, 0.012],
        });
        entityManager.addComponent(entityId, material);
        // sceneGraph.root.add(createSceneGraphNode({ uid: entityId, renderOrder: 0 }));

        // // render the bounding box for now
        // const bbTransform = mat4.create();
        // const octreeCentre = BoundingBox.centre(octree.root.aabb);
        // vec3.negate(octreeCentre, octreeCentre);
        // mat4.translate(bbTransform, bbTransform, octreeCentre);
        //
        // const red: vec3 = [1.0, 0.0, 0.0];
        // const green: vec3 = [0.0, 1.0, 0.0];
        // const blue: vec3 = [0.0, 0.0, 1.0];
        // const yellow: vec3 = [1.0, 1.0, 0.0];
        // const colours = [red, green, blue, yellow];
        //
        // const octreeBoxes: RenderableBoundingBox[] = [
        //   { boundingBox: octree.root.aabb, transform: bbTransform, colour: red },
        // ];
        //
        // function addChildBoundingBoxes(node: OctreeNode, depth: number) {
        //   node.children.forEach((child, idx) => {
        //     if (child.children.length > 0) {
        //       addChildBoundingBoxes(child, depth + 1);
        //       // if (depth === 0 && idx === 0) {
        //       //   addChildBoundingBoxes(child, depth + 1);
        //       // } else if (depth > 0) {
        //       //   addChildBoundingBoxes(child, depth + 1);
        //       // }
        //     } else {
        //       octreeBoxes.push({
        //         boundingBox: child.aabb,
        //         transform: bbTransform,
        //         colour: colours[depth % 4],
        //       });
        //     }
        //   });
        // }
        // addChildBoundingBoxes(octree.root, 0);
        //
        const boundingBoxRenderer = createBoundingBoxRenderer({
          renderer,
          bufferManager,
          shaderManager,
        });

        boundingBoxRenderer.setBoundingBoxes(voxels);

        app.onPostRender(() => {
          boundingBoxRenderer.render();
        });
      });
    }
  }

  function voxelizeMesh(
    mesh: { aabb: BoundingBox; triangles: Uint32Array; vertices: Float32Array | Float64Array },
    voxelSize: number,
  ) {
    const blockSize = vec3.fromValues(voxelSize, voxelSize, voxelSize);
    return generateVoxelMesh(mesh, blockSize);
  }

  function generateVoxelMesh(
    mesh: {
      aabb: BoundingBox;
      vertices: number[] | Float32Array | Float64Array;
      triangles: Uint32Array;
    },
    voxelSize: vec3,
  ) {
    const start = performance.now();
    const octree = Octree.fromMesh(mesh);
    const t1 = performance.now();

    const chunkBlockCount = VoxelChunk.CHUNK_SIZE;
    const chunkSize = vec3.fromValues(
      chunkBlockCount[0] * voxelSize[0],
      chunkBlockCount[1] * voxelSize[1],
      chunkBlockCount[1] * voxelSize[2],
    );

    const blockTransform = mat4.create();
    const centre = BoundingBox.centre(mesh.aabb);
    vec3.negate(centre, centre);
    mat4.translate(blockTransform, blockTransform, centre);

    const boxes: RenderableBoundingBox[] = [];

    const blockCount = vec3.create();
    vec3.sub(blockCount, mesh.aabb.max, mesh.aabb.min);
    vec3.set(
      blockCount,
      Math.ceil(blockCount[0] / voxelSize[0]),
      Math.ceil(blockCount[1] / voxelSize[1]),
      Math.ceil(blockCount[2] / voxelSize[2]),
    );
    const chunks = vec3.fromValues(
      Math.ceil(blockCount[0] / chunkBlockCount[0]),
      Math.ceil(blockCount[1] / chunkBlockCount[1]),
      Math.ceil(blockCount[2] / chunkBlockCount[2]),
    );
    const voxels = createVoxelContainer();

    const aabb = mesh.aabb;
    const chunkAABB = BoundingBox.create();
    const blockAABB = BoundingBox.create();
    for (let z = 0; z < chunks[2]; ++z) {
      for (let y = 0; y < chunks[1]; ++y) {
        for (let x = 0; x < chunks[0]; ++x) {
          // build the chunk AABB
          vec3.set(
            chunkAABB.min,
            aabb.min[0] + x * chunkSize[0],
            aabb.min[1] + y * chunkSize[1],
            aabb.min[2] + z * chunkSize[2],
          );
          vec3.add(chunkAABB.max, chunkAABB.min, chunkSize);

          const chunk = VoxelChunk.create();

          // if the chunkAABB intersects with the mesh, build the chunk leaf nodes
          // by checking if each block intersects with the mesh
          if (octree.intersect(chunkAABB)) {
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

                  if (octree.intersect(blockAABB)) {
                    boxes.push({
                      boundingBox: {
                        min: vec3.clone(blockAABB.min),
                        max: vec3.clone(blockAABB.max),
                      },
                      transform: blockTransform,
                      colour: [1.0, 0.0, 0.0],
                    });
                    chunk.addVoxel(i, j, k);
                  }
                }
              }
            }
          }

          voxels.insert(x, y, z, chunk);
        }
      }
    }

    const t2 = performance.now();
    console.log('Octree:', t1 - start);
    console.log('voxels:', t2 - t1);
    return boxes;
  }

  onDestroy(() => {});
</script>

<WebGpuScene bind:app opts={{ rendererType: RendererType.WeightedBlended }} />
