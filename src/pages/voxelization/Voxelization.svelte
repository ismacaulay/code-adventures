<script lang="ts">
  import { mat4, vec3 } from 'gl-matrix';
  import WebGpuScene from 'components/WebGPUScene.svelte';
  import { onDestroy } from 'svelte';
  import type { WebGPUApplication } from 'toolkit/application/webgpu';
  import { CameraType } from 'toolkit/camera/camera';
  import { CameraControlType } from 'toolkit/camera/controls';
  import { createBufferGeometryComponent } from 'toolkit/ecs/components/geometry';
  import { createMeshDiffuseMaterialComponent } from 'toolkit/ecs/components/material';
  import { createTransformComponent } from 'toolkit/ecs/components/transform';
  import { BoundingBox } from 'toolkit/geometry/boundingBox';
  import { NodeType, Octree, type MeshOctreeNode } from 'toolkit/geometry/octree';
  import { VoxelChunk } from 'toolkit/geometry/voxel';
  import { loadObj } from 'toolkit/loaders/objLoader';
  import {
    createBoundingBoxRenderer,
    type RenderableBoundingBox,
  } from 'toolkit/rendering/boundingBoxRenderer';
  import { BufferAttributeFormat } from 'toolkit/rendering/buffers/vertexBuffer';
  import { RendererType } from 'toolkit/rendering/renderer';
  import { createSceneGraphNode } from 'toolkit/sceneGraph/node';
  import { generateMeshFromVoxels } from 'toolkit/voxelization/meshGenerator';
  import { voxelizeMesh } from 'toolkit/voxelization/voxelization';

  let app: Maybe<WebGPUApplication>;
  let unsubscribers: Unsubscriber[] = [];
  async function loadBunny() {
    return loadObj('/models/bunny.obj').then((data) => {
      data.vertices = data.vertices.map((v) => v * 1000);
      return { data, camera: { position: [0, 0, 1] as vec3, zoom: 0.01 } };
    });
  }

  async function loadDragon() {
    return loadObj('/models/dragon.obj').then((data) => {
      return { data, camera: { position: [0, 0, -1] as vec3, zoom: 0.025 } };
    });
  }

  const loaders = {
    bunny: loadBunny,
    dragon: loadDragon,
  };
  const id = 'dragon';

  $: {
    if (app) {
      loaders[id]().then(({ data, camera }) => {
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
        const voxelWidth = longest / 200.0;
        const voxelSize: vec3 = [voxelWidth, voxelWidth, voxelWidth];

        const mesh = { aabb: boundingBox, triangles: data.faces, vertices: data.vertices };

        console.log('Building octree');
        console.time('[octree]');
        const octree = Octree.fromMesh(mesh);
        console.timeEnd('[octree]');

        console.log('Building voxels');
        console.time('[voxels]');
        voxelizeMesh(mesh, octree, voxelSize).then((voxels) => {
          console.timeEnd('[voxels]');
          console.log('voxels:', voxels);

          // const boxes: RenderableBoundingBox[] = [];
          // const bbTransform = mat4.create();
          // const negBBCentre = vec3.create();
          // vec3.negate(negBBCentre, centre);
          // mat4.translate(bbTransform, bbTransform, negBBCentre);
          // const chunkSize: vec3 = [
          //   voxelSize[0] * VoxelChunk.CHUNK_SIZE[0],
          //   voxelSize[1] * VoxelChunk.CHUNK_SIZE[1],
          //   voxelSize[2] * VoxelChunk.CHUNK_SIZE[2],
          // ];
          // let chunk: Maybe<VoxelChunk>;
          // for (let k = 0; k < voxels.chunkCount[2]; ++k) {
          //   for (let j = 0; j < voxels.chunkCount[1]; ++j) {
          //     for (let i = 0; i < voxels.chunkCount[0]; ++i) {
          //       chunk = voxels.get(i, j, k);
          //       if (!chunk || !chunk.isEmpty()) {
          //         continue;
          //       }
          //
          //       const chunkAABB = BoundingBox.create();
          //       chunkAABB.min[0] = boundingBox.min[0] + i * chunkSize[0];
          //       chunkAABB.min[1] = boundingBox.min[1] + j * chunkSize[1];
          //       chunkAABB.min[2] = boundingBox.min[2] + k * chunkSize[2];
          //       chunkAABB.max[0] = chunkAABB.min[0] + chunkSize[0];
          //       chunkAABB.max[1] = chunkAABB.min[1] + chunkSize[1];
          //       chunkAABB.max[2] = chunkAABB.min[2] + chunkSize[2];
          //       boxes.push({
          //         boundingBox: chunkAABB,
          //         transform: bbTransform,
          //         colour: [1.0, 0.0, 0.0],
          //       });
          //
          //       // for (let z = 0; z < VoxelChunk.CHUNK_SIZE[2]; ++z) {
          //       //   for (let y = 0; y < VoxelChunk.CHUNK_SIZE[1]; ++y) {
          //       //     for (let x = 0; x < VoxelChunk.CHUNK_SIZE[0]; ++x) {
          //       //       if (!chunk.hasVoxel(x, y, z)) {
          //       //         continue;
          //       //       }
          //       //
          //       //       const blockAABB = BoundingBox.create();
          //       //       blockAABB.min[0] = chunkAABB.min[0] + x * voxelSize[0];
          //       //       blockAABB.min[1] = chunkAABB.min[1] + y * voxelSize[1];
          //       //       blockAABB.min[2] = chunkAABB.min[2] + z * voxelSize[2];
          //       //       blockAABB.max[0] = blockAABB.min[0] + voxelSize[0];
          //       //       blockAABB.max[1] = blockAABB.min[1] + voxelSize[1];
          //       //       blockAABB.max[2] = blockAABB.min[2] + voxelSize[2];
          //       //
          //       //       boxes.push({
          //       //         boundingBox: blockAABB,
          //       //         transform: bbTransform,
          //       //         colour: [1.0, 0.0, 0.0],
          //       //       });
          //       //     }
          //       //   }
          //       // }
          //     }
          //   }
          // }
          //
          // boundingBoxRenderer.setBoundingBoxes(boxes);

          console.log('Building mesh');
          console.time('[mesh]');
          generateMeshFromVoxels(voxels, voxelSize, boundingBox).then((buffers: any) => {
            console.timeEnd('[mesh]');
            const transform = createTransformComponent({
              position: [-centre[0], -centre[1], -centre[2]],
            });
            const material = createMeshDiffuseMaterialComponent({
              transparent: true,
              opacity: 1.0,
              colour: [0.0, 1.0, 0.0],
            });

            for (let i = 0; i < buffers.length; ++i) {
              const buffer = buffers[i];
              const entityId = `${id} - voxel mesh - ${i}`;
              entityManager.add(entityId);
              entityManager.addComponent(entityId, transform);

              const geometry = createBufferGeometryComponent({
                boundingBox,
                count: buffer.length / 3,
                buffers: [
                  {
                    array: new Float32Array(buffer.buffer.subarray(0, buffer.length)),
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
              entityManager.addComponent(entityId, material);
              sceneGraph.root.add(createSceneGraphNode({ uid: entityId, renderOrder: 0 }));
            }
          });
        });

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
        cameraController.position = camera.position;
        if (cameraController.camera.type === CameraType.Orthographic) {
          cameraController.camera.zoom = camera.zoom;
          cameraController.camera.updateProjectionMatrix();
        }

        // render the bunny
        const entityId = id;
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
        sceneGraph.root.add(createSceneGraphNode({ uid: entityId, renderOrder: 0 }));

        // const root = octree.getRoot();
        // render the bounding box for now
        // const bbTransform = mat4.create();
        // const octreeCentre = BoundingBox.centre(root.aabb);
        // vec3.negate(octreeCentre, octreeCentre);
        // mat4.translate(bbTransform, bbTransform, octreeCentre);
        //
        // const red: vec3 = [1.0, 0.0, 0.0];
        // const green: vec3 = [0.0, 1.0, 0.0];
        // const blue: vec3 = [0.0, 0.0, 1.0];
        // const yellow: vec3 = [1.0, 1.0, 0.0];
        // const colours = [red, green, blue, yellow];

        // const octreeBoxes: RenderableBoundingBox[] = [
        //   // { boundingBox: root.aabb, transform: bbTransform, colour: red },
        // ];
        //
        // function addChildBoundingBoxes(node: MeshOctreeNode, depth: number) {
        //   if (node.type === NodeType.Leaf) {
        //     if (node.indices.length !== node.count) {
        //       throw new Error('Invlaid count');
        //     }
        //     octreeBoxes.push({
        //       boundingBox: node.aabb,
        //       transform: bbTransform,
        //       colour: colours[depth % 4],
        //     });
        //   } else {
        //     // if (depth === 7) {
        //     //   octreeBoxes.push({
        //     //     boundingBox: node.aabb,
        //     //     transform: bbTransform,
        //     //     colour: colours[depth % 4],
        //     //   });
        //     // }
        //     let child: number;
        //     if (node.children.length !== 8) {
        //       throw new Error('Invlaid children');
        //     }
        //     for (let i = 0; i < node.children.length; ++i) {
        //       child = node.children[i];
        //       if (child === -1) {
        //         continue;
        //       }
        //       addChildBoundingBoxes(octree.getNode(child), depth + 1);
        //     }
        //     // node.children.forEach((child) => {
        //     //   if (child.children.length > 0) {
        //     //     addChildBoundingBoxes(child, depth + 1);
        //     //     // if (depth === 0 && idx === 0) {
        //     //     //   addChildBoundingBoxes(child, depth + 1);
        //     //     // } else if (depth > 0) {
        //     //     //   addChildBoundingBoxes(child, depth + 1);
        //     //     // }
        //     //   } else {
        //     //     octreeBoxes.push({
        //     //       boundingBox: child.aabb,
        //     //       transform: bbTransform,
        //     //       // colour: colours[depth % 4],
        //     //       colour: [1.0, 0.0, 0.0],
        //     //     });
        //     //   }
        //     // });
        //   }
        // }
        // addChildBoundingBoxes(root, 0);
        //
        // const boundingBoxRenderer = createBoundingBoxRenderer({
        //   renderer,
        //   bufferManager,
        //   shaderManager,
        // });
        //
        // // boundingBoxRenderer.setBoundingBoxes(octreeBoxes);
        // // boundingBoxRenderer.setBoundingBoxes(voxels);
        //
        // app.onPostRender(() => {
        //   boundingBoxRenderer.render();
        // });
      });
    }
  }

  onDestroy(() => {
    unsubscribers.forEach((cb) => cb());
    unsubscribers.length = 0;
  });
</script>

<WebGpuScene bind:app opts={{ rendererType: RendererType.WeightedBlended }} />
