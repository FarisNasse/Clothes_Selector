import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
import type { Garment } from '@/types/domain';

export type GarmentImageVariant = 'grid' | 'hero' | 'outfit' | 'thumbnail' | 'capture' | 'preview';

const swatches: Record<string, string> = {
  navy: '#2B3C54',
  cream: '#E7DECB',
  white: '#F7F5EF',
  charcoal: '#555A59',
  indigo: '#324B72',
  brown: '#76533E',
  black: '#252625',
  olive: '#6B7257',
  grey: '#8B8E89',
  gray: '#8B8E89',
  beige: '#CBBEA8',
};

type Props = {
  garment: Garment;
  variant?: GarmentImageVariant;
  style?: ViewStyle;
  showLabel?: boolean;
};

export function GarmentImage({ garment, variant = 'grid', style, showLabel = false }: Props) {
  const tone = swatches[garment.primaryColor.toLowerCase()] ?? '#A8A197';
  const lightGarment = ['white', 'cream', 'beige'].includes(garment.primaryColor.toLowerCase());

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${garment.primaryColor} ${garment.subcategory} by ${garment.brand ?? 'unknown brand'}`}
      style={[styles.base, styles[variant], style]}
    >
      {garment.imageUrl ? (
        <Image source={{ uri: garment.imageUrl }} resizeMode="contain" style={styles.image} />
      ) : (
        <View style={styles.fallback}>
          <GarmentSilhouette category={garment.category} tone={tone} />
          {showLabel ? (
            <View style={styles.labelWrap}>
              <AppText variant="micro" style={[styles.fallbackLabel, lightGarment && styles.darkLabel]}>
                {garment.subcategory}
              </AppText>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

function GarmentSilhouette({ category, tone }: { category: Garment['category']; tone: string }) {
  if (category === 'bottom') {
    return (
      <View style={styles.bottomShape}>
        <View style={[styles.waist, { backgroundColor: tone }]} />
        <View style={styles.legs}>
          <View style={[styles.leg, { backgroundColor: tone }]} />
          <View style={[styles.leg, { backgroundColor: tone }]} />
        </View>
      </View>
    );
  }

  if (category === 'footwear') {
    return (
      <View style={styles.shoeStage}>
        <View style={[styles.shoe, { backgroundColor: tone }]} />
        <View style={[styles.shoeSecond, { backgroundColor: tone }]} />
      </View>
    );
  }

  if (category === 'accessory') {
    return <View style={[styles.accessory, { backgroundColor: tone }]} />;
  }

  return (
    <View style={styles.topShape}>
      <View style={[styles.leftSleeve, { backgroundColor: tone }]} />
      <View style={[styles.torso, { backgroundColor: tone }]} />
      <View style={[styles.rightSleeve, { backgroundColor: tone }]} />
      {category === 'outerwear' ? <View style={styles.jacketLine} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    backgroundColor: semanticColors.canvas.sunken,
    borderRadius: radius.media,
  },
  grid: { width: '100%', aspectRatio: 0.82 },
  hero: { width: '100%', aspectRatio: 1.04 },
  outfit: { width: '100%', height: '100%', borderRadius: radius.lg },
  thumbnail: { width: 72, height: 84, borderRadius: radius.md },
  capture: { width: '100%', aspectRatio: 1 },
  preview: { width: '100%', aspectRatio: 0.9 },
  image: { width: '100%', height: '100%' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  labelWrap: { position: 'absolute', left: space.md, right: space.md, bottom: space.md, alignItems: 'center' },
  fallbackLabel: { color: semanticColors.ink.inverse, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  darkLabel: { color: semanticColors.ink.secondary },
  topShape: { width: '72%', height: '62%', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  torso: { width: '58%', height: '88%', borderRadius: 14 },
  leftSleeve: { position: 'absolute', left: 0, top: '8%', width: '28%', height: '42%', borderRadius: 13, transform: [{ rotate: '18deg' }] },
  rightSleeve: { position: 'absolute', right: 0, top: '8%', width: '28%', height: '42%', borderRadius: 13, transform: [{ rotate: '-18deg' }] },
  jacketLine: { position: 'absolute', top: '10%', bottom: '7%', width: 1, backgroundColor: 'rgba(255,255,255,0.4)' },
  bottomShape: { width: '52%', height: '72%', alignItems: 'center' },
  waist: { width: '94%', height: '18%', borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  legs: { flex: 1, width: '94%', flexDirection: 'row', gap: 6 },
  leg: { flex: 1, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  shoeStage: { width: '78%', height: '56%', justifyContent: 'center' },
  shoe: { width: '78%', height: '28%', borderRadius: 18, transform: [{ rotate: '-8deg' }] },
  shoeSecond: { width: '78%', height: '28%', borderRadius: 18, marginLeft: '20%', marginTop: 8, transform: [{ rotate: '7deg' }] },
  accessory: { width: '54%', aspectRatio: 1, borderRadius: radius.pill },
});
