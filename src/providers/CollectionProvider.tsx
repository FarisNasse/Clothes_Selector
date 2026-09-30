import {
  createContext, useContext, useEffect, useRef, useState, type PropsWithChildren,
} from 'react';
import {
  importDeviceCollection, listAccountCollection, setAccountFavorite, setAccountLook,
} from '@/features/collections/repository';
import {
  emptyCollection, readCollection, savedLook, writeCollection, type Collection,
} from '@/features/collections/storage';
import { useSession } from './SessionProvider';
import type { Occasion, OutfitRecommendation, WeatherContext } from '@/types/domain';

type Collections = Collection & {
  error: string | null;
  loading: boolean;
  retry: () => void;
  importAvailable: boolean;
  importFromDevice: () => Promise<number>;
  toggleFavorite: (id: string) => Promise<boolean>;
  removeLook: (id: string) => Promise<boolean>;
  toggleLook: (outfit: OutfitRecommendation, occasion: Occasion, weather: WeatherContext,
    requirements?: { coveredLegs: boolean; rainProtection: boolean }) => Promise<boolean>;
};
const Context = createContext<Collections | null>(null);

export function CollectionProvider({ children }: PropsWithChildren) {
  const { isDemo, session } = useSession();
  const owner = isDemo ? 'demo' : session?.user.id ?? 'signed-out';
  return <AccountCollection key={owner} owner={owner} connected={!isDemo && Boolean(session)}>
    {children}
  </AccountCollection>;
}

function AccountCollection({ owner, connected, children }: PropsWithChildren<{ owner: string; connected: boolean }>) {
  const [collection, setCollection] = useState<Collection>(emptyCollection);
  const current = useRef(collection);
  const legacy = useRef<Collection>(emptyCollection());
  const busy = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadEpoch, setLoadEpoch] = useState(0);
  const [importAvailable, setImportAvailable] = useState(false);
  const cacheOwner = connected ? 'account-cache:' + owner : owner;

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setReady(false);
      try {
        let cached = emptyCollection();
        try { cached = readCollection(localStorage, cacheOwner); }
        catch { if (!connected) throw new Error('Device storage unavailable'); }
        if (!active) return;
        current.current = cached;
        setCollection(cached);
        if (connected) {
          try { legacy.current = readCollection(localStorage, owner); }
          catch { legacy.current = emptyCollection(); }
        }
        if (connected) {
          const remote = await listAccountCollection(owner);
          if (!active) return;
          current.current = remote;
          setCollection(remote);
          setImportAvailable(Boolean(legacy.current.favorites.length || legacy.current.looks.length));
          try { writeCollection(localStorage, cacheOwner, remote); } catch { /* Remote is authoritative. */ }
        }
        setError(null);
        if (active) setReady(true);
      } catch {
        if (!active) return;
        setError(connected
          ? 'Showing cached looks and favorites read-only. Check your connection, then retry sync.'
          : 'Device storage is unavailable. Saved looks and favorites cannot be changed right now.');
        setReady(false);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [cacheOwner, connected, owner, loadEpoch]);

  async function commit(update: (value: Collection) => Collection, sync: (value: Collection) => Promise<void>) {
    if (!ready || busy.current) return false;
    busy.current = true;
    try {
      const next = update(current.current);
      if (connected) await sync(current.current);
      let cacheFailed = false;
      try {
        writeCollection(localStorage, cacheOwner, next);
      } catch {
        if (!connected) throw new Error('Device storage unavailable');
        cacheFailed = true;
        setError('Your change synced, but this device could not cache it.');
      }
      current.current = next;
      setCollection(next);
      if (!cacheFailed) setError(null);
      return true;
    } catch {
      setError(connected
        ? 'Could not sync that change. Check your connection and try again.'
        : 'Could not save on this device. Your previous collection is unchanged.');
      return false;
    } finally {
      busy.current = false;
    }
  }

  return <Context.Provider value={{
    ...collection, error, loading, importAvailable,
    retry: () => setLoadEpoch((value) => value + 1),
    importFromDevice: async () => {
      if (!connected || busy.current || !ready || !importAvailable) return 0;
      busy.current = true;
      try {
        const count = await importDeviceCollection(owner, legacy.current);
        const remote = await listAccountCollection(owner);
        current.current = remote;
        setCollection(remote);
        try {
          writeCollection(localStorage, cacheOwner, remote);
          writeCollection(localStorage, owner, emptyCollection());
          setImportAvailable(false);
          setError(null);
        } catch {
          setError('Imported to your account, but the old device copy could not be cleared.');
        }
        return count;
      } catch {
        setError('Could not import the old device collection. Try again while connected.');
        return 0;
      } finally { busy.current = false; }
    },
    removeLook: (id) => commit(
      (value) => ({ ...value, looks: value.looks.filter((item) => item.id !== id) }),
      async () => { if (connected) await setAccountLook(owner, id, false); },
    ),
    toggleFavorite: (id) => commit(
      (value) => ({ ...value, favorites: value.favorites.includes(id)
        ? value.favorites.filter((item) => item !== id) : [...value.favorites, id] }),
      async (value) => { if (connected) await setAccountFavorite(owner, id, !value.favorites.includes(id)); },
    ),
    toggleLook: (outfit, occasion, weather, requirements) => {
      const look = savedLook(outfit, occasion, weather, requirements);
      return commit(
        (value) => ({ ...value, looks: value.looks.some((item) => item.id === look.id)
          ? value.looks.filter((item) => item.id !== look.id) : [look, ...value.looks] }),
        async (value) => { if (connected) await setAccountLook(owner, look, !value.looks.some((item) => item.id === look.id)); },
      );
    },
  }}>{children}</Context.Provider>;
}

export function useCollection() {
  const value = useContext(Context);
  if (!value) throw new Error('CollectionProvider is required');
  return value;
}
