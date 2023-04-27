import { mat4, vec3, glMatrix } from 'gl-matrix';
import { ComponentType, type MatrixTransformComponent } from 'types/ecs/component';
import type { TransformComponent } from 'types/ecs/component';
import { isAxisRotation, type Rotation } from 'toolkit/math/rotation';

export function createTransformComponent({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
}: {
  position?: vec3;
  rotation?: Rotation;
  scale?: vec3;
}): TransformComponent {
  let matrix = mat4.create();

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

export function transformComponentFromMatrix(fromMatrix: mat4): MatrixTransformComponent {
  let matrix = mat4.clone(fromMatrix);

  return {
    type: ComponentType.Transform,

    get matrix() {
      return matrix;
    },
  };
}
