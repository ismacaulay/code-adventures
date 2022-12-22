export interface TextureDescriptor {
  uri: string;
  format: GPUTextureFormat;
  addressModeU: GPUAddressMode;
  addressModeV: GPUAddressMode;
  addressModeW: GPUAddressMode;
  magFilter: GPUFilterMode;
  minFilter: GPUFilterMode;
}

export interface Texture {
  texture: GPUTexture;
  data: ImageBitmap | { buffer: ArrayBuffer; shape: [number, number, number] };
}

export interface TextureManager {
  createTexture(descriptor: TextureDescriptor): Promise<number>;

  get(id: number): { texture: Texture; sampler: GPUSampler };

  destroy(): void;
}

export function createTextureManager(device: GPUDevice): TextureManager {
  let next = 0;

  // TODO: resue textures and samplers if possible
  let storage: GenericObject<{ texture: Texture; sampler: GPUSampler }> = {};

  return {
    async createTexture({
      uri,
      format,
      addressModeU,
      addressModeV,
      addressModeW,
      minFilter,
      magFilter,
    }: TextureDescriptor) {
      const sampler = device.createSampler({
        addressModeU,
        addressModeV,
        addressModeW,
        minFilter,
        magFilter,
      });
      const texture = await createTextureFromURI(device, uri, format);
      storage[next] = { texture, sampler };
      return next++;
    },

    get(id) {
      const entry = storage[id];
      if (!entry) {
        throw new Error(`[TextureManager] Unknown texture id: ${id}`);
      }

      const { texture, sampler } = entry;

      return {
        texture,
        sampler,
      };
    },

    destroy() {
      Object.values(storage).forEach((entry) => entry.texture.texture.destroy());
      storage = {};
    },
  };
}

async function createTextureFromURI(device: GPUDevice, uri: string, format: GPUTextureFormat) {
  const img = document.createElement('img');
  img.src = uri;
  await img.decode();
  const imageBitmap = await createImageBitmap(img);

  const texture = device.createTexture({
    size: [imageBitmap.width, imageBitmap.height, 1],
    format,
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  return {
    texture,
    data: imageBitmap,
  };
}

// async function createTextureFromBuffer(
//   device: GPUDevice,
//   buffer: Uint8Array | Uint8ClampedArray,
//   shape: [number, number, number],
//   format: GPUTextureFormat,
// ) {
//   const texture = device.createTexture({
//     size: [shape[0], shape[1], 1],
//     format,
//     usage:
//       GPUTextureUsage.TEXTURE_BINDING |
//       GPUTextureUsage.COPY_DST |
//       GPUTextureUsage.RENDER_ATTACHMENT,
//   });

//   return {
//     texture,
//     data: { buffer, shape },
//   };
// }
