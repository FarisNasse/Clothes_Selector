import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { OutfitCard } from '@/components/OutfitCard';
import { Pill } from '@/components/Pill';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { Type } from '@/components/Type';
import { generateOutfits } from '@/features/recommendations/engine';
import { demoStyleProfile } from '@/fixtures/demoWardrobe';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { colors, radii, spacing } from '@/theme/tokens';
import type { Occasion } from '@/types/domain';

const stylingWeather = { temperatureF: 64, precipitationProbability: 0.15, raining: false };

const occasionLabels: { key: Occasion; label: string }[] = [
  { key: 'everyday', label: 'Casual' },
  { key: 'dinner', label: 'Smart casual' },
  { key: 'date', label: 'Date' },
  { key: 'work', label: 'Work' },
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
      <Screen>
        <View style={styles.missing}>
          <Type variant="title">Garment not found.</Type>
          <Type variant="muted">It may have been removed from the wardrobe.</Type>
        </View>
      </Screen>
    );
  }

  const recommendation = recommendations[index % Math.max(recommendations.length, 1)];

  return (
    <Screen>
      <View style={styles.hero}>
        <Type variant="eyebrow">{garment.brand ?? 'Wardrobe item'}</Type>
        <Type variant="display">{garment.name}</Type>
        <Type variant="muted">
          {garment.primaryColor} · {garment.subcategory} · {garment.fit} fit
        </Type>
      </View>

      <View style={styles.metadataGrid}>
        <Metric label="Formality" value={`${garment.formality}/10`} />
        <Metric label="Warmth" value={`${garment.warmth}/10`} />
        <Metric label="Worn" value={`${garment.wearCount}×`} />
        <Metric label="AI confidence" value={garment.aiConfidence ? `${Math.round(garment.aiConfidence * 100)}%` : 'Manual'} />
      </View>

      <View style={styles.section}>
        <SectionHeader
          eyebrow="Style this"
          title="Build around this piece"
          detail="The selected garment remains locked; only compatible owned pieces may fill the remaining slots."
        />
        <View style={styles.pills}>
          {occasionLabels.map((item) => (
            <Pill
              key={item.key}
              label={item.label}
              selected={occasion === item.key}
              onPress={() => {
                setOccasion(item.key);
                setIndex(0);
              }}
            />
          ))}
        </View>
      </View>

      {recommendation ? (
        <OutfitCard
          recommendation={recommendation}
          wearLoading={recordingWear}
          onWear={async () => {
            try {
              setRecordingWear(true);
              await recordWear(recommendation, occasion, stylingWeather);
              Alert.alert('Outfit recorded', 'Wear history and garment utilization have been updated.');
            } catch (caught) {
              Alert.alert('Could not record outfit', caught instanceof Error ? caught.message : 'Please try again.');
            } finally {
              setRecordingWear(false);
            }
          }}
          onAnother={() => setIndex((current) => current + 1)}
        />
      ) : (
        <View style={styles.noMatch}>
          <Type variant="title">No strong match yet.</Type>
          <Type variant="muted">
            The current wardrobe does not have enough compatible pieces for this occasion. This is preferable to inventing a garment the user does not own.
          </Type>
        </View>
      )}

      <View style={styles.section}>
        <SectionHeader eyebrow="Attributes" title="Structured garment profile" />
        <View style={styles.attributeCard}>
          <Attribute label="Color" value={garment.primaryColor} />
          <Attribute label="Pattern" value={garment.pattern} />
          <Attribute label="Materials" value={garment.materials.join(', ')} />
          <Attribute label="Seasons" value={garment.seasons.join(', ')} />
          <Attribute label="Style" value={garment.styleTags.join(', ')} />
        </View>
      </View>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Type variant="eyebrow">{label}</Type>
      <Type variant="title">{value}</Type>
    </View>
  );
}

function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.attributeRow}>
      <Type style={styles.attributeLabel}>{label}</Type>
      <Type variant="muted" style={styles.attributeValue}>
        {value}
      </Type>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: spacing.md, gap: spacing.xs },
  missing: { paddingTop: 120, gap: spacing.sm },
  metadataGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xl },
  metric: { width: '48%', backgroundColor: colors.surfaceStrong, borderRadius: radii.md, padding: spacing.md, gap: 3 },
  section: { marginTop: spacing.xl, gap: spacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  noMatch: { marginTop: spacing.md, backgroundColor: colors.brassSoft, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm },
  attributeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  attributeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  attributeLabel: { fontWeight: '700' },
  attributeValue: { textTransform: 'capitalize', flex: 1, textAlign: 'right' },
});
