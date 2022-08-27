export function createStateMachine<T extends number | string>(
  initialState: T,
  states: { [key in T]: () => T }
) {
  let currentState = initialState;

  return {
    step() {
      const fn = states[currentState];
      if (!fn) {
        throw new Error(`Unknown state: ${currentState}`);
      }

      currentState = fn();
      return currentState;
    },
  };
}
