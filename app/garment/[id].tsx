import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { GarmentHero } from '@/components/garment/GarmentHero';
import { RecommendationHero } from '@/components/outfit/RecommendationHero';
import { AppText } from '@/components/primitives/AppText';
import { Chip } from '@/components/primitives/Chip';
import { EmptyState } from '@/components/primitives/EmptyState';
import { Surface } from '@/components/primitives/Surface';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
import { generateOutfits } from '@/features/recommendations/engine';
import { demoStyleProfile } from '@/fixtures/demoWardrobe';
import { useWardrobe } from '@/providers/WardrobeProvider';
import type { Occasion } from '@/types/domain';

const stylingWeather = { temperatureF: 64, precipitationProbability: 0.15, raining: false };

const occasionLabels: { key: Occasion; label: string }[] = [
  { key: 'everyday', label: 'Casual' },
  { key: 'dinner', label: 'Smart casual' },
  { key: 'date', label: 'Date' },
  { key: 'work', label: 'Work' },
  { key: 'going_out', label: 'Going out' },
];

export default function GarmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { garments, recordWear } = useWardrobe();
  const [occasion, setOccasion] = useState<Occasion>('dinner');
  const [index, setIndex] = useState(0);
  const [recordingWear, setRecordingWear] = useState(false);

  const garment = garments.find((item) => item.id === id);
  const recommendations = useMemo(
    () =>
      garment
        ? generateOutfits({
            wardrobe: garments,
            occasion,
            weather: stylingWeather,
            styleProfile: demoStyleProfile,
            lockedGarmentId: garment.id,
            limit: 3,
          })
        : [],
    [garment, garments, occasion],
  );

  if (!garment) {
    return (
      <Screen maxWidth={820}>
        <View style={styles.missingWrap}>
          <EmptyState
            title="This garment is no longer in your wardrobe."
            detail="It may have been removed or the wardrobe has not finished loading yet."
          />
        </View>
      </Screen>
    );
  }

  const recommendation = recommendations[index % Math.max(recommendations.length, 1)];

  return (
    <Screen maxWidth={860}>
      <View style={styles.heroWrap}>
        <GarmentHero garment={garment} />
      </View>

      <View style={styles.section}>
        <SectionHeader
          eyebrow="Style this"
          title="Keep this piece. Rebuild everything around it."
          detail="The selected garment remains visually locked while Clothes Selector searches your owned wardrobe for compatible pieces."
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.occasionRail}>
          {occasionLabels.map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              selected={occasion === item.key}
              onPress={() => {
                setOccasion(item.key);
                setIndex(0);
              }}
            />
          ))}
        </ScrollView>
      </View>

      {recommendation ? (
        <RecommendationHero
          recommendation={recommendation}
          title={`Built around ${garment.name.toLowerCase()}.`}
          contextLabel="Locked styling session"
          lockedGarmentId={garment.id}
          wearLoading={recordingWear}
          onWear={async () => {
            try {
              setRecordingWear(true);
              await recordWear(recommendation, occasion, stylingWeather);
              Alert.alert('Outfit recorded', 'This styling choice is now part of your wear history.');
            } catch (caught) {
              Alert.alert('Could not record outfit', caught instanceof Error ? caught.message : 'Please try again.');
            } finally {
              setRecordingWear(false);
            }
          }}
          onAnother={() => setIndex((current) => current + 1)}
        />
      ) : (
        <EmptyState
          title="No complete look is available yet."
          detail="Add compatible tops, bottoms, or footwear and this garment can become the anchor for a full outfit."
        />
      )}

      <View style={styles.sectionLarge}>
        <SectionHeader eyebrow="Piece profile" title="What Clothes Selector knows" />
        <Surface variant="interactive" style={styles.attributeCard}>
          <Attribute label="Category" value={garment.category} />
          <Attribute label="Material" value={garment.materials.join(', ') || 'Unknown'} />
          <Attribute label="Pattern" value={garment.pattern} />
          <Attribute label="Formality" value={`${garment.formality}/10`} />
          <Attribute label="Warmth" value={`${garment.warmth}/10`} />
          <Attribute label="Weather" value={garment.waterproof ? 'Water resistant' : 'Dry weather'} />
          <Attribute label="Seasons" value={garment.seasons.join(', ')} last />
        </Surface>
      </View>
    </Screen>
  );
}

function Attribute({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.attributeRow, !last && styles.attributeBorder]}>
      <AppText variant="metadata" style={styles.attributeLabel}>{label}</AppText>
      <AppText variant="bodySmall" style={styles.attributeValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  missingWrap: { paddingTop: space.sectionLarge },
  heroWrap: { paddingTop: space.lg },
  section: { marginTop: space.sectionLarge, gap: space.lg },
  sectionLarge: { marginTop: space.sectionLarge, gap: space.lg },
  occasionRail: { gap: space.sm, paddingRight: space.xxl },
  attributeCard: { overflow: 'hidden', borderRadius: radius.lg },
  attributeRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.lg,
    paddingHorizontal: space.lg,
  },
  attributeBorder: { borderBottomWidth: 1, borderBottomColor: semanticColors.border.subtle },
  attributeLabel: { fontWeight: '700' },
  attributeValue: { flex: 1, textAlign: 'right', textTransform: 'capitalize' },
});
