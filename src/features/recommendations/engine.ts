import type {
  Garment,
  Occasion,
  OutfitRecommendation,
  OutfitScoreBreakdown,
  StyleProfile,
  WeatherContext,
} from '@/types/domain';

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

const neutralColors = new Set([
  'black',
  'white',
  'cream',
  'beige',
  'stone',
  'navy',
  'charcoal',
  'gray',
  'grey',
  'brown',
  'indigo',
  'olive',
]);

const harmoniousPairs = new Set([
  'brown|cream',
  'brown|navy',
  'brown|olive',
  'brown|white',
  'charcoal|cream',
  'charcoal|navy',
  'charcoal|white',
  'cream|indigo',
  'cream|navy',
  'indigo|white',
  'navy|white',
  'navy|olive',
]);

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
  limit?: number;
  now?: Date;
};

type Candidate = Garment[];

function canonicalPair(a: string, b: string) {
  return [a.toLowerCase(), b.toLowerCase()].sort().join('|');
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function colorHarmonyScore(garments: Garment[]) {
  const colors = garments.map((garment) => garment.primaryColor.toLowerCase());
  if (colors.length < 2) return 1;

  let pairScore = 0;
  let pairCount = 0;

  for (let i = 0; i < colors.length; i += 1) {
    for (let j = i + 1; j < colors.length; j += 1) {
      const a = colors[i];
      const b = colors[j];
      if (!a || !b) continue;
      pairCount += 1;

      if (a === b) {
        pairScore += 0.82;
      } else if (harmoniousPairs.has(canonicalPair(a, b))) {
        pairScore += 1;
      } else if (neutralColors.has(a) && neutralColors.has(b)) {
        pairScore += 0.9;
      } else if (neutralColors.has(a) || neutralColors.has(b)) {
        pairScore += 0.78;
      } else {
        pairScore += 0.58;
      }
    }
  }

  return pairCount === 0 ? 1 : pairScore / pairCount;
}

function preferenceScore(garments: Garment[], profile: StyleProfile) {
  const garmentScores = garments.map((garment) => {
    if (profile.dislikedColors.includes(garment.primaryColor.toLowerCase())) return 0.2;
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
  const fits = garments.filter((garment) => garment.category !== 'footwear').map((garment) => garment.fit);
  if (fits.length < 2) return 0.9;

  const conflicting =
    fits.includes('slim') && fits.includes('oversized') ? 0.58 : fits.includes('slim') && fits.includes('relaxed') ? 0.78 : 0.94;
  return conflicting;
}

function formalityConsistencyScore(garments: Garment[]) {
  const values = garments.map((garment) => garment.formality);
  const spread = Math.max(...values) - Math.min(...values);
  if (spread <= 2) return 1;
  if (spread <= 3) return 0.82;
  if (spread <= 4) return 0.58;
  return 0.25;
}

function occasionScore(garments: Garment[], occasion: Occasion) {
  const target = occasionTargets[occasion];
  const outfitFormality = average(garments.map((garment) => garment.formality));
  if (outfitFormality < target.min || outfitFormality > target.max) return 0.35;
  return clamp01(1 - Math.abs(outfitFormality - target.target) / 5);
}

function weatherScore(garments: Garment[], weather: WeatherContext) {
  const outerwear = garments.find((garment) => garment.category === 'outerwear');
  const footwear = garments.find((garment) => garment.category === 'footwear');
  const avgWarmth = average(garments.map((garment) => garment.warmth));

  let score = 1;

  if (weather.temperatureF >= 78 && avgWarmth > 4.5) score -= 0.5;
  if (weather.temperatureF <= 50 && avgWarmth < 3.5) score -= 0.35;
  if (weather.raining && outerwear && !outerwear.waterproof) score -= 0.22;
  if (weather.raining && footwear && !footwear.waterproof) score -= 0.16;

  return clamp01(score);
}

function textureScore(garments: Garment[]) {
  const textured = garments.filter((garment) =>
    garment.materials.some((material) => ['suede', 'wool', 'linen', 'silk', 'denim'].includes(material.toLowerCase())),
  ).length;
  if (textured === 0) return 0.75;
  if (textured <= 2) return 1;
  return 0.84;
}

function rotationScore(garments: Garment[], nowDate: Date) {
  const now = nowDate.getTime();
  return average(
    garments.map((garment) => {
      if (!garment.lastWornAt) return 1;
      const days = Math.max(0, (now - new Date(garment.lastWornAt).getTime()) / 86_400_000);
      return clamp01(0.45 + Math.min(days / 60, 0.55));
    }),
  );
}

function isHardCompatible(candidate: Candidate, occasion: Occasion, weather: WeatherContext) {
  const values = candidate.map((garment) => garment.formality);
  if (Math.max(...values) - Math.min(...values) > 4) return false;

  if (occasion === 'formal') {
    const footwear = candidate.find((garment) => garment.category === 'footwear');
    if (!footwear || footwear.formality < 6) return false;
  }

  if (weather.temperatureF >= 82) {
    const tooHeavy = candidate.some((garment) => garment.category === 'outerwear' && garment.warmth >= 7);
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
    reasons.push(`${top.primaryColor} and ${bottom.primaryColor} create a controlled, versatile palette`);
  }
  if (footwear && breakdown.textureCompatibility >= 0.9) {
    reasons.push(`${footwear.name.toLowerCase()} adds useful texture without disrupting the silhouette`);
  }
  if (breakdown.wardrobeRotation >= 0.75) {
    reasons.push('the combination brings less-used pieces back into rotation');
  }

  const lead = reasons.length > 0 ? reasons.slice(0, 2).join(', while ') : 'the pieces share a consistent level of formality';
  return `${lead}. The overall balance is tuned for ${occasion.replace('_', ' ')} rather than generic styling.`;
}

function buildCandidates(wardrobe: Garment[], lockedGarmentId?: string) {
  const tops = wardrobe.filter((garment) => garment.category === 'top');
  const bottoms = wardrobe.filter((garment) => garment.category === 'bottom');
  const shoes = wardrobe.filter((garment) => garment.category === 'footwear');
  const outerwear = wardrobe.filter((garment) => garment.category === 'outerwear');
  const candidates: Candidate[] = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        candidates.push([top, bottom, shoe]);
        for (const layer of outerwear) candidates.push([layer, top, bottom, shoe]);
      }
    }
  }

  if (!lockedGarmentId) return candidates;
  return candidates.filter((candidate) => candidate.some((garment) => garment.id === lockedGarmentId));
}

export function generateOutfits({
  wardrobe,
  occasion,
  weather,
  styleProfile,
  lockedGarmentId,
  limit = 3,
  now = new Date(),
}: GenerateOutfitInput): OutfitRecommendation[] {
  return buildCandidates(wardrobe, lockedGarmentId)
    .filter((candidate) => isHardCompatible(candidate, occasion, weather))
    .map((garments) => {
      const { score, breakdown } = scoreCandidate(garments, occasion, weather, styleProfile, now);
      return {
        id: garments.map((garment) => garment.id).join(':'),
        garments,
        score,
        breakdown,
        explanation: explain(garments, breakdown, occasion),
      } satisfies OutfitRecommendation;
    })
    .sort((a, b) => b.score - a.score)
    .filter((recommendation, index, all) => {
      const shoeId = recommendation.garments.find((garment) => garment.category === 'footwear')?.id;
      const prior = all.slice(0, index);
      const exactDuplicate = prior.some((item) => item.id === recommendation.id);
      if (exactDuplicate) return false;

      // Encourage visible variety without making diversity a hard styling constraint.
      const sameShoeCount = prior
        .slice(0, limit)
        .filter((item) => item.garments.some((garment) => garment.id === shoeId)).length;
      return sameShoeCount < 2;
    })
    .slice(0, limit);
}
