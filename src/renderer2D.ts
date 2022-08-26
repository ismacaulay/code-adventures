import { transformValueToRange } from "./math/range";
import type { PointSet2D } from "./types/points";

export function createRenderer2D(canvas: HTMLCanvasElement) {
  function handleWheelEvent(e: MouseEvent) {
    e.preventDefault();
  }
  canvas.addEventListener("wheel", handleWheelEvent);

  const ctx = canvas.getContext("2d");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // TODO: this should be from a "camera"
  const startRangeX: [number, number] = [-15, 15];
  const startRangeY: [number, number] = [-15, 15];

  const endRangeX: [number, number] = [0, canvas.width];
  const endRangeY: [number, number] = [0, canvas.height];

  function translatePoint(x: number, y: number): [number, number] {
    return [
      transformValueToRange(x, startRangeX, endRangeX),
      transformValueToRange(y, startRangeY, endRangeY),
    ];
  }

  return {
    clear() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    drawPoints({ vertices, radius }: PointSet2D) {
      const count = vertices.length / 2;
      let translatedR = transformValueToRange(
        startRangeX[0] + radius,
        startRangeX,
        endRangeX
      );

      const TWO_PI = 2 * Math.PI;
      ctx.fillStyle = "green";

      for (let i = 0; i < count; ++i) {
        ctx.beginPath();

        ctx.arc(
          ...translatePoint(vertices[i * 2], vertices[i * 2 + 1]),
          translatedR,
          0,
          TWO_PI
        );

        ctx.fill();
      }
    },

    drawLinesStrip({ vertices }: { vertices: Float32Array }) {
      const numVerts = vertices.length / 2;
      if (numVerts < 1) {
        return;
      }

      ctx.beginPath();

      ctx.moveTo(...translatePoint(vertices[0], vertices[1]));
      for (let i = 1; i < numVerts; ++i) {
        ctx.lineTo(...translatePoint(vertices[i * 2], vertices[i * 2 + 1]));
      }

      ctx.stroke();
    },

    destroy() {
      canvas.removeEventListener("wheel", handleWheelEvent);
    },
  };
}
