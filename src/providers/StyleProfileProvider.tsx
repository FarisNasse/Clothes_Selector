import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getStyleProfile, neutralStyleProfile, saveStyleProfile } from '@/features/style/repository';
import { demoStyleProfile } from '@/fixtures/demoWardrobe';
import { useSession } from '@/providers/SessionProvider';
import type { StyleProfile } from '@/types/domain';

type StyleProfileContextValue = {
  profile: StyleProfile;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: (profile: StyleProfile) => Promise<void>;
};

const StyleProfileContext = createContext<StyleProfileContextValue | null>(null);

export function StyleProfileProvider({ children }: PropsWithChildren) {
  const { session, isDemo } = useSession();
  const [profile, setProfile] = useState<StyleProfile>(isDemo ? demoStyleProfile : neutralStyleProfile);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setProfile(await getStyleProfile(isDemo ? 'demo-user' : session?.user.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load style preferences.');
    } finally {
      setLoading(false);
    }
  }, [isDemo, session?.user.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async (nextProfile: StyleProfile) => {
    const userId = isDemo ? 'demo-user' : session?.user.id;
    if (!userId) throw new Error('You must be signed in to save style preferences.');
    const persisted = await saveStyleProfile(userId, nextProfile);
    setProfile(persisted);
  }, [isDemo, session?.user.id]);

  const value = useMemo(
    () => ({ profile, loading, error, refresh, save }),
    [error, loading, profile, refresh, save],
  );

  return <StyleProfileContext.Provider value={value}>{children}</StyleProfileContext.Provider>;
}

export function useStyleProfile() {
  const value = useContext(StyleProfileContext);
  if (!value) throw new Error('useStyleProfile must be used inside StyleProfileProvider');
  return value;
}
