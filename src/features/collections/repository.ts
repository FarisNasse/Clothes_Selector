import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import { parseSavedLook, type Collection, type SavedLook } from './storage';

function client() {
  if (env.demoMode || !supabase) throw new Error('Account collections require connected mode.');
  return supabase;
}

export async function listAccountCollection(userId: string): Promise<Collection> {
  const db = client();
  const collection: Collection = { favorites: [], looks: [] };
  for (let start = 0; ; start += 1000) {
    const [favoriteResult, lookResult] = await Promise.all([
      db.from('favorite_garments').select('garment_id').eq('user_id', userId)
        .order('garment_id').range(start, start + 999),
      db.from('saved_looks').select('look_key, garment_ids, occasion, weather, created_at')
        .eq('user_id', userId).order('created_at', { ascending: false })
        .order('look_key').range(start, start + 999),
    ]);
    if (favoriteResult.error) throw favoriteResult.error;
    if (lookResult.error) throw lookResult.error;
    collection.favorites.push(...(favoriteResult.data ?? []).map((row) => row.garment_id as string));
    collection.looks.push(...(lookResult.data ?? []).flatMap((row) => {
      const parsed = parseSavedLook({
        id: row.look_key, garmentIds: row.garment_ids, occasion: row.occasion,
        weather: row.weather, createdAt: row.created_at,
      });
      return parsed ? [parsed] : [];
    }));
    if ((favoriteResult.data?.length ?? 0) < 1000 && (lookResult.data?.length ?? 0) < 1000) break;
  }
  return collection;
}

export async function setAccountFavorite(userId: string, garmentId: string, favorite: boolean) {
  const db = client();
  const { error } = favorite
    ? await db.from('favorite_garments').insert({ user_id: userId, garment_id: garmentId })
    : await db.from('favorite_garments').delete().eq('user_id', userId).eq('garment_id', garmentId);
  if (error) throw error;
}

export async function setAccountLook(userId: string, look: SavedLook | string, save: boolean) {
  const db = client();
  if (save) {
    if (typeof look === 'string') throw new Error('A complete look is required to save.');
    const { error } = await db.from('saved_looks').insert({
        user_id: userId,
        look_key: look.id,
        garment_ids: look.garmentIds,
        occasion: look.occasion,
        weather: look.weather,
        created_at: look.createdAt,
      });
    if (error) throw error;
    return;
  }
  const { error } = await db.from('saved_looks').delete()
    .eq('user_id', userId).eq('look_key', typeof look === 'string' ? look : look.id);
  if (error) throw error;
}

/** One-time migration for collections saved by earlier device-only releases. */
export async function importDeviceCollection(userId: string, collection: Collection): Promise<number> {
  const db = client();
  const owned = new Set<string>();
  for (let start = 0; ; start += 1000) {
    const { data, error } = await db.from('garments').select('id').eq('user_id', userId)
      .order('id').range(start, start + 999);
    if (error) throw error;
    for (const row of data ?? []) owned.add(row.id);
    if (!data || data.length < 1000) break;
  }
  const favorites = collection.favorites.filter((id) => owned.has(id));
  const looks = collection.looks.filter((look) => look.garmentIds.every((id) => owned.has(id)));
  for (let start = 0; start < favorites.length; start += 100) {
    const result = await db.from('favorite_garments').upsert(
      favorites.slice(start, start + 100).map((garmentId) => ({ user_id: userId, garment_id: garmentId })),
      { onConflict: 'user_id,garment_id', ignoreDuplicates: true },
    );
    if (result.error) throw result.error;
  }
  for (let start = 0; start < looks.length; start += 100) {
    const result = await db.from('saved_looks').upsert(
      looks.slice(start, start + 100).map((look) => ({
        user_id: userId, look_key: look.id, garment_ids: look.garmentIds,
        occasion: look.occasion, weather: look.weather, created_at: look.createdAt,
      })),
      { onConflict: 'user_id,look_key', ignoreDuplicates: true },
    );
    if (result.error) throw result.error;
  }
  return favorites.length + looks.length;
}
