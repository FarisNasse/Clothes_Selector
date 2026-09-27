import type { GarmentAnalysis } from '@/features/wardrobe/analysisSchema';
import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import { GarmentImageError } from './pickedImage';
import { tryGarmentAnalysis } from './analysisAttempt';

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
  data: ArrayBuffer;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  userId: string;
  onStage?: (stage: 'uploading' | 'analyzing') => void;
}): Promise<
  | { analysis: GarmentAnalysis; storagePath: string | null; manualFallback: false }
  | { analysis: null; storagePath: string; manualFallback: true }
> {
  const client = supabase;
  if (env.demoMode || !client) {
    params.onStage?.('analyzing');
    await new Promise((resolve) => setTimeout(resolve, 650));
    return { analysis: demoAnalysis, storagePath: null, manualFallback: false };
  }

  const extension = extensionForMime(params.mimeType);
  const storagePath = `${params.userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  params.onStage?.('uploading');
  try {
    const { error: uploadError } = await client.storage
      .from('garment-images')
      .upload(storagePath, params.data, {
        contentType: params.mimeType,
        upsert: false,
      });
    if (uploadError) throw uploadError;
  } catch (error) {
    throw new GarmentImageError('upload', error);
  }

  params.onStage?.('analyzing');
  const attempt = await tryGarmentAnalysis(() =>
    client.functions.invoke('analyze-garment', {
      body: { storagePath },
    }),
  );
  if (attempt.analysis)
    return { analysis: attempt.analysis, storagePath, manualFallback: false };

  // Preserve the uploaded photo so it can still be saved with manually entered details.
  console.warn('Automatic garment analysis failed; switching to manual entry.', attempt.error);
  return { analysis: null, storagePath, manualFallback: true };
}
