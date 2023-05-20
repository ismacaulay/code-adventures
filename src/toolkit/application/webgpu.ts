import { mat4, vec3 } from 'gl-matrix';
import { get, writable, type Writable } from 'svelte/store';
import { CameraType } from 'toolkit/camera/camera';
import { createCameraController, type CameraController } from 'toolkit/camera/cameraController';
import { CameraControlType } from 'toolkit/camera/controls';
import { createBufferManager, DefaultBuffers, type BufferManager } from 'toolkit/ecs/bufferManager';
import { createComponentManager } from 'toolkit/ecs/componentManager';
import { createEntityManager } from 'toolkit/ecs/entityManager';
import { createScriptManager } from 'toolkit/ecs/scriptManager';
import { createShaderManager, DefaultShaders, type ShaderManager } from 'toolkit/ecs/shaderManager';
import { createTextureManager } from 'toolkit/ecs/textureManager';
import { BoundingBox } from 'toolkit/geometry/boundingBox';
import { FrustumIntersection, intersectFrustumAABB } from 'toolkit/math/intersect/frustum';
import {
  createBoundingBoxRenderer,
  type RenderableBoundingBox,
} from 'toolkit/rendering/boundingBoxRenderer';
import type { IndexBuffer } from 'toolkit/rendering/buffers/indexBuffer';
import type { UniformBuffer } from 'toolkit/rendering/buffers/uniformBuffer';
import type { VertexBuffer } from 'toolkit/rendering/buffers/vertexBuffer';
import { CommandType } from 'toolkit/rendering/commands';
import { createDebugRenderSystem } from 'toolkit/rendering/debugRenderSystem';
import { RendererType, type Renderer } from 'toolkit/rendering/renderer';
import type { Shader } from 'toolkit/rendering/shader';
import { createWebGPURenderer } from 'toolkit/rendering/webgpuRenderer';
import { createSceneGraph } from 'toolkit/sceneGraph';
import { createSceneLoader } from 'toolkit/scenes/loader';
import { createFrameStats, type FrameStats } from 'toolkit/stats';
import {
  ComponentType,
  GeometryComponentType,
  isWeightedBlendedShaderId,
  MaterialComponentType,
  type MaterialComponent,
} from 'types/ecs/component';

import type { EntityManager } from 'types/ecs/entity';
import type { SceneGraph, SceneGraphNode } from 'types/sceneGraph';

export type WebGPUApplication = {
  readonly renderer: Renderer;
  readonly cameraController: CameraController;
  readonly sceneGraph: SceneGraph;
  readonly entityManager: EntityManager;
  readonly bufferManager: BufferManager;
  readonly shaderManager: ShaderManager;
  readonly stats: FrameStats;

  readonly debugMode: Writable<boolean>;
  readonly debugCameraController: CameraController;

  loadScene(url: string): Promise<void>;

  /**
   * Adds a callback that will be executed after the renderer.start() call,
   * but before any objects are renderered
   */
  onPreRender(cb: () => void): Unsubscriber;
  /**
   * Adds a callback that will be executed before the renderer.end() call,
   * but after all objects are renderered
   */
  onPostRender(cb: () => void): Unsubscriber;

  start(): void;
  destroy(): void;
};

export async function createWebGPUApplication(
  appId: string,
  canvas: HTMLCanvasElement,
  opts?: { rendererType?: RendererType },
): Promise<WebGPUApplication> {
  console.log('creating webgpu application', appId);
  const sceneGraph = createSceneGraph();
  const cameraController = createCameraController(canvas);
  const debugCameraController = createCameraController(canvas, {
    type: CameraType.Perspective,
    control: CameraControlType.Free,
  });
  debugCameraController.camera.znear = 0.01;
  debugCameraController.camera.zfar = 1000;
  debugCameraController.camera.updateProjectionMatrix();

  const renderer = await createWebGPURenderer(canvas, opts);
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

  const boundingBoxRenderer = createBoundingBoxRenderer({
    renderer,
    bufferManager,
    shaderManager,
  });

  const debugRenderSystem = createDebugRenderSystem({
    cameraController,
    renderer,
    bufferManager,
    shaderManager,
  });

  const resizer = new ResizeObserver(() => {
    cameraController.aspect = canvas.clientWidth / canvas.clientHeight;
    debugCameraController.aspect = canvas.clientWidth / canvas.clientHeight;
  });
  resizer.observe(canvas);

  // TODO: implement a needs update system so that it only rerenders
  // as necessary
  let frameId = -1;
  let frameTime = 0;
  let lastFrameTime = performance.now();
  let dt = 0;
  const stats = createFrameStats();
  const debugMode = writable(false);
  debugMode.subscribe((enabled) => {
    cameraController.controls.enabled = !enabled;
    debugCameraController.controls.enabled = enabled;
  });

  const tmp = vec3.create();
  const boundingBoxes: RenderableBoundingBox[] = [];

  const transformedBoundingBox = BoundingBox.create();

  function isMaterialTransparent(material: MaterialComponent) {
    if (
      material.subtype !== MaterialComponentType.MeshBasic &&
      material.subtype !== MaterialComponentType.MeshDiffuse &&
      material.subtype !== MaterialComponentType.LineBasic
    ) {
      throw new Error(`[isMaterialTransparent] subtype: ${material.subtype} not implemented yet!`);
    }

    return material.transparent && material.opacity !== 1.0;
  }

  function getShaderForMaterial(material: MaterialComponent) {
    if (
      material.subtype !== MaterialComponentType.MeshBasic &&
      material.subtype !== MaterialComponentType.MeshDiffuse &&
      material.subtype !== MaterialComponentType.LineBasic
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
    const { uid, visible, children } = node;
    if (!visible) {
      return;
    }

    const transform = entityManager.getComponent(uid, ComponentType.Transform);
    const geometry = entityManager.getComponent(uid, ComponentType.Geometry);
    const material = entityManager.getComponent(uid, ComponentType.Material);
    const script = entityManager.getComponent(uid, ComponentType.Script);

    if (script && script.script !== undefined) {
      scriptManager.get(script.script).update(dt, uid);
    }

    if (transform && geometry && material) {
      let buffers: VertexBuffer[] = [];
      let indices: Maybe<IndexBuffer> = undefined;
      let count = 0;
      let instances = 0;
      if (geometry.subtype === GeometryComponentType.Buffer) {
        // TODO: there is a bug with perspective orbit controls where the culling does work.
        // It would be good to be able to switch to a debug scene where we can see the scene and the camera
        vec3.transformMat4(transformedBoundingBox.min, geometry.boundingBox.min, transform.matrix);
        vec3.transformMat4(transformedBoundingBox.max, geometry.boundingBox.max, transform.matrix);
        if (
          intersectFrustumAABB(cameraController.frustum, transformedBoundingBox) ==
          FrustumIntersection.Outside
        ) {
          return;
        }

        for (let i = 0; i < geometry.buffers.length; ++i) {
          const buffer = geometry.buffers[i];
          // TODO: should the buffers on the geometry have a needsUpdate?
          if (buffer.id === undefined) {
            buffer.id = bufferManager.createVertexBuffer(buffer);
            renderer.submit({
              type: CommandType.WriteBuffer,
              src: buffer.array,
              dst: bufferManager.get<VertexBuffer>(buffer.id).buffer,
            });
          }

          buffers.push(bufferManager.get<VertexBuffer>(buffer.id));

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
        }

        count = geometry.count;
        instances = geometry.instances;
      }

      if (material.shader === undefined) {
        // TODO: move the shader creation into a factory
        if (material.subtype === MaterialComponentType.MeshBasic) {
          material.shader = shaderManager.create(DefaultShaders.MeshBasic);
        } else if (material.subtype === MaterialComponentType.MeshDiffuse) {
          material.shader = shaderManager.create(DefaultShaders.MeshDiffuse);
        } else if (material.subtype === MaterialComponentType.MeshPhong) {
          material.shader = shaderManager.create(DefaultShaders.MeshPhong) as number;
        } else if (material.subtype === MaterialComponentType.LineBasic) {
          material.shader = shaderManager.create(DefaultShaders.LineBasic);
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
      } else if (material.subtype === MaterialComponentType.LineBasic) {
        transparent = isMaterialTransparent(material);
        shader = getShaderForMaterial(material);
        shader.update({
          model: transform.matrix,
          opacity: material.opacity,
          colour: material.colour,
        });
      } else if (material.subtype === MaterialComponentType.RawShader) {
        shader = shaderManager.get<Shader>(material.shader!);
        if (material.uniforms) {
          if ('model' in material.uniforms) {
            mat4.copy(material.uniforms.model as mat4, transform.matrix);
          }

          if ('view' in material.uniforms) {
            if (get(debugMode)) {
              mat4.copy(material.uniforms.view as mat4, debugCameraController.camera.view);
            } else {
              mat4.copy(material.uniforms.view as mat4, cameraController.camera.view);
            }
          }

          if ('projection' in material.uniforms) {
            if (get(debugMode)) {
              mat4.copy(
                material.uniforms.projection as mat4,
                debugCameraController.camera.projection,
              );
            } else {
              mat4.copy(material.uniforms.projection as mat4, cameraController.camera.projection);
            }
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

      stats.addTriangles(count / 3);

      renderer.submit({
        type: CommandType.Draw,
        shader,
        indices,
        buffers: buffers ?? [],
        count,
        instances,
        transparent,
      });

      if (geometry.showBoundingBox) {
        // TODO: use the transformed BB from Frustum culling
        boundingBoxes.push({ boundingBox: geometry.boundingBox, transform: transform.matrix });
      }
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

  const preRenderCallbacks: (() => void)[] = [];
  const postRenderCallbacks: (() => void)[] = [];

  function render() {
    stats.begin();

    frameTime = performance.now();
    dt = (frameTime - lastFrameTime) / 1000;
    lastFrameTime = frameTime;

    if (get(debugMode)) {
      debugCameraController.update(dt);
      debugRenderSystem.update();
    } else {
      cameraController.update(dt);
    }

    renderer.begin();

    preRenderCallbacks.forEach((cb) => cb());

    // TODO: only write if the buffer is dirty
    const matricesBuffer = bufferManager.get<UniformBuffer>(DefaultBuffers.ViewProjection);
    if (get(debugMode)) {
      matricesBuffer.updateUniforms({
        view: debugCameraController.camera.view,
        projection: debugCameraController.camera.projection,
      });
    } else {
      matricesBuffer.updateUniforms({
        view: cameraController.camera.view,
        projection: cameraController.camera.projection,
      });
    }

    renderer.submit({
      type: CommandType.WriteBuffer,
      src: matricesBuffer.data,
      dst: matricesBuffer.buffer,
    });

    // TODO: if nothing has changed we probably want to just keep rendering the bounding boxes
    //       as is
    boundingBoxes.length = 0;

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
        let cameraPosition: vec3;
        if (get(debugMode)) {
          cameraPosition = debugCameraController.position;
        } else {
          cameraPosition = cameraController.position;
        }

        const distA = vec3.length(vec3.sub(tmp, cameraPosition, transformA.position));
        const distB = vec3.length(vec3.sub(tmp, cameraPosition, transformB.position));

        return distB - distA;
      }

      return 0;
    });
    transparent.forEach(renderNode);

    if (boundingBoxes.length > 0) {
      // TODO: only do this when they change
      boundingBoxRenderer.setBoundingBoxes(boundingBoxes);
      boundingBoxRenderer.render();
    }

    if (get(debugMode)) {
      debugRenderSystem.render();
    }

    postRenderCallbacks.forEach((cb) => cb());

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

    onPreRender(cb: () => void) {
      preRenderCallbacks.push(cb);

      return () => {
        const idx = preRenderCallbacks.findIndex(cb);
        if (idx != -1) {
          preRenderCallbacks.splice(idx, 1);
        }
      };
    },
    onPostRender(cb: () => void) {
      postRenderCallbacks.push(cb);

      return () => {
        const idx = postRenderCallbacks.findIndex(cb);
        if (idx != -1) {
          postRenderCallbacks.splice(idx, 1);
        }
      };
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
      debugCameraController.destroy();

      resizer.disconnect();
    },

    renderer,
    cameraController,
    debugCameraController,
    sceneGraph,
    entityManager,
    bufferManager,
    shaderManager,
    stats,
    debugMode,
  };
}
