import { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { GarmentIllustration } from './GarmentIllustration';
import { useExperience } from '@/providers/ExperienceProvider';
import type { Garment } from '@/types/domain';
import { swatches } from './GarmentIllustration';
import { canonicalColor } from '@/features/wardrobe/catalog';

export type GarmentImageVariant = 'grid' | 'hero' | 'outfit' | 'thumbnail' | 'capture' | 'preview';
type Props = {
  garment: Garment;
  variant?: GarmentImageVariant;
  style?: StyleProp<ViewStyle>;
  showLabel?: boolean;
};
export function GarmentImage({ garment, variant = 'grid', style }: Props) {
  const { colors: c, reducedMotion } = useExperience();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [garment.imageUrl]);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={
        garment.name + (!garment.imageUrl || failed ? ', garment illustration' : '')
      }
      style={[
        styles.base,
        styles[variant],
        { backgroundColor: variant === 'outfit' ? 'transparent' : variant === 'hero' ? (swatches[canonicalColor(garment.primaryColor)] ?? c.canvas.media) + '25' : c.canvas.media },
        style,
      ]}
    >
      {garment.imageUrl && !failed ? (
        <Image
          source={{ uri: garment.imageUrl }}
          contentFit={variant === 'grid' ? 'cover' : 'contain'}
          style={styles.image}
          cachePolicy="memory-disk"
          recyclingKey={garment.id + garment.imageUrl}
          transition={reducedMotion ? 0 : 240}
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={[styles.illustration, variant === 'outfit' && styles.flatlay]}>
          <GarmentIllustration garment={garment} />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  base: { overflow: 'hidden', borderRadius: 20 },
  grid: { width: '100%', aspectRatio: 0.8 },
  hero: { width: '100%', aspectRatio: 0.92 },
  outfit: { width: '100%', height: '100%', borderRadius: 8 },
  thumbnail: { width: 64, height: 80, borderRadius: 12 },
  capture: { width: '100%', aspectRatio: 1 },
  preview: { width: '100%', aspectRatio: 0.9 },
  image: { width: '100%', height: '100%' },
  illustration: { flex: 1, padding: 18 },
  flatlay: { padding: 0 },
});
