import { useEffect, useState } from 'react';
import { Modal, ScrollView, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { GarmentHero } from '@/components/garment/GarmentHero';
import { GarmentImage } from '@/components/garment/GarmentImage';
import { swatches } from '@/components/garment/GarmentIllustration';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
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
  const { favorites, looks, toggleFavorite, error: collectionError } = useCollection();
  const { colors: c, haptic } = useExperience();
  const { width } = useWindowDimensions();
  const [zoom, setZoom] = useState(false);
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
            onImagePress={() => setZoom(true)}
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
                    onPress={async () => {
                      if (await toggleFavorite(garment.id)) haptic();
                    }}
                  />
                </View>
              </View>
            }
          />
          <View style={{ marginTop: 34, backgroundColor: c.canvas.inverse, borderRadius: 24, padding: 23, gap: 8 }}>
            <AppText variant="eyebrow" style={{ color: '#CDD5C9' }}>THE WEAR STORY</AppText>
            <AppText variant="display" style={{ color: '#FBF9F5' }}>{garment.wearCount ? garment.wearCount + ' recorded wears.' : 'Ready for its first outing.'}</AppText>
            <AppText variant="bodySmall" style={{ color: '#CDD5C9' }}>{garment.lastWornAt ? 'Last in rotation ' + new Date(garment.lastWornAt).toLocaleDateString() : 'Make a look with this piece and start its story.'}</AppText>
          </View>
          <View style={{ marginTop: 34, gap: 14 }}><AppText variant="eyebrow">Saved with this piece</AppText>
            {looks.filter((look) => look.garmentIds.includes(garment.id)).slice(0, 3).length ? looks.filter((look) => look.garmentIds.includes(garment.id)).slice(0, 3).map((look) => <AnimatedPressable key={look.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/look/[id]', params: { id: look.id } })} style={{ padding: 17, backgroundColor: c.canvas.editorial, borderRadius: 16 }}><AppText variant="bodyLarge">{look.occasion} look →</AppText><AppText variant="metadata">{look.garmentIds.length} pieces · saved {new Date(look.createdAt).toLocaleDateString()}</AppText></AnimatedPressable>) : <AppText variant="muted">Save a look featuring this piece to see it here.</AppText>}
          </View>
          <View style={{ marginTop: 34, gap: 14 }}><AppText variant="eyebrow">Pairs well with</AppText><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
            {garments.filter((item) => item.id !== garment.id && item.category !== garment.category && Math.abs(item.formality - garment.formality) <= 3).sort((a,b) => Math.abs(a.formality-garment.formality)-Math.abs(b.formality-garment.formality)).slice(0, 6).map((item) => <AnimatedPressable key={item.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/garment/[id]', params: { id: item.id } })} style={{ width: 135, gap: 8 }}><GarmentImage garment={item} /><AppText variant="bodySmall" numberOfLines={2}>{item.name}</AppText></AnimatedPressable>)}
          </ScrollView></View>
          <View style={{ marginTop: 26, flexDirection: 'row', gap: 8, alignItems: 'center' }}><View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: c.border.strong, backgroundColor: swatches[garment.primaryColor.toLowerCase()] ?? c.canvas.media }} /><AppText variant="metadata">{garment.primaryColor} · {garment.materials.join(', ') || 'Material not recorded'}</AppText></View>
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
      <Modal visible={zoom} transparent animationType="fade" onRequestClose={() => setZoom(false)}><View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(12,20,15,.94)', padding: 18 }}><View style={{ alignSelf: 'flex-end', marginBottom: 12 }}><Button label="Close" icon="close" variant="secondary" onPress={() => setZoom(false)} /></View><GarmentImage garment={garment} variant="hero" style={{ maxHeight: width * 1.2 }} /><AppText variant="metadata" style={{ color: '#FBF9F5', textAlign: 'center', marginTop: 16 }}>{garment.name}</AppText></View></Modal>
    </Screen>
  );
}
