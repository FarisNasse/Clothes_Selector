import { z } from 'zod';

export const garmentAnalysisSchema = z.object({
  category: z.enum(['top', 'bottom', 'outerwear', 'footwear', 'accessory', 'suit']),
  subcategory: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  brand: z.string().max(80).nullable(),
  primaryColor: z.string().min(1).max(40),
  secondaryColors: z.array(z.string().max(40)).max(5),
  pattern: z.string().min(1).max(40),
  materials: z.array(z.string().max(50)).max(6),
  fit: z.enum(['slim', 'tailored', 'regular', 'relaxed', 'oversized']),
  formality: z.number().int().min(1).max(10),
  warmth: z.number().int().min(1).max(10),
  waterproof: z.boolean(),
  seasons: z.array(z.enum(['spring', 'summer', 'fall', 'winter', 'all-season'])).min(1).max(5),
  styleTags: z.array(z.string().max(40)).min(1).max(8),
  confidence: z.number().min(0).max(1),
});

export type GarmentAnalysis = z.infer<typeof garmentAnalysisSchema>;
