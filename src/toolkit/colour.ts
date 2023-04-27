import type { vec3 } from 'gl-matrix';

function componentToHex(c: number) {
  var hex = Math.floor(c * 255).toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

export function rgbToHex(rgb: vec3) {
  return '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

export function hexToRgb(hex: string, out?: vec3): vec3 {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb & 0xff0000) >> 16;
  const g = (rgb & 0x00ff00) >> 8;
  const b = (rgb & 0x0000ff) >> 0;

  const result = out ?? [0, 0, 0];
  result[0] = r / 255;
  result[1] = g / 255;
  result[2] = b / 255;
  return result;
}
