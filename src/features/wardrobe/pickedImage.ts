import type { ImagePickerAsset } from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export const MAX_GARMENT_IMAGE_BYTES = 12 * 1024 * 1024;

export class GarmentImageError extends Error {
  constructor(public readonly kind: 'read' | 'size' | 'format' | 'upload', cause?: unknown) {
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
      // Expo can supply converted JPEG bytes for HEIC; inspect the bytes, not the filename.
      // A device that does not supply base64 needs a new selection.
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

export function photoErrorMessage(failure: unknown) {
  if (!(failure instanceof GarmentImageError))
    return 'Could not open or upload the photo. Check your connection and try again.';
  switch (failure.kind) {
    case 'size': return 'This photo is over 12 MB. Choose a smaller photo, or save without it.';
    case 'format': return 'This photo format cannot be uploaded. Choose or export a JPEG, PNG, or WebP image.';
    case 'read': return 'We could not read this photo. Choose another or export it as a JPEG.';
    case 'upload': return 'We could not upload the photo. Check your connection and sign-in, then retry.';
  }
}
