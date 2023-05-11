import { vec3 } from 'gl-matrix';

export type Sphere = {
  centre: vec3;
  radius: number;
};

export module Sphere {
  export function create(): Sphere {
    return { centre: vec3.create(), radius: 1 };
  }
}
