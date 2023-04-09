export function createQueue<T>() {
  const queue: T[] = [];

  return {
    enqueue(item: T) {
      queue.unshift(item);
    },

    dequeue() {
      return queue.shift();
    },

    empty() {
      return queue.length === 0;
    },
  };
}
