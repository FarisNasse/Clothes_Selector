import { demoWardrobe } from '@/fixtures/demoWardrobe';
import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import type { Garment, GarmentDraft } from '@/types/domain';

const IMAGE_BUCKET = 'garment-images';
const SIGNED_URL_TTL_SECONDS = 60 * 60;
const SIGNED_URL_CACHE_MS = 40 * 60 * 1000;

type SignedUrlCacheEntry = { url: string; expiresAt: number };
const signedUrlCache = new Map<string, SignedUrlCacheEntry>();
let demoGarments = [...demoWardrobe];
export function recordDemoWear(ids: string[], timestamp: string) {
  const worn = new Set(ids);
  demoGarments = demoGarments.map((item) => worn.has(item.id)
    ? { ...item, wearCount: item.wearCount + 1, lastWornAt: timestamp } : item);
}

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
    confirmedFields: (row.confirmed_fields as Garment['confirmedFields']) ?? [],
  };
}

async function withSignedImages(garments: Garment[]): Promise<Garment[]> {
  if (!supabase || env.demoMode) return garments;

  const now = Date.now();
  const pathsToSign = [
    ...new Set(
      garments
        .map((garment) => garment.storagePath)
        .filter((path): path is string => Boolean(path))
        .filter((path) => {
          const cached = signedUrlCache.get(path);
          return !cached || cached.expiresAt <= now;
        }),
    ),
  ];

  if (pathsToSign.length > 0) {
    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .createSignedUrls(pathsToSign, SIGNED_URL_TTL_SECONDS);

    if (error) throw error;

    for (const result of data ?? []) {
      if (result.path && result.signedUrl) {
        signedUrlCache.set(result.path, {
          url: result.signedUrl,
          expiresAt: now + SIGNED_URL_CACHE_MS,
        });
      }
    }
  }

  return garments.map((garment) => {
    if (!garment.storagePath) return garment;
    return { ...garment, imageUrl: signedUrlCache.get(garment.storagePath)?.url ?? null };
  });
}

function draftToChanges(draft: GarmentDraft) {
  return {
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
    confirmed_fields: draft.confirmedFields ?? [],
  };
}

export async function listGarments(userId?: string): Promise<Garment[]> {
  if (env.demoMode) return [...demoGarments];
  if (!supabase || !userId) return [];

  const { data, error } = await supabase
    .from('garments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return withSignedImages((data ?? []).map((row) => rowToGarment(row as Record<string, unknown>)));
}

export async function createGarment(userId: string, draft: GarmentDraft): Promise<Garment> {
  if (env.demoMode) {
    const created: Garment = {
      ...draft,
      id: `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId: 'demo-user',
      wearCount: 0,
      lastWornAt: null,
    };
    demoGarments = [created, ...demoGarments];
    return created;
  }
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('garments')
    .insert({ user_id: userId, ...draftToChanges(draft) })
    .select('*')
    .single();
  if (error) throw error;
  // The row is committed already; a transient signing failure must not invite a duplicate insert.
  const [garment] = await withSignedImages([rowToGarment(data as Record<string, unknown>)])
    .catch(() => [rowToGarment(data as Record<string, unknown>)]);
  if (!garment) throw new Error('The saved garment was not returned.');
  return garment;
}

export async function updateGarment(
  userId: string,
  garmentId: string,
  draft: GarmentDraft,
): Promise<Garment> {
  if (env.demoMode) {
    const existing = demoGarments.find((item) => item.id === garmentId);
    if (!existing) throw new Error('Garment not found.');
    const updated = { ...existing, ...draft };
    demoGarments = demoGarments.map((item) => item.id === garmentId ? updated : item);
    return updated;
  }
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('garments')
    .update(draftToChanges(draft))
    .eq('id', garmentId)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw error;
  const [garment] = await withSignedImages([rowToGarment(data as Record<string, unknown>)])
    .catch(() => [rowToGarment(data as Record<string, unknown>)]);
  if (!garment) throw new Error('The updated garment was not returned.');
  return garment;
}

export async function deleteGarment(userId: string, garment: Garment): Promise<void> {
  if (env.demoMode) {
    demoGarments = demoGarments.filter((item) => item.id !== garment.id);
    return;
  }
  if (!supabase) throw new Error('Supabase is not configured.');

  // Remove the database row first. If that fails, the image remains recoverable.
  const { error } = await supabase
    .from('garments')
    .delete()
    .eq('id', garment.id)
    .eq('user_id', userId);
  if (error) throw error;

  if (garment.storagePath) {
    const { error: storageError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .remove([garment.storagePath]);
    if (!storageError) signedUrlCache.delete(garment.storagePath);
  }
}
