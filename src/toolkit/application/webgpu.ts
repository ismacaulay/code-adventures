import type { Camera } from 'toolkit/camera/camera';
import { createOrbitControls } from 'toolkit/camera/orbitControls';
import { createOrthographicCamera } from 'toolkit/camera/orthographic';
import { createPerspectiveCamera } from 'toolkit/camera/perspective';
import { createBufferManager, DefaultBuffers } from 'toolkit/ecs/bufferManager';
import { createEntityManager } from 'toolkit/ecs/entityManager';
import { createShaderManager } from 'toolkit/ecs/shaderManager';
import type { IndexBuffer } from 'toolkit/rendering/buffers/indexBuffer';
import type { UniformBuffer } from 'toolkit/rendering/buffers/uniformBuffer';
import type { VertexBuffer } from 'toolkit/rendering/buffers/vertexBuffer';
import { CommandType } from 'toolkit/rendering/commands';
import type { Shader } from 'toolkit/rendering/shader';
import { createWebGPURenderer } from 'toolkit/rendering/webgpuRenderer';
import { createSceneGraph } from 'toolkit/sceneGraph';
import { createSceneLoader } from 'toolkit/scenes/loader';
import { ComponentType } from 'types/ecs/component';

import type { EntityManager } from 'types/ecs/entity';
import type { ReadonlySceneGraph, SceneGraphNode } from 'types/sceneGraph';

export interface WebGPUApplication {
  readonly camera: Camera;
  readonly sceneGraph: ReadonlySceneGraph;
  readonly entityManager: EntityManager;

  loadScene(url: string): Promise<void>;

  start(): void;
  destroy(): void;
}

export async function createWebGPUApplication(
  canvas: HTMLCanvasElement,
): Promise<WebGPUApplication> {
  console.log('creating webgpu application');

  const sceneGraph = createSceneGraph();

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const aspect = width / height;

  // const camera = createOrthographicCamera({
  //   aspect,

  //   left: -2.5,
  //   right: 2.5,
  //   top: 2.5,
  //   bottom: -2.5,

  //   znear: 0.1,
  //   zfar: 1000,
  // });

  const camera = createPerspectiveCamera({
    aspect,
    fov: 45,
    znear: 0.1,
    zfar: 1000,
  });
  const controls = createOrbitControls(canvas, { camera });

  const renderer = await createWebGPURenderer(canvas);

  const entityManager = createEntityManager();
  const bufferManager = createBufferManager(renderer.device);
  const shaderManager = createShaderManager(renderer.device, { bufferManager });
  const sceneLoader = createSceneLoader({ entityManager, sceneGraph, camera });

  function renderNode(node: SceneGraphNode) {
    const { uid, children } = node;

    const transform = entityManager.getComponent(uid, ComponentType.Transform);
    const geometry = entityManager.getComponent(uid, ComponentType.Geometry);
    const material = entityManager.getComponent(uid, ComponentType.Material);

    if (transform && geometry && material) {
      const vertexBuffers = geometry.buffers.map((buffer) => {
        // TODO: should the buffers on the geometry have a needsUpdate?
        if (buffer.id === undefined) {
          buffer.id = bufferManager.createVertexBuffer(buffer);
          renderer.submit({
            type: CommandType.WriteBuffer,
            src: buffer.array,
            dst: bufferManager.get<VertexBuffer>(buffer.id).buffer,
          });
        }

        return bufferManager.get<VertexBuffer>(buffer.id);
      });

      let indices: Maybe<IndexBuffer> = undefined;
      if (geometry.indices) {
        if (geometry.indices.id === undefined) {
          geometry.indices.id = bufferManager.createIndexBuffer(geometry.indices);
          renderer.submit({
            type: CommandType.WriteBuffer,
            src: geometry.indices.array,
            dst: bufferManager.get<VertexBuffer>(geometry.indices.id).buffer,
          });
        }

        indices = bufferManager.get<IndexBuffer>(geometry.indices.id);
      }

      if (material.shader.id === undefined) {
        material.shader.id = shaderManager.create(material.shader);
      }

      const shader = shaderManager.get<Shader>(material.shader.id);
      shader.update({ model: transform.matrix });
      shader.update(material.uniforms ?? {});
      shader.buffers.forEach((buf) => {
        renderer.submit({
          type: CommandType.WriteBuffer,
          src: buf.data,
          dst: buf.buffer,
        });
      });

      renderer.submit({
        type: CommandType.Draw,
        shader,
        indices,
        buffers: vertexBuffers,
        count: geometry.count,
        instances: geometry.instances,
      });
    }

    children.forEach(renderNode);
  }

  let frameId = -1;
  function render() {
    frameId = requestAnimationFrame(render);
    controls.update(0);

    renderer.begin();

    // TODO: only write if the buffer is dirty
    const matricesBuffer = bufferManager.get<UniformBuffer>(DefaultBuffers.ViewProjection);
    matricesBuffer.updateUniforms({
      view: camera.view,
      projection: camera.projection,
    });

    renderer.submit({
      type: CommandType.WriteBuffer,
      src: matricesBuffer.data,
      dst: matricesBuffer.buffer,
    });

    sceneGraph.root.children.forEach(renderNode);

    renderer.end();
  }

  return {
    async loadScene(url: string) {
      await sceneLoader.load(url);
    },

    start() {
      render();
    },

    destroy() {
      cancelAnimationFrame(frameId);
      frameId = -1;
    },

    camera,
    sceneGraph,
    entityManager,
  };
}
