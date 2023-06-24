type Node<T> = {
  value: T;
  next: Node<T> | undefined;
};

export function createQueue<T>() {
  let length = 0;
  let head: Node<T> | undefined = undefined;
  let tail: Node<T> | undefined = undefined;

  return {
    get length() {
      return length;
    },

    enqueue(item: T) {
      const node: Node<T> = { value: item, next: undefined };
      length++;

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

      length--;
      const node = head;
      head = head.next;
      if (head === undefined) {
        tail = undefined;
      }

      return node.value;
    },
  };
}
