import { z } from 'zod';
import { garmentAnalysisSchema } from './analysisSchema';
export const garmentDraftSchema = garmentAnalysisSchema.omit({ confidence: true }).extend({
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
