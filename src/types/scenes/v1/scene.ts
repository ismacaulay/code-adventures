import type { vec3 } from 'gl-matrix';
import type { ComponentV1 } from 'toolkit/scenes/component';
import type { CameraV1 } from './camera';
import type { EntityV1 } from './entity';
import type { SceneGraphV1 } from './sceneGraph';

interface BaseScene {
  version: number;
}

export interface SettingsV1 {
  background: vec3;
}

export interface SceneV1 extends BaseScene {
  version: 1;

  settings: SettingsV1;
  camera: CameraV1;
  root: SceneGraphV1;
  entities: {
    [key: string]: EntityV1;
  };
  components?: {
    [key: string]: ComponentV1;
  };
}
