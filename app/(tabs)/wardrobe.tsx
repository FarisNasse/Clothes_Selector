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
  const { favorites, looks, toggleFavorite, error: collectionError } = useCollection();
  const { colors: c, haptic } = useExperience();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [focused, setFocused] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<'closet' | 'catalog'>('closet');
  const [group, setGroup] = useState<'all' | 'favorites' | 'unworn' | 'recent'>('all');
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
  const grouped = useMemo(() => {
    if (group === 'favorites') return visible.filter((item) => favorites.includes(item.id));
    if (group === 'unworn') return visible.filter((item) => item.wearCount === 0);
    if (group === 'recent') return visible.filter((item) => item.lastWornAt).sort((a, b) => (b.lastWornAt ?? '').localeCompare(a.lastWornAt ?? ''));
    return visible;
  }, [visible, group, favorites]);
  const columns = view === 'closet' ? (width >= 900 ? 3 : 2) : width >= 1200 ? 5 : width >= 900 ? 4 : width >= 700 ? 3 : 2;
  const padding = width < 380 ? 16 : width < 700 ? 24 : 40;
  const tileWidth = (Math.min(width, layout.maxWidth) - padding * 2 - 14 * (columns - 1)) / columns;
  const extraFilters = activeFilterCount(filters);
  const clear = () => {
    setQuery('');
    setFilters(defaultFilters);
    setGroup('all');
  };
  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        key={columns + view}
        data={grouped}
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
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingBottom: 16 }}>
              <AppText variant="eyebrow" style={{ marginRight: 6 }}>Your closet</AppText>
              {(['all', 'favorites', 'unworn', 'recent'] as const).map((value) => <Chip key={value} label={{ all: 'All', favorites: 'Favorites', unworn: 'Never worn', recent: 'Recently worn' }[value]} selected={group === value} onPress={() => setGroup(value)} />)}
              <View style={{ flex: 1 }} />
              <Chip label="Closet" selected={view === 'closet'} onPress={() => setView('closet')} />
              <Chip label="Catalog" selected={view === 'catalog'} onPress={() => setView('catalog')} />
            </View>
            {query.trim() ? <View style={{ padding: 14, marginBottom: 15, backgroundColor: c.canvas.editorial, borderRadius: 16, gap: 10 }}>
              <AppText variant="eyebrow">Search your wardrobe / {grouped.length} pieces</AppText>
              {colors.filter((color) => color.includes(query.trim().toLowerCase())).length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}><AppText variant="metadata">COLORS</AppText>{colors.filter((color) => color.includes(query.trim().toLowerCase())).slice(0, 4).map((color) => <Chip key={color} label={color} selected={filters.color === color} onPress={() => setFilters((current) => ({ ...current, color }))} />)}</View> : null}
              {categories.filter(([, label]) => label.toLowerCase().includes(query.trim().toLowerCase())).length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}><AppText variant="metadata">CATEGORIES</AppText>{categories.filter(([, label]) => label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 3).map(([category, label]) => <Chip key={category} label={label} selected={filters.category === category} onPress={() => { setFilters((current) => ({ ...current, category })); setQuery(''); }} />)}</View> : null}
              {looks.filter((look) => look.occasion.includes(query.trim().toLowerCase())).slice(0, 2).map((look) => <Button key={look.id} label={'Saved ' + look.occasion + ' look'} variant="quiet" onPress={() => router.push({ pathname: '/look/[id]', params: { id: look.id } })} />)}
            </View> : null}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 18,
              }}
            >
              <AppText variant="eyebrow">
                {grouped.length} {grouped.length === 1 ? 'piece' : 'pieces'}
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
            editorial={view === 'closet'}
            favorite={favorites.includes(item.id)}
            onFavorite={() => {
              if (toggleFavorite(item.id)) haptic();
            }}
            onPress={() => router.push({ pathname: '/garment/[id]', params: { id: item.id } })}
            onStyle={() => router.push({ pathname: '/garment/[id]', params: { id: item.id, style: '1' } })}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <WardrobeSkeleton columns={columns} tileWidth={tileWidth} />
          ) : error ? null : (
            <EmptyState
              title={garments.length ? 'A quieter rail today.' : 'Your wardrobe starts here.'}
              detail={
                garments.length
                  ? query
                    ? 'No pieces match “' + query + '” with these filters.'
                    : 'Try another collection or filter to find your pieces.'
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
