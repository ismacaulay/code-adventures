import { mat4 } from 'gl-matrix';
import { CameraType, type Camera } from 'toolkit/camera/camera';
import { createCameraController } from 'toolkit/camera/cameraController';
import { createOrbitControls } from 'toolkit/camera/orbitControls';
import { createOrthographicCamera } from 'toolkit/camera/orthographic';
import { createPerspectiveCamera } from 'toolkit/camera/perspective';
import { createBufferManager, DefaultBuffers } from 'toolkit/ecs/bufferManager';
import { createComponentManager } from 'toolkit/ecs/componentManager';
import { createEntityManager } from 'toolkit/ecs/entityManager';
import { createShaderManager, DefaultShaders } from 'toolkit/ecs/shaderManager';
import { createTextureManager } from 'toolkit/ecs/textureManager';
import type { IndexBuffer } from 'toolkit/rendering/buffers/indexBuffer';
import type { UniformBuffer } from 'toolkit/rendering/buffers/uniformBuffer';
import type { VertexBuffer } from 'toolkit/rendering/buffers/vertexBuffer';
import { CommandType } from 'toolkit/rendering/commands';
import type { Shader } from 'toolkit/rendering/shader';
import { createWebGPURenderer } from 'toolkit/rendering/webgpuRenderer';
import { createSceneGraph } from 'toolkit/sceneGraph';
import { createSceneLoader } from 'toolkit/scenes/loader';
import { ComponentType, MaterialComponentType } from 'types/ecs/component';

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
  const cameraController = createCameraController(canvas);

  const resizer = new ResizeObserver(() => {
    cameraController.setAspect(canvas.clientWidth / canvas.clientHeight);
  });
  resizer.observe(canvas);

  const renderer = await createWebGPURenderer(canvas);

  const entityManager = createEntityManager();
  const bufferManager = createBufferManager(renderer.device);
  const textureManager = createTextureManager(renderer.device);
  const shaderManager = createShaderManager(renderer.device, { bufferManager, textureManager });
  const componentManager = createComponentManager();

  const sceneLoader = createSceneLoader({
    cameraController,
    entityManager,
    textureManager,
    componentManager,
    sceneGraph,
  });

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

      if (material.shader === undefined) {
        if (material.subtype === MaterialComponentType.MeshBasic) {
          material.shader = shaderManager.create(DefaultShaders.MeshBasic);
        } else if (material.subtype === MaterialComponentType.MeshDiffuse) {
          material.shader = shaderManager.create(DefaultShaders.MeshDiffuse);
        } else if (material.subtype === MaterialComponentType.RawShader) {
          material.shader = shaderManager.create(material.descriptor);
        } else {
          throw new Error('Unknown MaterialComponentType');
        }
      }

      const shader = shaderManager.get<Shader>(material.shader);

      if (material.subtype === MaterialComponentType.MeshBasic) {
        shader.update({ model: transform.matrix, colour: material.colour.map((c) => c / 255.0) });
      } else if (material.subtype === MaterialComponentType.MeshDiffuse) {
        shader.update({ model: transform.matrix, colour: material.colour.map((c) => c / 255.0) });
      } else if (material.subtype === MaterialComponentType.RawShader) {
        if (material.uniforms) {
          if ('model' in material.uniforms) {
            mat4.copy(material.uniforms.model as mat4, transform.matrix);
          }

          if ('view' in material.uniforms) {
            mat4.copy(material.uniforms.view as mat4, cameraController.camera.view);
          }

          if ('projection' in material.uniforms) {
            mat4.copy(material.uniforms.projection as mat4, cameraController.camera.projection);
          }

          shader.update(material.uniforms);
        }
      }
      shader.buffers.forEach((buf) => {
        renderer.submit({
          type: CommandType.WriteBuffer,
          src: buf.data,
          dst: buf.buffer,
        });
      });

      shader.textures.forEach((texture) => {
        renderer.submit({
          type: CommandType.CopyToTexture,
          src: texture.data,
          dst: texture.texture,
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

  // TODO: implement a needs update system so that it only rerenders
  // as necessary
  let frameId = -1;
  let frameTime = 0;
  let lastFrameTime = performance.now();
  let dt = 0;
  function render() {
    frameTime = performance.now();
    dt = (frameTime - lastFrameTime) / 1000;
    lastFrameTime = frameTime;

    cameraController.update(dt);

    renderer.begin();

    // TODO: only write if the buffer is dirty
    const matricesBuffer = bufferManager.get<UniformBuffer>(DefaultBuffers.ViewProjection);
    matricesBuffer.updateUniforms({
      view: cameraController.camera.view,
      projection: cameraController.camera.projection,
    });

    renderer.submit({
      type: CommandType.WriteBuffer,
      src: matricesBuffer.data,
      dst: matricesBuffer.buffer,
    });

    sceneGraph.root.children.forEach(renderNode);

    renderer.end();

    frameId = requestAnimationFrame(render);
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

      console.log('destroying webgpu application');
      componentManager.destroy();
      shaderManager.destroy();
      textureManager.destroy();
      bufferManager.destroy();
      entityManager.destroy();
      cameraController.destroy();

      resizer.unobserve(canvas);
    },

    camera: cameraController.camera,
    sceneGraph,
    entityManager,
  };
}
