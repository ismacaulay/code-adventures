import type { vec2 } from 'gl-matrix';
import type { LineStrip, Point2D, PointSet2D } from 'types/points';
import { transformValueToRange } from 'toolkit/math/range';

const TWO_PI = 2 * Math.PI;

export function createRenderer2D(canvas: HTMLCanvasElement) {
  function handleWheelEvent(e: MouseEvent) {
    e.preventDefault();
  }
  canvas.addEventListener('wheel', handleWheelEvent);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to get 2D context');
  }

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // TODO: this should be from a "camera"
  const startRangeX: [number, number] = [-15, 15];
  const startRangeY: [number, number] = [-15, 15];

  let endRangeX: [number, number] = [0, canvas.width];
  let endRangeY: [number, number] = [0, canvas.height];

  function transformVec2(v: vec2): [number, number] {
    return [
      transformValueToRange(v[0], startRangeX, endRangeX),
      transformValueToRange(v[1], startRangeY, endRangeY),
    ];
  }

  function transformRadius(radius: number) {
    return transformValueToRange(startRangeX[0] + radius, startRangeX, endRangeX);
  }

  function isArrayOfArrays<T>(arr: T[] | T[][]): arr is T[][] {
    if (arr.length > 0) {
      return Array.isArray(arr[0]);
    }
    return false;
  }

  return {
    clear() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    drawPoints(points: PointSet2D) {
      const count = points.length;

      let point: Point2D;
      for (let i = 0; i < count; ++i) {
        point = points[i];

        ctx.beginPath();
        ctx.fillStyle = point.color;

        ctx.arc(...transformVec2(point.position), transformRadius(point.radius), 0, TWO_PI);
        ctx.fill();
        ctx.closePath();
      }
    },

    drawLinesStrip({ vertices, dash, color }: LineStrip) {
      if (vertices.length < 2) {
        return;
      }

      let segmentDashes: number[][] | undefined;
      if (!isArrayOfArrays(dash)) {
        ctx.setLineDash(dash);
      } else {
        segmentDashes = dash;
      }

      let segmentColors: string[] | undefined;
      if (!Array.isArray(color)) {
        ctx.strokeStyle = color;
      } else {
        segmentColors = color;
      }

      ctx.lineWidth = 2;
      for (let i = 0; i < vertices.length - 1; ++i) {
        ctx.beginPath();
        ctx.moveTo(...transformVec2(vertices[i]));
        if (segmentDashes) {
          ctx.setLineDash(segmentDashes[i]);
        }

        if (segmentColors) {
          ctx.strokeStyle = segmentColors[i];
        }
        ctx.lineTo(...transformVec2(vertices[i + 1]));
        ctx.stroke();
        ctx.closePath();
      }
    },

    destroy() {
      canvas.removeEventListener('wheel', handleWheelEvent);
    },

    resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      endRangeX = [0, canvas.width];
      endRangeY = [0, canvas.height];
    },
  };
}
