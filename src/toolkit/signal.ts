import { createCallbackHandler } from './subscription';

export function createSignal() {
  let callbacks = createCallbackHandler();

  return {
    subscribe(cb: VoidFunction): Unsubscriber {
      return callbacks.add(cb);
    },

    emit() {
      callbacks.call();
    },

    destroy() {
      callbacks.destroy();
    },
  };
}
