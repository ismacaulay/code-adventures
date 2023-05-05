<script lang="ts">
  import WebGpuScene from 'pages/webgpu/components/WebGPUScene.svelte';
  import type { WebGPUApplication } from 'toolkit/application/webgpu';
  import { fetchBinary } from 'toolkit/network';
  import { RendererType } from 'toolkit/rendering/renderer';
  import { createTransformComponent } from 'toolkit/ecs/components/transform';
  import { vec3 } from 'gl-matrix';
  import { createMeshDiffuseMaterialComponent } from 'toolkit/ecs/components/material';
  import { createBufferGeometryComponent } from 'toolkit/ecs/components/geometry';
  import { BoundingBox } from 'toolkit/geometry/boundingBox';
  import { BufferAttributeFormat } from 'toolkit/rendering/buffers/vertexBuffer';
  import { createSceneGraphNode } from 'toolkit/sceneGraph/node';
  import { CameraType, type OrthographicCamera } from 'toolkit/camera/camera';
  import { CameraControlType } from 'toolkit/camera/controls';

  let app: Maybe<WebGPUApplication>;

  $: {
    if (app) {
      run(app);
    }
  }

  const base = '/generated/bunny';

  async function run(app: WebGPUApplication) {
    const [verticesBuf, trianglesBuf, coloursBuf] = await Promise.all([
      fetchBinary(`${base}/vertices.bin`),
      fetchBinary(`${base}/triangles.bin`),
      fetchBinary(`${base}/colours.bin`),
    ]);

    const name = 'bunny';
    const vertices = new Float32Array(verticesBuf);
    const triangles = new Uint32Array(trianglesBuf);
    const colours = new Uint8Array(coloursBuf);

    console.log(vertices, triangles, colours);

    const { cameraController, entityManager, sceneGraph } = app;

    entityManager.add(name);

    const transform = createTransformComponent({});
    entityManager.addComponent(name, transform);

    // TODO: load material
    const material = createMeshDiffuseMaterialComponent({
      transparent: false,
      opacity: 1,
      colour: [1.0, 0.0, 1.0],
    });
    entityManager.addComponent(name, material);

    const boundingBox = BoundingBox.fromVertices(vertices);
    const geometry = createBufferGeometryComponent({
      boundingBox,
      count: triangles.length,
      indices: triangles,
      buffers: [
        {
          array: vertices,
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

    cameraController.cameraType = CameraType.Orthographic;
    cameraController.controlType = CameraControlType.Orbit;
    cameraController.position = [0, 0, 1];
    (cameraController.camera as OrthographicCamera).zoom = 12;
    cameraController.camera.updateProjectionMatrix();

    const result = BoundingBox.centre(boundingBox);
    cameraController.target = vec3.clone(result);
  }
</script>

<WebGpuScene bind:app opts={{ rendererType: RendererType.Default }} />
