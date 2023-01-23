import { mat4 } from 'gl-matrix';
import {
  createMeshBasicMaterialComponent,
  createMeshDiffuseMaterialComponent,
  createRawShaderMaterialComponent,
} from 'toolkit/ecs/components/material';
import type { TextureManager } from 'toolkit/ecs/textureManager';
import {
  UniformType,
  type UniformBufferDescriptor,
  type UniformDictionary,
} from 'toolkit/rendering/buffers/uniformBuffer';
import type { MaterialComponent } from 'types/ecs/component';
import { MaterialComponentTypeV1, type MaterialComponentV1 } from 'types/scenes/v1/material';

export async function createMaterialComponent(
  material: MaterialComponentV1,
  { textureManager }: { textureManager: TextureManager },
): Promise<MaterialComponent> {
  if (material.type === MaterialComponentTypeV1.MeshBasicMaterial) {
    return createMeshBasicMaterialComponent({ colour: material.colour });
  } else if (material.type === MaterialComponentTypeV1.MeshDiffuseMaterial) {
    return createMeshDiffuseMaterialComponent({ colour: material.colour });
  } else if (material.type === MaterialComponentTypeV1.RawShaderMaterial) {
    // TODO: handle multi source, and move this check into function
    if ('source' in material) {
      const source = await fetch(material.source).then((resp) => resp.text());

      let uniforms: Maybe<{ descriptor: UniformBufferDescriptor; values: UniformDictionary }>;
      if (material.uniforms) {
        const uniformEntries = Object.entries(material.uniforms);
        if (uniformEntries.length > 0) {
          uniforms = uniformEntries.reduce(
            (acc, cur) => {
              const [name, value] = cur;

              if (typeof value === 'string') {
                acc.descriptor[name] = value;

                if (value === UniformType.Mat4) {
                  acc.values[name] = mat4.create();
                } else {
                  throw new Error(
                    `[createMaterialComponent] Unhandled uniform string type: ${value}`,
                  );
                }
              } else {
                throw new Error(
                  `[createMaterialComponent] Unable to handle uniform: ${name}: ${value}`,
                );
              }

              return acc;
            },
            {
              descriptor: {} as UniformBufferDescriptor,
              values: {} as UniformDictionary,
            },
          );
        }
      }

      let textures: Maybe<number[]>;
      if (material.textures) {
        textures = await Promise.all(
          material.textures.map((texture) => {
            return textureManager.createTexture({
              uri: texture.location,
              format: 'rgba8unorm',
              addressModeU: texture.addressModeU || 'repeat',
              addressModeV: texture.addressModeV || 'repeat',
              addressModeW: texture.addressModeW || 'repeat',
              minFilter: 'linear',
              magFilter: 'linear',
            });
          }),
        );
      }

      return createRawShaderMaterialComponent({
        source,
        vertex: { entryPoint: material.vertex.entryPoint },
        fragment: { entryPoint: material.fragment.entryPoint },
        uniforms,
        textures,
        blend: material.blend,
        transparent: material.transparent,
      });
    }
  }

  throw new Error(`[createMaterialComponent] Unknown material type: ${material.type}`);
}
