export const garmentCategories = [
  'top',
  'bottom',
  'outerwear',
  'footwear',
  'accessory',
  'suit',
] as const;

export type GarmentCategory = (typeof garmentCategories)[number];

export const occasions = ['everyday', 'work', 'dinner', 'date', 'going_out', 'formal'] as const;
export type Occasion = (typeof occasions)[number];

export type Fit = 'slim' | 'tailored' | 'regular' | 'relaxed' | 'oversized';
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';

export type Garment = {
  id: string;
  userId: string;
  category: GarmentCategory;
  subcategory: string;
  name: string;
  brand: string | null;
  primaryColor: string;
  secondaryColors: string[];
  pattern: string;
  materials: string[];
  fit: Fit;
  formality: number;
  warmth: number;
  waterproof: boolean;
  seasons: Season[];
  styleTags: string[];
  imageUrl: string | null;
  storagePath: string | null;
  purchasePrice: number | null;
  wearCount: number;
  lastWornAt: string | null;
  aiConfidence: number | null;
};

export type WeatherContext = {
  temperatureF: number;
  precipitationProbability: number;
  raining: boolean;
};

export type StyleProfile = {
  preferredFits: Fit[];
  styleWeights: Record<string, number>;
  dislikedColors: string[];
};

export type OutfitScoreBreakdown = {
  colorHarmony: number;
  personalPreference: number;
  silhouetteCompatibility: number;
  formalityConsistency: number;
  occasionSuitability: number;
  weatherSuitability: number;
  textureCompatibility: number;
  wardrobeRotation: number;
};

export type OutfitRecommendation = {
  id: string;
  garments: Garment[];
  score: number;
  breakdown: OutfitScoreBreakdown;
  explanation: string;
};

export type GarmentDraft = Omit<Garment, 'id' | 'userId' | 'wearCount' | 'lastWornAt'>;
