import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import type { Occasion, OutfitRecommendation, WeatherContext } from '@/types/domain';

export async function recordOutfitWear(params: {
  userId: string;
  recommendation: OutfitRecommendation;
  occasion: Occasion;
  weather: WeatherContext;
  requestId: string;
  requirements: { coveredLegs: boolean; rainProtection: boolean };
}): Promise<string | null> {
  if (env.demoMode || !supabase) return null;

  const { data, error } = await supabase.rpc('record_outfit_wear', {
    p_garment_ids: params.recommendation.garments.map((garment) => garment.id),
    p_occasion: params.occasion,
    p_recommendation_score: Math.round(params.recommendation.score),
    p_explanation: params.recommendation.explanation,
    p_context: {
      weather: params.weather,
      requirements: params.requirements,
      score_breakdown: params.recommendation.breakdown,
    },
    p_request_id: params.requestId,
  });

  if (error) throw error;
  return typeof data === 'string' ? data : null;
}
