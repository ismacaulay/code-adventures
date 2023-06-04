import {
  ComponentType,
  GeometryComponentType,
  type ClusterGeometryComponent,
} from 'types/ecs/component';
import type { MeshGeometryComponent } from 'types/ecs/component';
import { BoundingBox } from 'toolkit/geometry/boundingBox';
import {
  BufferAttributeFormat,
  type VertexBufferDescriptor,
} from 'toolkit/rendering/buffers/vertexBuffer';
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

/**
 *  Creates a ClusterGeometryComponent
 *
 *  @param {BoundingBox} params.boundingBox - overall object bounding box
 *  @param {Float32Array | Float64Array} params.vertices - all of the vertices in the clusters
 *  @param {Uint32Array} params.indices - all of the indicies for the clusters
 *  @param {Uint32Array} params.offsets - the offsets into the triangles and vertices arrays; triangle offset, triangle count, vertex offset, vertex count
 *  @param {Float32Array | Float64Array} params.bounds - cluster bounds; each bounds is a centre and a radius
 *  @param {VertexBufferDescriptor[]} params.attributes - additional attributes for each cluster
 */
export function createClusterGeometryComponent(params: {
  boundingBox: BoundingBox;
  indices: Uint32Array;
  vertices: Float32Array | Float64Array;
  offsets: Uint32Array;
  bounds: Float32Array | Float64Array;
  colours: Uint32Array;
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
      count: params.offsets.length / 4,

      offsets: params.offsets,
      bounds: params.bounds,
      indices: params.indices,
      vertices: params.vertices,
      colours: params.colours,
    },

    buffers: {
      indices: {
        array: new Uint32Array(params.indices.length),
      },
      vertices: {
        array: new Float64Array(params.vertices.length),
        attributes: [
          {
            location: 0,
            format: BufferAttributeFormat.Float32x3,
          },
        ],
      },
      colours: {
        array: new Uint32Array(params.colours.length),
        attributes: [
          {
            location: 1,
            format: BufferAttributeFormat.Uint32,
          },
        ],
      },
    },
  };
}
