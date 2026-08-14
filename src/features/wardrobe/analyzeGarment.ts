import { garmentAnalysisSchema, type GarmentAnalysis } from '@/features/wardrobe/analysisSchema';
import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';

const demoAnalysis: GarmentAnalysis = {
  category: 'top',
  subcategory: 'Knit polo',
  name: 'Navy Knit Polo',
  brand: null,
  primaryColor: 'navy',
  secondaryColors: [],
  pattern: 'solid',
  materials: ['cotton'],
  fit: 'regular',
  formality: 5,
  warmth: 3,
  waterproof: false,
  seasons: ['spring', 'summer', 'fall'],
  styleTags: ['minimalist', 'contemporary', 'smart casual'],
  confidence: 0.91,
};

function extensionForMime(mimeType?: string | null) {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

export async function analyzeGarmentImage(params: {
  uri: string;
  mimeType?: string | null;
  userId: string;
}): Promise<{ analysis: GarmentAnalysis; storagePath: string | null }> {
  if (env.demoMode || !supabase) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return { analysis: demoAnalysis, storagePath: null };
  }

  const extension = extensionForMime(params.mimeType);
  const storagePath = `${params.userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const response = await fetch(params.uri);
  const file = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from('garment-images').upload(storagePath, file, {
    contentType: params.mimeType ?? 'image/jpeg',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase.functions.invoke('analyze-garment', {
    body: { storagePath },
  });
  if (error) {
    await supabase.storage.from('garment-images').remove([storagePath]);
    throw error;
  }

  const parsed = garmentAnalysisSchema.safeParse(data);
  if (!parsed.success) {
    await supabase.storage.from('garment-images').remove([storagePath]);
    throw new Error('Garment analysis returned an unexpected shape.');
  }

  return { analysis: parsed.data, storagePath };
}
