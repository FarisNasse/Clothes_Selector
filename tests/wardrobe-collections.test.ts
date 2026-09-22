import assert from 'node:assert/strict';
import test from 'node:test';
import { activeFilterCount, defaultFilters, filterWardrobe } from '../src/features/wardrobe/filter';
import {
  collectionKey,
  emptyCollection,
  readCollection,
  savedLook,
  writeCollection,
} from '../src/features/collections/storage';
import { garmentDraftSchema, parseLabels } from '../src/features/wardrobe/validation';
import { generateOutfits } from '../src/features/recommendations/engine';
import { demoStyleProfile, demoWardrobe } from '../src/fixtures/demoWardrobe';

const weather = { temperatureF: 65, precipitationProbability: 0, raining: false };
test('wardrobe query intersects words with filters, secondary colors and favorites', () => {
  const items = filterWardrobe(demoWardrobe, 'BLACK dinner', defaultFilters);
  assert.ok(items.length > 0);
  assert.ok(items.every((g) => g.primaryColor === 'black' && g.formality >= 4));
  const shoe = demoWardrobe.find((g) => g.category === 'footwear')!;
  assert.deepEqual(
    filterWardrobe(demoWardrobe, 'shoes', { ...defaultFilters, favoritesOnly: true }, [shoe.id]),
    [shoe],
  );
  assert.deepEqual(
    filterWardrobe(demoWardrobe, 'black dinner', { ...defaultFilters, color: 'white' }),
    [],
  );
  assert.ok(
    filterWardrobe(demoWardrobe, '', { ...defaultFilters, season: 'winter' }).some((g) =>
      g.seasons.includes('all-season'),
    ),
  );
  const clone = { ...shoe, secondaryColors: ['red'] };
  assert.deepEqual(filterWardrobe([clone], '', { ...defaultFilters, color: 'red' }), [clone]);
  assert.equal(activeFilterCount({ ...defaultFilters, color: 'red', favoritesOnly: true }), 2);
});

test('sorting does not mutate wardrobe inventory', () => {
  const original = [...demoWardrobe];
  const sorted = filterWardrobe(original, '', { ...defaultFilters, sort: 'least-worn' });
  assert.deepEqual(original, demoWardrobe);
  assert.ok(sorted.every((g, i) => i === 0 || g.wearCount >= sorted[i - 1]!.wearCount));
});

test('collections survive reload, isolate owners and reject damaged or unavailable storage', () => {
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
  const outfit = generateOutfits({
    wardrobe: demoWardrobe,
    occasion: 'dinner',
    weather,
    styleProfile: demoStyleProfile,
  })[0]!;
  const look = savedLook(outfit, 'dinner', weather);
  const collection = { favorites: [demoWardrobe[0]!.id], looks: [look] };
  writeCollection(storage, 'owner-a', collection);
  assert.deepEqual(readCollection(storage, 'owner-a'), collection);
  assert.deepEqual(readCollection(storage, 'owner-b'), emptyCollection());
  data.set(collectionKey('owner-a'), '{bad');
  assert.deepEqual(readCollection(storage, 'owner-a'), emptyCollection());
  data.set(collectionKey('owner-a'), JSON.stringify({ favorites: 'wrong', looks: [] }));
  assert.deepEqual(readCollection(storage, 'owner-a'), emptyCollection());
  assert.throws(
    () =>
      writeCollection(
        {
          ...storage,
          setItem: () => {
            throw new Error('quota');
          },
        },
        'owner-a',
        collection,
      ),
    /quota/,
  );
  assert.throws(() =>
    writeCollection(storage, 'owner-a', {
      ...collection,
      looks: [{ ...look, weather: { ...weather, temperatureF: NaN } }],
    }),
  );
});

test('capture review validates details and keeps clean comma-separated labels', () => {
  const draft = { ...demoWardrobe[0]!, name: '  My jacket  ' };
  assert.equal(garmentDraftSchema.parse(draft).name, 'My jacket');
  for (const change of [
    { name: ' ' },
    { purchasePrice: -2 },
    { formality: 30 },
    { primaryColor: '' },
    { seasons: [] },
  ]) {
    assert.equal(garmentDraftSchema.safeParse({ ...draft, ...change }).success, false);
  }
  assert.deepEqual(parseLabels(' Linen, cotton, linen,  '), ['linen', 'cotton']);
});
