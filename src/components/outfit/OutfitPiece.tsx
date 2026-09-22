import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GarmentImage } from '@/components/garment/GarmentImage';
import { AppText } from '@/components/primitives/AppText';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import { useExperience } from '@/providers/ExperienceProvider';
import type { Garment } from '@/types/domain';
type Props = { garment: Garment; locked?: boolean; onPress?: (() => void) | undefined };
export function OutfitPiece({ garment, locked = false, onPress }: Props) {
  const { colors: c } = useExperience();
  return (
    <AnimatedPressable
      accessibilityLabel={garment.name + (locked ? ', keeping this piece' : ', view, swap or lock')}
      accessibilityRole={onPress ? 'button' : 'image'}
      disabled={!onPress}
      feedback
      onPress={onPress}
      style={{ flex: 1, borderRadius: 18 }}
    >
      <GarmentImage garment={garment} variant="outfit" />
      {locked ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 8,
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 5,
            borderRadius: 12,
            backgroundColor: c.canvas.elevated,
          }}
        >
          <Ionicons name="lock-closed" size={11} color={c.accent.forest} />
          <AppText variant="micro">Keeping</AppText>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}
