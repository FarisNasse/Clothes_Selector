import type { Session } from '@supabase/supabase-js';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { friendlyAuthError } from '@/features/auth/errors';
import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';

type SessionContextValue = {
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function authRedirect(path: 'sign-in' | 'reset-password') {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/${path}`;
  }
  return Linking.createURL(`/${path}`);
}

async function applyNativeAuthLink(url: string) {
  if (!supabase || Platform.OS === 'web') return;
  const parsed = new URL(url);
  const query = new URLSearchParams(parsed.search);
  const fragment = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const code = query.get('code');
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    return;
  }
  const accessToken = fragment.get('access_token');
  const refreshToken = fragment.get('refresh_token');
  if (accessToken && refreshToken) {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  }
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!env.demoMode);
  const linkingUrl = Linking.useLinkingURL();

  useEffect(() => {
    if (linkingUrl) void applyNativeAuthLink(linkingUrl).catch(() => {});
  }, [linkingUrl]);

  useEffect(() => {
    if (env.demoMode || !supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      loading,
      isDemo: env.demoMode,
      signIn: async (email, password) => {
        if (!supabase) return 'Supabase is not configured.';
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return friendlyAuthError(error, 'sign-in');
      },
      signUp: async (email, password) => {
        if (!supabase) return 'Supabase is not configured.';
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: authRedirect('sign-in') },
        });
        return friendlyAuthError(error, 'sign-up');
      },
      requestPasswordReset: async (email) => {
        if (!supabase) return 'Supabase is not configured.';
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: authRedirect('reset-password'),
        });
        return friendlyAuthError(error, 'reset');
      },
      updatePassword: async (password) => {
        if (!supabase) return 'Supabase is not configured.';
        const { error } = await supabase.auth.updateUser({ password });
        return friendlyAuthError(error, 'update');
      },
      signOut: async () => {
        if (supabase) {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
        }
      },
    }),
    [loading, session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
