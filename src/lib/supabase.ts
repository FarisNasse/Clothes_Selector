import 'react-native-url-polyfill/auto';
import '@/lib/installStorage';

import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { env } from '@/lib/env';

export const supabase = env.isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabasePublishableKey, {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        // Supabase exchanges email confirmation and recovery links automatically in a browser.
        // Native links are exchanged by SessionProvider after Expo Linking receives the URL.
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;
