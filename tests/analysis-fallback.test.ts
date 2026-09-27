import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tryGarmentAnalysis } from '../src/features/wardrobe/analysisAttempt';
import { manualGarmentDraft } from '../src/features/wardrobe/draft';
import { garmentDraftSchema } from '../src/features/wardrobe/validation';

test('API failure allows the uploaded photo to be completed and saved manually', async () => {
  const result = await tryGarmentAnalysis(async () => ({ data: null, error: new Error('429') }));
  assert.equal(result.analysis, null);

  const draft = manualGarmentDraft('user/photo.jpg', 'file:///photo.jpg');
  assert.equal(draft.storagePath, 'user/photo.jpg');
  assert.equal(draft.aiConfidence, null);
  assert.equal(garmentDraftSchema.safeParse(draft).success, false);

  const completed = { ...draft, name: 'Wool jacket', subcategory: 'Jacket', primaryColor: 'navy' };
  const saved = garmentDraftSchema.safeParse(completed);
  assert.equal(saved.success, true);
  if (saved.success) {
    assert.equal(saved.data.storagePath, 'user/photo.jpg');
    assert.deepEqual(saved.data.styleTags, []);
  }
});

test('invalid AI responses also switch to manual entry', async () => {
  const result = await tryGarmentAnalysis(async () => ({ data: { category: 'top' }, error: null }));
  assert.equal(result.analysis, null);
  assert.ok(result.error instanceof Error);
});
