import { mat4, vec3 } from 'gl-matrix';
import Stats from 'stats.js';
import { createCameraController, type CameraController } from 'toolkit/camera/cameraController';
import { createBufferManager, DefaultBuffers } from 'toolkit/ecs/bufferManager';
import { createComponentManager } from 'toolkit/ecs/componentManager';
import { createEntityManager } from 'toolkit/ecs/entityManager';
import { createScriptManager } from 'toolkit/ecs/scriptManager';
import { createShaderManager, DefaultShaders, type ShaderManager } from 'toolkit/ecs/shaderManager';
import { createTextureManager } from 'toolkit/ecs/textureManager';
import type { IndexBuffer } from 'toolkit/rendering/buffers/indexBuffer';
import type { UniformBuffer } from 'toolkit/rendering/buffers/uniformBuffer';
import type { VertexBuffer } from 'toolkit/rendering/buffers/vertexBuffer';
import { CommandType } from 'toolkit/rendering/commands';
import { RendererType } from 'toolkit/rendering/renderer';
import type { Shader } from 'toolkit/rendering/shader';
import { createWebGPURenderer } from 'toolkit/rendering/webgpuRenderer';
import { createSceneGraph } from 'toolkit/sceneGraph';
import { createSceneLoader } from 'toolkit/scenes/loader';
import {
  ComponentType,
  isWeightedBlendedShaderId,
  MaterialComponentType,
  type MaterialComponent,
} from 'types/ecs/component';

import type { EntityManager } from 'types/ecs/entity';
import type { ReadonlySceneGraph, SceneGraphNode } from 'types/sceneGraph';

export interface WebGPUApplication {
  readonly cameraController: CameraController;
  readonly sceneGraph: ReadonlySceneGraph;
  readonly entityManager: EntityManager;
  readonly shaderManager: ShaderManager;

  loadScene(url: string): Promise<void>;

  start(): void;
  destroy(): void;
}

export async function createWebGPUApplication(
  appId: string,
  canvas: HTMLCanvasElement,
): Promise<WebGPUApplication> {
  console.log('creating webgpu application', appId);
  const sceneGraph = createSceneGraph();
  const cameraController = createCameraController(canvas);

  const resizer = new ResizeObserver(() => {
    cameraController.aspect = canvas.clientWidth / canvas.clientHeight;
  });
  resizer.observe(canvas);

  const renderer = await createWebGPURenderer(canvas);
  const entityManager = createEntityManager();
  const bufferManager = createBufferManager(renderer.device);
  const textureManager = createTextureManager(renderer.device);
  const shaderManager = createShaderManager(renderer.device, {
    bufferManager,
    textureManager,
    renderer,
  });
  const componentManager = createComponentManager();

  const system = {
    vec3,

    engine: {
      entityManager,
      shaderManager,
      cameraController,

      ComponentType,
    },
  };
  const scriptManager = createScriptManager(system);
  const sceneLoader = createSceneLoader({
    cameraController,
    entityManager,
    textureManager,
    scriptManager,
    componentManager,
    sceneGraph,
    renderer,
  });

  // TODO: implement a needs update system so that it only rerenders
  // as necessary
  let frameId = -1;
  let frameTime = 0;
  let lastFrameTime = performance.now();
  let dt = 0;
  const tmp = vec3.create();

  function isMaterialTransparent(material: MaterialComponent) {
    if (
      material.subtype !== MaterialComponentType.MeshBasic &&
      material.subtype !== MaterialComponentType.MeshDiffuse
    ) {
      throw new Error(`[isMaterialTransparent] subtype: ${material.subtype} not implemented yet!`);
    }

    return material.transparent && material.opacity !== 1.0;
  }

  function getShaderForMaterial(material: MaterialComponent) {
    if (
      material.subtype !== MaterialComponentType.MeshBasic &&
      material.subtype !== MaterialComponentType.MeshDiffuse
    ) {
      throw new Error(`[getShaderForMaterial] subtype: ${material.subtype} not implemented yet!`);
    }

    const transparent = isMaterialTransparent(material);

    if (renderer.type === RendererType.Default) {
      if (typeof material.shader !== 'number') {
        throw new Error(`Invalid shader for render type: ${material.shader}`);
      }

      return shaderManager.get<Shader>(material.shader);
    } else if (renderer.type === RendererType.WeightedBlended) {
      if (!isWeightedBlendedShaderId(material.shader)) {
        throw new Error(`Invalid shader for render type: ${material.shader}`);
      }
      return transparent
        ? shaderManager.get<Shader>(material.shader.transparent)
        : shaderManager.get<Shader>(material.shader.opaque);
    }

    throw new Error(`Unknown renderer type: ${renderer.type}`);
  }

  function renderNode(node: SceneGraphNode) {
    const { uid, children } = node;

    const transform = entityManager.getComponent(uid, ComponentType.Transform);
    const geometry = entityManager.getComponent(uid, ComponentType.Geometry);
    const material = entityManager.getComponent(uid, ComponentType.Material);
    const script = entityManager.getComponent(uid, ComponentType.Script);

    if (script && script.script !== undefined) {
      scriptManager.get(script.script).update(dt, uid);
    }

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
        // TODO: move the shader creation into a factory
        if (material.subtype === MaterialComponentType.MeshBasic) {
          material.shader = shaderManager.create(DefaultShaders.MeshBasic);
        } else if (material.subtype === MaterialComponentType.MeshDiffuse) {
          material.shader = shaderManager.create(DefaultShaders.MeshDiffuse);
        } else if (material.subtype === MaterialComponentType.MeshPhong) {
          material.shader = shaderManager.create(DefaultShaders.MeshPhong) as number;
        } else if (material.subtype === MaterialComponentType.RawShader) {
          material.shader = shaderManager.create(material.descriptor) as number;
        } else {
          throw new Error(`Unknown MaterialComponentType: ${(material as any).subtype}`);
        }
      }

      let shader: Shader;
      let transparent = material.transparent;

      // TODO: make the material updating cleaner
      if (material.subtype === MaterialComponentType.MeshBasic) {
        transparent = isMaterialTransparent(material);
        shader = getShaderForMaterial(material);
        shader.update({
          model: transform.matrix,
          opacity: material.opacity,
          colour: material.colour,
        });
      } else if (material.subtype === MaterialComponentType.MeshDiffuse) {
        transparent = isMaterialTransparent(material);
        shader = getShaderForMaterial(material);
        shader.update({
          model: transform.matrix,
          opacity: material.opacity,
          colour: material.colour,
        });
      } else if (material.subtype === MaterialComponentType.MeshPhong) {
        throw new Error('Phong: Not implemented Yet');
      } else if (material.subtype === MaterialComponentType.RawShader) {
        shader = shaderManager.get<Shader>(material.shader!);
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

          if ('view_position' in material.uniforms) {
            vec3.copy(material.uniforms.view_position as vec3, cameraController.camera.position);
          }

          shader.update(material.uniforms);
        }
      } else {
        throw new Error(`Unknown material subtype: ${(material as any).subtype}`);
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
        transparent,
      });
    }

    children.forEach(renderNode);
  }

  function separateOpaqueAndTransparentNodes(nodes: readonly SceneGraphNode[]) {
    return nodes.reduce(
      (acc, cur) => {
        // TODO: process children
        const { uid, children } = cur;

        // const transform = entityManager.getComponent(uid, ComponentType.Transform);
        // const geometry = entityManager.getComponent(uid, ComponentType.Geometry);
        const material = entityManager.getComponent(uid, ComponentType.Material);

        if (material && material.transparent) {
          acc.transparent.push(cur);
        } else {
          acc.opaque.push(cur);
        }

        const { opaque, transparent } = separateOpaqueAndTransparentNodes(children);
        acc.opaque.push(...opaque);
        acc.transparent.push(...transparent);
        return acc;
      },
      { opaque: [] as SceneGraphNode[], transparent: [] as SceneGraphNode[] },
    );
  }

  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.left = '';
  stats.dom.style.right = '0px';
  document.body.appendChild(stats.dom);

  function render() {
    stats.begin();

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

    // we need to split the drawing into opaque and transparent objects
    // but this should be based on what type of transparent rendering
    // as an OIT would not need sorting. DWBOIT would still benefit from
    // separating transparent and non transparent objects
    // TODO: There is probably a way to cache this
    const { opaque, transparent } = separateOpaqueAndTransparentNodes(sceneGraph.root.children);

    opaque.forEach(renderNode);

    transparent.sort((a, b) => {
      // sort based on renderOrder, otherwise use distance to viewer
      if (a.renderOrder !== b.renderOrder) {
        return b.renderOrder - a.renderOrder;
      }

      const transformA = entityManager.getComponent(a.uid, ComponentType.Transform);
      const transformB = entityManager.getComponent(b.uid, ComponentType.Transform);
      if (transformA && transformB) {
        const distA = vec3.length(vec3.sub(tmp, cameraController.position, transformA.position));
        const distB = vec3.length(vec3.sub(tmp, cameraController.position, transformB.position));

        return distB - distA;
      }

      return 0;
    });
    transparent.forEach(renderNode);

    renderer.end();

    stats.end();
    frameId = requestAnimationFrame(render);
  }

  return {
    async loadScene(url: string) {
      await sceneLoader.load(url);
    },

    start() {
      if (frameId !== -1) {
        return;
      }
      render();
    },

    destroy() {
      console.log('destroying webgpu application', appId);

      cancelAnimationFrame(frameId);
      frameId = -1;

      scriptManager.destroy();
      componentManager.destroy();
      shaderManager.destroy();
      textureManager.destroy();
      bufferManager.destroy();
      entityManager.destroy();
      cameraController.destroy();

      resizer.unobserve(canvas);
      document.body.removeChild(stats.dom);
    },

    cameraController,
    sceneGraph,
    entityManager,
    shaderManager,
  };
}
