import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { recordOutfitWear } from '@/features/recommendations/repository';
import { createGarment, deleteGarment, listGarments, recordDemoWear, updateGarment } from '@/features/wardrobe/repository';
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
  recordWear: (recommendation: OutfitRecommendation, occasion: Occasion, weather: WeatherContext,
    requestId: string, requirements: { coveredLegs: boolean; rainProtection: boolean }) => Promise<void>;
};

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export function WardrobeProvider({ children }: PropsWithChildren) {
  const { session, isDemo } = useSession();
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastImageRefresh = useRef(Date.now());

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setGarments(await listGarments(isDemo ? 'demo-user' : session?.user.id));
      lastImageRefresh.current = Date.now();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load wardrobe.');
    } finally {
      setLoading(false);
    }
  }, [isDemo, session?.user.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    if (isDemo || !session?.user.id) return;
    async function refreshImages() {
      try {
        const next = await listGarments(session?.user.id);
        setGarments(next);
        lastImageRefresh.current = Date.now();
      } catch { /* Keep the last wardrobe and its illustration fallback while offline. */ }
    }
    const timer = setInterval(() => { void refreshImages(); }, 45 * 60 * 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && Date.now() - lastImageRefresh.current > 40 * 60 * 1000)
        void refreshImages();
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [isDemo, session?.user.id]);

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

      const garment = await updateGarment(userId, garmentId, draft);
      setGarments((current) => current.map((item) => (item.id === garmentId ? garment : item)));
      return garment;
    },
    [isDemo, session?.user.id],
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
    async (recommendation: OutfitRecommendation, occasion: Occasion, weather: WeatherContext,
      requestId: string, requirements: { coveredLegs: boolean; rainProtection: boolean }) => {
      const userId = isDemo ? 'demo-user' : session?.user.id;
      if (!userId) throw new Error('You must be signed in to record an outfit.');

      await recordOutfitWear({ userId, recommendation, occasion, weather, requestId, requirements });

      if (isDemo) {
        const wornIds = new Set(recommendation.garments.map((garment) => garment.id));
        const timestamp = new Date().toISOString();
        recordDemoWear([...wornIds], timestamp);
        setGarments((current) =>
          current.map((garment) =>
            wornIds.has(garment.id)
              ? { ...garment, wearCount: garment.wearCount + 1, lastWornAt: timestamp }
              : garment,
          ),
        );
        return;
      }

      // The RPC is the commit boundary. A failed refresh cannot invite a second wear.
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
