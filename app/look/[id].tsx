import { useLocalSearchParams, router } from 'expo-router';
import { View } from 'react-native';
import { Screen } from '@/components/Screen';
import { PageHeading } from '@/components/navigation/PageHeading';
import { EmptyState } from '@/components/primitives/EmptyState';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { OutfitSkeleton } from '@/components/primitives/Skeleton';
import { StylingStudio } from '@/components/styling/StylingStudio';
import { useCollection } from '@/providers/CollectionProvider';
import { useSession } from '@/providers/SessionProvider';
import { useWardrobe } from '@/providers/WardrobeProvider';
export default function SavedLookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { looks, removeLook, loading: collectionLoading, error: collectionError, retry } = useCollection();
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
      ) : look && missing ? (
        <View style={{ gap: 16 }}>
          <AppText variant="title">A piece is missing.</AppText>
          <AppText variant="muted">{missing} original piece{missing === 1 ? '' : 's'} no longer in your wardrobe. Start with a remaining piece, make a new look, then save it for {look.occasion.replace('_', ' ')}.</AppText>
          {look.garmentIds.some((garmentId) => garments.some((item) => item.id === garmentId)) ?
            <Button label="Restyle from a remaining piece" onPress={() => {
              const first = look.garmentIds.find((garmentId) => garments.some((item) => item.id === garmentId))!;
              router.push({ pathname: '/garment/[id]', params: { id: first, style: '1' } });
            }} /> : null}
          <Button label="Remove the old look" variant="secondary" onPress={async () => {
            if (await removeLook(look.id)) router.replace('/(tabs)/wardrobe');
          }} />
        </View>
      ) : (
        <EmptyState
          title="This look is no longer saved."
          detail="Browse your wardrobe to find a new combination."
          actionLabel="Find a new look"
          onAction={() => router.replace('/(tabs)')}
        />
      )}
    </Screen>
  );
}
