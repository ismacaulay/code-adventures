import { mat4, vec3 } from 'gl-matrix';
import {
  createMeshBasicMaterialComponent,
  createMeshDiffuseMaterialComponent,
  createMeshPhongMaterialComponent,
  createRawShaderMaterialComponent,
} from 'toolkit/ecs/components/material';
import type { TextureManager } from 'toolkit/ecs/textureManager';
import {
  UniformType,
  type UniformBufferDescriptor,
  type UniformBufferDescriptorEntry,
  type UniformDictionary,
  type UniformValue,
} from 'toolkit/rendering/buffers/uniformBuffer';
import type { MaterialComponent } from 'types/ecs/component';
import {
  MaterialComponentTypeV1,
  type MaterialComponentV1,
  type UniformDictionaryV1,
  type UniformValueV1,
} from 'types/scenes/v1/material';

function isString(value: any): value is string {
  return typeof value === 'string';
}

function isNumber(value: any): value is number {
  return typeof value === 'number';
}

function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

function isUniformDictionary(value: any): value is UniformDictionaryV1 {
  return !Array.isArray(value) && !isNumber(value) && !isBoolean(value) && !isString(value);
}

function isNumberArray(arr: any): arr is ArrayLike<number> {
  if (!Array.isArray(arr) || arr.length === 0) {
    return false;
  }

  return isNumber(arr[0]);
}

function isUniformDictionaryArray(arr: any): arr is UniformDictionaryV1[] {
  if (!Array.isArray(arr) || arr.length === 0) {
    return false;
  }

  return isUniformDictionary(arr[0]);
}

function processUniformEntryValue(entryValue: UniformType | UniformValueV1) {
  let uniformDescriptor: UniformBufferDescriptorEntry;
  let uniformValue: UniformValue;

  if (isString(entryValue)) {
    uniformDescriptor = entryValue;

    if (entryValue === UniformType.Vec3) {
      uniformValue = vec3.create();
    } else if (entryValue === UniformType.Mat4) {
      uniformValue = mat4.create();
    } else {
      throw new Error(`[processUniformEntryValue] Unhandled uniform string type: ${entryValue}`);
    }
  } else if (isNumber(entryValue)) {
    uniformDescriptor = UniformType.Scalar;
    uniformValue = entryValue;
  } else if (isBoolean(entryValue)) {
    uniformDescriptor = UniformType.Bool;
    uniformValue = entryValue;
  } else if (isNumberArray(entryValue)) {
    if (entryValue.length === 3) {
      uniformDescriptor = UniformType.Vec3;
      uniformValue = entryValue;
    } else {
      throw new Error(
        `[processUniformEntryValue] Unhandled number of array values: ${entryValue.length}`,
      );
    }
  } else if (isUniformDictionary(entryValue)) {
    const { descriptor, values } = Object.entries(entryValue).reduce(
      (acc, [n, v]) => {
        const { descriptor, value } = processUniformEntryValue(v);
        acc.descriptor[n] = descriptor;
        acc.values[n] = value;
        return acc;
      },
      {
        descriptor: {} as UniformBufferDescriptor,
        values: {} as UniformDictionary,
      },
    );
    uniformDescriptor = descriptor;
    uniformValue = values;
  } else if (isUniformDictionaryArray(entryValue)) {
    // TODO: we are only processing a single entry so we have a correct descriptor,
    //       but incorrect values
    const { descriptor, values } = entryValue.reduce(
      (acc, cur) => {
        const { descriptor, values } = Object.entries(cur).reduce(
          (acc, [n, v]) => {
            const { descriptor, value } = processUniformEntryValue(v);
            acc.descriptor[n] = descriptor;
            acc.values[n] = value;
            return acc;
          },
          {
            descriptor: {} as UniformBufferDescriptor,
            values: {} as UniformDictionary,
          },
        );

        acc.descriptor.push(descriptor);
        acc.values.push(values);
        return acc;
      },
      {
        descriptor: [] as UniformBufferDescriptor[],
        values: [] as UniformDictionary[],
      },
    );

    // All of the descriptors should be the same (should verify that) so we just take the first one
    uniformDescriptor = [descriptor[0], entryValue.length];
    uniformValue = values;
  } else {
    throw new Error(
      `[createMaterialComponent] Unable to handle uniform: ${JSON.stringify(entryValue)}`,
    );
  }

  return { descriptor: uniformDescriptor, value: uniformValue };
}

export async function createMaterialComponent(
  material: MaterialComponentV1,
  { textureManager }: { textureManager: TextureManager },
): Promise<MaterialComponent> {
  if (material.type === MaterialComponentTypeV1.MeshBasicMaterial) {
    return createMeshBasicMaterialComponent({
      transparent: material.transparent ?? false,
      opacity: material.opacity ?? 1.0,
      colour: material.colour ?? [0.0, 0.0, 0.0],
    });
  } else if (material.type === MaterialComponentTypeV1.MeshDiffuseMaterial) {
    return createMeshDiffuseMaterialComponent({
      transparent: material.transparent ?? false,
      opacity: material.opacity ?? 1.0,
      colour: material.colour ?? [0.0, 0.0, 0.0],
    });
  } else if (material.type === MaterialComponentTypeV1.MeshPhongMaterial) {
    return createMeshPhongMaterialComponent({
      diffuse: material.diffuse,
      specular: material.specular,
      shininess: material.shininess,
    });
  } else if (material.type === MaterialComponentTypeV1.RawShaderMaterial) {
    // TODO: handle multi source, and move this check into function
    if ('source' in material) {
      const source = await fetch(material.source).then((resp) => resp.text());

      let uniforms: Maybe<{ descriptor: UniformBufferDescriptor; values: UniformDictionary }>;
      if (material.uniforms) {
        const uniformEntries = Object.entries(material.uniforms);
        if (uniformEntries.length > 0) {
          uniforms = uniformEntries.reduce(
            (acc, [n, v]) => {
              const { descriptor, value } = processUniformEntryValue(v);
              acc.descriptor[n] = descriptor;
              acc.values[n] = value;
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
