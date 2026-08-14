import assert from 'node:assert/strict';
import test from 'node:test';

import { generateOutfits } from '../src/features/recommendations/engine';
import { demoStyleProfile, demoWardrobe } from '../src/fixtures/demoWardrobe';

const mildWeather = { temperatureF: 62, precipitationProbability: 0.35, raining: true };
const now = new Date('2026-08-14T12:00:00.000Z');

test('generates up to three recommendations using only known wardrobe inventory', () => {
  const recommendations = generateOutfits({
    wardrobe: demoWardrobe,
    occasion: 'dinner',
    weather: mildWeather,
    styleProfile: demoStyleProfile,
    now,
  });

  assert.equal(recommendations.length, 3);
  const ids = new Set(demoWardrobe.map((garment) => garment.id));
  for (const recommendation of recommendations) {
    assert.ok(recommendation.score >= 0 && recommendation.score <= 100);
    for (const garment of recommendation.garments) assert.ok(ids.has(garment.id));
  }
});

test('locked-item styling keeps the selected garment in every returned outfit', () => {
  const lockedGarmentId = 'g-brown-suede-jacket';
  const recommendations = generateOutfits({
    wardrobe: demoWardrobe,
    occasion: 'date',
    weather: mildWeather,
    styleProfile: demoStyleProfile,
    lockedGarmentId,
    now,
  });

  assert.ok(recommendations.length > 0);
  assert.ok(
    recommendations.every((recommendation) =>
      recommendation.garments.some((garment) => garment.id === lockedGarmentId),
    ),
  );
});

test('formal recommendations reject low-formality footwear', () => {
  const recommendations = generateOutfits({
    wardrobe: demoWardrobe,
    occasion: 'formal',
    weather: mildWeather,
    styleProfile: demoStyleProfile,
    now,
  });

  for (const recommendation of recommendations) {
    const footwear = recommendation.garments.find((garment) => garment.category === 'footwear');
    assert.ok(footwear);
    if (!footwear) throw new Error('Expected footwear in formal recommendation');
    assert.ok(footwear.formality >= 6);
  }
});
