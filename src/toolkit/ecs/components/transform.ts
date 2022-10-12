import type { vec3 } from 'gl-matrix';
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
  return {
    type: ComponentType.Transform,

    position,
    rotation,
    scale,
  };
}
