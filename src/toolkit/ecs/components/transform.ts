import { mat4, vec3, glMatrix } from 'gl-matrix';
import { ComponentType } from 'types/ecs/component';
import type { TransformComponent } from 'types/ecs/component';
import { isAxisRotation, type Rotation } from 'toolkit/math/rotation';

export function createTransformComponent(params: {
  position?: vec3;
  rotation?: Rotation;
  scale?: vec3;
}): TransformComponent {
  let matrix = mat4.create();

  const { position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] } = params;

  function updateMatrix() {
    mat4.identity(matrix);
    mat4.translate(matrix, matrix, position);

    if (isAxisRotation(rotation)) {
      mat4.rotate(matrix, matrix, rotation.angle, rotation.axis);
    } else {
      // THIS MIGHT BE WRONG!
      mat4.rotateX(matrix, matrix, glMatrix.toRadian(rotation[0]));
      mat4.rotateY(matrix, matrix, glMatrix.toRadian(rotation[1]));
      mat4.rotateZ(matrix, matrix, glMatrix.toRadian(rotation[2]));
    }
    mat4.scale(matrix, matrix, scale);
  }
  updateMatrix();

  return {
    type: ComponentType.Transform,

    position,
    rotation,
    scale,

    updateMatrix,

    get matrix() {
      return matrix;
    },
  };
}

export function transformComponentFromMatrix(fromMatrix: mat4): TransformComponent {
  let matrix = mat4.clone(fromMatrix);

  const position = vec3.create();
  mat4.getTranslation(position, matrix);

  return {
    type: ComponentType.Transform,

    get position() {
      return position;
    },
    set position(_value: vec3) {
      throw new Error('[Matrix Transform] set position not implemented yet');
    },

    get rotation() {
      throw new Error('[Matrix Transform] get rotation not implemented yet');
    },
    set rotation(_value: Rotation) {
      throw new Error('[Matrix Transform] set rotation not implemented yet');
    },

    get scale() {
      throw new Error('[Matrix Transform] get scale not implemented yet');
    },
    set scale(_value: vec3) {
      throw new Error('[Matrix Transform] set scale not implemented yet');
    },

    updateMatrix() {},
    get matrix() {
      return matrix;
    },
  };
}
