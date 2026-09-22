import { useDeferredValue, useMemo, useState } from 'react';
import { FlatList, ScrollView, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { PageHeading } from '@/components/navigation/PageHeading';
import { GarmentTile } from '@/components/garment/GarmentTile';
import { FilterSheet } from '@/components/wardrobe/FilterSheet';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Chip } from '@/components/primitives/Chip';
import { EmptyState } from '@/components/primitives/EmptyState';
import { IconButton } from '@/components/primitives/IconButton';
import { Notice } from '@/components/primitives/Notice';
import { Skeleton } from '@/components/primitives/Skeleton';
import { layout } from '@/design/layout';
import { activeFilterCount, defaultFilters, filterWardrobe } from '@/features/wardrobe/filter';
import { useExperience } from '@/providers/ExperienceProvider';
import { useCollection } from '@/providers/CollectionProvider';
import { useWardrobe } from '@/providers/WardrobeProvider';
import type { GarmentCategory } from '@/types/domain';
const categories: [GarmentCategory | 'all', string][] = [
  ['all', 'All pieces'],
  ['top', 'Tops'],
  ['bottom', 'Bottoms'],
  ['outerwear', 'Layers'],
  ['footwear', 'Shoes'],
  ['accessory', 'Accessories'],
  ['suit', 'Suits'],
];
export default function WardrobeScreen() {
  const { garments, loading, error, refresh } = useWardrobe();
  const { favorites, toggleFavorite, error: collectionError } = useCollection();
  const { colors: c, haptic } = useExperience();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [focused, setFocused] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const visible = useMemo(
    () => filterWardrobe(garments, deferredQuery, filters, favorites),
    [garments, deferredQuery, filters, favorites],
  );
  const colors = useMemo(
    () =>
      [
        ...new Set(
          garments
            .flatMap((item) => [item.primaryColor, ...item.secondaryColors])
            .map((color) => color.toLowerCase()),
        ),
      ].sort(),
    [garments],
  );
  const columns = width >= 1200 ? 5 : width >= 900 ? 4 : width >= 700 ? 3 : 2;
  const padding = width < 380 ? 16 : width < 700 ? 24 : 40;
  const tileWidth = (Math.min(width, layout.maxWidth) - padding * 2 - 14 * (columns - 1)) / columns;
  const extraFilters = activeFilterCount(filters);
  const clear = () => {
    setQuery('');
    setFilters(defaultFilters);
  };
  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        key={columns}
        data={visible}
        numColumns={columns}
        keyExtractor={(item) => item.id}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={5}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: 14 }}
        contentContainerStyle={{ paddingHorizontal: padding, paddingBottom: 28 }}
        ListHeaderComponent={
          <View>
            <PageHeading
              eyebrow="Your wardrobe"
              title={'Good pieces.\nEndless possibilities.'}
              action={
                <IconButton
                  label="Add garment"
                  icon="add"
                  onPress={() => router.push('/garment/add')}
                />
              }
            />
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View
                style={{
                  flex: 1,
                  minHeight: 52,
                  paddingLeft: 16,
                  paddingRight: 3,
                  borderRadius: 26,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: focused ? c.accent.forest : c.border.subtle,
                  backgroundColor: c.canvas.elevated,
                  gap: 10,
                }}
              >
                <Ionicons name="search-outline" color={c.ink.secondary} size={19} />
                <TextInput
                  accessibilityLabel="Search wardrobe"
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Try “black dinner”"
                  placeholderTextColor={c.ink.tertiary}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  returnKeyType="search"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    color: c.ink.primary,
                    minHeight: 48,
                    fontSize: 15,
                  }}
                />
                {query ? (
                  <IconButton label="Clear search" icon="close" onPress={() => setQuery('')} />
                ) : null}
              </View>
              <IconButton
                label={'Filters' + (extraFilters ? ', ' + extraFilters + ' active' : '')}
                icon="options-outline"
                selected={extraFilters > 0}
                onPress={() => setFiltersOpen(true)}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 18 }}
            >
              {categories.map(([category, label]) => (
                <Chip
                  key={category}
                  label={label}
                  selected={filters.category === category}
                  onPress={() => setFilters((current) => ({ ...current, category }))}
                />
              ))}
            </ScrollView>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 18,
              }}
            >
              <AppText variant="eyebrow">
                {visible.length} {visible.length === 1 ? 'piece' : 'pieces'}
                {extraFilters ? ' / ' + extraFilters + ' filters' : ''}
              </AppText>
              <Button
                label="Add a piece"
                icon="add"
                variant="quiet"
                onPress={() => router.push('/garment/add')}
              />
            </View>
            {collectionError ? <Notice message={collectionError} tone="error" /> : null}
            {error ? (
              <Notice
                message="We could not open your wardrobe."
                tone="error"
                action="Try again"
                onAction={refresh}
              />
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <GarmentTile
            garment={item}
            width={tileWidth}
            favorite={favorites.includes(item.id)}
            onFavorite={() => {
              if (toggleFavorite(item.id)) haptic();
            }}
            onPress={() => router.push({ pathname: '/garment/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <WardrobeSkeleton columns={columns} tileWidth={tileWidth} />
          ) : error ? null : (
            <EmptyState
              title={garments.length ? 'Nothing here. Yet.' : 'Your wardrobe starts here.'}
              detail={
                garments.length
                  ? query
                    ? 'No pieces match “' + query + '” with these filters.'
                    : 'Try a different filter to find your pieces.'
                  : 'Start with a favorite top, a pair of trousers, and your go-to shoes.'
              }
              actionLabel={garments.length ? 'Clear filters' : 'Add your first piece'}
              onAction={() => {
                if (garments.length) clear();
                else router.push('/garment/add');
              }}
            />
          )
        }
      />
      <FilterSheet
        visible={filtersOpen}
        filters={filters}
        colors={colors}
        onApply={setFilters}
        onClose={() => setFiltersOpen(false)}
      />
    </Screen>
  );
}

function WardrobeSkeleton({ columns, tileWidth }: { columns: number; tileWidth: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 14 }}>
      {Array.from({ length: columns }, (_, index) => (
        <Skeleton key={index} width={tileWidth} height={tileWidth * 1.3} />
      ))}
    </View>
  );
}
