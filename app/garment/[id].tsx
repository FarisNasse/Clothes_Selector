import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { GarmentHero } from '@/components/garment/GarmentHero';
import { StylingStudio } from '@/components/styling/StylingStudio';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/primitives/EmptyState';
import { IconButton } from '@/components/primitives/IconButton';
import { Notice } from '@/components/primitives/Notice';
import { OutfitSkeleton } from '@/components/primitives/Skeleton';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { useCollection } from '@/providers/CollectionProvider';
import { useExperience } from '@/providers/ExperienceProvider';
export default function GarmentDetailScreen() {
  const { id, style } = useLocalSearchParams<{ id: string; style?: string }>();
  const { garments, loading, error, refresh } = useWardrobe();
  const { favorites, toggleFavorite, error: collectionError } = useCollection();
  const { colors: c, haptic } = useExperience();
  const [styling, setStyling] = useState(style === '1');
  useEffect(() => setStyling(style === '1'), [id, style]);
  const garment = garments.find((item) => item.id === id);
  if (loading && !garment)
    return (
      <Screen>
        <OutfitSkeleton />
      </Screen>
    );
  if (error && !garment)
    return (
      <Screen>
        <Notice
          message="We could not load this piece."
          tone="error"
          action="Try again"
          onAction={refresh}
        />
      </Screen>
    );
  if (!garment)
    return (
      <Screen>
        <EmptyState
          title="This piece has moved on."
          detail="It is no longer in your wardrobe."
          actionLabel="Back to wardrobe"
          onAction={() => router.replace('/(tabs)/wardrobe')}
        />
      </Screen>
    );
  return (
    <Screen>
      {styling ? (
        <View style={{ paddingTop: 16, gap: 18 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <AppText variant="eyebrow">Styling / {garment.name}</AppText>
            <Button
              label="Back to garment"
              icon="arrow-back"
              variant="quiet"
              onPress={() => setStyling(false)}
            />
          </View>
          <StylingStudio key={garment.id} anchorId={garment.id} />
        </View>
      ) : (
        <>
          <GarmentHero
            garment={garment}
            actions={
              <View style={{ gap: 12 }}>
                <Button
                  label="Style this"
                  icon="sparkles-outline"
                  onPress={() => {
                    setStyling(true);
                    haptic();
                  }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Edit details"
                      variant="secondary"
                      icon="create-outline"
                      onPress={() =>
                        router.push({ pathname: '/garment/edit/[id]', params: { id: garment.id } })
                      }
                    />
                  </View>
                  <IconButton
                    label={
                      favorites.includes(garment.id) ? 'Unfavorite garment' : 'Favorite garment'
                    }
                    icon={favorites.includes(garment.id) ? 'heart' : 'heart-outline'}
                    selected={favorites.includes(garment.id)}
                    onPress={() => {
                      if (toggleFavorite(garment.id)) haptic();
                    }}
                  />
                </View>
              </View>
            }
          />
          <View style={{ marginTop: 44, gap: 22 }}>
            <AppText variant="eyebrow">The finer details</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
              {[
                ['Feel', garment.fit + ' / ' + garment.pattern],
                [
                  'Dressiness',
                  garment.formality <= 3
                    ? 'Easygoing'
                    : garment.formality <= 6
                      ? 'Smart casual'
                      : 'Dressed up',
                ],
                [
                  'Warmth',
                  garment.warmth <= 3
                    ? 'Lightweight'
                    : garment.warmth <= 6
                      ? 'A little warmth'
                      : 'For colder days',
                ],
                ['Season', garment.seasons.join(' / ')],
                ['Weather', garment.waterproof ? 'Water resistant' : 'Best on dry days'],
                ['Colors', [garment.primaryColor, ...garment.secondaryColors].join(' / ')],
              ].map(([label, value]) => (
                <View
                  key={label}
                  style={{
                    flexBasis: '45%',
                    flexGrow: 1,
                    borderTopWidth: 1,
                    borderTopColor: c.border.subtle,
                    paddingVertical: 16,
                    gap: 5,
                  }}
                >
                  <AppText variant="metadata">{label}</AppText>
                  <AppText variant="bodySmall" style={{ textTransform: 'capitalize' }}>
                    {value}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
      {collectionError ? <Notice message={collectionError} tone="error" /> : null}
    </Screen>
  );
}
