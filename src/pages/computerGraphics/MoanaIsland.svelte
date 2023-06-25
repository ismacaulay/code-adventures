<script lang="ts">
  import WebGpuScene from 'components/WebGPUScene.svelte';
  import type { WebGPUApplication } from 'toolkit/application/webgpu';
  import { fetchJSON } from 'toolkit/network';
  import { RendererType } from 'toolkit/rendering/renderer';
  import { transformComponentFromMatrix } from 'toolkit/ecs/components/transform';
  import { vec3, type mat4 } from 'gl-matrix';
  import { createMeshDiffuseMaterialComponent } from 'toolkit/ecs/components/material';
  import { createBufferGeometryComponent } from 'toolkit/ecs/components/geometry';
  import { BoundingBox } from 'toolkit/geometry/boundingBox';
  import { BufferAttributeFormat } from 'toolkit/rendering/buffers/vertexBuffer';
  import { createSceneGraphNode } from 'toolkit/sceneGraph/node';
  import { CameraType, type PerspectiveCamera } from 'toolkit/camera/camera';
  import { CameraControlType } from 'toolkit/camera/controls';
  import { loadObj } from 'toolkit/loaders/objLoader';
  import { loadObj as loadObj2 } from 'toolkit/loaders/objLoader2';

  let app: Maybe<WebGPUApplication>;

  $: {
    if (app) {
      run(app);
    }
  }

  const base = '/external/island';
  let triangleCount = 0;

  async function run(app: WebGPUApplication) {
    function addObject(
      name: string,
      mesh: { vertices: Float64Array; faces?: Uint32Array; boundingBox: BoundingBox },
      matrix: mat4,
    ) {
      const { entityManager, sceneGraph } = app;

      entityManager.add(name);

      const transform = transformComponentFromMatrix(matrix);
      entityManager.addComponent(name, transform);

      // TODO: load material
      const material = createMeshDiffuseMaterialComponent({
        transparent: false,
        opacity: 1,
        colour: [1.0, 0.0, 1.0],
      });
      entityManager.addComponent(name, material);

      const count = mesh.faces ? mesh.faces.length : mesh.vertices.length / 3;
      // triangleCount += mesh.faces.length;
      triangleCount += count;
      const geometry = createBufferGeometryComponent({
        boundingBox: mesh.boundingBox,
        count,
        indices: mesh.faces,
        buffers: [
          {
            array: mesh.vertices,
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

      const result = BoundingBox.create();
      vec3.transformMat4(result.min, mesh.boundingBox.min, transform.matrix);
      vec3.transformMat4(result.max, mesh.boundingBox.max, transform.matrix);
      return result;
    }

    async function loadJSONObject(path: string) {
      const json = await fetchJSON(`${base}/json/${path}`);
      console.log(json);

      const {
        name,
        transformMatrix,
        geomObjFile,
        instancedCopies = {},
      } = json as {
        name: string;
        transformMatrix: mat4;
        geomObjFile: string;
        instancedCopies: any;
      };

      const objData = await loadObj(`${base}/${geomObjFile}`);
      const objData2 = await loadObj2(`${base}/${geomObjFile}`);
      console.log(geomObjFile, objData2);
      // console.log(objData.vertices);
      //
      // const flatVertices = new Float64Array(objData.faces.length * 3);
      // let idx = 0;
      // let t, v1, v2, v3;
      // for (let i = 0; i < objData.faces.length; ++i) {
      //   t = objData.faces[i];
      //
      //   v1 = objData.vertices[t * 3];
      //   v2 = objData.vertices[t * 3 + 1];
      //   v3 = objData.vertices[t * 3 + 2];
      //
      //   flatVertices[idx] = v1;
      //   flatVertices[idx + 1] = v2;
      //   flatVertices[idx + 2] = v3;
      //   idx += 3;
      // }

      const boundingBox = BoundingBox.fromVertices(objData.vertices);
      // const boundingBox = BoundingBox.fromVertices(flatVertices);

      const mesh = { vertices: objData.vertices, faces: objData.faces, boundingBox };
      // const mesh = { vertices: flatVertices, boundingBox };

      const bbs = [addObject(name, mesh, transformMatrix)];

      for (const v of Object.values(instancedCopies)) {
        const { name, transformMatrix } = v as any;
        bbs.push(addObject(name, mesh, transformMatrix));
      }

      return BoundingBox.fromBoundingBoxes(bbs);
    }

    const objects = await Promise.all([
      loadJSONObject('isMountainA/isMountainA.json'),
      // loadJSONObject('isMountainB/isMountainB.json'),
      loadJSONObject('isCoastline/isCoastline.json'),
      loadJSONObject('isBeach/isBeach.json'),
      loadJSONObject('isBayCedarA1/isBayCedarA1.json'),
    ]);

    const { cameraController } = app;

    const boundingBox = BoundingBox.fromBoundingBoxes(objects);

    cameraController.cameraType = CameraType.Perspective;
    cameraController.controlType = CameraControlType.Free;
    // const controls = cameraController.controls;
    // if (controls.type === CameraControlType.Free) {
    //   controls.moveSensitivity = 5000;
    // }
    // cameraController.position = [-2029.422607421875, 9773.810546875, 11292.3115234375];
    // cameraController.position = [67.51712036132812, 1245.0089111328125, 1277.9298095703125];
    // cameraController.position = [348.0909729003906, 128.07098388671875, 124.46318817138672];
    // cameraController.target = [556.5510864257812, 827.2630615234375, -4490.3173828125];
    const camera = app.cameraController.camera as PerspectiveCamera;
    camera.fov = 69.5;
    camera.updateProjectionMatrix();

    const result = BoundingBox.centre(boundingBox);
    cameraController.target = vec3.clone(result);
    console.log(boundingBox, [result[0], result[1], result[2]]);
    cameraController.position = vec3.clone(boundingBox.max);
    cameraController.controls.computeYawPitch();
  }
</script>

<WebGpuScene bind:app opts={{ rendererType: RendererType.Default }} />
