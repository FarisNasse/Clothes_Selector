import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateOutfit, generateOutfits } from '../src/features/recommendations/engine';
import { demoStyleProfile, demoWardrobe } from '../src/fixtures/demoWardrobe';
import { accessoryPlacement, bottomCoverage, topRole } from '../src/features/wardrobe/visual';
import { newWearRequestId } from '../src/features/recommendations/request';

const top = demoWardrobe.find((item) => item.category === 'top')!;
const bottom = demoWardrobe.find((item) => item.category === 'bottom')!;
const shoes = demoWardrobe.find((item) => item.category === 'footwear')!;
const coat = demoWardrobe.find((item) => item.category === 'outerwear')!;
const weather = { temperatureF: 86, precipitationProbability: .7, raining: false, outdoorMinutes: 30 };
const context = { occasion: 'everyday' as const, weather, styleProfile: demoStyleProfile };

test('hot rain honors wearer coverage and confirmed protection independently', () => {
  const shorts = { ...bottom, id: 'shorts', name: 'Shorts', subcategory: 'Linen shorts', warmth: 2 };
  const trousers = { ...bottom, id: 'trousers', name: 'Light trousers', subcategory: 'Linen trousers', warmth: 2 };
  const heavy = { ...bottom, id: 'heavy', name: 'Heavy jeans', subcategory: 'Straight jeans', warmth: 9 };
  const dryShoes = { ...shoes, waterproof: true, confirmedFields: ['waterproof' as const] };
  const shell = { ...coat, waterproof: true, confirmedFields: ['waterproof' as const], warmth: 1 };
  const wardrobe = [top, shorts, trousers, heavy, dryShoes, shell];
  const covered = generateOutfits({ ...context, wardrobe, requireCoveredLegs: true, requireRainProtection: true });
  assert.ok(covered.length > 0);
  assert.ok(covered.every((look) => look.garments.some((item) => item.id === 'trousers' || item.id === 'heavy')));
  assert.ok(covered.every((look) => look.garments.some((item) => item.id === shell.id)));
  assert.ok(covered[0]!.reasons?.some((reason) => reason.kind === 'coverage'));
  const open = generateOutfits({ ...context, wardrobe, limit: 20 });
  assert.ok(open.some((look) => look.garments.some((item) => item.id === 'shorts')));
  assert.ok(open.some((look) => look.garments.some((item) => item.id === 'trousers')));
  assert.equal(evaluateOutfit([top, shorts, dryShoes], { ...context, requireCoveredLegs: true }), null);
  assert.equal(evaluateOutfit([top, trousers, shoes, coat], { ...context, requireRainProtection: true }), null);
});

test('rain chance and time outside change a score without inventing waterproof claims', () => {
  const unknown = { ...coat, confirmedFields: [] };
  const dry = evaluateOutfit([top, bottom, shoes, unknown], {
    ...context, weather: { temperatureF: 65, precipitationProbability: 0, raining: false, outdoorMinutes: 0 },
  })!;
  const exposed = evaluateOutfit([top, bottom, shoes, unknown], {
    ...context, weather: { temperatureF: 65, precipitationProbability: .7, raining: false, outdoorMinutes: 30 },
  })!;
  assert.ok(dry.breakdown.weatherSuitability > exposed.breakdown.weatherSuitability);
  assert.ok(exposed.reasons?.some((reason) => reason.kind === 'uncertainty'));
  assert.ok(!exposed.reasons?.some((reason) => reason.kind === 'rain'));
});

test('a suit can take a rain shell, and a shirt can take a knit mid layer', () => {
  const suit = { ...bottom, id: 'set', category: 'suit' as const, subcategory: 'Two-piece suit', formality: 9 };
  const shirt = { ...top, id: 'shirt', subcategory: 'Dress shirt', formality: 8 };
  const knit = { ...top, id: 'knit', subcategory: 'Crewneck sweater', formality: 7 };
  const shell = { ...coat, id: 'shell', waterproof: true, confirmedFields: ['waterproof' as const], formality: 8 };
  const dryShoes = { ...shoes, id: 'dry-shoes', waterproof: true, confirmedFields: ['waterproof' as const], formality: 8 };
  const results = generateOutfits({ ...context, occasion: 'formal', wardrobe: [suit, shirt, knit, shell, dryShoes],
    requireRainProtection: true, lockedGarmentIds: ['set', 'shirt', 'knit'], limit: 5 });
  assert.ok(results.length > 0);
  assert.ok(results.every((look) => ['set', 'shirt', 'knit', 'shell', 'dry-shoes'].every((id) =>
    look.garments.some((item) => item.id === id))));
});

test('visual subtype mapping is honest for coverage and accessory positions', () => {
  assert.equal(bottomCoverage('Linen shorts'), 'short');
  assert.equal(bottomCoverage('Pleated trousers'), 'full');
  assert.equal(bottomCoverage('Unfamiliar lower piece'), 'unknown');
  assert.equal(topRole('Crewneck sweater'), 'mid');
  assert.equal(accessoryPlacement('Tote bag'), 'shoulder');
  assert.equal(accessoryPlacement('Baseball cap'), 'head');
  assert.equal(accessoryPlacement('Unexpected accessory'), 'unknown');
});

test('wear retries can retain a distinct UUID request token', () => {
  const first = newWearRequestId();
  const second = newWearRequestId();
  assert.match(first, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  assert.notEqual(first, second);
});
