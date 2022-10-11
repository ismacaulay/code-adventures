import type { CameraV1 } from './camera';
import type { EntityV1 } from './entity';
import type { SceneGraphV1 } from './sceneGraph';

interface BaseScene {
  version: number;
}

export interface SceneV1 extends BaseScene {
  version: 1;

  camera: CameraV1;
  root: SceneGraphV1;
  entities: {
    [key: string]: EntityV1;
  };
}
