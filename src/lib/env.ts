const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
const requestedDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE?.toLowerCase() !== 'false';

export const env = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  supabaseUrl,
  supabasePublishableKey,
  isSupabaseConfigured: Boolean(supabaseUrl && supabasePublishableKey),
  demoMode: requestedDemoMode || !supabaseUrl || !supabasePublishableKey,
} as const;
