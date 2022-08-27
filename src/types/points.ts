import type { vec2 } from 'gl-matrix';

export interface Point2D {
  position: vec2;
  radius: number;
  color: string;
}

export type PointSet2D = Point2D[];

export interface SegmentDescriptor {
  dash: number[];
  color: string;
}

export interface LineStrip {
  vertices: vec2[];
  color: string | string[];
  dash: number[] | number[][];
}
