<script lang="ts">
  import { onMount } from "svelte";
  import { Pane } from "tweakpane";
  import { setSeed, generate2DPoints } from "../../math/random";
  import { createRenderer2D } from "../../renderer2D";
  import type { PointSet2D } from "../../types/points";
  import { computeConvexHull2D } from "../../algorithms/computationalGeometry/convexHull2D";

  let canvas: HTMLCanvasElement;

  const seed = -522254247;
  console.log("Seed:", seed);
  setSeed(seed);

  onMount(() => {
    const renderer = createRenderer2D(canvas);

    const pointsCount = 25;
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
      dash: [],
      color: "black",
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

        const p: PointSet2D = [];
        for (let i = 0; i < pointsCount; ++i) {
          p.push({
            position: [points.vertices[i * 2], points.vertices[i * 2 + 1]],
            radius: 0.2,
            color: "black",
          });
        }
        renderer.drawPoints(p);

        needsUpdate = false;
      }
    }
    animate();

    const pane = new Pane();
    pane.addButton({ title: "randomize points" }).on("click", () => {
      points.vertices = generate2DPoints(pointsCount, pointsRange);
      lineStrip.vertices = undefined;

      needsUpdate = true;
    });
    pane.addButton({ title: "compute convex hull" }).on("click", () => {
      const hull = computeConvexHull2D(points.vertices);
      console.log(hull);
      hull.push(hull[0]);

      lineStrip.vertices = hull;
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
