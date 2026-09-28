import { View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, ReduceMotion } from 'react-native-reanimated';
import { OutfitPiece } from './OutfitPiece';
import { compositionFor } from './composition';
import { Entrance } from '@/components/motion/Entrance';
import { AppText } from '@/components/primitives/AppText';
import { useExperience } from '@/providers/ExperienceProvider';
import type { Garment } from '@/types/domain';
type Props = {
  garments: Garment[];
  lockedGarmentId?: string | null;
  lockedIds?: string[];
  onGarmentPress?: ((garment: Garment) => void) | undefined;
  label?: string;
  tint?: string;
};
export function OutfitFlatLay({
  garments,
  lockedGarmentId = null,
  lockedIds = [],
  onGarmentPress,
  label = 'THE DAILY EDIT',
  tint,
}: Props) {
  const { colors: c, reducedMotion } = useExperience();
  const positions = compositionFor(garments);
  return (
    <View
      style={{
        width: '100%',
        aspectRatio: 0.8,
        borderRadius: 28,
        backgroundColor: c.canvas.media,
        overflow: 'hidden',
      }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: tint ?? c.canvas.editorial, opacity: .2 }} />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: '9%',
          top: '12%',
          width: '75%',
          height: '77%',
          borderRadius: 160,
          borderWidth: 1,
          borderColor: c.border.strong,
          opacity: 0.32,
          transform: [{ rotate: '-22deg' }],
        }}
      />
      <AppText
        variant="micro"
        style={{ position: 'absolute', top: 18, left: 20, letterSpacing: 2 }}
      >
        {label}
      </AppText>
      {garments.map((item, index) => {
        const p = positions[item.id];
        if (!p) return null;
        return (
          <Animated.View
            key={item.id}
            entering={FadeIn.duration(reducedMotion ? 0 : 280).reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.duration(reducedMotion ? 0 : 190).reduceMotion(ReduceMotion.System)}
            layout={LinearTransition.duration(reducedMotion ? 0 : 290).reduceMotion(ReduceMotion.System)}
            style={{
              position: 'absolute',
              left: (p.left + '%') as `${number}%`,
              top: (p.top + '%') as `${number}%`,
              width: (p.width + '%') as `${number}%`,
              height: (p.height + '%') as `${number}%`,
              zIndex: p.zIndex,
              transform: [{ rotate: p.rotation + 'deg' }],
            }}
          >
            <Entrance delay={index * 28} style={{ flex: 1 }}>
              <OutfitPiece
                garment={item}
                locked={lockedIds.includes(item.id) || lockedGarmentId === item.id}
                onPress={onGarmentPress ? () => onGarmentPress(item) : undefined}
              />
            </Entrance>
          </Animated.View>
        );
      })}
      <AppText
        variant="micro"
        style={{ position: 'absolute', bottom: 16, left: 20, letterSpacing: 1 }}
      >
        {garments.length} PIECES. ALL YOURS.
      </AppText>
    </View>
  );
}
