// Browser-only preparation: decode with the browser's orientation handling,
// bound the longest edge, and strip camera metadata before private upload.
export async function normalizeWebPhoto(file: File): Promise<File> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file; // Keep the original so the existing validator can explain unsupported formats.
  }
  try {
    const scale = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, .86));
    return blob ? new File([blob], 'wardrobe-photo.' + (type === 'image/png' ? 'png' : 'jpg'), { type }) : file;
  } finally {
    bitmap.close();
  }
}
