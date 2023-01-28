interface Script {
  update(dt: number, entity: string): void;
}

interface ScriptStorageEntry {
  script: Maybe<Script>;
  destroy(): void;
}

interface ScriptDescriptor {
  location: string;
}

export interface ScriptManager {
  create(descriptor: ScriptDescriptor): Promise<number>;
}

type ScriptFactory = (engine: any) => Script;

export function createScriptManager(system: any) {
  let storage: GenericObject<ScriptStorageEntry> = {};
  let next = 0;

  (window as any).ca_registerScript = function (factory: ScriptFactory) {
    const scriptEl = document.currentScript;
    if (!scriptEl) {
      throw new Error('Unable to get current script');
    }

    const id = Number(scriptEl.id.split('_ca_script-')[1]);
    storage[id].script = factory(system);
  };

  return {
    get(id: number): Script {
      const entry = storage[id];
      if (!entry) {
        throw new Error(`Unknown script: ${id}`);
      }

      if (!entry.script) {
        throw new Error(`No script assigned for id: ${id}`);
      }

      return entry.script;
    },

    create(descriptor: ScriptDescriptor) {
      const id = next;
      next++;

      return new Promise<number>((res, rej) => {
        const script = document.createElement('script');
        script.id = `_ca_script-${id}`;
        // script.type = 'module';
        script.onload = function scriptLoaded() {
          res(id);
        };
        script.onerror = function scriptError(evt) {
          rej(evt);
        };

        script.src = descriptor.location;
        document.head.appendChild(script);

        storage[id] = {
          script: undefined,
          destroy() {
            document.head.removeChild(script);
          },
        };
      });
    },

    destroy() {
      Object.values(storage).forEach((entry) => entry.destroy());
      storage = {};
    },
  };
}
