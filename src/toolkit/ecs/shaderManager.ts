import type { UniformBuffer } from 'toolkit/rendering/buffers/uniformBuffer';
import {
  cloneShader,
  createShader,
  ShaderBindingType,
  type Shader,
  type ShaderBindingDescriptor,
  type ShaderDescriptor,
} from 'toolkit/rendering/shader';
import { DefaultBuffers, type BufferManager } from './bufferManager';

export interface ShaderManager {
  get<T extends Shader>(id: number): T;
  create(descriptor: ShaderDescriptor): number;
  clone(id: number, bindings: ShaderBindingDescriptor[]): number;
  destroy(): void;
}

export function createShaderManager(
  device: GPUDevice,
  { bufferManager }: { bufferManager: BufferManager },
): ShaderManager {
  let storage: GenericObject<Shader> = {};
  let next = 0;

  return {
    create(descriptor: ShaderDescriptor) {
      if ('bindings' in descriptor) {
        const { bindings, uniformBuffers } = processBindings(descriptor.bindings, {
          bufferManager,
        });

        storage[next] = createShader(next, device, descriptor, bindings, uniformBuffers);
      }
      return next++;
    },

    get<T extends Shader>(id: number) {
      const shader = storage[id];
      if (!shader) {
        throw new Error(`Unknown shader id: ${id}`);
      }

      return shader as T;
    },

    clone(id: number, bindingDescriptors: ShaderBindingDescriptor[]) {
      const shader = storage[id];
      if (!shader) {
        throw new Error(`Unknown shader: ${id}`);
      }

      const { bindings, uniformBuffers } = processBindings(bindingDescriptors, {
        bufferManager,
      });

      storage[next] = cloneShader(shader, bindings, uniformBuffers);
      storage[next].id = next;
      return next++;
    },

    destroy() {
      storage = {};
    },
  };
}

function processBindings(
  bindings: ShaderBindingDescriptor[],
  { bufferManager }: { bufferManager: BufferManager },
) {
  if (bindings.length === 0) {
    return { bindings: [], uniformBuffers: [] };
  }

  const uniformBuffers: UniformBuffer[] = [];
  const processed = [
    {
      entries: bindings.map((binding) => {
        if (binding.resource === undefined) {
          if (binding.type === ShaderBindingType.UniformBuffer) {
            binding.resource = bufferManager.createUniformBuffer(
              binding.descriptor,
              binding.values,
            );
          } else {
            throw new Error(`Unknown binding type: ${binding.type}`);
          }
        }

        const buffer = bufferManager.get<UniformBuffer>(binding.resource);
        // only include non default buffers
        if (binding.resource >= DefaultBuffers.Count) {
          uniformBuffers.push(buffer);
        }
        return {
          resource: {
            buffer: buffer.buffer,
          },
        };
      }),
    },
  ];

  return { bindings: processed, uniformBuffers };
}
