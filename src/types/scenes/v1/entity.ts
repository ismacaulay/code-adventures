import type { GeometryComponentV1 } from './geometry';
import type { MaterialComponentV1 } from './material';
import type { ScriptComponentV1 } from './script';
import type { TransformV1 } from './transform';

export interface EntityV1 {
  transform: TransformV1;
  geometry: GeometryComponentV1 | string;
  material: MaterialComponentV1 | string;
  script?: ScriptComponentV1 | string;
}
