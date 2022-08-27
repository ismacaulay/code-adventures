export function transformValueToRange(
  value: number,
  oldRange: [number, number],
  newRange: [number, number],
) {
  const oldDiff = oldRange[1] - oldRange[0];
  if (oldDiff === 0) {
    return newRange[0];
  }

  return ((value - oldRange[0]) * (newRange[1] - newRange[0])) / oldDiff + newRange[0];
}
