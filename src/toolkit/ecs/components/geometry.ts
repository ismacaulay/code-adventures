import {
  ComponentType,
  GeometryComponentType,
  type ClusterGeometryComponent,
} from 'types/ecs/component';
import type { MeshGeometryComponent } from 'types/ecs/component';
import type { BoundingBox } from 'toolkit/geometry/boundingBox';
import type { VertexBufferDescriptor } from 'toolkit/rendering/buffers/vertexBuffer';
import type { IndexBufferDescriptor } from 'toolkit/rendering/buffers/indexBuffer';

export function createBufferGeometryComponent({
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
    subtype: GeometryComponentType.Buffer,
    boundingBox,
    showBoundingBox: false,

    indices: indexDescriptor,
    buffers,
    count,
    instances,
  };
}

export function createClusterGeometryComponent(params: {
  boundingBox: BoundingBox;
  counts: Uint32Array;
  bounds: Float32Array | Float64Array;
  indices: Uint32Array;
  vertices: Float32Array | Float64Array;
  attributes: VertexBufferDescriptor[];
}): ClusterGeometryComponent {
  return {
    type: ComponentType.Geometry,
    subtype: GeometryComponentType.Cluster,
    boundingBox: params.boundingBox,
    showBoundingBox: false,

    clusters: {
      counts: params.counts,
      bounds: params.bounds,
      indices: params.indices,
      vertices: params.vertices,
      attributes: params.attributes,
    },
  };
}
