import { vec3 } from 'gl-matrix';
import { writable, type Writable } from 'svelte/store';
import { MaterialComponentType, type MaterialComponent } from 'types/ecs/component';

export interface BaseMaterialViewModel {
  type: MaterialComponentType;

  destroy(): void;
}

export interface MeshBasicMaterialViewModel extends BaseMaterialViewModel {
  type: MaterialComponentType.MeshBasic;

  transparent: Writable<boolean>;
  opacity: Writable<number>;
  colour: Writable<vec3>;
}

export interface MeshDiffuseMaterialViewModel extends BaseMaterialViewModel {
  type: MaterialComponentType.MeshDiffuse;

  transparent: Writable<boolean>;
  opacity: Writable<number>;
  colour: Writable<vec3>;
}

export interface RawShaderMaterialViewModel extends BaseMaterialViewModel {
  type: MaterialComponentType.RawShader;

  transparent: Writable<boolean>;
}

export type MaterialViewModel =
  | MeshBasicMaterialViewModel
  | MeshDiffuseMaterialViewModel
  | RawShaderMaterialViewModel;

export function createMaterialViewModel(component: MaterialComponent): MaterialViewModel {
  let unsubscribers: Unsubscriber[] = [];

  if (
    component.subtype === MaterialComponentType.MeshBasic ||
    component.subtype === MaterialComponentType.MeshDiffuse
  ) {
    const transparent = writable(component.transparent);
    const opacity = writable(component.opacity);
    const colour = writable(vec3.clone(component.colour));

    unsubscribers.push(
      transparent.subscribe((value) => {
        component.transparent = value;
      }),

      opacity.subscribe((value) => {
        component.opacity = value;
      }),

      colour.subscribe((value) => {
        if (!vec3.equals(value, component.colour)) {
          vec3.copy(component.colour, value);
        }
      }),
    );

    return {
      type: component.subtype,
      transparent,
      opacity,
      colour,
      destroy() {
        unsubscribers.forEach((cb) => cb());
        unsubscribers = [];
      },
    };
  } else if (component.subtype === MaterialComponentType.RawShader) {
    const transparent = writable(component.transparent);

    unsubscribers.push(
      transparent.subscribe((value) => {
        component.transparent = value;
      }),
    );
    return {
      type: component.subtype,
      transparent,
      destroy() {
        unsubscribers.forEach((cb) => cb());
        unsubscribers = [];
      },
    };
  }

  throw new Error(`[createMaterialViewModel] Subtype not implemented yet: ${component.subtype}`);
}
