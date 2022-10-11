export interface SceneGraphDescriptorV1 {
  entity: string;
  children?: SceneGraphDescriptorV1[];
}

export type SceneGraphV1 = SceneGraphDescriptorV1[];
