<script lang="ts">
  import { onMount } from "svelte";

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext("2d");

    function handleWheelEvent(e: MouseEvent) {
      e.preventDefault();
    }
    canvas.addEventListener("wheel", handleWheelEvent);

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const startRangeX: [number, number] = [-15, 15];
    const endRangeX: [number, number] = [0, canvas.width];
    const startRangeY: [number, number] = [-15, 15];
    const endRangeY: [number, number] = [0, canvas.height];

    function transformValueToRange(
      value: number,
      oldRange: [number, number],
      newRange: [number, number]
    ) {
      const oldDiff = oldRange[1] - oldRange[0];
      if (oldDiff === 0) {
        return newRange[0];
      }

      return (
        ((value - oldRange[0]) * (newRange[1] - newRange[0])) / oldDiff +
        newRange[0]
      );
    }

    function drawPoints(points: Int32Array, radius: number) {
      const count = points.length / 2;
      let translatedX: number, translatedY: number;
      let translatedR = transformValueToRange(
        startRangeX[0] + radius,
        startRangeX,
        endRangeX
      );

      const TWO_PI = 2 * Math.PI;
      ctx.fillStyle = "green";

      for (let i = 0; i < count; ++i) {
        ctx.beginPath();

        translatedX = transformValueToRange(
          points[i * 2],
          startRangeX,
          endRangeX
        );
        translatedY = transformValueToRange(
          points[i * 2 + 1],
          startRangeY,
          endRangeY
        );
        ctx.arc(translatedX, translatedY, translatedR, 0, TWO_PI);

        ctx.fill();
      }
    }

    function randomIntInRangeInclusive([min, max]: [number, number]) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function generate2DPoints(
      count: number,
      range: { x: [number, number]; y: [number, number] }
    ) {
      const points = new Int32Array(count * 2);
      const seen = new Set<[number, number]>();
      let found = false;
      let x: number;
      let y: number;

      for (let i = 0; i < count; ++i) {
        found = false;
        while (!found) {
          x = randomIntInRangeInclusive(range.x);
          y = randomIntInRangeInclusive(range.y);

          if (!seen.has([x, y])) {
            seen.add([x, y]);

            points[i * 2] = x;
            points[i * 2 + 1] = y;
            found = true;
          }
        }
      }

      return points;
    }

    const points = generate2DPoints(10, { x: [-10, 10], y: [-10, 10] });
    drawPoints(points, 0.25);

    return () => {
      canvas.removeEventListener("wheel", handleWheelEvent);
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

