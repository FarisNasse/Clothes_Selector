import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { OutfitCard } from '@/components/OutfitCard';
import { Pill } from '@/components/Pill';
import { Screen } from '@/components/Screen';
import { Type } from '@/components/Type';
import { generateOutfits } from '@/features/recommendations/engine';
import { demoStyleProfile } from '@/fixtures/demoWardrobe';
import { useSession } from '@/providers/SessionProvider';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { colors, radii, spacing } from '@/theme/tokens';
import type { Occasion } from '@/types/domain';

const occasionLabels: { key: Occasion; label: string }[] = [
  { key: 'everyday', label: 'Everyday' },
  { key: 'work', label: 'Work' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'date', label: 'Date' },
  { key: 'going_out', label: 'Going out' },
  { key: 'formal', label: 'Formal' },
];

export default function TodayScreen() {
  const { garments, recordWear } = useWardrobe();
  const { isDemo } = useSession();
  const [occasion, setOccasion] = useState<Occasion>('dinner');
  const [recommendationIndex, setRecommendationIndex] = useState(0);
  const [recordingWear, setRecordingWear] = useState(false);

  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()),
    [],
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning.';
    if (hour < 18) return 'Good afternoon.';
    return 'Good evening.';
  }, []);

  const weather = useMemo(
    () => ({ temperatureF: 62, precipitationProbability: 0.35, raining: true }),
    [],
  );

  const recommendations = useMemo(
    () =>
      generateOutfits({
        wardrobe: garments,
        occasion,
        weather,
        styleProfile: demoStyleProfile,
        limit: 3,
      }),
    [garments, occasion, weather],
  );

  const recommendation = recommendations[recommendationIndex % Math.max(recommendations.length, 1)];

  return (
    <Screen>
      <View style={styles.topline}>
        <View>
          <Type variant="eyebrow">{todayLabel}</Type>
          <Type variant="display">{greeting}</Type>
        </View>
        {isDemo ? (
          <View style={styles.demoBadge}>
            <Type style={styles.demoText}>PROPOSAL DEMO</Type>
          </View>
        ) : null}
      </View>

      <View style={styles.weatherCard}>
        <View>
          <Type variant="eyebrow">{isDemo ? 'Demo weather' : 'Weather integration pending'}</Type>
          <Type variant="title" style={styles.weatherTitle}>62°F · Light rain</Type>
        </View>
        <Type variant="muted" style={styles.weatherDetail}>
          Rain risk increases later today. Water-resistant layers receive a scoring boost.
        </Type>
      </View>

      <View style={styles.section}>
        <Type variant="title">What are you dressing for?</Type>
        <View style={styles.pills}>
          {occasionLabels.map((item) => (
            <Pill
              key={item.key}
              label={item.label}
              selected={occasion === item.key}
              onPress={() => {
                setOccasion(item.key);
                setRecommendationIndex(0);
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
              await recordWear(recommendation, occasion, weather);
              Alert.alert(
                'Outfit recorded',
                'Wear history and garment utilization have been updated. This is the product north-star event.',
              );
            } catch (caught) {
              Alert.alert('Could not record outfit', caught instanceof Error ? caught.message : 'Please try again.');
            } finally {
              setRecordingWear(false);
            }
          }}
          onAnother={() => setRecommendationIndex((current) => current + 1)}
        />
      ) : (
        <View style={styles.emptyCard}>
          <Type variant="title">Build your wardrobe first.</Type>
          <Type variant="muted">
            Add at least one top, bottom, and pair of shoes before requesting an outfit.
          </Type>
        </View>
      )}

      <View style={styles.signalRow}>
        <View style={styles.signalCard}>
          <Type variant="eyebrow">Wardrobe</Type>
          <Type variant="title">{garments.length}</Type>
          <Type variant="muted">items indexed</Type>
        </View>
        <View style={styles.signalCard}>
          <Type variant="eyebrow">Signal</Type>
          <Type variant="title">Wear</Type>
          <Type variant="muted">beats a like</Type>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topline: {
    paddingTop: spacing.md,
    gap: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  demoBadge: {
    borderRadius: radii.pill,
    backgroundColor: colors.brassSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  demoText: { color: colors.brass, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  weatherCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.forest,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  weatherTitle: { color: colors.white },
  weatherDetail: { color: '#D7E0DB' },
  section: { marginVertical: spacing.xl, gap: spacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  emptyCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  signalRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  signalCard: {
    flex: 1,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 2,
  },
});
