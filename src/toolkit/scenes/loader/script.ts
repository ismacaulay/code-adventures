import { ComponentType, type ScriptComponent } from 'types/ecs/component';
import type { ScriptComponentV1 } from 'types/scenes/v1/script';

export function createScriptComponent(script: ScriptComponentV1): ScriptComponent {
  return {
    type: ComponentType.Script,

    location: script.location,
  };
}
