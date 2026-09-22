import { memo } from 'react';
import { View, type DimensionValue } from 'react-native';
import { GarmentImage } from './GarmentImage';
import { AppText } from '@/components/primitives/AppText';
import { IconButton } from '@/components/primitives/IconButton';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import type { Garment } from '@/types/domain';
type Props = {
  garment: Garment;
  width?: DimensionValue;
  onPress: () => void;
  favorite?: boolean;
  onFavorite?: () => void;
};
export const GarmentTile = memo(function GarmentTileContent({
  garment,
  width = '100%',
  onPress,
  favorite = false,
  onFavorite,
}: Props) {
  return (
    <View style={{ width, gap: 10, marginBottom: 24 }}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={'View ' + garment.name}
        feedback
        onPress={onPress}
        style={{ borderRadius: 20 }}
      >
        <GarmentImage garment={garment} variant="grid" />
        <View style={{ gap: 3, paddingTop: 12, paddingHorizontal: 2 }}>
          <AppText variant="bodySmall" numberOfLines={2} style={{ fontWeight: '500' }}>
            {garment.name}
          </AppText>
          <AppText variant="metadata" numberOfLines={1}>
            {garment.brand ?? garment.subcategory}
          </AppText>
        </View>
      </AnimatedPressable>
      {onFavorite ? (
        <View style={{ position: 'absolute', right: 6, top: 6 }}>
          <IconButton
            icon={favorite ? 'heart' : 'heart-outline'}
            label={(favorite ? 'Unfavorite ' : 'Favorite ') + garment.name}
            selected={favorite}
            onPress={onFavorite}
          />
        </View>
      ) : null}
    </View>
  );
});
