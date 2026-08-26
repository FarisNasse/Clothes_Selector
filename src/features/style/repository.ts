import { demoStyleProfile } from '@/fixtures/demoWardrobe';
import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import type { Fit, StyleProfile } from '@/types/domain';

export const neutralStyleProfile: StyleProfile = {
  preferredFits: ['regular'],
  styleWeights: {
    minimalist: 0.5,
    contemporary: 0.5,
    classic: 0.5,
    streetwear: 0.5,
    preppy: 0.5,
    workwear: 0.5,
    athleisure: 0.5,
  },
  dislikedColors: [],
};

function parseFits(value: unknown): Fit[] {
  const valid = new Set<Fit>(['slim', 'tailored', 'regular', 'relaxed', 'oversized']);
  return Array.isArray(value) ? value.filter((fit): fit is Fit => valid.has(fit as Fit)) : [];
}

function rowToStyleProfile(row: Record<string, unknown>): StyleProfile {
  const weights = row.style_weights && typeof row.style_weights === 'object'
    ? (row.style_weights as Record<string, number>)
    : {};
  return {
    preferredFits: parseFits(row.preferred_fits),
    styleWeights: { ...neutralStyleProfile.styleWeights, ...weights },
    dislikedColors: Array.isArray(row.disliked_colors) ? row.disliked_colors.map(String) : [],
  };
}

export async function getStyleProfile(userId?: string): Promise<StyleProfile> {
  if (env.demoMode) return demoStyleProfile;
  if (!supabase || !userId) return neutralStyleProfile;

  const { data, error } = await supabase
    .from('style_profiles')
    .select('preferred_fits, style_weights, disliked_colors')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToStyleProfile(data as Record<string, unknown>) : neutralStyleProfile;
}

export async function saveStyleProfile(userId: string, profile: StyleProfile): Promise<StyleProfile> {
  if (env.demoMode) return profile;
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('style_profiles')
    .upsert(
      {
        user_id: userId,
        preferred_fits: profile.preferredFits,
        style_weights: profile.styleWeights,
        disliked_colors: profile.dislikedColors,
      },
      { onConflict: 'user_id' },
    )
    .select('preferred_fits, style_weights, disliked_colors')
    .single();
  if (error) throw error;

  await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', userId);
  return rowToStyleProfile(data as Record<string, unknown>);
}
