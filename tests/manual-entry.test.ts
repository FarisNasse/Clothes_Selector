import assert from 'node:assert/strict';
import { test } from 'node:test';
import { manualGarmentDraft } from '../src/features/wardrobe/draft';
import { garmentDraftSchema } from '../src/features/wardrobe/validation';

test('manual entry requires all four identifying fields and does not invent AI or photo data', () => {
  const draft = manualGarmentDraft();
  assert.equal(draft.category, '');
  assert.equal(draft.storagePath, null);
  assert.equal(draft.imageUrl, null);
  assert.equal(draft.aiConfidence, null);
  assert.equal(garmentDraftSchema.safeParse(draft).success, false);

  const garment = { ...draft, category: 'top', subcategory: 'Oxford shirt',
    name: 'Light blue Oxford', primaryColor: 'light blue' };
  assert.equal(garmentDraftSchema.safeParse(garment).success, true);
  assert.equal(garmentDraftSchema.safeParse({ ...garment, storagePath: 'user/photo.jpg' }).success, true);
  for (const field of ['category', 'subcategory', 'name', 'primaryColor'] as const) {
    assert.equal(garmentDraftSchema.safeParse({ ...garment, [field]: '  ' }).success, false, field);
  }
});
