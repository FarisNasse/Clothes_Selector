import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { BottomSheet } from '@/components/sheets/BottomSheet';
import { AppText } from '@/components/primitives/AppText';
import { EmptyState } from '@/components/primitives/EmptyState';
import { IconButton } from '@/components/primitives/IconButton';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import { GarmentImage } from '@/components/garment/GarmentImage';
import { useCollection } from '@/providers/CollectionProvider';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { useExperience } from '@/providers/ExperienceProvider';
export function SavedLooksSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { looks, removeLook } = useCollection();
  const { garments } = useWardrobe();
  const { colors: c } = useExperience();
  return (
    <BottomSheet
      visible={visible}
      title="Worth keeping."
      subtitle="Saved looks live on this device, separately for each account."
      onClose={onClose}
      scroll={false}
    >
      <FlatList
        data={looks}
        keyExtractor={(look) => look.id}
        style={{ maxHeight: 480 }}
        contentContainerStyle={{ gap: 16, paddingBottom: 10 }}
        ListEmptyComponent={
          <EmptyState
            title="A little inspiration for later."
            detail="Save a look from Today. It will be right here when you need it."
          />
        }
        renderItem={({ item }) => {
          const pieces = item.garmentIds
            .map((id) => garments.find((garment) => garment.id === id))
            .filter((garment) => Boolean(garment));
          return (
            <View
              style={{ backgroundColor: c.canvas.elevated, borderRadius: 20, padding: 16, gap: 14 }}
            >
              <AnimatedPressable
                accessibilityRole="button"
                accessibilityLabel={'Open saved ' + item.occasion.replace('_', ' ') + ' look'}
                onPress={() => {
                  onClose();
                  router.push({ pathname: '/look/[id]', params: { id: item.id } });
                }}
                style={{ gap: 12 }}
              >
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {pieces.map((garment) =>
                    garment ? (
                      <GarmentImage
                        key={garment.id}
                        garment={garment}
                        variant="thumbnail"
                        style={{ width: 50, height: 64 }}
                      />
                    ) : null,
                  )}
                </View>
                <AppText variant="bodyLarge" style={{ textTransform: 'capitalize' }}>
                  {item.occasion.replace('_', ' ')} / {item.garmentIds.length} pieces
                </AppText>
                {pieces.length < item.garmentIds.length ? (
                  <AppText variant="metadata">Some pieces are no longer in your wardrobe.</AppText>
                ) : null}
              </AnimatedPressable>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <AppText variant="metadata">
                  {new Date(item.createdAt).toLocaleDateString()}
                </AppText>
                <IconButton
                  label="Remove saved look"
                  icon="bookmark"
                  onPress={() => removeLook(item.id)}
                />
              </View>
            </View>
          );
        }}
      />
    </BottomSheet>
  );
}
