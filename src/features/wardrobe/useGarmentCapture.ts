import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { analyzeGarmentImage } from './analyzeGarment';
import { analysisToDraft } from './draft';
import { discardStagedGarmentImage } from './stagedImage';
import { garmentDraftSchema } from './validation';
import { useSession } from '@/providers/SessionProvider';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { useExperience } from '@/providers/ExperienceProvider';
import type { Garment, GarmentDraft } from '@/types/domain';

type Busy = 'picking' | 'uploading' | 'analyzing' | 'saving' | null;
export function useGarmentCapture() {
  const { session, isDemo } = useSession();
  const { addGarment } = useWardrobe();
  const { haptic } = useExperience();
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [draft, setDraft] = useState<GarmentDraft | null>(null);
  const [saved, setSaved] = useState<Garment | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(true);
  const operation = useRef<Busy>(null);
  const staged = useRef(new Set<string>());
  async function discard(path: string) {
    try {
      await discardStagedGarmentImage(path);
      staged.current.delete(path);
    } catch {
      console.warn('Could not discard an unused garment image.');
    }
  }
  useEffect(() => {
    active.current = true;
    const paths = staged.current;
    return () => {
      active.current = false;
      // Saving owns the image until it succeeds or fails, even if the view closes.
      if (operation.current !== 'saving')
        for (const path of paths) {
          void discardStagedGarmentImage(path).catch(() => {});
        }
    };
  }, []);
  function stage(next: Busy) {
    operation.current = next;
    if (active.current) setBusy(next);
  }
  async function analyze(selected: ImagePicker.ImagePickerAsset) {
    const userId = isDemo ? 'demo-user' : session?.user.id;
    if (!userId) throw new Error('Authentication required');
    stage('uploading');
    const result = await analyzeGarmentImage({
      uri: selected.uri,
      mimeType: selected.mimeType ?? null,
      userId,
      onStage: (value) => stage(value),
    });
    if (result.storagePath) staged.current.add(result.storagePath);
    if (!active.current) {
      if (result.storagePath) await discard(result.storagePath);
      return;
    }
    setDraft({ ...analysisToDraft(result.analysis, result.storagePath), imageUrl: selected.uri });
    haptic('success');
  }
  async function choose(source: 'camera' | 'library') {
    if (operation.current) return;
    stage('picking');
    setError(null);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        if (active.current)
          setError(
            source === 'camera'
              ? 'Allow camera access in your device settings, or choose a photo instead.'
              : 'Allow photo access in your device settings to choose a garment.',
          );
        return;
      }
      const options: ImagePicker.ImagePickerOptions = { quality: 0.82, mediaTypes: ['images'] };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      const selected = result.assets?.[0];
      if (!active.current || result.canceled || !selected) return;
      if (selected.fileSize && selected.fileSize > 12 * 1024 * 1024) {
        setError('Choose a photo smaller than 12 MB.');
        return;
      }
      for (const path of staged.current) {
        await discard(path);
      }
      setAsset(selected);
      setDraft(null);
      setSaved(null);
      await analyze(selected);
    } catch {
      if (active.current)
        setError('We could not read this photo. Try again or choose a different photo.');
      console.warn('Garment capture or analysis did not complete.');
    } finally {
      stage(null);
    }
  }
  async function retry() {
    if (!asset || operation.current) return;
    setError(null);
    try {
      await analyze(asset);
    } catch {
      if (active.current)
        setError('We could not read this photo. Try another image with a plain background.');
    } finally {
      stage(null);
    }
  }
  async function save() {
    if (!draft || operation.current) return;
    const result = garmentDraftSchema.safeParse(draft);
    if (!result.success) {
      setError(
        'Please check your details: ' +
          [...new Set(result.error.issues.map((item) => item.path[0]))].join(', ') +
          '.',
      );
      return;
    }
    stage('saving');
    setError(null);
    try {
      const garment = await addGarment(result.data);
      if (draft.storagePath) staged.current.delete(draft.storagePath);
      if (active.current) {
        setSaved(garment);
        setDraft(null);
        haptic('success');
      }
    } catch {
      if (active.current)
        setError('We could not add this piece. Your details are still here; please try again.');
    } finally {
      stage(null);
      if (!active.current)
        for (const path of staged.current) {
          await discard(path);
        }
    }
  }
  return { asset, draft, setDraft, saved, busy, error, choose, retry, save, isDemo };
}
