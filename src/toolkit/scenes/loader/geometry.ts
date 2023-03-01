import { createMeshGeometryComponent } from 'toolkit/ecs/components/geometry';
import { computeBoundingBox } from 'toolkit/geometry/boundingBox';
import { loadObj } from 'toolkit/loaders/objLoader';
import { BufferAttributeFormat } from 'toolkit/rendering/buffers/vertexBuffer';
import type { GeometryComponent } from 'types/ecs/component';
import { GeometryComponentTypeV1, type GeometryComponentV1 } from 'types/scenes/v1/geometry';

export async function createGeometryComponent(
  geometry: GeometryComponentV1,
): Promise<GeometryComponent> {
  if (geometry.type === GeometryComponentTypeV1.Obj) {
    const { vertices, faces } = await loadObj(geometry.location);
    const boundingBox = computeBoundingBox(vertices);

    return createMeshGeometryComponent({
      boundingBox,
      count: faces.length,
      indices: faces,
      buffers: [
        {
          array: vertices,
          attributes: [
            {
              format: BufferAttributeFormat.Float32x3,
              location: 0,
            },
          ],
        },
      ],
    });
  } else if (geometry.type === GeometryComponentTypeV1.Mesh) {
    const { vertices, triangles, attributes = [] } = geometry;
    const boundingBox = computeBoundingBox(vertices);

    let count = 0;
    const vertBuf = new Float64Array(vertices);
    let triBuf: Maybe<Uint32Array>;
    if (triangles) {
      triBuf = new Uint32Array(triangles);
      count = triBuf.length;
    } else {
      count = vertices.length / 3;
    }
    return createMeshGeometryComponent({
      boundingBox,
      count,
      indices: triBuf,
      buffers: [
        {
          array: vertBuf,
          attributes: [
            {
              format: BufferAttributeFormat.Float32x3,
              location: 0,
            },
          ],
        },
        ...attributes.map((attr, idx) => {
          return {
            array: new Float64Array(attr.array),
            attributes: [
              {
                format: attr.format,
                location: idx + 1,
              },
            ],
          };
        }),
      ],
    });
  }

  throw new Error(`[loadGeometryComponent] Unknown geometry type ${(geometry as any).type}`);
}
