import type { Session } from '@supabase/supabase-js';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';

type SessionContextValue = {
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!env.demoMode);

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
        return error?.message ?? null;
      },
      signUp: async (email, password) => {
        if (!supabase) return 'Supabase is not configured.';
        const { error } = await supabase.auth.signUp({ email, password });
        return error?.message ?? null;
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
