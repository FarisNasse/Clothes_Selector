import type { GarmentAnalysis } from '@/features/wardrobe/analysisSchema';
import type { GarmentDraft } from '@/types/domain';

export function analysisToDraft(analysis: GarmentAnalysis, storagePath: string | null): GarmentDraft {
  return {
    category: analysis.category,
    subcategory: analysis.subcategory,
    name: analysis.name,
    brand: analysis.brand,
    primaryColor: analysis.primaryColor,
    secondaryColors: analysis.secondaryColors,
    pattern: analysis.pattern,
    materials: analysis.materials,
    fit: analysis.fit,
    formality: analysis.formality,
    warmth: analysis.warmth,
    waterproof: analysis.waterproof,
    seasons: analysis.seasons,
    styleTags: analysis.styleTags,
    imageUrl: null,
    storagePath,
    purchasePrice: null,
    aiConfidence: analysis.confidence,
  };
}
