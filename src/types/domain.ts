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
export type ConfirmedGarmentField = 'fit' | 'formality' | 'warmth' | 'waterproof' | 'seasons';
export type StylingIntent = 'quiet' | 'balanced' | 'expressive';

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
  /** Details explicitly chosen by the wearer. Missing means legacy/demo inventory. */
  confirmedFields?: ConfirmedGarmentField[] | undefined;
};

export type WeatherContext = {
  temperatureF: number;
  precipitationProbability: number;
  raining: boolean;
  /** Minutes spent outside while wearing the look. Missing means unknown. */
  outdoorMinutes?: number | undefined;
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
  reasons?: OutfitReason[];
};

export type OutfitReason = {
  kind: 'palette' | 'pattern' | 'material' | 'rain' | 'rotation' | 'context' | 'intent' | 'coverage' | 'uncertainty';
  garmentIds: string[];
  text: string;
};

export type GarmentDraft = Omit<Garment, 'id' | 'userId' | 'wearCount' | 'lastWornAt'>;
