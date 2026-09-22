import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/sheets/BottomSheet';
import { GarmentImage } from '@/components/garment/GarmentImage';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import { useExperience } from '@/providers/ExperienceProvider';
import type { Garment, OutfitRecommendation } from '@/types/domain';
type Option = { garment: Garment; outfit: OutfitRecommendation };
type Props = {
  garment: Garment;
  options: Option[];
  onClose: () => void;
  onApply: (outfit: OutfitRecommendation) => void;
};
export function SwapGarmentSheet({ garment, options, onClose, onApply }: Props) {
  const { colors: c } = useExperience();
  const [candidate, setCandidate] = useState<Option | null>(null);
  return (
    <BottomSheet
      visible
      title={'A different ' + (garment.category === 'footwear' ? 'pair.' : 'piece.')}
      subtitle="Matches that work with the rest of this look."
      onClose={onClose}
      scroll={false}
    >
      {candidate ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            marginBottom: 16,
          }}
        >
          <GarmentImage garment={garment} variant="thumbnail" />
          <Ionicons name="arrow-forward" size={22} color={c.ink.secondary} />
          <GarmentImage garment={candidate.garment} variant="thumbnail" />
          <View style={{ flex: 1 }}>
            <AppText variant="bodySmall">{candidate.garment.name}</AppText>
            <AppText variant="metadata">Previewing your swap</AppText>
          </View>
        </View>
      ) : null}
      <FlatList
        data={options}
        keyExtractor={(item) => item.garment.id}
        style={{ maxHeight: 350 }}
        contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <AppText variant="muted" style={{ paddingVertical: 24 }}>
            No compatible alternatives yet. Try a different occasion or add another piece in this
            category.
          </AppText>
        }
        renderItem={({ item, index }) => (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityState={{ selected: candidate?.garment.id === item.garment.id }}
            accessibilityLabel={'Preview ' + item.garment.name}
            onPress={() => setCandidate(item)}
            feedback
            style={{
              padding: 10,
              borderRadius: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              backgroundColor:
                candidate?.garment.id === item.garment.id ? c.accent.forestMist : c.canvas.elevated,
            }}
          >
            <GarmentImage garment={item.garment} variant="thumbnail" />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="bodySmall">{item.garment.name}</AppText>
              <AppText variant="metadata">
                {index < 2
                  ? 'Best match'
                  : item.garment.wearCount < garment.wearCount
                    ? 'Less worn'
                    : 'Another way to wear it'}{' '}
                · {item.garment.wearCount} wears
              </AppText>
            </View>
            {candidate?.garment.id === item.garment.id ? (
              <Ionicons name="checkmark-circle" size={22} color={c.accent.forest} />
            ) : null}
          </AnimatedPressable>
        )}
      />
      <Button
        label="Use this piece"
        disabled={!candidate}
        onPress={() => {
          if (candidate) onApply(candidate.outfit);
        }}
      />
    </BottomSheet>
  );
}
