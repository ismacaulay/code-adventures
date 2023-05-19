import {
  ComponentType,
  GeometryComponentType,
  type ClusterGeometryComponent,
} from 'types/ecs/component';
import type { MeshGeometryComponent } from 'types/ecs/component';
import { BoundingBox } from 'toolkit/geometry/boundingBox';
import type { VertexBufferDescriptor } from 'toolkit/rendering/buffers/vertexBuffer';
import type { IndexBufferDescriptor } from 'toolkit/rendering/buffers/indexBuffer';
import { Sphere } from 'toolkit/math/sphere';

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

  let boundingSphere: Sphere | undefined;

  return {
    type: ComponentType.Geometry,
    subtype: GeometryComponentType.Buffer,
    boundingBox,
    showBoundingBox: false,

    get boundingSphere() {
      if (!boundingSphere) {
        boundingSphere = Sphere.create();
        BoundingBox.centre(boundingBox, boundingSphere.centre);
        boundingSphere.radius = BoundingBox.diagonal(boundingBox);
      }

      return boundingSphere;
    },

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
  let boundingSphere: Sphere | undefined;

  return {
    type: ComponentType.Geometry,
    subtype: GeometryComponentType.Cluster,
    boundingBox: params.boundingBox,
    showBoundingBox: false,

    get boundingSphere() {
      if (!boundingSphere) {
        boundingSphere = Sphere.create();
        BoundingBox.centre(params.boundingBox, boundingSphere.centre);
        boundingSphere.radius = BoundingBox.diagonal(params.boundingBox);
      }

      return boundingSphere;
    },

    clusters: {
      counts: params.counts,
      bounds: params.bounds,
      indices: params.indices,
      vertices: params.vertices,
      attributes: params.attributes,
    },
  };
}
