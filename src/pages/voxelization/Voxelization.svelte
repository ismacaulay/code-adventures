<script lang="ts">
  import { mat4, vec3 } from 'gl-matrix';
  import WebGpuScene from 'pages/webgpu/components/WebGPUScene.svelte';
  import { onDestroy } from 'svelte';
  import type { WebGPUApplication } from 'toolkit/application/webgpu';
  import { CameraType } from 'toolkit/camera/camera';
  import { CameraControlType } from 'toolkit/camera/controls';
  import { createBufferGeometryComponent } from 'toolkit/ecs/components/geometry';
  import { createMeshDiffuseMaterialComponent } from 'toolkit/ecs/components/material';
  import { createTransformComponent } from 'toolkit/ecs/components/transform';
  import { BoundingBox } from 'toolkit/geometry/boundingBox';
  import { Octree, type OctreeNode } from 'toolkit/geometry/octree';
  import { loadObj } from 'toolkit/loaders/objLoader';
  import {
    createBoundingBoxRenderer,
    type RenderableBoundingBox,
  } from 'toolkit/rendering/boundingBoxRenderer';
  import { BufferAttributeFormat } from 'toolkit/rendering/buffers/vertexBuffer';
  import { RendererType } from 'toolkit/rendering/renderer';
  import { createSceneGraphNode } from 'toolkit/sceneGraph/node';
  import { voxelizeMesh } from 'toolkit/voxelization';

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

        const mesh = { aabb: boundingBox, triangles: data.faces, vertices: data.vertices };

        console.log('Building octree');
        const start = performance.now();
        const octree = Octree.fromMesh(mesh);
        let t1 = performance.now();
        console.log('Octree:', t1 - start);
        t1 = performance.now();

        // TODO handle result of the voxelization
        const voxels = voxelizeMesh(mesh, octree, voxelSize);

        const t2 = performance.now();
        console.log('voxels:', t2 - t1);

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
        sceneGraph.root.add(createSceneGraphNode({ uid: entityId, renderOrder: 0 }));

        // // render the bounding box for now
        const bbTransform = mat4.create();
        const octreeCentre = BoundingBox.centre(octree.root.aabb);
        vec3.negate(octreeCentre, octreeCentre);
        mat4.translate(bbTransform, bbTransform, octreeCentre);

        const red: vec3 = [1.0, 0.0, 0.0];
        const green: vec3 = [0.0, 1.0, 0.0];
        const blue: vec3 = [0.0, 0.0, 1.0];
        const yellow: vec3 = [1.0, 1.0, 0.0];
        const colours = [red, green, blue, yellow];

        const octreeBoxes: RenderableBoundingBox[] = [
          { boundingBox: octree.root.aabb, transform: bbTransform, colour: red },
        ];

        function addChildBoundingBoxes(node: OctreeNode, depth: number) {
          node.children.forEach((child) => {
            if (child.children.length > 0) {
              addChildBoundingBoxes(child, depth + 1);
              // if (depth === 0 && idx === 0) {
              //   addChildBoundingBoxes(child, depth + 1);
              // } else if (depth > 0) {
              //   addChildBoundingBoxes(child, depth + 1);
              // }
            } else {
              octreeBoxes.push({
                boundingBox: child.aabb,
                transform: bbTransform,
                // colour: colours[depth % 4],
                colour: [1.0, 0.0, 0.0],
              });
             }
          });
        }
        addChildBoundingBoxes(octree.root, 0);

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

  onDestroy(() => {});
</script>

<WebGpuScene bind:app opts={{ rendererType: RendererType.WeightedBlended }} />
