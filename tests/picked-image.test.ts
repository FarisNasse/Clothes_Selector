import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ImagePickerAsset } from 'expo-image-picker';
import { classifyPhotoUploadError, GarmentImageError, MAX_GARMENT_IMAGE_BYTES, photoErrorMessage, readPickedImage } from '../src/features/wardrobe/pickedImage';

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

test('upload failures separate expired login, storage policy, size and network recovery', () => {
  const cases = [
    [{ statusCode: '401', message: 'Invalid JWT' }, 'auth'],
    [{ status: 403, message: 'RLS policy' }, 'policy'],
    [{ status: 413, message: 'too large' }, 'size'],
    [{ message: 'Failed to fetch' }, 'network'],
  ] as const;
  for (const [failure, kind] of cases) {
    const result = classifyPhotoUploadError(failure);
    assert.equal(result.kind, kind);
    assert.ok(photoErrorMessage(result).length > 30);
  }
});
