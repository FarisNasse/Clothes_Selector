import type { Garment, GarmentDraft } from '@/types/domain';

// Required identifying fields stay empty until the user supplies real details.
export function manualGarmentDraft(): GarmentDraft {
  return {
    category: '' as GarmentDraft['category'],
    subcategory: '',
    name: '',
    brand: null,
    primaryColor: '',
    secondaryColors: [],
    pattern: 'unknown',
    materials: [],
    fit: 'regular',
    formality: 5,
    warmth: 5,
    waterproof: false,
    seasons: ['all-season'],
    styleTags: [],
    imageUrl: null,
    storagePath: null,
    purchasePrice: null,
    aiConfidence: null,
    confirmedFields: [],
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
    confirmedFields: garment.confirmedFields ?? [],
  };
}
