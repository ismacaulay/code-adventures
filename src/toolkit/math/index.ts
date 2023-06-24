const TO_RADIANS = Math.PI / 180;
export function radians(degrees: number) {
  return degrees * TO_RADIANS;
}

const TO_DEGREES = 180 / Math.PI;
export function degrees(radians: number) {
  return radians * TO_DEGREES;
}

export function inverseLerp(a: number, b: number, value: number) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  if (max === min) {
    return 0;
  }

  return (value - min) / (max - min);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
