import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Type } from '@/components/Type';
import { colors, radii, spacing } from '@/theme/tokens';
import type { OutfitRecommendation } from '@/types/domain';

type Props = {
  recommendation: OutfitRecommendation;
  onWear: () => void;
  onAnother: () => void;
  wearLoading?: boolean;
};

export function OutfitCard({ recommendation, onWear, onAnother, wearLoading = false }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Type variant="eyebrow">Recommended</Type>
          <Type variant="title">Today&apos;s outfit</Type>
        </View>
        <View style={styles.score}>
          <Type style={styles.scoreValue}>{recommendation.score}</Type>
          <Type style={styles.scoreLabel}>MATCH</Type>
        </View>
      </View>

      <View style={styles.garments}>
        {recommendation.garments.map((garment) => (
          <View key={garment.id} style={styles.row}>
            <View style={styles.dot} />
            <View style={styles.rowCopy}>
              <Type style={styles.garmentName}>{garment.name}</Type>
              <Type variant="muted" style={styles.garmentMeta}>
                {garment.primaryColor} · {garment.subcategory}
              </Type>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.explanation}>
        <Type variant="eyebrow">Why it works</Type>
        <Type>{recommendation.explanation}</Type>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Wear this" loading={wearLoading} onPress={onWear} />
        <PrimaryButton label="Another outfit" variant="secondary" onPress={onAnother} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  score: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: { color: colors.white, fontWeight: '800', fontSize: 20, lineHeight: 22 },
  scoreLabel: { color: colors.white, fontWeight: '700', fontSize: 8, letterSpacing: 1 },
  garments: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brass },
  rowCopy: { flex: 1 },
  garmentName: { fontWeight: '700' },
  garmentMeta: { fontSize: 12, lineHeight: 16, textTransform: 'capitalize' },
  explanation: {
    backgroundColor: colors.brassSoft,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  actions: { gap: spacing.sm },
});
