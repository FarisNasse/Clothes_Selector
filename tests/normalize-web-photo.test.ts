import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeWebPhoto } from '../src/features/wardrobe/normalizeWebPhoto';

test('browser photo preparation bounds dimensions and converts decoded images before upload', async () => {
  const originalBitmap = globalThis.createImageBitmap;
  const originalDocument = globalThis.document;
  let closed = false;
  let drawn = false;
  const canvas = {
    width: 0, height: 0,
    getContext: () => ({ drawImage: () => { drawn = true; } }),
    toBlob: (resolve: (blob: Blob) => void) => resolve(new Blob([Uint8Array.from([0xff, 0xd8, 0xff])], { type: 'image/jpeg' })),
  };
  try {
    globalThis.createImageBitmap = (async () => ({ width: 4000, height: 3000, close: () => { closed = true; } })) as typeof createImageBitmap;
    globalThis.document = { createElement: () => canvas } as unknown as Document;
    const result = await normalizeWebPhoto(new File(['camera metadata'], 'camera.heic', { type: 'image/heic' }));
    assert.equal(canvas.width, 2200);
    assert.equal(canvas.height, 1650);
    assert.equal(result.type, 'image/jpeg');
    assert.equal(result.name, 'wardrobe-photo.jpg');
    assert.equal(drawn, true);
    assert.equal(closed, true);
  } finally {
    globalThis.createImageBitmap = originalBitmap;
    globalThis.document = originalDocument;
  }
});
