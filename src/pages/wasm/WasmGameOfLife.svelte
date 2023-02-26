<script lang="ts">
  import { onMount } from 'svelte';
  import init, { Universe, Cell } from 'game-of-life';

  const CELL_SIZE = 5;
  const GRID_COLOR = '#CCCCCC';
  const DEAD_COLOR = '#FFFFFF';
  const ALIVE_COLOR = '#000000';

  const width = 128;
  const height = 128;

  let canvas: HTMLCanvasElement;

  onMount(() => {
    let frameId = -1;

    init().then((wasm) => {
      const universe = Universe.new(width, height);

      canvas.height = (CELL_SIZE + 1) * height + 1;
      canvas.width = (CELL_SIZE + 1) * width + 1;

      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      if (!ctx) {
        throw new Error('Unable to get canvas context');
      }

      function drawGrid() {
        ctx.beginPath();
        ctx.strokeStyle = GRID_COLOR;

        // vertical lines
        for (let i = 0; i <= width; ++i) {
          ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
          ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
        }

        // horizontal lines
        for (let i = 0; i <= height; ++i) {
          ctx.moveTo(0, i * (CELL_SIZE + 1) + 1);
          ctx.lineTo((CELL_SIZE + 1) * width + 1, i * (CELL_SIZE + 1) + 1);
        }
        ctx.stroke();
      }

      function drawCells() {
        const cellsPtr = universe.cells();
        // this creates a new view on the memory buffer and is not a copy
        // which can be verified by checking the memory.buffer === cells.buffer
        const cells = new Uint8Array(wasm.memory.buffer, cellsPtr, width * height);

        ctx.beginPath();

        for (let row = 0; row < height; ++row) {
          for (let col = 0; col < width; ++col) {
            const idx = row * width + col;
            ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;
            ctx.fillRect(
              col * (CELL_SIZE + 1) + 1,
              row * (CELL_SIZE + 1) + 1,
              CELL_SIZE,
              CELL_SIZE,
            );
          }
        }

        ctx.stroke();
      }

      function render() {
        universe.tick();

        drawGrid();
        drawCells();

        frameId = requestAnimationFrame(render);
      }

      frameId = requestAnimationFrame(render);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  });
</script>

<style>
  .container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>

<div class="container">
  <canvas id="game-of-life-canvas" bind:this={canvas} />
</div>
