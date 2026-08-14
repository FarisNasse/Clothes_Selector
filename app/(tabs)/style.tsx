import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/primitives/AppText';
import { Surface } from '@/components/primitives/Surface';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
import { demoStyleProfile } from '@/fixtures/demoWardrobe';
import { useWardrobe } from '@/providers/WardrobeProvider';

export default function StyleScreen() {
  const { garments } = useWardrobe();
  const stylesRanked = Object.entries(demoStyleProfile.styleWeights).sort((a, b) => b[1] - a[1]);
  const leastWorn = [...garments].sort((a, b) => a.wearCount - b.wearCount).slice(0, 3);

  return (
    <Screen maxWidth={900}>
      <View style={styles.header}>
        <AppText variant="eyebrow">Style intelligence</AppText>
        <AppText variant="displayXL">Your taste, translated.</AppText>
        <AppText variant="muted" style={styles.headerDetail}>
          A living model of what you actually wear—not a personality quiz frozen in time.
        </AppText>
      </View>

      <View style={styles.heroGrid}>
        <Surface variant="interactive" style={styles.dominantCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles-outline" size={22} color={semanticColors.accent.forest} />
          </View>
          <AppText variant="eyebrow">Strongest signal</AppText>
          <AppText variant="title" style={styles.capitalize}>{stylesRanked[0]?.[0] ?? 'Still learning'}</AppText>
          <AppText variant="metadata">
            The profile moves when your real behavior contradicts an onboarding preference.
          </AppText>
        </Surface>

        <Surface variant="sunken" style={styles.rotationCard}>
          <AppText variant="eyebrow">Rotation</AppText>
          <AppText variant="display">{garments.reduce((sum, garment) => sum + garment.wearCount, 0)}</AppText>
          <AppText variant="metadata">recorded garment wears across {garments.length} indexed pieces</AppText>
        </Surface>
      </View>

      <View style={styles.section}>
        <SectionHeader
          eyebrow="Taste map"
          title="Signals, not labels"
          detail="Style categories are weighted inputs. They guide ranking without forcing every outfit into one aesthetic."
        />
        <Surface variant="interactive" style={styles.profileCard}>
          {stylesRanked.map(([label, value], index) => (
            <View key={label} style={[styles.profileRow, index > 0 && styles.profileBorder]}>
              <View style={styles.profileLabels}>
                <AppText variant="bodySmall" style={styles.capitalize}>{label}</AppText>
                <AppText variant="metadata">{Math.round(value * 100)}%</AppText>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.round(value * 100)}%` }]} />
              </View>
            </View>
          ))}
        </Surface>
      </View>

      <View style={styles.section}>
        <SectionHeader eyebrow="Rediscovery" title="Pieces falling out of rotation" />
        <View style={styles.rediscoveryGrid}>
          {leastWorn.map((garment) => (
            <Surface key={garment.id} variant="sunken" style={styles.rediscoveryCard}>
              <AppText variant="bodySmall" style={styles.rediscoveryName}>{garment.name}</AppText>
              <AppText variant="metadata">{garment.wearCount} wears · {garment.brand ?? 'Unbranded'}</AppText>
            </Surface>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader eyebrow="Learning loop" title="What matters most" />
        <Surface variant="interactive" style={styles.learningCard}>
          <Signal index="01" title="Wear" detail="The strongest signal. You chose the outfit in real life." />
          <Signal index="02" title="Swap" detail="Useful evidence about which piece broke the recommendation." />
          <Signal index="03" title="Skip" detail="Weak evidence on its own, stronger when the pattern repeats." last />
        </Surface>
      </View>
    </Screen>
  );
}

function Signal({ index, title, detail, last = false }: { index: string; title: string; detail: string; last?: boolean }) {
  return (
    <View style={[styles.signalRow, !last && styles.profileBorder]}>
      <AppText variant="metadata" style={styles.signalIndex}>{index}</AppText>
      <View style={styles.signalCopy}>
        <AppText variant="bodyLarge">{title}</AppText>
        <AppText variant="metadata">{detail}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space.lg, gap: space.sm },
  headerDetail: { maxWidth: 620 },
  heroGrid: { marginTop: space.section, flexDirection: 'row', gap: space.md, flexWrap: 'wrap' },
  dominantCard: { flex: 1.25, minWidth: 260, padding: space.xxl, gap: space.md },
  rotationCard: { flex: 0.75, minWidth: 200, padding: space.xxl, gap: space.sm, justifyContent: 'center' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.accent.forestMist,
    marginBottom: space.sm,
  },
  capitalize: { textTransform: 'capitalize' },
  section: { marginTop: space.sectionLarge, gap: space.lg },
  profileCard: { overflow: 'hidden', paddingHorizontal: space.lg },
  profileRow: { paddingVertical: space.lg, gap: space.sm },
  profileBorder: { borderTopWidth: 1, borderTopColor: semanticColors.border.subtle },
  profileLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: space.lg },
  track: { height: 5, backgroundColor: semanticColors.canvas.sunken, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: 5, backgroundColor: semanticColors.accent.forest, borderRadius: radius.pill },
  rediscoveryGrid: { flexDirection: 'row', gap: space.md, flexWrap: 'wrap' },
  rediscoveryCard: { flex: 1, minWidth: 180, padding: space.lg, gap: space.sm },
  rediscoveryName: { fontWeight: '700' },
  learningCard: { overflow: 'hidden', paddingHorizontal: space.lg },
  signalRow: { flexDirection: 'row', gap: space.lg, paddingVertical: space.lg },
  signalIndex: { color: semanticColors.accent.bronze, fontWeight: '800' },
  signalCopy: { flex: 1, gap: space.xs },
});
