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
  garmentIds: z.array(z.string()).min(3).max(5),
  occasion: z.enum(occasions),
  createdAt: z.string(),
  weather: z.object({
    temperatureF: z.number().finite(),
    precipitationProbability: z.number().min(0).max(1),
    raining: z.boolean(),
  }),
});
const schema = z.object({ favorites: z.array(z.string()), looks: z.array(lookSchema) });
export type SavedLook = z.infer<typeof lookSchema>;
export type Collection = z.infer<typeof schema>;
export const emptyCollection = (): Collection => ({ favorites: [], looks: [] });
export type DeviceStorage = Pick<Storage, 'getItem' | 'setItem'>;
export const collectionKey = (owner: string) => 'clothes-selector:collection:v1:' + owner;
export function readCollection(storage: DeviceStorage, owner: string): Collection {
  const raw = storage.getItem(collectionKey(owner));
  if (!raw) return emptyCollection();
  try {
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : emptyCollection();
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
): SavedLook {
  const garmentIds = outfit.garments.map((item) => item.id);
  return {
    id: outfitKey(garmentIds),
    garmentIds,
    occasion,
    weather,
    createdAt: new Date().toISOString(),
  };
}
