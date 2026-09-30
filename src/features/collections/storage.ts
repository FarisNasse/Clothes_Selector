import { z } from 'zod';
import {
  occasions,
  type Occasion,
  type OutfitRecommendation,
  type WeatherContext,
} from '@/types/domain';
import { outfitKey } from '@/features/recommendations/engine';
const lookSchema = z.object({
  id: z.string(),
  garmentIds: z.array(z.string()).min(3).max(6),
  occasion: z.enum(occasions),
  createdAt: z.string(),
  weather: z.object({
    temperatureF: z.number().finite(),
    precipitationProbability: z.number().min(0).max(1),
    raining: z.boolean(),
    outdoorMinutes: z.number().int().min(0).max(1440).optional(),
  }),
  requirements: z.object({ coveredLegs: z.boolean().optional(), rainProtection: z.boolean().optional() }).optional(),
});
const schema = z.object({ favorites: z.array(z.string()), looks: z.array(lookSchema) });
export type SavedLook = z.infer<typeof lookSchema>;
export function parseSavedLook(value: unknown): SavedLook | null {
  const result = lookSchema.safeParse(value);
  return result.success ? result.data : null;
}
export type Collection = z.infer<typeof schema>;
export const emptyCollection = (): Collection => ({ favorites: [], looks: [] });
export type DeviceStorage = Pick<Storage, 'getItem' | 'setItem'>;
export const collectionKey = (owner: string) => 'clothes-selector:collection:v1:' + owner;
export function savedLookId(outfit: OutfitRecommendation, occasion: Occasion): string {
  return outfitKey(outfit.garments.map((item) => item.id)) + '@' + occasion;
}
export function readCollection(storage: DeviceStorage, owner: string): Collection {
  const raw = storage.getItem(collectionKey(owner));
  if (!raw) return emptyCollection();
  try {
    const result = schema.safeParse(JSON.parse(raw));
    if (!result.success) return emptyCollection();
    const looks = result.data.looks.map((look) => ({ ...look,
      id: outfitKey(look.garmentIds) + '@' + look.occasion,
    }));
    return { ...result.data, looks: [...new Map(looks.map((look) => [look.id, look])).values()] };
  } catch {
    return emptyCollection();
  }
}
export function writeCollection(storage: DeviceStorage, owner: string, collection: Collection) {
  storage.setItem(collectionKey(owner), JSON.stringify(schema.parse(collection)));
}
export function savedLook(
  outfit: OutfitRecommendation,
  occasion: Occasion,
  weather: WeatherContext,
  requirements: { coveredLegs: boolean; rainProtection: boolean } = { coveredLegs: false, rainProtection: false },
): SavedLook {
  const garmentIds = outfit.garments.map((item) => item.id);
  return {
    id: savedLookId(outfit, occasion),
    garmentIds,
    occasion,
    weather,
    requirements,
    createdAt: new Date().toISOString(),
  };
}
