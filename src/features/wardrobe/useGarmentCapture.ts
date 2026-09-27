import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { analyzeGarmentImage } from './analyzeGarment';
import { analysisToDraft, manualGarmentDraft } from './draft';
import { discardStagedGarmentImage } from './stagedImage';
import { GarmentImageError, readPickedImage } from './pickedImage';
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
  const [manualFallback, setManualFallback] = useState(false);
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
    // Demo mode uses sample details and needs no photo bytes or network request.
    const image = isDemo
      ? { data: new ArrayBuffer(0), mimeType: 'image/jpeg' as const }
      : await readPickedImage(selected, Platform.OS === 'web');
    const result = await analyzeGarmentImage({
      ...image,
      userId,
      onStage: (value) => stage(value),
    });
    if (result.storagePath) staged.current.add(result.storagePath);
    if (!active.current) {
      if (result.storagePath) await discard(result.storagePath);
      return;
    }
    setManualFallback(result.manualFallback);
    setDraft(
      result.manualFallback
        ? manualGarmentDraft(result.storagePath, selected.uri)
        : { ...analysisToDraft(result.analysis, result.storagePath), imageUrl: selected.uri },
    );
    haptic('success');
  }
  async function choose(source: 'camera' | 'library') {
    if (operation.current) return;
    stage('picking');
    setError(null);
    try {
      const permission = Platform.OS === 'web' ? { granted: true } :
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
      const options: ImagePicker.ImagePickerOptions = {
        quality: 0.82,
        mediaTypes: ['images'],
        base64: Platform.OS !== 'web',
      };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      const selected = result.assets?.[0];
      if (!active.current || result.canceled || !selected) return;
      for (const path of staged.current) {
        await discard(path);
      }
      setAsset(selected);
      setDraft(null);
      setManualFallback(false);
      setSaved(null);
      await analyze(selected);
    } catch (failure) {
      if (active.current) setError(captureMessage(failure));
      console.warn('Garment capture or analysis did not complete.', failure);
    } finally {
      stage(null);
    }
  }
  async function retry() {
    if (!asset || operation.current) return;
    setError(null);
    try {
      await analyze(asset);
    } catch (failure) {
      if (active.current) setError(captureMessage(failure));
      console.warn('Garment analysis retry failed.', failure);
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
  return { asset, draft, setDraft, saved, busy, error, manualFallback, choose, retry, save, isDemo };
}

function captureMessage(failure: unknown) {
  if (!(failure instanceof GarmentImageError))
    return 'Could not open the photo picker. Try again or check camera/photo permissions.';
  switch (failure.kind) {
    case 'size': return 'This photo is over 12 MB. Choose a smaller photo.';
    case 'format': return 'This format is not supported. Choose a JPEG, PNG, or WebP photo.';
    case 'read': return 'We could not read this photo. Try again or choose a different photo.';
    case 'upload': return 'We could not upload the photo. Check your connection and sign-in, then try again.';
    case 'analysis': return 'The photo uploaded, but analysis is unavailable. Try again in a moment.';
  }
}
