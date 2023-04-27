<script lang="ts">
  import WebGpuScene from 'pages/webgpu/components/WebGPUScene.svelte';
  import type { WebGPUApplication } from 'toolkit/application/webgpu';
  import { fetchJSON } from 'toolkit/network';
  import { RendererType } from 'toolkit/rendering/renderer';
  import { load } from '@loaders.gl/core';
  import { OBJLoader } from '@loaders.gl/obj';
  import { transformComponentFromMatrix } from 'toolkit/ecs/components/transform';
  import { vec3, type mat4 } from 'gl-matrix';
  import {
    createMeshBasicMaterialComponent,
    createMeshDiffuseMaterialComponent,
  } from 'toolkit/ecs/components/material';
  import { createBufferGeometryComponent } from 'toolkit/ecs/components/geometry';
  import { BoundingBox } from 'toolkit/geometry/boundingBox';
  import { BufferAttributeFormat } from 'toolkit/rendering/buffers/vertexBuffer';
  import { createSceneGraphNode } from 'toolkit/sceneGraph/node';
  import { CameraType, type PerspectiveCamera } from 'toolkit/camera/camera';
  import { CameraControlType } from 'toolkit/camera/controls';
  import { loadObj } from 'toolkit/loaders/objLoader';

  let app: Maybe<WebGPUApplication>;

  $: {
    if (app) {
      run(app);
    }
  }

  const base = '/external/island';
  async function run(app: WebGPUApplication) {
    async function loadJSONObject(path: string) {
      const json = await fetchJSON(`${base}/json/${path}`);
      console.log(json);

      const { name, transformMatrix, geomObjFile } = json as {
        name: string;
        transformMatrix: mat4;
        geomObjFile: string;
      };

      const data = await loadObj(`${base}/${geomObjFile}`);
      console.log(data);

      const { entityManager, sceneGraph } = app;

      entityManager.add(name);

      const transform = transformComponentFromMatrix(transformMatrix);
      entityManager.addComponent(name, transform);

      // TODO: load material
      const material = createMeshDiffuseMaterialComponent({
        transparent: false,
        opacity: 1,
        colour: [1.0, 0.0, 1.0],
      });
      entityManager.addComponent(name, material);

      const boundingBox = BoundingBox.fromVertices(data.vertices);

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
      entityManager.addComponent(name, geometry);
      sceneGraph.root.add(createSceneGraphNode({ uid: name }));
      return boundingBox;
    }

    const objects = await Promise.all([
      loadJSONObject('isMountainA/isMountainA.json'),
      loadJSONObject('isMountainB/isMountainB.json'),
      loadJSONObject('isCoastline/isCoastline.json'),
      loadJSONObject('isBeach/isBeach.json'),
    ]);

    const { cameraController } = app;

    const boundingBox = BoundingBox.fromBoundingBoxes(objects);

    cameraController.cameraType = CameraType.Perspective;
    cameraController.controlType = CameraControlType.Orbit;
    cameraController.position = [-2029.422607421875, 9773.810546875, 11292.3115234375];
    // cameraController.target = [556.5510864257812, 827.2630615234375, -4490.3173828125];
    const camera = app.cameraController.camera as PerspectiveCamera;
    const result = BoundingBox.centre(boundingBox);
    cameraController.target = vec3.clone(result);
    const radius = BoundingBox.diagonal(boundingBox);
    const distance = vec3.length(vec3.sub(result, cameraController.camera.position, result));

    camera.znear = distance * 0.1;
    camera.zfar = distance + radius;
    camera.fov = 69.5;
    camera.updateProjectionMatrix();
    console.log(cameraController.camera.znear, cameraController.camera.zfar);
  }
</script>

<WebGpuScene bind:app opts={{ rendererType: RendererType.Default }} />
