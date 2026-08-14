import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { Type } from '@/components/Type';
import { demoStyleProfile } from '@/fixtures/demoWardrobe';
import { colors, radii, spacing } from '@/theme/tokens';

export default function StyleScreen() {
  const stylesRanked = Object.entries(demoStyleProfile.styleWeights).sort((a, b) => b[1] - a[1]);

  return (
    <Screen>
      <View style={pageStyles.header}>
        <Type variant="eyebrow">Personalization</Type>
        <Type variant="display">Your style model.</Type>
        <Type variant="muted">
          Preferences are represented as weighted signals. The model should learn from what you wear, swap, and reject.
        </Type>
      </View>

      <View style={pageStyles.section}>
        <SectionHeader eyebrow="Profile" title="A multidimensional taste profile" />
        <View style={pageStyles.card}>
          {stylesRanked.map(([label, value]) => (
            <View key={label} style={pageStyles.profileRow}>
              <View style={pageStyles.profileLabels}>
                <Type style={pageStyles.capitalized}>{label}</Type>
                <Type variant="muted">{Math.round(value * 100)}%</Type>
              </View>
              <View style={pageStyles.track}>
                <View style={[pageStyles.fill, { width: `${Math.round(value * 100)}%` }]} />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={pageStyles.section}>
        <SectionHeader eyebrow="Learning loop" title="Behavior outranks stated preference" />
        <View style={pageStyles.learningCard}>
          <Type variant="bodyLarge">Recommendation → swap → save → wear → rate</Type>
          <Type variant="muted">
            A tap on “Wear this” should be treated as a higher-quality signal than a generic like. This keeps optimization aligned with actual dressing behavior.
          </Type>
        </View>
      </View>

      <View style={pageStyles.section}>
        <SectionHeader eyebrow="Preferred fit" title="Regular, tailored, relaxed" />
        <View style={pageStyles.chipRow}>
          {demoStyleProfile.preferredFits.map((fit) => (
            <View key={fit} style={pageStyles.chip}>
              <Type style={pageStyles.capitalized}>{fit}</Type>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const pageStyles = StyleSheet.create({
  header: { paddingTop: spacing.md, gap: spacing.xs },
  section: { marginTop: spacing.xl, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  profileRow: { gap: spacing.xs },
  profileLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 8, backgroundColor: colors.surfaceStrong, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.forest, borderRadius: 4 },
  learningCard: { backgroundColor: colors.forestSoft, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.brassSoft, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  capitalized: { textTransform: 'capitalize', fontWeight: '600' },
});
