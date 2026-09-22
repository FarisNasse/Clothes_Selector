import { useRef, useState } from 'react';
import { View } from 'react-native';
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
import { useWardrobe } from '@/providers/WardrobeProvider';
import { useExperience } from '@/providers/ExperienceProvider';
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
  const [draft, setDraft] = useState(() => garmentToDraft(garment));
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null);
  const busyRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  async function save() {
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
    setBusy('save');
    setError(null);
    try {
      await editGarment(garment.id, checked.data);
      haptic('success');
      if (router.canGoBack()) router.back();
      else router.replace({ pathname: '/garment/[id]', params: { id: garment.id } });
    } catch {
      setError('We could not save these changes. Please try again.');
    } finally {
      busyRef.current = false;
      setBusy(null);
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
      <GarmentForm value={draft} onChange={setDraft} disabled={Boolean(busy)} />
      <View style={{ marginTop: 28, gap: 12 }}>
        {error && !confirm ? <Notice message={error} tone="error" /> : null}
        <Button
          label="Save changes"
          loading={busy === 'save'}
          disabled={busy === 'delete'}
          onPress={save}
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
