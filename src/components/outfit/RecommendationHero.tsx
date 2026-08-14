import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { OutfitFlatLay } from '@/components/outfit/OutfitFlatLay';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Surface } from '@/components/primitives/Surface';
import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
import type { OutfitRecommendation } from '@/types/domain';

type Props = {
  recommendation: OutfitRecommendation;
  title?: string;
  contextLabel?: string;
  lockedGarmentId?: string | null;
  wearLoading?: boolean;
  onWear: () => void;
  onAnother: () => void;
};

export function RecommendationHero({
  recommendation,
  title = 'A look worth wearing.',
  contextLabel = 'Recommended now',
  lockedGarmentId = null,
  wearLoading = false,
  onWear,
  onAnother,
}: Props) {
  return (
    <View style={styles.root}>
      <OutfitFlatLay garments={recommendation.garments} lockedGarmentId={lockedGarmentId} />

      <View style={styles.copy}>
        <View style={styles.contextRow}>
          <AppText variant="eyebrow">{contextLabel}</AppText>
          <View style={styles.matchBadge}>
            <Ionicons name="sparkles" size={12} color={semanticColors.accent.forest} />
            <AppText variant="metadata" style={styles.matchText}>{recommendation.score}% match</AppText>
          </View>
        </View>
        <AppText variant="display">{title}</AppText>
        <AppText variant="muted">{recommendation.explanation}</AppText>
      </View>

      <Surface variant="sunken" style={styles.pieces}>
        {recommendation.garments.map((garment, index) => (
          <View key={garment.id} style={[styles.pieceRow, index > 0 && styles.pieceBorder]}>
            <View style={styles.pieceCopy}>
              <AppText variant="bodySmall" style={styles.pieceName}>{garment.name}</AppText>
              <AppText variant="metadata" style={styles.capitalized}>{garment.primaryColor} · {garment.subcategory}</AppText>
            </View>
            {garment.id === lockedGarmentId ? (
              <AppText variant="micro" style={styles.lockedText}>LOCKED</AppText>
            ) : null}
          </View>
        ))}
      </Surface>

      <View style={styles.actions}>
        <View style={styles.primaryAction}>
          <Button label="Wear this" icon="checkmark" loading={wearLoading} onPress={onWear} />
        </View>
        <View style={styles.secondaryAction}>
          <Button label="Another" icon="refresh" variant="secondary" onPress={onAnother} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.xl },
  copy: { gap: space.sm },
  contextRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  matchBadge: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    backgroundColor: semanticColors.accent.forestMist,
  },
  matchText: { color: semanticColors.accent.forest, fontWeight: '700' },
  pieces: { paddingHorizontal: space.lg, overflow: 'hidden' },
  pieceRow: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  pieceBorder: { borderTopWidth: 1, borderTopColor: semanticColors.border.subtle },
  pieceCopy: { flex: 1, gap: 2 },
  pieceName: { fontWeight: '700' },
  capitalized: { textTransform: 'capitalize' },
  lockedText: { color: semanticColors.accent.bronze, fontWeight: '800', letterSpacing: 0.8 },
  actions: { flexDirection: 'row', gap: space.md },
  primaryAction: { flex: 1.4 },
  secondaryAction: { flex: 1 },
});
