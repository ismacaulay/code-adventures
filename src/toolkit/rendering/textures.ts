export enum TextureType {
  Texture2D = 'texture2d',
}

interface BaseTextureV1 {
  type: TextureType;
}

export interface Texture2DV1 extends BaseTextureV1 {
  type: TextureType.Texture2D;
  url: string;
}

export type TextureV1 = Texture2DV1;
