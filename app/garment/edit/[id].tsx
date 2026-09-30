import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import type { ImagePickerAsset } from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { PageHeading } from '@/components/navigation/PageHeading';
import { GarmentForm } from '@/components/garment/GarmentForm';
import { BottomSheet } from '@/components/sheets/BottomSheet';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/primitives/EmptyState';
import { Notice } from '@/components/primitives/Notice';
import { OutfitSkeleton } from '@/components/primitives/Skeleton';
import { garmentToDraft } from '@/features/wardrobe/draft';
import { garmentDraftSchema } from '@/features/wardrobe/validation';
import { photoErrorMessage } from '@/features/wardrobe/pickedImage';
import { pickGarmentPhoto, uploadGarmentPhoto } from '@/features/wardrobe/photo';
import { discardStagedGarmentImage } from '@/features/wardrobe/stagedImage';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { useExperience } from '@/providers/ExperienceProvider';
import { useSession } from '@/providers/SessionProvider';
import type { Garment } from '@/types/domain';
export default function EditGarmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { garments, loading } = useWardrobe();
  const garment = garments.find((item) => item.id === id);
  if (loading && !garment)
    return (
      <Screen>
        <OutfitSkeleton />
      </Screen>
    );
  if (!garment)
    return (
      <Screen>
        <EmptyState
          title="This piece is not here."
          detail="Choose another piece from your wardrobe."
          actionLabel="Back to wardrobe"
          onAction={() => router.replace('/(tabs)/wardrobe')}
        />
      </Screen>
    );
  return <GarmentEditor key={garment.id} garment={garment} />;
}
function GarmentEditor({ garment }: { garment: Garment }) {
  const { editGarment, removeGarment } = useWardrobe();
  const { haptic } = useExperience();
  const { session, isDemo } = useSession();
  const [draft, setDraft] = useState(() => garmentToDraft(garment));
  const [asset, setAsset] = useState<ImagePickerAsset | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'pick' | 'save' | 'delete' | null>(null);
  const busyRef = useRef(false);
  const saving = useRef(false);
  const active = useRef(true);
  const unused = useRef(new Set<string>());
  const uploaded = useRef<{ uri: string; path: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
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
      if (!saving.current)
        for (const path of paths) discardStagedGarmentImage(path).catch(() => {});
    };
  }, []);
  async function choose(source: 'camera' | 'library') {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy('pick');
    setPhotoError(null);
    try {
      const selected = await pickGarmentPhoto(source);
      if (!active.current || !selected) return;
      if (uploaded.current) void discard(uploaded.current.path);
      uploaded.current = null;
      setAsset(selected);
      setRemovePhoto(false);
    } catch (failure) {
      if (active.current)
        setPhotoError(failure instanceof Error && failure.name !== 'GarmentImageError'
          ? failure.message : photoErrorMessage(failure));
    } finally {
      busyRef.current = false;
      if (active.current) setBusy(null);
    }
  }
  function clearPhoto() {
    if (busyRef.current) return;
    if (uploaded.current) void discard(uploaded.current.path);
    uploaded.current = null;
    setAsset(null);
    setRemovePhoto(true);
    setPhotoError(null);
  }
  async function save(ignoreSelectedPhoto = false) {
    if (busyRef.current) return;
    const checked = garmentDraftSchema.safeParse(draft);
    if (!checked.success) {
      setError(
        'Please check your details: ' +
          [...new Set(checked.error.issues.map((item) => item.path[0]))].join(', ') +
          '.',
      );
      return;
    }
    busyRef.current = true;
    saving.current = true;
    setBusy('save');
    setError(null);
    setPhotoError(null);
    let updating = false;
    try {
      let path = removePhoto ? null : garment.storagePath;
      if (asset && !ignoreSelectedPhoto) {
        path = uploaded.current?.uri === asset.uri ? uploaded.current.path
          : await uploadGarmentPhoto(asset, isDemo ? 'demo-user' : session?.user.id ?? '');
        if (path && uploaded.current?.path !== path) {
          unused.current.add(path);
          uploaded.current = { uri: asset.uri, path };
        }
      }
      if (!active.current) return;
      updating = true;
      await editGarment(garment.id, {
        ...checked.data,
        storagePath: path,
        imageUrl: isDemo ? (removePhoto || ignoreSelectedPhoto ? null : asset?.uri ?? garment.imageUrl)
          : path === garment.storagePath ? garment.imageUrl : null,
        aiConfidence: null,
      });
      if (path) unused.current.delete(path);
      if (garment.storagePath && garment.storagePath !== path) void discard(garment.storagePath);
      if (uploaded.current && uploaded.current.path !== path) void discard(uploaded.current.path);
      uploaded.current = null;
      haptic('success');
      if (router.canGoBack()) router.back();
      else router.replace({ pathname: '/garment/[id]', params: { id: garment.id } });
    } catch (failure) {
      if (active.current) {
        if (!updating && asset && !ignoreSelectedPhoto) setPhotoError(photoErrorMessage(failure));
        else setError('We could not save these changes. Your details are still here; please try again.');
      }
    } finally {
      busyRef.current = false;
      saving.current = false;
      if (active.current) setBusy(null);
      else for (const path of unused.current) await discard(path);
    }
  }
  async function remove() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy('delete');
    setError(null);
    try {
      await removeGarment(garment.id);
      setConfirm(false);
      router.replace('/(tabs)/wardrobe');
    } catch {
      setError('We could not remove this piece. Please try again.');
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  }
  return (
    <Screen maxWidth={760}>
      <PageHeading eyebrow="The details" title="A little refinement." detail={garment.name} />
      <View style={{ gap: 12, marginBottom: 24 }}>
        <AppText variant="eyebrow">PHOTO · OPTIONAL</AppText>
        {asset || (!removePhoto && garment.imageUrl) ? (
          <Image source={{ uri: asset?.uri ?? garment.imageUrl! }} contentFit="contain"
            style={{ width: '100%', height: 240, borderRadius: 20 }} />
        ) : <AppText variant="muted">This piece has no photo. You can add one at any time.</AppText>}
        <Button label="Take photo" variant="secondary" disabled={Boolean(busy)}
          onPress={() => choose('camera')} />
        <Button label="Choose photo" variant="secondary" disabled={Boolean(busy)}
          onPress={() => choose('library')} />
        {asset || (!removePhoto && garment.storagePath) ? (
          <Button label="Remove photo" variant="quiet" disabled={Boolean(busy)} onPress={clearPhoto} />
        ) : null}
        {photoError ? (
          <View style={{ gap: 10 }}>
            <Notice message={photoError} tone="error" />
            <Button label="Retry photo" variant="secondary" disabled={Boolean(busy)}
              onPress={() => save()} />
            <Button label={garment.storagePath ? 'Save without new photo' : 'Save without photo'}
              variant="quiet" disabled={Boolean(busy)} onPress={() => save(true)} />
          </View>
        ) : null}
      </View>
      <GarmentForm value={draft} onChange={setDraft} disabled={Boolean(busy)} />
      <View style={{ marginTop: 28, gap: 12 }}>
        {error && !confirm ? <Notice message={error} tone="error" /> : null}
        <Button
          label="Save changes"
          loading={busy === 'save'}
          disabled={Boolean(busy) && busy !== 'save'}
          onPress={() => save()}
        />
        <Button
          label="Delete garment"
          variant="quiet"
          disabled={Boolean(busy)}
          onPress={() => setConfirm(true)}
        />
      </View>
      <BottomSheet
        visible={confirm}
        title="Remove this piece?"
        onClose={() => {
          if (!busy) setConfirm(false);
        }}
      >
        <AppText variant="muted">
          {garment.name} and its photo will be removed from your wardrobe. This cannot be undone.
        </AppText>
        {error ? <Notice message={error} tone="error" /> : null}
        <Button
          label="Delete garment permanently"
          variant="danger"
          loading={busy === 'delete'}
          onPress={remove}
        />
        <Button
          label="Keep this piece"
          variant="quiet"
          disabled={Boolean(busy)}
          onPress={() => setConfirm(false)}
        />
      </BottomSheet>
    </Screen>
  );
}
