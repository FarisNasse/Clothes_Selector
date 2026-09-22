const DEFAULT_SUPABASE_URL = 'https://timgqrbsczlvoopmsobr.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ZTa8xIEj2Q3Lz_cuS7c7-Q_F7hLx_ey';

// Clothes Selector runs against its dedicated Supabase project by default.
// EXPO_PUBLIC_* variables may override these public client values for other environments.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const env = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  supabaseUrl,
  supabasePublishableKey,
  isSupabaseConfigured: true,
  demoMode: process.env.EXPO_PUBLIC_DEMO_MODE === 'true',
} as const;
