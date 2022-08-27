<script lang="ts">
  import { onMount } from "svelte";
  import { setSeed, generate2DPoints, randomInt32 } from "../../math/random";
  import { createRenderer2D } from "../../renderer2D";
  import { ButtonApi, Pane } from "tweakpane";
  import { cloneDeep } from "lodash";
  import type {
    Point2D,
    PointSet2D,
    SegmentDescriptor,
  } from "../../types/points";
  import { createStateMachine } from "../../toolkit/stateMachine";
  import { isRightTurn } from "../../math/vec2";

  enum AlgorithmState {
    Initial,
    Sorting,
    AddPoint,
    CheckTurn,
    Discard,
    Done,
  }

  interface HullState {
    upper: {
      points: Point2D[];
      segments: SegmentDescriptor[];
    };
    lower: {
      points: Point2D[];
      segments: SegmentDescriptor[];
    };
  }

  let canvas: HTMLCanvasElement;
  const seed = randomInt32();
  /* const seed = -522254247; */
  console.log("Seed:", seed);
  setSeed(seed);

  onMount(() => {
    const renderer = createRenderer2D(canvas);

    const pointsCount = 25;
    const pointsRange = {
      x: [-10, 10] as [number, number],
      y: [-10, 10] as [number, number],
    };

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
          upper: {
            points: [],
            segments: [],
          },
          lower: {
            points: [],
            segments: [],
          },
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
      const total = hull.upper.points.length + hull.lower.points.length;

      const lineStrip = {
        vertices: [],
        dash: [],
        color: [],
      };
      for (let i = 0; i < total; ++i) {
        if (i === hull.upper.points.length) {
          continue;
        }

        if (i < hull.upper.points.length) {
          lineStrip.vertices.push(hull.upper.points[i].position);
          if (i !== 0) {
            lineStrip.dash.push(hull.upper.segments[i - 1].dash);
            lineStrip.color.push(hull.upper.segments[i - 1].color);
          }
        } else {
          let idx = i - hull.upper.points.length;
          lineStrip.vertices.push(hull.lower.points[idx].position);
          lineStrip.dash.push(hull.lower.segments[idx - 1].dash);
          lineStrip.color.push(hull.lower.segments[idx - 1].color);
        }
      }

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

    const stateMachine = createStateMachine<AlgorithmState>(
      AlgorithmState.Initial,
      {
        [AlgorithmState.Initial]: () => {
          const nextState = cloneDeep(state[currentState]);
          state.push(nextState);

          nextState.points = cloneDeep(nextState.points).sort((p1, p2) => {
            const xDiff = p1.position[0] - p2.position[0];
            if (xDiff !== 0) {
              return xDiff;
            }

            return p1.position[1] - p2.position[1];
          });

          return AlgorithmState.Sorting;
        },
        [AlgorithmState.Sorting]: () => {
          const nextState = cloneDeep(state[currentState]);
          state.push(nextState);

          nextState.hull.upper.points = [
            nextState.points[0],
            nextState.points[1],
          ];
          nextState.hull.upper.points.forEach((p) => (p.color = "green"));
          nextState.hull.upper.segments = [{ dash: [], color: "black" }];
          nextState.idx = 2;
          return AlgorithmState.AddPoint;
        },
        [AlgorithmState.AddPoint]: () => {
          const nextState = cloneDeep(state[currentState]);
          state.push(nextState);

          const hull = nextState.hull;
          if (nextState.idx < 0) {
            hull.upper.segments.forEach((s) => {
              s.dash = [];
              s.color = "green";
            });
            hull.upper.points.forEach((p) => {
              p.color = "green";
            });
            hull.lower.segments.forEach((s) => {
              s.dash = [];
              s.color = "green";
            });
            hull.lower.points.forEach((p) => {
              p.color = "green";
            });
            return AlgorithmState.Done;
          }

          if (nextState.idx > nextState.points.length - 1) {
            hull.upper.segments.forEach((s) => {
              s.dash = [];
              s.color = "black";
            });
            nextState.direction = -1;

            hull.lower.points = [
              nextState.points[nextState.points.length - 1],
              nextState.points[nextState.points.length - 2],
            ];
            hull.lower.segments.push({ dash: [5, 5], color: "black" });
            nextState.idx = nextState.points.length - 3;
          }

          let points: PointSet2D;
          let segments: SegmentDescriptor[];
          if (nextState.direction === 1) {
            points = hull.upper.points;
            segments = hull.upper.segments;
          } else {
            points = hull.lower.points;
            segments = hull.lower.segments;
          }

          const point = nextState.points[nextState.idx];
          point.color = "green";

          points.push(point);

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

          return AlgorithmState.CheckTurn;
        },
        [AlgorithmState.CheckTurn]: () => {
          const nextState = cloneDeep(state[currentState]);
          state.push(nextState);

          const hull = nextState.hull;
          let points: PointSet2D;
          let segments: SegmentDescriptor[];
          if (nextState.direction === 1) {
            points = hull.upper.points;
            segments = hull.upper.segments;
          } else {
            points = hull.lower.points;
            segments = hull.lower.segments;
          }

          const p0 = points[points.length - 3];
          const p1 = points[points.length - 2];
          const p2 = points[points.length - 1];
          let color = "green";
          let result = AlgorithmState.AddPoint;
          if (!isRightTurn(p0.position, p1.position, p2.position)) {
            color = "red";
            result = AlgorithmState.Discard;
          }
          p0.color = color;
          p1.color = color;
          p2.color = color;
          const s0 = segments[segments.length - 2];
          s0.color = color;
          const s1 = segments[segments.length - 1];
          s1.color = color;

          return result;
        },
        [AlgorithmState.Discard]: () => {
          const nextState = cloneDeep(state[currentState]);
          state.push(nextState);

          const hull = nextState.hull;
          let points: PointSet2D;
          let segments: SegmentDescriptor[];
          if (nextState.direction === 1) {
            points = hull.upper.points;
            segments = hull.upper.segments;
          } else {
            points = hull.lower.points;
            segments = hull.lower.segments;
          }

          const p0 = points[points.length - 3];
          const p1 = points[points.length - 2];
          const p2 = points[points.length - 1];
          p0.color = "green";
          p1.color = "black";
          p2.color = "green";
          points.splice(points.length - 2, 1);
          points.forEach((p) => (p.color = "green"));

          segments.splice(segments.length - 1, 1);
          segments[segments.length - 1].color = "black";
          segments[segments.length - 1].dash = [5, 5];

          if (points.length < 3) {
            segments.forEach((s) => {
              s.dash = [];
              s.color = "black";
            });
            return AlgorithmState.AddPoint;
          }

          segments[segments.length - 2].color = "black";
          segments[segments.length - 2].dash = [5, 5];

          return AlgorithmState.CheckTurn;
        },
        [AlgorithmState.Done]: () => {
          return AlgorithmState.Done;
        },
      }
    );

    const pane = new Pane();
    const folder = pane.addFolder({
      title: "animation controls",
      expanded: true,
    });

    let playBtn: ButtonApi;
    let forwardBtn: ButtonApi;
    let backwardBtn: ButtonApi;

    function stepAnimation() {
      if (currentState < state.length) {
        if (currentState === state.length - 1) {
          if (stateMachine.step() !== AlgorithmState.Done) {
            currentState++;
          }
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

    folder.addButton({ title: "stop" }).on("click", () => {
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
      pane.dispose();
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
