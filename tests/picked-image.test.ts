import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ImagePickerAsset } from 'expo-image-picker';
import { GarmentImageError, MAX_GARMENT_IMAGE_BYTES, readPickedImage } from '../src/features/wardrobe/pickedImage';

const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
const picked = (overrides: Partial<ImagePickerAsset>): ImagePickerAsset => ({
  uri: 'file:///photo.heic', width: 16, height: 16, ...overrides,
});

test('native HEIC selection uploads the JPEG bytes returned by the picker', async () => {
  const result = await readPickedImage(picked({
    mimeType: 'image/heic', base64: Buffer.from(jpeg).toString('base64'),
  }), false);
  assert.equal(result.mimeType, 'image/jpeg');
  assert.deepEqual(new Uint8Array(result.data), jpeg);
});

test('web selection reads the picked File rather than fetching its preview URI', async () => {
  const file = new File([jpeg], 'photo.jpg', { type: 'image/jpeg' });
  const result = await readPickedImage(picked({ uri: 'blob:expired', file }), true);
  assert.equal(result.mimeType, 'image/jpeg');
  assert.deepEqual(new Uint8Array(result.data), jpeg);
});

test('unsupported and oversized browser files give distinct errors', async () => {
  await assert.rejects(
    readPickedImage(picked({ file: new File(['HEIC'], 'photo.heic') }), true),
    (error: unknown) => error instanceof GarmentImageError && error.kind === 'format',
  );
  await assert.rejects(
    readPickedImage(picked({ file: new File([new Uint8Array(MAX_GARMENT_IMAGE_BYTES + 1)], 'big.jpg') }), true),
    (error: unknown) => error instanceof GarmentImageError && error.kind === 'size',
  );
});
