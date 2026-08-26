import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { recordOutfitWear } from '@/features/recommendations/repository';
import { createGarment, deleteGarment, listGarments, updateGarment } from '@/features/wardrobe/repository';
import { useSession } from '@/providers/SessionProvider';
import type { Garment, GarmentDraft, Occasion, OutfitRecommendation, WeatherContext } from '@/types/domain';

type WardrobeContextValue = {
  garments: Garment[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addGarment: (draft: GarmentDraft) => Promise<Garment>;
  editGarment: (garmentId: string, draft: GarmentDraft) => Promise<Garment>;
  removeGarment: (garmentId: string) => Promise<void>;
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

  const editGarment = useCallback(
    async (garmentId: string, draft: GarmentDraft) => {
      const userId = isDemo ? 'demo-user' : session?.user.id;
      if (!userId) throw new Error('You must be signed in to edit a garment.');

      if (isDemo) {
        const currentGarment = garments.find((garment) => garment.id === garmentId);
        if (!currentGarment) throw new Error('Garment not found.');
        const updated: Garment = { ...currentGarment, ...draft };
        setGarments((current) => current.map((garment) => (garment.id === garmentId ? updated : garment)));
        return updated;
      }

      const garment = await updateGarment(userId, garmentId, draft);
      setGarments((current) => current.map((item) => (item.id === garmentId ? garment : item)));
      return garment;
    },
    [garments, isDemo, session?.user.id],
  );

  const removeGarment = useCallback(
    async (garmentId: string) => {
      const userId = isDemo ? 'demo-user' : session?.user.id;
      if (!userId) throw new Error('You must be signed in to delete a garment.');
      const garment = garments.find((item) => item.id === garmentId);
      if (!garment) throw new Error('Garment not found.');
      await deleteGarment(userId, garment);
      setGarments((current) => current.filter((item) => item.id !== garmentId));
    },
    [garments, isDemo, session?.user.id],
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
    () => ({ garments, loading, error, refresh, addGarment, editGarment, removeGarment, recordWear }),
    [addGarment, editGarment, error, garments, loading, recordWear, refresh, removeGarment],
  );

  return <WardrobeContext.Provider value={value}>{children}</WardrobeContext.Provider>;
}

export function useWardrobe() {
  const value = useContext(WardrobeContext);
  if (!value) throw new Error('useWardrobe must be used inside WardrobeProvider');
  return value;
}
