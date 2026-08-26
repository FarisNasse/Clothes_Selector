import type { GarmentAnalysis } from '@/features/wardrobe/analysisSchema';
import type { Garment, GarmentDraft } from '@/types/domain';

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

export function garmentToDraft(garment: Garment): GarmentDraft {
  return {
    category: garment.category,
    subcategory: garment.subcategory,
    name: garment.name,
    brand: garment.brand,
    primaryColor: garment.primaryColor,
    secondaryColors: garment.secondaryColors,
    pattern: garment.pattern,
    materials: garment.materials,
    fit: garment.fit,
    formality: garment.formality,
    warmth: garment.warmth,
    waterproof: garment.waterproof,
    seasons: garment.seasons,
    styleTags: garment.styleTags,
    imageUrl: garment.imageUrl,
    storagePath: garment.storagePath,
    purchasePrice: garment.purchasePrice,
    aiConfidence: garment.aiConfidence,
  };
}
