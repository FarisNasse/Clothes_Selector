import { demoWardrobe } from '@/fixtures/demoWardrobe';
import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import type { Garment, GarmentDraft } from '@/types/domain';

function rowToGarment(row: Record<string, unknown>): Garment {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    category: row.category as Garment['category'],
    subcategory: String(row.subcategory),
    name: String(row.name),
    brand: row.brand ? String(row.brand) : null,
    primaryColor: String(row.primary_color),
    secondaryColors: (row.secondary_colors as string[] | null) ?? [],
    pattern: String(row.pattern),
    materials: (row.materials as string[] | null) ?? [],
    fit: row.fit as Garment['fit'],
    formality: Number(row.formality),
    warmth: Number(row.warmth),
    waterproof: Boolean(row.waterproof),
    seasons: (row.seasons as Garment['seasons']) ?? ['all-season'],
    styleTags: (row.style_tags as string[] | null) ?? [],
    imageUrl: null,
    storagePath: row.storage_path ? String(row.storage_path) : null,
    purchasePrice: row.purchase_price === null ? null : Number(row.purchase_price),
    wearCount: Number(row.wear_count ?? 0),
    lastWornAt: row.last_worn_at ? String(row.last_worn_at) : null,
    aiConfidence: row.ai_confidence === null ? null : Number(row.ai_confidence),
  };
}

export async function listGarments(userId?: string): Promise<Garment[]> {
  if (env.demoMode || !supabase || !userId) return demoWardrobe;

  const { data, error } = await supabase.from('garments').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => rowToGarment(row as Record<string, unknown>));
}

export async function createGarment(userId: string, draft: GarmentDraft): Promise<Garment> {
  if (env.demoMode || !supabase) {
    return {
      ...draft,
      id: `demo-${Date.now()}`,
      userId: 'demo-user',
      wearCount: 0,
      lastWornAt: null,
    };
  }

  const payload = {
    user_id: userId,
    category: draft.category,
    subcategory: draft.subcategory,
    name: draft.name,
    brand: draft.brand,
    primary_color: draft.primaryColor,
    secondary_colors: draft.secondaryColors,
    pattern: draft.pattern,
    materials: draft.materials,
    fit: draft.fit,
    formality: draft.formality,
    warmth: draft.warmth,
    waterproof: draft.waterproof,
    seasons: draft.seasons,
    style_tags: draft.styleTags,
    storage_path: draft.storagePath,
    purchase_price: draft.purchasePrice,
    ai_confidence: draft.aiConfidence,
  };

  const { data, error } = await supabase.from('garments').insert(payload).select('*').single();
  if (error) throw error;
  return rowToGarment(data as Record<string, unknown>);
}
