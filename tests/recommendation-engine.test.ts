import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateOutfit, generateOutfits } from '../src/features/recommendations/engine';
import { demoStyleProfile, demoWardrobe } from '../src/fixtures/demoWardrobe';
import { colorGroups, garmentTypes } from '../src/features/wardrobe/catalog';

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

test('sample wardrobe expands across categories and the picker offers broad color choices', () => {
  assert.ok(demoWardrobe.length >= 50);
  assert.ok(garmentTypes.top.length >= 20);
  assert.ok(garmentTypes.outerwear.length >= 15);
  assert.ok(colorGroups.flatMap((group) => group.colors).length >= 40);
  assert.equal(new Set(demoWardrobe.map((item) => item.id)).size, demoWardrobe.length);
});

test('moderate color variation beats an identical head-to-toe palette', () => {
  const top = demoWardrobe.find((item) => item.id === 'g-white-oxford')!;
  const bottom = demoWardrobe.find((item) => item.id === 'g-charcoal-trousers')!;
  const shoes = demoWardrobe.find((item) => item.id === 'g-black-chelseas')!;
  const context = { occasion: 'dinner' as const,
    weather: { temperatureF: 65, precipitationProbability: 0, raining: false },
    styleProfile: demoStyleProfile, now };
  const varied = evaluateOutfit([top, bottom, shoes], context)!;
  const matching = evaluateOutfit([
    { ...top, primaryColor: 'black' }, { ...bottom, primaryColor: 'black' }, shoes,
  ], context)!;
  assert.ok(varied.breakdown.colorHarmony > matching.breakdown.colorHarmony);
});

test('weather, pattern density, and formal top suitability affect the same outfit evaluator', () => {
  const top = demoWardrobe.find((item) => item.id === 'g-white-oxford')!;
  const bottom = demoWardrobe.find((item) => item.id === 'g-charcoal-trousers')!;
  const shoes = demoWardrobe.find((item) => item.id === 'g-black-chelseas')!;
  const context = { occasion: 'work' as const,
    weather: { temperatureF: 43, precipitationProbability: 0, raining: false },
    styleProfile: demoStyleProfile, now };
  const cool = evaluateOutfit([top, bottom, shoes], context)!;
  const hot = evaluateOutfit([top, bottom, shoes], { ...context,
    weather: { ...context.weather, temperatureF: 90 } })!;
  assert.ok(cool.breakdown.weatherSuitability > hot.breakdown.weatherSuitability);
  const crowded = evaluateOutfit([{ ...top, pattern: 'stripe' },
    { ...bottom, pattern: 'plaid' }, shoes], context)!;
  assert.ok(cool.breakdown.textureCompatibility > crowded.breakdown.textureCompatibility);
  assert.equal(evaluateOutfit([{ ...top, formality: 2 }, bottom, shoes],
    { ...context, occasion: 'formal' }), null);
});
