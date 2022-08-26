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
