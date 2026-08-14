import { StyleSheet, View } from 'react-native';

import { OutfitPiece } from '@/components/outfit/OutfitPiece';
import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
import type { Garment } from '@/types/domain';

type Props = {
  garments: Garment[];
  lockedGarmentId?: string | null;
  onGarmentPress?: (garment: Garment) => void;
};

export function OutfitFlatLay({ garments, lockedGarmentId = null, onGarmentPress }: Props) {
  const top = garments.find((item) => item.category === 'top');
  const bottom = garments.find((item) => item.category === 'bottom');
  const footwear = garments.find((item) => item.category === 'footwear');
  const outerwear = garments.find((item) => item.category === 'outerwear' || item.category === 'suit');
  const accessory = garments.find((item) => item.category === 'accessory');

  return (
    <View style={styles.canvas}>
      <View style={styles.leftColumn}>
        {outerwear ? (
          <View style={styles.outerwear}>
            <Piece garment={outerwear} lockedGarmentId={lockedGarmentId} onGarmentPress={onGarmentPress} />
          </View>
        ) : null}
        {top ? (
          <View style={[styles.top, !outerwear && styles.topWithoutLayer]}>
            <Piece garment={top} lockedGarmentId={lockedGarmentId} onGarmentPress={onGarmentPress} />
          </View>
        ) : null}
      </View>
      <View style={styles.rightColumn}>
        {bottom ? (
          <View style={styles.bottom}>
            <Piece garment={bottom} lockedGarmentId={lockedGarmentId} onGarmentPress={onGarmentPress} />
          </View>
        ) : null}
        {footwear ? (
          <View style={styles.footwear}>
            <Piece garment={footwear} lockedGarmentId={lockedGarmentId} onGarmentPress={onGarmentPress} />
          </View>
        ) : null}
        {accessory ? (
          <View style={styles.accessory}>
            <Piece garment={accessory} lockedGarmentId={lockedGarmentId} onGarmentPress={onGarmentPress} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Piece({
  garment,
  lockedGarmentId,
  onGarmentPress,
}: {
  garment: Garment;
  lockedGarmentId: string | null;
  onGarmentPress?: (garment: Garment) => void;
}) {
  return (
    <OutfitPiece
      garment={garment}
      locked={garment.id === lockedGarmentId}
      {...(onGarmentPress ? { onPress: () => onGarmentPress(garment) } : {})}
    />
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    aspectRatio: 0.96,
    borderRadius: radius.media,
    backgroundColor: semanticColors.canvas.sunken,
    padding: space.md,
    flexDirection: 'row',
    gap: space.md,
    overflow: 'hidden',
  },
  leftColumn: { flex: 1.1, gap: space.md },
  rightColumn: { flex: 0.9, gap: space.md },
  outerwear: { flex: 1.06 },
  top: { flex: 0.94 },
  topWithoutLayer: { flex: 1 },
  bottom: { flex: 1.18 },
  footwear: { flex: 0.72 },
  accessory: { flex: 0.48 },
});
