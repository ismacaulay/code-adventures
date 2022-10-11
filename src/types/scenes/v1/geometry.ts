export enum GeometryComponentTypeV1 {
  Obj = 'obj',
}

interface BaseGeometryComponentV1 {
  type: GeometryComponentTypeV1;
}

export interface ObjGeometryComponentV1 extends BaseGeometryComponentV1 {
  type: GeometryComponentTypeV1.Obj;
  location: string;
}

export type GeometryComponentV1 = ObjGeometryComponentV1;
