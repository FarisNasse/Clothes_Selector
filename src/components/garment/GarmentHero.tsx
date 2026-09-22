import { View, useWindowDimensions } from 'react-native';
import { GarmentImage } from './GarmentImage';
import { AppText } from '@/components/primitives/AppText';
import { Entrance } from '@/components/motion/Entrance';
import { useExperience } from '@/providers/ExperienceProvider';
import type { Garment } from '@/types/domain';
import type { ReactNode } from 'react';
export function GarmentHero({ garment, actions }: { garment: Garment; actions?: ReactNode }) {
  const { width } = useWindowDimensions();
  const { colors: c } = useExperience();
  const wide = width >= 850;
  return (
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 48 : 26, paddingTop: 20 }}>
      <Entrance style={{ flex: wide ? 1.2 : undefined }}>
        <GarmentImage garment={garment} variant="hero" />
      </Entrance>
      <Entrance
        delay={90}
        style={{ flex: wide ? 1 : undefined, justifyContent: 'center', gap: 18 }}
      >
        <AppText variant="eyebrow">{garment.brand ?? 'A piece of your wardrobe'}</AppText>
        <AppText
          variant="displayXL"
          accessibilityRole="header"
          style={width < 380 ? { fontSize: 36, lineHeight: 41 } : undefined}
        >
          {garment.name}
        </AppText>
        <AppText variant="muted" style={{ textTransform: 'capitalize' }}>
          {garment.primaryColor} · {garment.fit} ·{' '}
          {garment.materials.join(' / ') || garment.subcategory}
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {garment.styleTags.map((tag) => (
            <View
              key={tag}
              style={{
                paddingVertical: 7,
                paddingHorizontal: 12,
                borderRadius: 20,
                backgroundColor: c.canvas.sunken,
              }}
            >
              <AppText variant="metadata">{tag}</AppText>
            </View>
          ))}
        </View>
        {actions}
        <View style={{ borderTopWidth: 1, borderColor: c.border.subtle, paddingTop: 20, gap: 6 }}>
          <AppText variant="bodySmall">
            {garment.wearCount === 0
              ? 'Ready for its first outing.'
              : garment.wearCount + ' wears. Part of your story.'}
          </AppText>
          <AppText variant="metadata">
            {garment.lastWornAt
              ? 'Last worn ' +
                new Date(garment.lastWornAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'No wear recorded yet.'}
          </AppText>
          {garment.purchasePrice !== null && garment.wearCount > 0 ? (
            <AppText variant="metadata">
              {'$' + (garment.purchasePrice / garment.wearCount).toFixed(2)} per recorded wear
            </AppText>
          ) : null}
        </View>
      </Entrance>
    </View>
  );
}
