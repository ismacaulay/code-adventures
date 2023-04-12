export function createDynamicFloat64Array(initial: number = 65536) {
  // TODO: should be an ArrayBuffer?
  let buffer = new Float64Array(initial);
  let length = 0;

  function resizeBuffer() {
    const newBuffer = new Float64Array(buffer.length * 2);
    // console.log('[resizeBuffer] resizing: ', buffer.length, newBuffer.length);
    newBuffer.set(buffer);
    buffer = newBuffer;
  }

  return {
    get buffer() {
      return buffer;
    },

    get length() {
      return length;
    },

    get capacity() {
      return buffer.length;
    },

    append(arr: ArrayLike<number>) {
      while (length + arr.length > buffer.length) {
        resizeBuffer();
      }

      buffer.set(arr, length);
      length += arr.length;
    },

    push(...args: number[]) {
      while (length + args.length > buffer.length) {
        resizeBuffer();
      }

      buffer.set(args, length);
      length += args.length;
    },
  };
}
