import { mat4, type vec3 } from 'gl-matrix';
import { ComponentType } from 'types/ecs/component';
import type { TransformComponent } from 'types/ecs/component';

export function createTransformComponent({
  position,
  rotation,
  scale,
}: {
  position: vec3;
  rotation: vec3;
  scale: vec3;
}): TransformComponent {
  let matrix = mat4.create();

  function updateMatrix() {
    mat4.identity(matrix);
    mat4.translate(matrix, matrix, position);
    // mat4.rotate(matrix, matrix, rotation.angle, rotation.axis);
    // THIS MIGHT BE WRONG!
    mat4.rotateX(matrix, matrix, rotation[0]);
    mat4.rotateY(matrix, matrix, rotation[1]);
    mat4.rotateZ(matrix, matrix, rotation[2]);
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
