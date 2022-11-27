export function createCallbackHandler() {
  let callbacks: VoidFunction[] = [];

  return {
    add(cb: VoidFunction): Unsubscriber {
      callbacks.push(cb);

      return function unsubscribe() {
        const idx = callbacks.findIndex((value) => value === cb);
        if (idx !== -1) {
          callbacks.splice(idx, 1);
        }
      };
    },

    call() {
      callbacks.forEach((cb) => cb());
    },

    destroy() {
      callbacks = [];
    },
  };
}
