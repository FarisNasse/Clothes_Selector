import { View } from 'react-native';
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
};
export function OutfitFlatLay({
  garments,
  lockedGarmentId = null,
  lockedIds = [],
  onGarmentPress,
  label = 'THE DAILY EDIT',
}: Props) {
  const { colors: c } = useExperience();
  const positions = compositionFor(garments);
  return (
    <View
      style={{
        width: '100%',
        aspectRatio: 0.95,
        borderRadius: 28,
        backgroundColor: c.canvas.sunken,
        overflow: 'hidden',
      }}
    >
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
          <View
            key={item.id}
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
            <Entrance delay={index * 40} style={{ flex: 1 }}>
              <OutfitPiece
                garment={item}
                locked={lockedIds.includes(item.id) || lockedGarmentId === item.id}
                onPress={onGarmentPress ? () => onGarmentPress(item) : undefined}
              />
            </Entrance>
          </View>
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
