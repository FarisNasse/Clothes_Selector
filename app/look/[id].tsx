import { useLocalSearchParams, router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { PageHeading } from '@/components/navigation/PageHeading';
import { EmptyState } from '@/components/primitives/EmptyState';
import { OutfitSkeleton } from '@/components/primitives/Skeleton';
import { StylingStudio } from '@/components/styling/StylingStudio';
import { useCollection } from '@/providers/CollectionProvider';
import { useSession } from '@/providers/SessionProvider';
import { useWardrobe } from '@/providers/WardrobeProvider';
export default function SavedLookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { looks, loading: collectionLoading, error: collectionError, retry } = useCollection();
  const { isDemo } = useSession();
  const { garments, loading } = useWardrobe();
  const look = looks.find((item) => item.id === id);
  if (loading || collectionLoading)
    return (
      <Screen>
        <OutfitSkeleton />
      </Screen>
    );
  if (collectionError && !look)
    return <Screen><EmptyState title="Saved looks are unavailable."
      detail={collectionError} actionLabel="Try again" onAction={retry} /></Screen>;
  const missing =
    look?.garmentIds.filter((garmentId) => !garments.some((item) => item.id === garmentId))
      .length ?? 0;
  return (
    <Screen>
      <PageHeading eyebrow={isDemo ? 'Saved on this device' : 'Saved to your account'} title="Worth another wear." />
      {look && !missing ? (
        <StylingStudio initialLook={look} />
      ) : (
        <EmptyState
          title={missing ? 'A piece is missing.' : 'This look is no longer saved.'}
          detail={
            missing
              ? missing +
                ' of the original pieces are no longer in your wardrobe. Build a fresh look from the pieces you have.'
              : 'Browse your wardrobe to find a new combination.'
          }
          actionLabel="Find a new look"
          onAction={() => router.replace('/(tabs)')}
        />
      )}
    </Screen>
  );
}
