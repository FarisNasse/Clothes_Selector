import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';

import { GarmentTile } from '@/components/garment/GarmentTile';
import { AppText } from '@/components/primitives/AppText';
import { Chip } from '@/components/primitives/Chip';
import { EmptyState } from '@/components/primitives/EmptyState';
import { Screen } from '@/components/Screen';
import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
import { useWardrobe } from '@/providers/WardrobeProvider';
import type { GarmentCategory } from '@/types/domain';

const filters: { label: string; value: GarmentCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Tops', value: 'top' },
  { label: 'Bottoms', value: 'bottom' },
  { label: 'Outerwear', value: 'outerwear' },
  { label: 'Shoes', value: 'footwear' },
  { label: 'Accessories', value: 'accessory' },
];

export default function WardrobeScreen() {
  const { garments, loading, error } = useWardrobe();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<GarmentCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return garments.filter((garment) => {
      const matchesCategory = filter === 'all' || garment.category === filter;
      const matchesQuery =
        !normalized ||
        [garment.name, garment.brand ?? '', garment.primaryColor, garment.subcategory, ...garment.styleTags]
          .join(' ')
          .toLowerCase()
          .includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [filter, garments, query]);

  const columns = width >= 900 ? 4 : width < 360 ? 2 : 3;
  const tileWidth: `${number}%` = columns === 4 ? '23.5%' : columns === 2 ? '48.5%' : '31.5%';

  return (
    <Screen maxWidth={1180}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="eyebrow">Wardrobe</AppText>
          <AppText variant="displayXL">Everything you own, visually.</AppText>
          <AppText variant="muted" style={styles.headerDetail}>
            Browse the closet first. Metadata stays quiet until you need it.
          </AppText>
        </View>
        <Link href="/garment/add" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add garment"
            style={({ pressed }) => [styles.addButton, pressed && styles.addPressed]}
          >
            <Ionicons name="add" color={semanticColors.ink.inverse} size={27} />
          </Pressable>
        </Link>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={semanticColors.ink.tertiary} />
          <TextInput
            accessibilityLabel="Search wardrobe"
            value={query}
            onChangeText={setQuery}
            placeholder="Search your wardrobe"
            placeholderTextColor={semanticColors.ink.tertiary}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query ? (
            <Pressable accessibilityLabel="Clear wardrobe search" onPress={() => setQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={semanticColors.ink.tertiary} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.countBadge}>
          <AppText variant="metadata" style={styles.countText}>{visible.length} pieces</AppText>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRail}>
        {filters.map((item) => (
          <Chip
            key={item.value}
            label={item.label}
            selected={filter === item.value}
            onPress={() => setFilter(item.value)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={semanticColors.accent.forest} />
          <AppText variant="metadata">Opening your wardrobe…</AppText>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorWrap}>
          <Ionicons name="alert-circle-outline" size={18} color={semanticColors.feedback.negative} />
          <AppText variant="bodySmall" style={styles.errorText}>{error}</AppText>
        </View>
      ) : null}

      {!loading && visible.length ? (
        <View style={styles.grid}>
          {visible.map((garment) => (
            <GarmentTile
              garment={garment}
              width={tileWidth}
              key={garment.id}
              onPress={() => router.push({ pathname: '/garment/[id]', params: { id: garment.id } })}
            />
          ))}
        </View>
      ) : null}

      {!loading && !visible.length ? (
        <EmptyState
          title={garments.length ? 'Nothing matches that search.' : 'Your wardrobe is ready for its first piece.'}
          detail={
            garments.length
              ? 'Try another category, color, garment type, or brand.'
              : 'Photograph a garment and Clothes Selector will turn it into a structured, styleable wardrobe item.'
          }
          actionLabel={garments.length ? 'Clear filters' : 'Add a garment'}
          onAction={() => {
            if (garments.length) {
              setFilter('all');
              setQuery('');
            } else {
              router.push('/garment/add');
            }
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: space.lg,
    flexDirection: 'row',
    gap: space.xl,
    alignItems: 'flex-start',
  },
  headerCopy: { flex: 1, gap: space.sm },
  headerDetail: { maxWidth: 620 },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: semanticColors.accent.forestDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
  toolbar: {
    marginTop: space.section,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  search: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    backgroundColor: semanticColors.canvas.elevated,
    borderWidth: 1,
    borderColor: semanticColors.border.subtle,
  },
  searchInput: { flex: 1, color: semanticColors.ink.primary, fontSize: 15, paddingVertical: 0 },
  countBadge: {
    minHeight: 42,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: semanticColors.canvas.sunken,
    paddingHorizontal: space.lg,
  },
  countText: { fontWeight: '700' },
  filterRail: { gap: space.sm, paddingTop: space.lg, paddingBottom: space.xl, paddingRight: space.xxl },
  loaderWrap: { paddingVertical: space.section, alignItems: 'center', gap: space.md },
  errorWrap: {
    marginBottom: space.lg,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.md,
    backgroundColor: '#F5E6E3',
  },
  errorText: { flex: 1, color: semanticColors.feedback.negative },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
