import { useEffect, useRef, useState } from 'react';
import type { ImagePickerAsset } from 'expo-image-picker';
import { manualGarmentDraft } from './draft';
import { discardStagedGarmentImage } from './stagedImage';
import { photoErrorMessage } from './pickedImage';
import { pickGarmentPhoto, uploadGarmentPhoto } from './photo';
import { garmentDraftSchema } from './validation';
import { useSession } from '@/providers/SessionProvider';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { useExperience } from '@/providers/ExperienceProvider';
import type { Garment, GarmentDraft } from '@/types/domain';

type Busy = 'picking' | 'saving' | null;

export function useGarmentCapture() {
  const { session, isDemo } = useSession();
  const { addGarment } = useWardrobe();
  const { haptic } = useExperience();
  const [asset, setAsset] = useState<ImagePickerAsset | null>(null);
  const [draft, setDraft] = useState<GarmentDraft>(manualGarmentDraft);
  const [formVersion, setFormVersion] = useState(0);
  const [saved, setSaved] = useState<Garment | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const active = useRef(true);
  const operation = useRef<Busy>(null);
  const unused = useRef(new Set<string>());
  const uploaded = useRef<{ uri: string; path: string } | null>(null);

  async function discard(path: string) {
    try {
      await discardStagedGarmentImage(path);
      unused.current.delete(path);
    } catch {
      console.warn('Could not discard an unused garment image.');
    }
  }
  useEffect(() => {
    active.current = true;
    const paths = unused.current;
    return () => {
      active.current = false;
      // A save in flight owns cleanup once its database result is known.
      if (operation.current !== 'saving')
        for (const path of paths) discardStagedGarmentImage(path).catch(() => {});
    };
  }, []);
  function stage(next: Busy) {
    operation.current = next;
    if (active.current) setBusy(next);
  }
  function clearPhoto() {
    if (operation.current) return;
    const previous = uploaded.current;
    uploaded.current = null;
    if (previous) void discard(previous.path);
    setAsset(null);
    setPhotoError(null);
  }
  async function choose(source: 'camera' | 'library') {
    if (operation.current) return;
    stage('picking');
    setError(null);
    setPhotoError(null);
    try {
      const selected = await pickGarmentPhoto(source);
      if (!active.current || !selected) return;
      const previous = uploaded.current;
      uploaded.current = null;
      if (previous) void discard(previous.path);
      setAsset(selected);
    } catch (failure) {
      if (active.current)
        setPhotoError(failure instanceof Error && !(failure.name === 'GarmentImageError')
          ? failure.message
          : photoErrorMessage(failure));
    } finally {
      stage(null);
    }
  }
  async function save(withPhoto = true) {
    if (operation.current || saved) return;
    const checked = garmentDraftSchema.safeParse(draft);
    if (!checked.success) {
      setError('Please check your details: ' +
        [...new Set(checked.error.issues.map((item) => item.path[0]))].join(', ') + '.');
      return;
    }
    const userId = isDemo ? 'demo-user' : session?.user.id;
    if (!userId) {
      setError('Sign in before adding a piece to your wardrobe.');
      return;
    }
    stage('saving');
    setError(null);
    setPhotoError(null);
    let path: string | null = null;
    let inserting = false;
    try {
      if (withPhoto && asset) {
        path = uploaded.current?.uri === asset.uri ? uploaded.current.path : null;
        if (!path) {
          path = await uploadGarmentPhoto(asset, userId);
          if (path) {
            unused.current.add(path);
            uploaded.current = { uri: asset.uri, path };
          }
        }
      }
      if (!active.current) return;
      const values = { ...checked.data, storagePath: path, imageUrl: null, aiConfidence: null };
      inserting = true;
      const garment = await addGarment(values);
      if (path) unused.current.delete(path);
      if (!withPhoto && uploaded.current) void discard(uploaded.current.path);
      uploaded.current = null;
      if (active.current) {
        setSaved(garment);
        setAsset(null);
        haptic('success');
      }
    } catch (failure) {
      if (active.current) {
        if (!inserting && withPhoto && asset) setPhotoError(photoErrorMessage(failure));
        else setError('We could not add this piece. Your details are still here; please try again.');
      }
    } finally {
      stage(null);
      if (!active.current)
        for (const unusedPath of unused.current) await discard(unusedPath);
    }
  }
  function addAnother() {
    if (operation.current) return;
    setDraft(manualGarmentDraft());
    setFormVersion((version) => version + 1);
    setSaved(null);
    setAsset(null);
    setError(null);
    setPhotoError(null);
  }
  return { asset, draft, setDraft, formVersion, saved, busy, error, photoError, choose, clearPhoto, save, addAnother, isDemo };
}
