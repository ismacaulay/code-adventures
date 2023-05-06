import { writable } from 'svelte/store';

export function createFrameStats() {
  const fps = writable<number>(0);
  const triangles = writable<number>(0);

  let start = 0;
  let frames = 0;

  return {
    begin() {
      triangles.set(0);
    },

    addTriangles(count: number) {
      triangles.update((value) => {
        return value + count;
      });
    },

    end() {
      frames++;

      const now = performance.now();

      if (now >= start + 1000) {
        fps.set(Math.round((frames * 1000) / (now - start)));
        start = now;
        frames = 0;
      }
    },

    fps,
    triangles,
  };
}
