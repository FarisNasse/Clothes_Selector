import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  emptyCollection,
  readCollection,
  savedLook,
  writeCollection,
  type Collection,
} from '@/features/collections/storage';
import { useSession } from './SessionProvider';
import type { Occasion, OutfitRecommendation, WeatherContext } from '@/types/domain';
type Collections = Collection & {
  error: string | null;
  loading: boolean;
  toggleFavorite: (id: string) => boolean;
  removeLook: (id: string) => boolean;
  toggleLook: (
    outfit: OutfitRecommendation,
    occasion: Occasion,
    weather: WeatherContext,
  ) => boolean;
};
const Context = createContext<Collections | null>(null);
export function CollectionProvider({ children }: PropsWithChildren) {
  const { isDemo, session } = useSession();
  const owner = isDemo ? 'demo' : (session?.user.id ?? 'signed-out');
  // Remount the local state boundary whenever account identity changes.
  return (
    <AccountCollection key={owner} owner={owner}>
      {children}
    </AccountCollection>
  );
}
function AccountCollection({ owner, children }: PropsWithChildren<{ owner: string }>) {
  const [collection, setCollection] = useState<Collection>(emptyCollection);
  const current = useRef(collection);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      current.current = readCollection(localStorage, owner);
      setCollection(current.current);
    } catch {
      setError(
        'Device storage is unavailable. Saved looks and favorites cannot be changed right now.',
      );
    }
    setReady(true);
  }, [owner]);
  function commit(update: (value: Collection) => Collection) {
    if (!ready) return false;
    try {
      const next = update(current.current);
      writeCollection(localStorage, owner, next);
      current.current = next;
      setCollection(next);
      setError(null);
      return true;
    } catch {
      setError('We could not save on this device. Your previous collection is unchanged.');
      return false;
    }
  }
  return (
    <Context.Provider
      value={{
        ...collection,
        error,
        loading: !ready,
        removeLook: (id) =>
          commit((value) => ({ ...value, looks: value.looks.filter((item) => item.id !== id) })),
        toggleFavorite: (id) =>
          commit((value) => ({
            ...value,
            favorites: value.favorites.includes(id)
              ? value.favorites.filter((item) => item !== id)
              : [...value.favorites, id],
          })),
        toggleLook: (outfit, occasion, weather) => {
          const look = savedLook(outfit, occasion, weather);
          return commit((value) => ({
            ...value,
            looks: value.looks.some((item) => item.id === look.id)
              ? value.looks.filter((item) => item.id !== look.id)
              : [look, ...value.looks],
          }));
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCollection() {
  const value = useContext(Context);
  if (!value) throw new Error('CollectionProvider is required');
  return value;
}
