<script lang="ts">
  import { onMount } from "svelte";
  import { setSeed, generate2DPoints } from "./math/random";
  import { createRenderer2D } from "./renderer2D";
  import { ButtonApi, Pane } from "tweakpane";
  import { vec2 } from "gl-matrix";
  import { cloneDeep } from "lodash";
  import type { Point2D, SegmentDescriptor } from "./types/points";

  enum AlgorithmState {
    Initial,
    Sorting,
    AddPoint,
    CheckTurn,
    Discard,
    Done,
  }

  interface HullState {
    points: Point2D[];
    segments: SegmentDescriptor[];
  }

  let container: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  setSeed(42);

  onMount(() => {
    const renderer = createRenderer2D(canvas);

    const pointsCount = 25;
    const pointsRange = {
      x: [-10, 10] as [number, number],
      y: [-10, 10] as [number, number],
    };

    const p01 = vec2.create();
    const p02 = vec2.create();
    function isRightTurn(p0: vec2, p1: vec2, p2: vec2) {
      vec2.sub(p01, p1, p0);
      vec2.sub(p02, p2, p0);
      return p01[0] * p02[1] - p01[1] * p02[0] > 0;
    }

    function generatePoints(
      count: number,
      range: { x: [number, number]; y: [number, number] }
    ) {
      const vertices = generate2DPoints(count, range);

      const points = [];
      for (let i = 0; i < count; ++i) {
        points.push({
          position: [vertices[i * 2], vertices[i * 2 + 1]],
          color: "black",
          radius: 0.2,
        });
      }

      return points;
    }

    function generateInitialState() {
      return {
        points: generatePoints(pointsCount, pointsRange),
        hull: {
          points: [],
          segments: [],
        },
        idx: 0,
        direction: 1,
      };
    }

    function renderState({
      points,
      hull,
    }: {
      points: Point2D[];
      hull: HullState;
    }) {
      const lineStrip = hull.points.reduce(
        (acc, cur, idx) => {
          acc.vertices.push(cur.position);
          if (idx != 0) {
            acc.dash.push(hull.segments[idx - 1].dash);
            acc.color.push(hull.segments[idx - 1].color);
          }
          return acc;
        },
        { vertices: [], color: [], dash: [] }
      );
      renderer.drawLinesStrip(lineStrip);

      renderer.drawPoints(points);
    }

    const initialState = generateInitialState();
    const state = [initialState];
    let currentState = 0;

    let needsUpdate = true;
    let frameId = -1;
    function animate() {
      frameId = requestAnimationFrame(animate);

      if (needsUpdate) {
        renderer.clear();
        renderState(state[currentState]);

        needsUpdate = false;
      }
    }
    animate();

    let algorthimState = AlgorithmState.Initial;
    function generateNextState() {
      if (algorthimState === AlgorithmState.Done) {
        return false;
      }

      const nextState = cloneDeep(state[currentState]);
      if (algorthimState === AlgorithmState.Initial) {
        algorthimState = AlgorithmState.Sorting;

        nextState.points = cloneDeep(nextState.points).sort((p1, p2) => {
          const xDiff = p1.position[0] - p2.position[0];
          if (xDiff !== 0) {
            return xDiff;
          }

          return p1.position[1] - p2.position[1];
        });
      } else if (algorthimState === AlgorithmState.Sorting) {
        algorthimState = AlgorithmState.AddPoint;

        nextState.hull.points = [nextState.points[0], nextState.points[1]];
        nextState.hull.points.forEach((p) => (p.color = "green"));
        nextState.hull.segments = [{ dash: [], color: "black" }];
        nextState.idx = 2;
      } else if (algorthimState === AlgorithmState.AddPoint) {
        if (nextState.idx < 0) {
          nextState.hull.segments.forEach((s) => {
            s.dash = [];
            s.color = "green";
          });
          algorthimState = AlgorithmState.Done;
        } else {
          algorthimState = AlgorithmState.CheckTurn;

          if (nextState.idx > nextState.points.length - 1) {
            nextState.direction = -1;
            nextState.idx = nextState.points.length - 2;
          }

          const point = nextState.points[nextState.idx];
          point.color = "green";

          nextState.hull.points.push(point);

          const segments = nextState.hull.segments;
          segments.forEach((s) => {
            s.dash = [];
            s.color = "black";
          });
          segments.push({ dash: [5, 5], color: "black" });
          if (segments.length > 1) {
            segments[segments.length - 2].color = "black";
            segments[segments.length - 2].dash = [5, 5];
          }

          nextState.idx += nextState.direction;
        }
      } else if (algorthimState === AlgorithmState.CheckTurn) {
        const hull = nextState.hull;
        const points = hull.points;
        const segments = hull.segments;
        const p0 = points[points.length - 3];
        const p1 = points[points.length - 2];
        const p2 = points[points.length - 1];
        let color = "green";
        if (isRightTurn(p0.position, p1.position, p2.position)) {
          algorthimState = AlgorithmState.AddPoint;
        } else {
          color = "red";
          algorthimState = AlgorithmState.Discard;
        }
        p0.color = color;
        p1.color = color;
        p2.color = color;
        const s0 = segments[segments.length - 2];
        s0.color = color;
        const s1 = segments[segments.length - 1];
        s1.color = color;
      } else if (algorthimState === AlgorithmState.Discard) {
        const hull = nextState.hull;
        const points = hull.points;
        const p0 = points[points.length - 3];
        const p1 = points[points.length - 2];
        const p2 = points[points.length - 1];
        p0.color = "green";
        p1.color = "black";
        p2.color = "green";
        points.splice(points.length - 2, 1);
        points.forEach((p) => (p.color = "green"));

        const segments = hull.segments;
        segments.splice(segments.length - 1, 1);
        segments[segments.length - 1].color = "black";
        segments[segments.length - 1].dash = [5, 5];

        if (points.length < 3) {
          algorthimState = AlgorithmState.AddPoint;
          segments.forEach((s) => {
            s.dash = [];
            s.color = "black";
          });
        } else {
          algorthimState = AlgorithmState.CheckTurn;
          segments[segments.length - 2].color = "black";
          segments[segments.length - 2].dash = [5, 5];
        }
      } else {
        console.warn("State:", algorthimState, "not handled yet");
      }

      state.push(nextState);
      return true;
    }

    const pane = new Pane();
    const folder = pane.addFolder({
      title: "animation controls",
      expanded: true,
    });

    let playBtn: ButtonApi;
    let stopBtn: ButtonApi;
    let forwardBtn: ButtonApi;
    let backwardBtn: ButtonApi;

    function stepAnimation() {
      if (currentState < state.length) {
        if (currentState === state.length - 1 && generateNextState()) {
          currentState++;
        } else if (currentState < state.length - 1) {
          currentState++;
        }
      }

      needsUpdate = true;
    }

    let start: number;
    const params = { duration: 500 };
    let animationId = -1;
    function runAnimation(current: number) {
      if (start === undefined) {
        start = current;
      }

      if (current - start >= params.duration) {
        start = current;
        stepAnimation();
      }

      animationId = requestAnimationFrame(runAnimation);
    }

    folder.addInput(params, "duration", { min: 0, max: 1000, step: 100 });
    playBtn = folder.addButton({ title: "play" }).on("click", () => {
      playBtn.disabled = true;
      forwardBtn.disabled = true;
      backwardBtn.disabled = true;

      animationId = requestAnimationFrame(runAnimation);
    });

    stopBtn = folder.addButton({ title: "stop" }).on("click", () => {
      playBtn.disabled = false;
      forwardBtn.disabled = false;
      backwardBtn.disabled = false;

      cancelAnimationFrame(animationId);
    });

    forwardBtn = folder
      .addButton({ title: "forward" })
      .on("click", stepAnimation);

    backwardBtn = folder.addButton({ title: "backward" }).on("click", () => {
      if (currentState !== 0) {
        currentState--;
      }
      needsUpdate = true;
    });

    // TODO: Try a ResizeObserver on the actual element
    function handleResize() {
      renderer.resize();
      needsUpdate = true;
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);

      renderer.destroy();
    };
  });
</script>

<svelte:head>
  <title>Covex Hull 2D</title>
</svelte:head>

<div class="container" bind:this={container}>
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
