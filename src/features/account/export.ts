import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { supabase } from '@/lib/supabase';

type ExportTable = 'profiles' | 'style_profiles' | 'garments' | 'outfits' |
  'recommendation_sessions' | 'recommendation_feedback' | 'wear_events' |
  'favorite_garments' | 'saved_looks';

const tables: { name: ExportTable; owner: string; sort: string }[] = [
  { name: 'profiles', owner: 'id', sort: 'id' },
  { name: 'style_profiles', owner: 'user_id', sort: 'user_id' },
  { name: 'garments', owner: 'user_id', sort: 'id' },
  { name: 'outfits', owner: 'user_id', sort: 'id' },
  { name: 'recommendation_sessions', owner: 'user_id', sort: 'id' },
  { name: 'recommendation_feedback', owner: 'user_id', sort: 'id' },
  { name: 'wear_events', owner: 'user_id', sort: 'id' },
  { name: 'favorite_garments', owner: 'user_id', sort: 'garment_id' },
  { name: 'saved_looks', owner: 'user_id', sort: 'look_key' },
];

/** Export every account row, including past outfits, without signed image URLs or credentials. */
export async function buildAccountExport() {
  if (!supabase) throw new Error('Connect your account before exporting.');
  const { data: identity, error: identityError } = await supabase.auth.getUser();
  if (identityError || !identity.user) throw identityError ?? new Error('Sign in again to export.');
  const userId = identity.user.id;
  const result: Record<string, unknown> = {
    format: 'clothes-selector-account-v1', exportedAt: new Date().toISOString(),
    account: { id: userId, email: identity.user.email ?? null },
    photoFilesIncluded: false,
  };
  for (const table of tables) {
    const rows: Record<string, unknown>[] = [];
    for (let start = 0; ; start += 1000) {
      const { data, error } = await supabase.from(table.name).select('*')
        .eq(table.owner, userId).order(table.sort, { ascending: true }).range(start, start + 999);
      if (error) throw error;
      rows.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    result[table.name] = rows;
  }
  const outfits = result.outfits as { id: string }[];
  const items: Record<string, unknown>[] = [];
  for (let i = 0; i < outfits.length; i += 100) {
    const ids = outfits.slice(i, i + 100).map((outfit) => outfit.id);
    const { data, error } = await supabase.from('outfit_items').select('*').in('outfit_id', ids);
    if (error) throw error;
    items.push(...(data ?? []));
  }
  result.outfit_items = items;
  return JSON.stringify(result, null, 2);
}

export async function shareAccountExport(json: string) {
  const filename = `clothes-selector-export-${new Date().toISOString().slice(0, 10)}.json`;
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    }
    return;
  }
  if (!(await Sharing.isAvailableAsync())) throw new Error('File sharing is unavailable on this device.');
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(json);
  try {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export wardrobe details' });
  } finally {
    try { file.delete(); } catch { /* OS cache will expire if cleanup fails. */ }
  }
}
