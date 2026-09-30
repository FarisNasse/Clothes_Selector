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

test('every generated reason names pieces in the displayed look after a swap', () => {
  const context = { occasion: 'dinner' as const, weather: mildWeather,
    styleProfile: demoStyleProfile, now };
  const look = generateOutfits({ ...context, wardrobe: demoWardrobe })[0]!;
  const replacement = demoWardrobe.find((item) => item.category === 'top' &&
    !look.garments.some((piece) => piece.id === item.id))!;
  const updated = evaluateOutfit(look.garments.map((item) => item.category === 'top' ? replacement : item), context);
  assert.ok(updated);
  assert.ok(updated.reasons?.length);
  const ids = new Set(updated.garments.map((item) => item.id));
  for (const reason of updated.reasons ?? []) {
    assert.ok(reason.garmentIds.every((id) => ids.has(id)));
    for (const id of reason.garmentIds) {
      const item = updated.garments.find((piece) => piece.id === id)!;
      if (reason.kind !== 'intent') assert.ok(reason.text.includes(item.name));
    }
  }
  assert.ok(!updated.explanation.includes(look.garments.find((item) => item.category === 'top')!.name));
});

test('unknown default attributes cannot substantiate rain claims or hard rain protection', () => {
  const top = demoWardrobe.find((item) => item.category === 'top')!;
  const bottom = demoWardrobe.find((item) => item.category === 'bottom')!;
  const shoe = { ...demoWardrobe.find((item) => item.category === 'footwear')!, waterproof: true,
    confirmedFields: [] };
  const coat = { ...demoWardrobe.find((item) => item.category === 'outerwear')!, waterproof: true,
    confirmedFields: [] };
  const context = { occasion: 'everyday' as const, weather: mildWeather,
    styleProfile: demoStyleProfile, now };
  const unconfirmed = evaluateOutfit([top, bottom, shoe, coat], context);
  assert.ok(unconfirmed);
  assert.ok(!unconfirmed.reasons?.some((reason) => reason.kind === 'rain'));
  assert.equal(evaluateOutfit([top, bottom, shoe, coat],
    { ...context, requireRainProtection: true }), null);
  const confirmed = evaluateOutfit([top, bottom,
    { ...shoe, confirmedFields: ['waterproof'] },
    { ...coat, confirmedFields: ['waterproof'] }],
  { ...context, requireRainProtection: true });
  assert.ok(confirmed?.reasons?.some((reason) => reason.kind === 'rain'));
});

test('one-look exclusions and chosen intensity are honored', () => {
  const base = { wardrobe: demoWardrobe, occasion: 'dinner' as const,
    weather: mildWeather, styleProfile: demoStyleProfile, now };
  const anchor = demoWardrobe.find((item) => item.category === 'footwear')!;
  const excluded = generateOutfits({ ...base, excludedGarmentIds: [anchor.id] });
  assert.ok(excluded.length);
  assert.ok(excluded.every((look) => !look.garments.some((item) => item.id === anchor.id)));
  assert.deepEqual(generateOutfits({ ...base, lockedGarmentId: anchor.id,
    excludedGarmentIds: [anchor.id] }), []);
  const colorful = (['top', 'bottom', 'footwear'] as const).map((category, index) => ({
    ...demoWardrobe.find((item) => item.category === category)!,
    primaryColor: ['red', 'forest green', 'cobalt blue'][index]!,
    pattern: index === 0 ? 'stripe' : 'solid',
  }));
  const quiet = evaluateOutfit(colorful, { ...base, intent: 'quiet' });
  const bold = evaluateOutfit(colorful, { ...base, intent: 'expressive' });
  assert.ok(quiet && bold);
  assert.ok(bold.score > quiet.score);
});
