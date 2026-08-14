import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import type { Occasion, OutfitRecommendation, WeatherContext } from '@/types/domain';

export async function recordOutfitWear(params: {
  userId: string;
  recommendation: OutfitRecommendation;
  occasion: Occasion;
  weather: WeatherContext;
}): Promise<string | null> {
  if (env.demoMode || !supabase) return null;

  const { data, error } = await supabase.rpc('record_outfit_wear', {
    p_garment_ids: params.recommendation.garments.map((garment) => garment.id),
    p_occasion: params.occasion,
    p_recommendation_score: params.recommendation.score,
    p_explanation: params.recommendation.explanation,
    p_context: {
      weather: params.weather,
      score_breakdown: params.recommendation.breakdown,
    },
  });

  if (error) throw error;
  return typeof data === 'string' ? data : null;
}
