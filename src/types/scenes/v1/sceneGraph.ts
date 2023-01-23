export interface SceneGraphDescriptorV1 {
  entity: string;
  renderOrder?: number;
  children?: SceneGraphDescriptorV1[];
}

export type SceneGraphV1 = SceneGraphDescriptorV1[];
