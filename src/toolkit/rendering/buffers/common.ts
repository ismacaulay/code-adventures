export function createBuffer(
  device: GPUDevice,
  src: Float32Array | Uint16Array | Uint32Array,
  usage: number,
): GPUBuffer {
  // create a buffer
  const buffer = device.createBuffer({
    size: src.byteLength,
    usage,
    mappedAtCreation: true,
  });

  // write the data to the mapped buffer
  new (src as any).constructor(buffer.getMappedRange()).set(src);

  // unmap the buffer before submitting it to the queue
  buffer.unmap();

  return buffer;
}
