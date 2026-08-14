import { Pressable, StyleSheet, View } from 'react-native';

import { GarmentImage } from '@/components/garment/GarmentImage';
import { AppText } from '@/components/primitives/AppText';
import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
import type { Garment } from '@/types/domain';

type Props = {
  garment: Garment;
  locked?: boolean;
  onPress?: () => void;
};

export function OutfitPiece({ garment, locked = false, onPress }: Props) {
  return (
    <Pressable
      accessibilityLabel={`${garment.name}${locked ? ', locked in this styling session' : ''}`}
      {...(onPress ? { accessibilityRole: 'button' as const, onPress } : { disabled: true })}
      style={({ pressed }) => [styles.root, locked && styles.locked, pressed && styles.pressed]}
    >
      <GarmentImage garment={garment} variant="outfit" />
      {locked ? (
        <View style={styles.lockedBadge}>
          <AppText variant="micro" style={styles.lockedText}>LOCKED</AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minWidth: 0, borderRadius: radius.lg },
  locked: { borderWidth: 1.5, borderColor: semanticColors.accent.bronze },
  pressed: { opacity: 0.8 },
  lockedBadge: {
    position: 'absolute',
    left: space.sm,
    top: space.sm,
    borderRadius: radius.pill,
    backgroundColor: semanticColors.canvas.elevated,
    paddingHorizontal: space.sm,
    paddingVertical: 5,
  },
  lockedText: { color: semanticColors.accent.bronze, fontWeight: '800', letterSpacing: 0.8 },
});
