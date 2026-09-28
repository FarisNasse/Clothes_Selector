import type {
  Garment,
  Occasion,
  OutfitRecommendation,
  OutfitScoreBreakdown,
  StyleProfile,
  WeatherContext,
} from '@/types/domain';
import { canonicalColor, colorSwatches } from '@/features/wardrobe/catalog';

const weights: Record<keyof OutfitScoreBreakdown, number> = {
  colorHarmony: 0.25,
  personalPreference: 0.2,
  silhouetteCompatibility: 0.15,
  formalityConsistency: 0.1,
  occasionSuitability: 0.1,
  weatherSuitability: 0.1,
  textureCompatibility: 0.05,
  wardrobeRotation: 0.05,
};

const neutralColors = new Set(['black', 'white', 'off-white', 'cream', 'ivory', 'stone',
  'beige', 'sand', 'taupe', 'gray', 'charcoal', 'navy', 'midnight blue', 'indigo',
  'brown', 'chocolate', 'espresso', 'tan', 'camel', 'olive']);

const occasionTargets: Record<Occasion, { min: number; max: number; target: number }> = {
  everyday: { min: 1, max: 6, target: 3.5 },
  work: { min: 4, max: 8, target: 6 },
  dinner: { min: 4, max: 8, target: 5.5 },
  date: { min: 3, max: 8, target: 5 },
  going_out: { min: 3, max: 8, target: 5 },
  formal: { min: 7, max: 10, target: 8.5 },
};

export type GenerateOutfitInput = {
  wardrobe: Garment[];
  occasion: Occasion;
  weather: WeatherContext;
  styleProfile: StyleProfile;
  lockedGarmentId?: string;
  lockedGarmentIds?: string[];
  limit?: number;
  now?: Date;
};

type Candidate = Garment[];

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function colorAttributes(raw: string) {
  const color = canonicalColor(raw);
  const hex = colorSwatches[color];
  if (!hex) return { color, neutral: neutralColors.has(color), hue: null as number | null, light: 0.5, saturation: 0 };
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const [r, g, b] = channels as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const light = (max + min) / 2;
  const saturation = delta ? delta / (1 - Math.abs(2 * light - 1)) : 0;
  let hue = 0;
  if (delta) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue = (hue * 60 + 360) % 360;
  }
  return { color, neutral: neutralColors.has(color) || saturation < 0.12, hue, light, saturation };
}

function colorHarmonyScore(garments: Garment[]) {
  const colors = garments.map((garment) => colorAttributes(garment.primaryColor));
  if (colors.length < 2) return 1;

  let pairScore = 0;
  let pairCount = 0;

  for (let i = 0; i < colors.length; i += 1) {
    for (let j = i + 1; j < colors.length; j += 1) {
      const a = colors[i];
      const b = colors[j];
      if (!a || !b || !a.color || !b.color) continue;
      pairCount += 1;
      const lightContrast = Math.abs(a.light - b.light);
      if (a.color === b.color) pairScore += 0.73;
      else if (a.neutral && b.neutral) pairScore += lightContrast > 0.12 ? 0.94 : 0.81;
      else if (a.neutral || b.neutral) pairScore += 0.91;
      else if (a.hue !== null && b.hue !== null) {
        const distance = Math.min(Math.abs(a.hue - b.hue), 360 - Math.abs(a.hue - b.hue));
        pairScore += distance < 42 ? 0.91 : distance < 95 ? 0.83 : distance > 145 ? 0.66 : 0.75;
      } else pairScore += 0.7;
    }
  }

  const unique = new Set(colors.map((item) => item.color)).size;
  const accents = colors.filter((item) => !item.neutral && item.saturation > 0.28).length;
  // Moderate coordination: preserve tonal looks, but give one accent room to breathe.
  return clamp01((pairCount ? pairScore / pairCount : 1) -
    (unique === 1 && colors.length >= 3 ? 0.1 : 0) -
    (accents > 2 ? 0.07 * (accents - 2) : 0));
}

function preferenceScore(garments: Garment[], profile: StyleProfile) {
  const garmentScores = garments.map((garment) => {
    if ([garment.primaryColor, ...garment.secondaryColors].some((color) =>
      profile.dislikedColors.map(canonicalColor).includes(canonicalColor(color)))) return 0.2;
    const styleScore = Math.max(
      0.45,
      ...garment.styleTags.map((tag) => profile.styleWeights[tag.toLowerCase()] ?? 0.45),
    );
    const fitBoost = profile.preferredFits.includes(garment.fit) ? 0.1 : 0;
    return clamp01(styleScore + fitBoost);
  });

  return average(garmentScores);
}

function silhouetteScore(garments: Garment[]) {
  const fits = garments
    .filter((garment) => garment.category !== 'footwear')
    .map((garment) => garment.fit);
  if (fits.length < 2) return 0.9;

  const conflicting =
    fits.includes('slim') && fits.includes('oversized')
      ? 0.58
      : fits.includes('slim') && fits.includes('relaxed')
        ? 0.78
        : 0.94;
  return conflicting;
}

function formalityConsistencyScore(garments: Garment[]) {
  const values = garments.filter((garment) => garment.category !== 'accessory').map((garment) => garment.formality);
  const spread = Math.max(...values) - Math.min(...values);
  if (spread <= 2) return 1;
  if (spread <= 3) return 0.82;
  if (spread <= 4) return 0.58;
  return 0.25;
}

function occasionScore(garments: Garment[], occasion: Occasion) {
  const target = occasionTargets[occasion];
  const outfitFormality = average(garments.filter((item) => item.category !== 'accessory').map((garment) => garment.formality));
  if (outfitFormality < target.min || outfitFormality > target.max) return 0.35;
  return clamp01(1 - Math.abs(outfitFormality - target.target) / 5);
}

function weatherScore(garments: Garment[], weather: WeatherContext) {
  const outerwear = garments.find((garment) => garment.category === 'outerwear');
  const footwear = garments.find((garment) => garment.category === 'footwear');
  const avgWarmth = average(garments.filter((item) => item.category !== 'accessory').map((garment) => garment.warmth));

  let score = 1;

  if (weather.temperatureF >= 78 && avgWarmth > 4.5) score -= 0.5;
  if (weather.temperatureF <= 50 && avgWarmth < 3.5) score -= 0.35;
  if (weather.temperatureF <= 42 && !outerwear && avgWarmth < 6) score -= 0.3;
  if (weather.raining && outerwear && !outerwear.waterproof) score -= 0.22;
  if (weather.raining && !outerwear) score -= 0.12;
  if (weather.raining && footwear && !footwear.waterproof) score -= 0.16;
  const season = weather.temperatureF >= 75 ? 'summer' : weather.temperatureF <= 42 ? 'winter' : null;
  if (season) score -= Math.min(0.35, garments.filter((item) =>
    item.category !== 'accessory' && !item.seasons.includes(season) &&
    !item.seasons.includes('all-season')).length * 0.12);

  return clamp01(score);
}

function textureScore(garments: Garment[]) {
  const textured = garments.filter((garment) =>
    garment.materials.some((material) =>
      ['suede', 'wool', 'linen', 'silk', 'denim'].includes(material.toLowerCase()),
    ),
  ).length;
  const patterns = garments.filter((item) => item.pattern &&
    !['solid', 'unknown'].includes(item.pattern.toLowerCase())).length;
  if (patterns > 1) return 0.54;
  if (textured === 0 && patterns === 0) return 0.76;
  if (textured <= 2) return 1;
  return 0.86;
}

function rotationScore(garments: Garment[], nowDate: Date) {
  const now = nowDate.getTime();
  return average(
    garments.map((garment) => {
      if (!garment.lastWornAt) return 1;
      const days = Math.max(0, (now - new Date(garment.lastWornAt).getTime()) / 86_400_000);
      if (!Number.isFinite(days)) return 0.75;
      return clamp01(0.45 + Math.min(days / 60, 0.55));
    }),
  );
}

function isHardCompatible(candidate: Candidate, occasion: Occasion, weather: WeatherContext) {
  const values = candidate.filter((garment) => garment.category !== 'accessory').map((garment) => garment.formality);
  if (Math.max(...values) - Math.min(...values) > 4) return false;

  if (occasion === 'formal') {
    const footwear = candidate.find((garment) => garment.category === 'footwear');
    const top = candidate.find((garment) => garment.category === 'top');
    const bottom = candidate.find((garment) => garment.category === 'bottom');
    if (!footwear || footwear.formality < 6 || !top || top.formality < 6 ||
      (bottom && (bottom.formality < 6 || /shorts/i.test(bottom.subcategory)))) return false;
  }

  if (weather.temperatureF >= 82) {
    const tooHeavy = candidate.some(
      (garment) => garment.category === 'outerwear' && garment.warmth >= 7,
    );
    if (tooHeavy) return false;
  }

  return true;
}

function scoreCandidate(
  garments: Candidate,
  occasion: Occasion,
  weather: WeatherContext,
  styleProfile: StyleProfile,
  now: Date,
): { score: number; breakdown: OutfitScoreBreakdown } {
  const breakdown: OutfitScoreBreakdown = {
    colorHarmony: colorHarmonyScore(garments),
    personalPreference: preferenceScore(garments, styleProfile),
    silhouetteCompatibility: silhouetteScore(garments),
    formalityConsistency: formalityConsistencyScore(garments),
    occasionSuitability: occasionScore(garments, occasion),
    weatherSuitability: weatherScore(garments, weather),
    textureCompatibility: textureScore(garments),
    wardrobeRotation: rotationScore(garments, now),
  };

  const weighted = (Object.keys(weights) as (keyof OutfitScoreBreakdown)[]).reduce(
    (sum, key) => sum + breakdown[key] * weights[key],
    0,
  );

  return { score: Math.round(weighted * 100), breakdown };
}

function explain(garments: Garment[], breakdown: OutfitScoreBreakdown, occasion: Occasion) {
  const top = garments.find((garment) => garment.category === 'top');
  const bottom = garments.find((garment) => garment.category === 'bottom');
  const footwear = garments.find((garment) => garment.category === 'footwear');

  const reasons: string[] = [];
  if (top && bottom && breakdown.colorHarmony >= 0.88) {
    reasons.push(
      `${top.primaryColor} and ${bottom.primaryColor} create a controlled, versatile palette`,
    );
  }
  if (footwear && breakdown.textureCompatibility >= 0.9) {
    reasons.push(
      `${footwear.name.toLowerCase()} adds useful texture without disrupting the silhouette`,
    );
  }
  if (garments.some((garment) => !['solid', 'unknown'].includes(garment.pattern.toLowerCase())) &&
    breakdown.textureCompatibility >= 0.9) {
    reasons.push('a single pattern gives the look a focal point');
  }
  if (breakdown.weatherSuitability >= 0.88 && garments.some((garment) => garment.waterproof)) {
    reasons.push('the weather-ready pieces suit the conditions');
  }
  if (breakdown.wardrobeRotation >= 0.75) {
    reasons.push('the combination brings less-used pieces back into rotation');
  }

  const lead =
    reasons.length > 0
      ? reasons.slice(0, 2).join(', while ')
      : 'the pieces share a consistent level of formality';
  return `${lead}. The overall balance is tuned for ${occasion.replace('_', ' ')} with pieces you already own.`;
}

type Slot = (Garment | undefined)[];
const MAX_CANDIDATES = 8000;

/** Bound work for large closets; walk each product with a deterministic coprime stride. */
function* combinations(slots: Slot[], budget: number): Generator<Garment[]> {
  const total = slots.reduce((count, slot) => count * slot.length, 1);
  if (!total) return;
  const count = Math.min(total, budget);
  let step = total <= budget ? 1 : Math.max(1, Math.floor(total * 0.61803398875));
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  while (gcd(step, total) !== 1) step += 1;
  let ordinal = 0;
  for (let sample = 0; sample < count; sample += 1) {
    let remainder = ordinal;
    const candidate: Garment[] = [];
    for (const slot of slots) {
      const item = slot[remainder % slot.length];
      remainder = Math.floor(remainder / slot.length);
      if (item) candidate.push(item);
    }
    yield candidate;
    ordinal = (ordinal + step) % total;
  }
}

function* buildCandidates(wardrobe: Garment[], lockedIds: string[]): Generator<Garment[]> {
  const unique = [...new Map(wardrobe.map((item) => [item.id, item])).values()];
  const locks = lockedIds.map((id) => unique.find((item) => item.id === id));
  if (locks.some((item) => !item)) return;
  if (new Set(locks.map((item) => item?.category)).size !== locks.length) return;
  const pool = (category: Garment['category']): Garment[] => {
    const locked = locks.find((item) => item?.category === category);
    return locked ? [locked] : unique.filter((item) => item.category === category);
  };
  const optional = (category: Garment['category']): Slot =>
    locks.some((item) => item?.category === category)
      ? pool(category)
      : [undefined, ...pool(category)];
  const regular: Slot[] = [
    optional('outerwear'),
    pool('top'),
    pool('bottom'),
    pool('footwear'),
    optional('accessory'),
  ];
  const suited: Slot[] = [pool('suit'), pool('top'), pool('footwear'), optional('accessory')];
  const structures = [
    ...(!locks.some((item) => item?.category === 'suit') ? [regular] : []),
    ...(!locks.some((item) => item?.category === 'bottom' || item?.category === 'outerwear')
      ? [suited]
      : []),
  ].filter((slots) => slots.every((slot) => slot.length > 0));
  for (const slots of structures) {
    yield* combinations(slots, Math.floor(MAX_CANDIDATES / structures.length));
  }
}

export type OutfitContext = Pick<
  GenerateOutfitInput,
  'occasion' | 'weather' | 'styleProfile' | 'now'
>;
export function outfitKey(ids: string[]): string {
  return [...ids].sort().join(':');
}

/** Used by both generation and swaps, so an edited look gets fresh scores and reasoning. */
export function evaluateOutfit(
  garments: Garment[],
  context: OutfitContext,
): OutfitRecommendation | null {
  const categories = new Set(garments.map((item) => item.category));
  const complete =
    categories.has('top') &&
    categories.has('footwear') &&
    (categories.has('bottom') || categories.has('suit'));
  if (
    !complete ||
    categories.size !== garments.length ||
    new Set(garments.map((item) => item.id)).size !== garments.length
  )
    return null;
  if (categories.has('suit') && (categories.has('bottom') || categories.has('outerwear')))
    return null;
  if (!isHardCompatible(garments, context.occasion, context.weather)) return null;
  const { score, breakdown } = scoreCandidate(
    garments,
    context.occasion,
    context.weather,
    context.styleProfile,
    context.now ?? new Date(),
  );
  return {
    id: outfitKey(garments.map((item) => item.id)),
    garments,
    score,
    breakdown,
    explanation: explain(garments, breakdown, context.occasion),
  };
}

export function generateOutfits({
  wardrobe,
  occasion,
  weather,
  styleProfile,
  lockedGarmentId,
  lockedGarmentIds = [],
  limit = 3,
  now = new Date(),
}: GenerateOutfitInput): OutfitRecommendation[] {
  if (limit <= 0 || !Number.isFinite(limit)) return [];
  const locks = [...new Set([...lockedGarmentIds, ...(lockedGarmentId ? [lockedGarmentId] : [])])];
  const ranked: OutfitRecommendation[] = [];
  for (const candidate of buildCandidates(wardrobe, locks)) {
    const recommendation = evaluateOutfit(candidate, { occasion, weather, styleProfile, now });
    if (recommendation) ranked.push(recommendation);
  }
  ranked.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const selected: OutfitRecommendation[] = [];
  const selectedIds = new Set<string>();
  const shoeCounts = new Map<string, number>();
  const pieceCounts = new Map<string, number>();
  while (selected.length < limit) {
    let best: OutfitRecommendation | undefined;
    let bestScore = -Infinity;
    for (const item of ranked) {
      if (selectedIds.has(item.id)) continue;
      const shoe = item.garments.find((garment) => garment.category === 'footwear')?.id ?? '';
      if ((shoeCounts.get(shoe) ?? 0) >= 2) continue;
      const repeated = item.garments.filter((garment) =>
        ['top', 'bottom', 'suit'].includes(garment.category) && (pieceCounts.get(garment.id) ?? 0) > 0).length;
      const adjusted = item.score - repeated * 5 - (shoeCounts.get(shoe) ?? 0) * 3;
      if (adjusted > bestScore) {
        best = item;
        bestScore = adjusted;
      }
    }
    if (!best) break;
    selected.push(best);
    selectedIds.add(best.id);
    for (const garment of best.garments) pieceCounts.set(garment.id, (pieceCounts.get(garment.id) ?? 0) + 1);
    const shoe = best.garments.find((garment) => garment.category === 'footwear')?.id ?? '';
    shoeCounts.set(shoe, (shoeCounts.get(shoe) ?? 0) + 1);
  }
  // A lock on the only pair of shoes must not discard otherwise valid alternatives.
  if (selected.length >= limit) return selected;
  for (const item of ranked) {
    if (!selectedIds.has(item.id)) {
      selected.push(item);
      selectedIds.add(item.id);
    }
    if (selected.length >= limit) break;
  }
  return selected;
}
