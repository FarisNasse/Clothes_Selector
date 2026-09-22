import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from '@/components/sheets/BottomSheet';
import { AppText } from '@/components/primitives/AppText';
import { Chip } from '@/components/primitives/Chip';
import { Button } from '@/components/primitives/Button';
import { defaultFilters, type WardrobeFilters } from '@/features/wardrobe/filter';
import type { Season } from '@/types/domain';
const seasons: (Season | 'all')[] = ['all', 'spring', 'summer', 'fall', 'winter'];
export function FilterSheet({
  visible,
  filters,
  colors,
  onApply,
  onClose,
}: {
  visible: boolean;
  filters: WardrobeFilters;
  colors: string[];
  onApply: (next: WardrobeFilters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(filters);
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);
  return (
    <BottomSheet visible={visible} title="Find your pieces." onClose={onClose}>
      <AppText variant="eyebrow">Color</AppText>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {['', ...colors].map((color) => (
          <Chip
            key={color}
            label={color || 'All colors'}
            selected={draft.color === color}
            onPress={() => setDraft((current) => ({ ...current, color }))}
          />
        ))}
      </View>
      <AppText variant="eyebrow">Season</AppText>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {seasons.map((season) => (
          <Chip
            key={season}
            label={season}
            selected={draft.season === season}
            onPress={() => setDraft((current) => ({ ...current, season }))}
          />
        ))}
      </View>
      <AppText variant="eyebrow">Dressiness</AppText>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {(['all', 'casual', 'smart', 'formal'] as const).map((formality) => (
          <Chip
            key={formality}
            label={formality === 'smart' ? 'Smart casual' : formality}
            selected={draft.formality === formality}
            onPress={() => setDraft((current) => ({ ...current, formality }))}
          />
        ))}
      </View>
      <AppText variant="eyebrow">Order</AppText>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {(['added', 'least-worn', 'recently-worn', 'name'] as const).map((sort) => (
          <Chip
            key={sort}
            label={sort.replaceAll('-', ' ')}
            selected={draft.sort === sort}
            onPress={() => setDraft((current) => ({ ...current, sort }))}
          />
        ))}
      </View>
      <Chip
        label="Favorites only"
        selected={draft.favoritesOnly}
        onPress={() =>
          setDraft((current) => ({ ...current, favoritesOnly: !current.favoritesOnly }))
        }
      />
      <Button
        label="Show pieces"
        onPress={() => {
          onApply(draft);
          onClose();
        }}
      />
      <Button
        label="Reset filters"
        variant="quiet"
        onPress={() => setDraft({ ...defaultFilters, category: filters.category })}
      />
    </BottomSheet>
  );
}
