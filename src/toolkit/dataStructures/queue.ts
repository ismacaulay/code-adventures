type Node<T> = {
  value: T;
  next: Node<T> | undefined;
};

export function createQueue<T>() {
  let head: Node<T> | undefined = undefined;
  let tail: Node<T> | undefined = undefined;

  return {
    enqueue(item: T) {
      const node: Node<T> = { value: item, next: undefined };

      if (!tail) {
        tail = node;
        head = node;
        return;
      }

      tail.next = node;
      tail = node;
    },

    dequeue() {
      if (!head) {
        return undefined;
      }

      const node = head;
      head = head.next;
      if (head === undefined) {
        tail = undefined;
      }

      return node.value;
    },
  };
}
