import { ComponentType } from 'types/ecs/component';
import type {
  MeshGeometryComponent,
  IndexBufferDescriptor,
  VertexBufferDescriptor,
} from 'types/ecs/component';

export function createMeshGeometryComponent({
  indices,
  buffers,
  count,
  instances = 1,
}: {
  indices?: Uint16Array | Uint32Array;
  buffers: VertexBufferDescriptor[];
  count: number;
  instances?: number;
}): MeshGeometryComponent {
  let indexDescriptor: Maybe<IndexBufferDescriptor>;
  if (indices) {
    indexDescriptor = {
      array: indices,
    };
  }

  return {
    type: ComponentType.Geometry,
    indices: indexDescriptor,
    buffers,
    count,
    instances,
  };
}
