import { createQueue } from 'toolkit/dataStructures/queue';
import { nanoid } from 'nanoid';

export type CallbackTask = {
  args: any[];
  transferables?: Transferable[];

  callbacks: {
    onComplete: (result: any) => void;
  };
};

export type PromiseTask = {
  args: any[];
  transferables?: Transferable[];
};

export type Task = CallbackTask | PromiseTask;

function isCallbackTask(task: Task): task is CallbackTask {
  return 'callbacks' in task;
}

export type WorkerFactory = () => Worker;

export type WorkerPoolOpts = {
  concurrency?: number;
};

export type WorkerPool<ComputeFunctions> = {
  enqueue(name: Extract<keyof ComputeFunctions, string>, task: CallbackTask): void;
  enqueue(name: Extract<keyof ComputeFunctions, string>, task: PromiseTask): Promise<any>;

  destroy(): void;
};

type WorkerEntry = {
  id: string;
  worker: Worker;
  busy: boolean;
  task: WorkerTask | undefined;
};

type WorkerMessage = {
  workerId: string;
  result: any;
};

type WorkerTask = {
  name: string;
  args: any[];
  transferables?: Transferable[];
  callbacks: {
    onComplete: (result: any) => void;
  };
};

export function createWorkerPool<ComputeFunctions>(
  workerFactory: WorkerFactory,
  opts: WorkerPoolOpts = {},
): WorkerPool<ComputeFunctions> {
  const { concurrency = navigator.hardwareConcurrency ?? 4 } = opts;

  const taskQueue = createQueue<WorkerTask>();
  const workers: WorkerEntry[] = [];

  function handleWorkerMessage(message: WorkerMessage) {
    const worker = workers.find((entry) => entry.id === message.workerId);
    if (!worker) {
      return;
    }

    const task = worker.task;
    if (task) {
      task.callbacks.onComplete(message.result);
    }

    worker.task = undefined;
    worker.busy = false;

    processQueue();
  }

  function getAvailableWorker() {
    let worker = workers.find((entry) => !entry.busy);

    if (!worker) {
      if (workers.length < concurrency) {
        worker = {
          id: nanoid(),
          worker: workerFactory(),
          busy: false,
          task: undefined,
        };

        worker.worker.onmessage = function onMessage(message: MessageEvent) {
          // TODO: handle missing data
          handleWorkerMessage(message.data);
        };
        workers.push(worker);
      }
    }
    return worker;
  }

  function processQueue() {
    const worker = getAvailableWorker();
    if (!worker) {
      return;
    }

    const task = taskQueue.dequeue();
    if (!task) {
      return;
    }

    worker.busy = true;
    worker.task = task;
    worker.worker.postMessage(
      { workerId: worker.id, name: task.name, args: task.args },
      task.transferables as Transferable[],
    );
  }

  function enqueue(name: Extract<keyof ComputeFunctions, string>, task: CallbackTask): void;
  function enqueue(name: Extract<keyof ComputeFunctions, string>, task: PromiseTask): Promise<any>;
  function enqueue(name: Extract<keyof ComputeFunctions, string>, task: Task) {
    if (isCallbackTask(task)) {
      taskQueue.enqueue({
        name,
        args: task.args,
        transferables: task.transferables,

        callbacks: task.callbacks,
      });
      processQueue();
    } else {
      return new Promise((res) => {
        taskQueue.enqueue({
          name,
          args: task.args,
          transferables: task.transferables,

          callbacks: {
            onComplete: (result: any) => {
              res(result);
            },
          },
        });

        processQueue();
      });
    }
  }

  return {
    enqueue,

    destroy() {
      // TODO: notify waiting callers?
      workers.forEach((worker) => {
        worker.worker.terminate();
      });
      workers.length = 0;
    },
  };
}
