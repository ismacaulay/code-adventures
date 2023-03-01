import { ComponentType } from 'types/ecs/component';
import type {
  MeshGeometryComponent,
  IndexBufferDescriptor,
  VertexBufferDescriptor,
} from 'types/ecs/component';
import type { BoundingBox } from 'toolkit/geometry/boundingBox';

export function createMeshGeometryComponent({
  boundingBox,
  indices,
  buffers,
  count,
  instances = 1,
}: {
  boundingBox: BoundingBox;
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
    boundingBox,
    showBoundingBox: false,
  };
}
