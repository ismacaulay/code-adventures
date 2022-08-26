<script lang="ts">
  import { onMount } from "svelte";
  import { setSeed, randomIntInRangeInclusive } from "./math/random";
  import { createRenderer2D } from "./renderer2D";
  import { Pane } from "tweakpane";
  import { vec2 } from "gl-matrix";

  let canvas: HTMLCanvasElement;
  setSeed(42);

  onMount(() => {
    const renderer = createRenderer2D(canvas);

    function generate2DPoints(
      count: number,
      range: { x: [number, number]; y: [number, number] }
    ) {
      const points = new Int32Array(count * 2);
      const seen = new Set<string>();
      let found = false;
      let x: number;
      let y: number;
      let key: string;

      for (let i = 0; i < count; ++i) {
        found = false;
        while (!found) {
          x = randomIntInRangeInclusive(range.x);
          y = randomIntInRangeInclusive(range.y);

          key = JSON.stringify([x, y]);
          if (!seen.has(key)) {
            seen.add(key);

            points[i * 2] = x;
            points[i * 2 + 1] = y;
            found = true;
          }
        }
      }

      return points;
    }

    const pointsCount = 10;
    const pointsRange = {
      x: [-10, 10] as [number, number],
      y: [-10, 10] as [number, number],
    };
    const points = {
      vertices: generate2DPoints(pointsCount, pointsRange),
      radius: 0.2,
    };

    const lineStrip = {
      vertices: undefined,
    };

    let needsUpdate = true;
    let frameId = -1;
    function animate() {
      frameId = requestAnimationFrame(animate);

      if (needsUpdate) {
        renderer.clear();

        if (lineStrip.vertices) {
          renderer.drawLinesStrip(lineStrip);
        }
        renderer.drawPoints(points);

        needsUpdate = false;
      }
    }
    animate();

    const p01 = vec2.create();
    const p02 = vec2.create();
    function isRightTurn(p0: vec2, p1: vec2, p2: vec2) {
      vec2.sub(p01, p1, p0);
      vec2.sub(p02, p2, p0);
      return p01[0] * p02[1] - p01[1] * p02[0] > 0;
    }

    function computeConvexHull2D(vertices: Int32Array) {
      // sort the points in the x coordinate
      const sorted = [];
      const count = vertices.length / 2;
      for (let i = 0; i < count; ++i) {
        sorted.push([vertices[i * 2], vertices[i * 2 + 1]]);
      }
      sorted.sort((p1, p2) => {
        const xDiff = p1[0] - p2[0];
        if (xDiff !== 0) {
          return xDiff;
        }

        return p1[1] - p2[1];
      });

      const upper = [];
      upper.push(sorted[0], sorted[1]);
      for (let i = 2; i < count; ++i) {
        upper.push(sorted[i]);

        while (upper.length > 2) {
          const p0 = upper[upper.length - 3];
          const p1 = upper[upper.length - 2];
          const p2 = upper[upper.length - 1];

          if (isRightTurn(p0, p1, p2)) {
            break;
          }

          upper.splice(upper.length - 2, 1);
        }
      }

      const lower = [];
      lower.push(sorted[sorted.length - 1], sorted[sorted.length - 2]);
      for (let i = sorted.length - 3; i >= 0; --i) {
        lower.push(sorted[i]);

        while (lower.length > 2) {
          const p0 = lower[lower.length - 3];
          const p1 = lower[lower.length - 2];
          const p2 = lower[lower.length - 1];

          if (isRightTurn(p0, p1, p2)) {
            break;
          }
          lower.splice(lower.length - 2, 1);
        }
      }

      lower.splice(0, 1);
      lower.splice(lower.length - 1, 1);
      return upper.concat(lower);
    }

    const pane = new Pane();
    pane.addButton({ title: "randomize points" }).on("click", () => {
      points.vertices = generate2DPoints(pointsCount, pointsRange);
      lineStrip.vertices = undefined;

      needsUpdate = true;
    });
    pane.addButton({ title: "compute convex hull" }).on("click", () => {
      const hull = computeConvexHull2D(points.vertices);
      hull.push(hull[0]);

      lineStrip.vertices = new Float32Array(hull.flat());
      needsUpdate = true;
    });

    return () => {
      cancelAnimationFrame(frameId);

      renderer.destroy();
    };
  });
</script>

<svelte:head>
  <title>Covex Hull 2D</title>
</svelte:head>

<div class="container">
  <canvas bind:this={canvas} />
</div>

<style>
  .container {
    width: 100vw;
    height: 100vh;
  }

  canvas {
    width: 100%;
    height: 100%;
  }
</style>
