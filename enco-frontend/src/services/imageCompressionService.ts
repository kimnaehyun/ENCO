import {NativeModules} from 'react-native';

const {ImageCompression} = NativeModules;

export type CompressedImageResult = {
  uri: string;
  fileName?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  fileSize?: number;
};

type CompressionOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 72,
};

export async function compressReceiptImage(
  imageUri: string,
  options?: CompressionOptions,
): Promise<CompressedImageResult> {
  if (!imageUri || !ImageCompression?.compressImage) {
    return {
      uri: imageUri,
      mimeType: 'image/jpeg',
    };
  }

  try {
    const result = (await ImageCompression.compressImage(imageUri, {
      ...DEFAULT_OPTIONS,
      ...options,
    })) as CompressedImageResult;

    return {
      uri: result?.uri || imageUri,
      fileName: result?.fileName,
      mimeType: result?.mimeType || 'image/jpeg',
      width: result?.width,
      height: result?.height,
      fileSize: result?.fileSize,
    };
  } catch {
    return {
      uri: imageUri,
      mimeType: 'image/jpeg',
    };
  }
}