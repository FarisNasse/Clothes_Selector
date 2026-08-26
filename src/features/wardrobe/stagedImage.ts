import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';

const IMAGE_BUCKET = 'garment-images';

export async function discardStagedGarmentImage(storagePath: string | null) {
  if (!storagePath || env.demoMode || !supabase) return;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([storagePath]);
  if (error) throw error;
}
