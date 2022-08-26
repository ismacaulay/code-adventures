import seedrandom from "seedrandom";

let prng = Math.random;
export function setSeed(seed: number) {
  prng = seedrandom(`${seed}`);
}

export function randomIntInRangeInclusive([min, max]: [number, number]) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(prng() * (max - min + 1) + min);
}

export function generate2DPoints(
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
