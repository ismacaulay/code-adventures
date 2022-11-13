export enum GeometryComponentTypeV1 {
  Obj = 'obj',
  Mesh = 'mesh',
}

interface BaseGeometryComponentV1 {
  type: GeometryComponentTypeV1;
}

export interface ObjGeometryComponentV1 extends BaseGeometryComponentV1 {
  type: GeometryComponentTypeV1.Obj;
  location: string;
}

export interface MeshGeometryComponentV1 extends BaseGeometryComponentV1 {
  type: GeometryComponentTypeV1.Mesh;
  vertices: number[];
  triangles: number[];
}

export type GeometryComponentV1 = ObjGeometryComponentV1 | MeshGeometryComponentV1;
