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
  onStyle?: () => void;
  editorial?: boolean;
};
export const GarmentTile = memo(function GarmentTileContent({
  garment,
  width = '100%',
  onPress,
  favorite = false,
  onFavorite,
  onStyle,
  editorial = false,
}: Props) {
  return (
    <View style={{ width, gap: 10, marginBottom: editorial ? 32 : 24 }}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={'View ' + garment.name}
        feedback
        onPress={onPress}
        onLongPress={onStyle}
        style={{ borderRadius: 20 }}
      >
        <GarmentImage garment={garment} variant="grid" style={editorial ? { aspectRatio: .68, borderRadius: 24 } : undefined} />
        <View style={{ gap: 3, paddingTop: 12, paddingHorizontal: 2 }}>
          <AppText variant="bodySmall" numberOfLines={2} style={{ fontWeight: '500' }}>
            {garment.name}
          </AppText>
          <AppText variant="metadata" numberOfLines={1}>{garment.brand ?? garment.subcategory} · {garment.wearCount ? garment.wearCount + ' wears' : 'New to rotation'}</AppText>
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
      {onStyle ? <View style={{ alignSelf: 'flex-start', marginTop: -5 }}><IconButton icon="sparkles-outline" label={'Style ' + garment.name} onPress={onStyle} /></View> : null}
    </View>
  );
});
