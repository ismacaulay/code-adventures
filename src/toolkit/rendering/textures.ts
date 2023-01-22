export enum TextureType {
  Texture2D = 'texture2d',
}

interface BaseTextureV1 {
  type: TextureType;
}

export interface Texture2DV1 extends BaseTextureV1 {
  type: TextureType.Texture2D;
  location: string;
  addressModeU?: GPUAddressMode;
  addressModeV?: GPUAddressMode;
  addressModeW?: GPUAddressMode;
}

export type TextureV1 = Texture2DV1;
