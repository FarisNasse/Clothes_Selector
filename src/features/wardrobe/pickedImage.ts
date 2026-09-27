import type { ImagePickerAsset } from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export const MAX_GARMENT_IMAGE_BYTES = 12 * 1024 * 1024;

export class GarmentImageError extends Error {
  constructor(public readonly kind: 'read' | 'size' | 'format' | 'upload' | 'analysis', cause?: unknown) {
    super(kind, { cause });
    this.name = 'GarmentImageError';
  }
}

function imageMime(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
    return 'image/png';
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return 'image/webp';
  return null;
}

export async function readPickedImage(asset: ImagePickerAsset, isWeb: boolean) {
  let data: ArrayBuffer;
  try {
    if (isWeb) {
      // The picker exposes the original browser File. Fetching its preview URI can fail.
      if (asset.file?.size && asset.file.size > MAX_GARMENT_IMAGE_BYTES)
        throw new GarmentImageError('size');
      data = asset.file ? await asset.file.arrayBuffer() : await (await fetch(asset.uri)).arrayBuffer();
    } else {
      // Expo supplies JPEG data even when the selected native photo is HEIC/AVIF.
      // Fetching a file:// or content:// URI is not reliable in React Native.
      if (!asset.base64) throw new GarmentImageError('read');
      data = decode(asset.base64);
    }
  } catch (error) {
    if (error instanceof GarmentImageError) throw error;
    throw new GarmentImageError('read', error);
  }
  if (!data.byteLength) throw new GarmentImageError('read');
  if (data.byteLength > MAX_GARMENT_IMAGE_BYTES) throw new GarmentImageError('size');
  const mimeType = imageMime(new Uint8Array(data, 0, Math.min(data.byteLength, 12)));
  if (!mimeType) throw new GarmentImageError('format');
  return { data, mimeType };
}
