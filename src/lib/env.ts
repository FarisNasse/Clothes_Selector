// A connected build must explicitly select its project. Public keys are safe to ship,
// but silently falling back to a production project is not safe for staging data.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
const demoMode = process.env.EXPO_PUBLIC_DEMO_MODE !== 'false';
const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';
if (!demoMode && (!supabaseUrl || !supabasePublishableKey)) {
  throw new Error('Connected mode requires EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
}
if (appEnv === 'production' && demoMode) {
  throw new Error('Production builds must explicitly set EXPO_PUBLIC_DEMO_MODE=false.');
}

export const env = {
  appEnv,
  supabaseUrl,
  supabasePublishableKey,
  isSupabaseConfigured: Boolean(supabaseUrl && supabasePublishableKey),
  demoMode,
} as const;
