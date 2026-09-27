import { z } from 'zod';
import { garmentAnalysisSchema } from './analysisSchema';
export const garmentDraftSchema = garmentAnalysisSchema.omit({ confidence: true }).extend({
  // Manual entries can have no style tags without inventing one.
  styleTags: z.array(z.string().max(40)).max(8),
  name: z.string().trim().min(1).max(120),
  subcategory: z.string().trim().min(1).max(80),
  primaryColor: z.string().trim().min(1).max(40),
  imageUrl: z.string().nullable(),
  storagePath: z.string().nullable(),
  purchasePrice: z.number().finite().nonnegative().nullable(),
  aiConfidence: z.number().min(0).max(1).nullable(),
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
