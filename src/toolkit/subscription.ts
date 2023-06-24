export const noop = () => {};

type CallbackFunc<T> = (params: T) => void;

export function createCallbackHandler<T = void>() {
  let callbacks: CallbackFunc<T>[] = [];

  return {
    add(cb: CallbackFunc<T>): Unsubscriber {
      callbacks.push(cb);

      return function unsubscribe() {
        const idx = callbacks.findIndex((value) => value === cb);
        if (idx !== -1) {
          callbacks.splice(idx, 1);
        }
      };
    },

    call(param: T) {
      callbacks.forEach((cb) => cb(param));
    },

    destroy() {
      callbacks = [];
    },
  };
}
