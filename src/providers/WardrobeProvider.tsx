import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { recordOutfitWear } from '@/features/recommendations/repository';
import { createGarment, listGarments } from '@/features/wardrobe/repository';
import { useSession } from '@/providers/SessionProvider';
import type { Garment, GarmentDraft, Occasion, OutfitRecommendation, WeatherContext } from '@/types/domain';

type WardrobeContextValue = {
  garments: Garment[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addGarment: (draft: GarmentDraft) => Promise<Garment>;
  recordWear: (recommendation: OutfitRecommendation, occasion: Occasion, weather: WeatherContext) => Promise<void>;
};

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export function WardrobeProvider({ children }: PropsWithChildren) {
  const { session, isDemo } = useSession();
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setGarments(await listGarments(isDemo ? 'demo-user' : session?.user.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load wardrobe.');
    } finally {
      setLoading(false);
    }
  }, [isDemo, session?.user.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addGarment = useCallback(
    async (draft: GarmentDraft) => {
      const userId = isDemo ? 'demo-user' : session?.user.id;
      if (!userId) throw new Error('You must be signed in to add a garment.');
      const garment = await createGarment(userId, draft);
      setGarments((current) => [garment, ...current]);
      return garment;
    },
    [isDemo, session?.user.id],
  );

  const recordWear = useCallback(
    async (recommendation: OutfitRecommendation, occasion: Occasion, weather: WeatherContext) => {
      const userId = isDemo ? 'demo-user' : session?.user.id;
      if (!userId) throw new Error('You must be signed in to record an outfit.');

      await recordOutfitWear({ userId, recommendation, occasion, weather });

      if (isDemo) {
        const wornIds = new Set(recommendation.garments.map((garment) => garment.id));
        const timestamp = new Date().toISOString();
        setGarments((current) =>
          current.map((garment) =>
            wornIds.has(garment.id)
              ? { ...garment, wearCount: garment.wearCount + 1, lastWornAt: timestamp }
              : garment,
          ),
        );
        return;
      }

      await refresh();
    },
    [isDemo, refresh, session?.user.id],
  );

  const value = useMemo(
    () => ({ garments, loading, error, refresh, addGarment, recordWear }),
    [addGarment, error, garments, loading, recordWear, refresh],
  );

  return <WardrobeContext.Provider value={value}>{children}</WardrobeContext.Provider>;
}

export function useWardrobe() {
  const value = useContext(WardrobeContext);
  if (!value) throw new Error('useWardrobe must be used inside WardrobeProvider');
  return value;
}
