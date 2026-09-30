import { z } from 'zod';
export const garmentDraftSchema = z.object({
  category: z.enum(['top', 'bottom', 'outerwear', 'footwear', 'accessory', 'suit']),
  subcategory: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  brand: z.string().trim().max(80).nullable(),
  primaryColor: z.string().trim().min(1).max(40),
  secondaryColors: z.array(z.string().max(40)).max(5),
  pattern: z.string().trim().min(1).max(40),
  materials: z.array(z.string().max(50)).max(6),
  fit: z.enum(['slim', 'tailored', 'regular', 'relaxed', 'oversized']),
  formality: z.number().int().min(1).max(10),
  warmth: z.number().int().min(1).max(10),
  waterproof: z.boolean(),
  seasons: z.array(z.enum(['spring', 'summer', 'fall', 'winter', 'all-season'])).min(1).max(5),
  styleTags: z.array(z.string().max(40)).max(8),
  imageUrl: z.string().nullable(),
  storagePath: z.string().nullable(),
  purchasePrice: z.number().finite().nonnegative().nullable(),
  aiConfidence: z.number().min(0).max(1).nullable(),
  confirmedFields: z.array(z.enum(['fit', 'formality', 'warmth', 'waterproof', 'seasons'])).optional(),
});
export function parseLabels(raw: string) {
  return [
    ...new Set(
      raw
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}
