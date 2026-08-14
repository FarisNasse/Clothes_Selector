import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { RecommendationHero } from '@/components/outfit/RecommendationHero';
import { AppText } from '@/components/primitives/AppText';
import { Chip } from '@/components/primitives/Chip';
import { EmptyState } from '@/components/primitives/EmptyState';
import { Surface } from '@/components/primitives/Surface';
import { Screen } from '@/components/Screen';
import { generateOutfits } from '@/features/recommendations/engine';
import { demoStyleProfile } from '@/fixtures/demoWardrobe';
import { useSession } from '@/providers/SessionProvider';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
import type { Occasion } from '@/types/domain';

const occasionLabels: { key: Occasion; label: string }[] = [
  { key: 'everyday', label: 'Everyday' },
  { key: 'work', label: 'Work' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'date', label: 'Date' },
  { key: 'going_out', label: 'Going out' },
  { key: 'formal', label: 'Formal' },
];

const recommendationTitles: Record<Occasion, string> = {
  everyday: 'Easy, without looking accidental.',
  work: 'Polished without overthinking it.',
  dinner: 'Dinner, solved.',
  date: 'Confident. Not overdone.',
  going_out: 'A little sharper tonight.',
  formal: 'The right level of serious.',
};

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
    <Screen maxWidth={820}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="eyebrow">{todayLabel}</AppText>
          <AppText variant="displayXL">{greeting}</AppText>
        </View>
        {isDemo ? (
          <View style={styles.demoBadge}>
            <AppText variant="micro" style={styles.demoText}>DEMO</AppText>
          </View>
        ) : null}
      </View>

      <Surface variant="sunken" style={styles.weatherStrip}>
        <View style={styles.weatherIcon}>
          <Ionicons name="rainy-outline" size={19} color={semanticColors.accent.forest} />
        </View>
        <View style={styles.weatherCopy}>
          <AppText variant="bodySmall" style={styles.weatherTitle}>62°F · Light rain</AppText>
          <AppText variant="metadata">Water-resistant layers are favored later today.</AppText>
        </View>
        <AppText variant="metadata">35%</AppText>
      </Surface>

      <View style={styles.occasionSection}>
        <AppText variant="heading">What are you dressing for?</AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.occasionRail}
        >
          {occasionLabels.map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              selected={occasion === item.key}
              onPress={() => {
                setOccasion(item.key);
                setRecommendationIndex(0);
              }}
            />
          ))}
        </ScrollView>
      </View>

      {recommendation ? (
        <RecommendationHero
          recommendation={recommendation}
          title={recommendationTitles[occasion]}
          contextLabel={`${occasionLabels.find((item) => item.key === occasion)?.label ?? 'Today'} · from your wardrobe`}
          wearLoading={recordingWear}
          onWear={async () => {
            try {
              setRecordingWear(true);
              await recordWear(recommendation, occasion, weather);
              Alert.alert('Locked in', 'This wear is now part of your wardrobe history.');
            } catch (caught) {
              Alert.alert('Could not record outfit', caught instanceof Error ? caught.message : 'Please try again.');
            } finally {
              setRecordingWear(false);
            }
          }}
          onAnother={() => setRecommendationIndex((current) => current + 1)}
        />
      ) : (
        <EmptyState
          title="Your wardrobe needs a few more pieces."
          detail="Add at least one top, one bottom, and one pair of shoes. Then Clothes Selector can begin assembling complete looks."
          actionLabel="Add a garment"
          onAction={() => router.push('/garment/add')}
        />
      )}

      <View style={styles.insightSection}>
        <AppText variant="eyebrow">Wardrobe insight</AppText>
        <Surface variant="interactive" style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons name="time-outline" size={20} color={semanticColors.accent.bronze} />
          </View>
          <View style={styles.insightCopy}>
            <AppText variant="bodyLarge">Your least-worn layer deserves another look.</AppText>
            <AppText variant="metadata">
              Clothes Selector can favor strong pieces that have fallen out of rotation instead of repeating the same safe outfit.
            </AppText>
          </View>
        </Surface>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: space.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.lg,
  },
  headerCopy: { flex: 1, gap: space.sm },
  demoBadge: {
    marginTop: 3,
    minHeight: 28,
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    backgroundColor: semanticColors.accent.bronzeMist,
  },
  demoText: { color: semanticColors.accent.bronze, fontWeight: '800', letterSpacing: 0.9 },
  weatherStrip: {
    marginTop: space.xxl,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  weatherIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.accent.forestMist,
  },
  weatherCopy: { flex: 1, gap: 2 },
  weatherTitle: { fontWeight: '700' },
  occasionSection: { marginVertical: space.section, gap: space.lg },
  occasionRail: { gap: space.sm, paddingRight: space.xxl },
  insightSection: { marginTop: space.sectionLarge, gap: space.md },
  insightCard: { padding: space.lg, flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.accent.bronzeMist,
  },
  insightCopy: { flex: 1, gap: space.sm },
});
