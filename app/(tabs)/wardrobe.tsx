import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { GarmentTile } from '@/components/GarmentTile';
import { Pill } from '@/components/Pill';
import { Screen } from '@/components/Screen';
import { Type } from '@/components/Type';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { colors, radii, spacing } from '@/theme/tokens';
import type { GarmentCategory } from '@/types/domain';

const filters: { label: string; value: GarmentCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Tops', value: 'top' },
  { label: 'Bottoms', value: 'bottom' },
  { label: 'Outerwear', value: 'outerwear' },
  { label: 'Shoes', value: 'footwear' },
];

export default function WardrobeScreen() {
  const { garments, loading, error } = useWardrobe();
  const [filter, setFilter] = useState<GarmentCategory | 'all'>('all');

  const visible = useMemo(
    () => (filter === 'all' ? garments : garments.filter((garment) => garment.category === filter)),
    [filter, garments],
  );

  const totalValue = garments.reduce((sum, garment) => sum + (garment.purchasePrice ?? 0), 0);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Type variant="eyebrow">Digital wardrobe</Type>
          <Type variant="display">Your closet.</Type>
          <Type variant="muted">Structured inventory designed for decisions, not just cataloging.</Type>
        </View>
        <Link href="/garment/add" asChild>
          <Pressable style={styles.addButton} accessibilityLabel="Add garment">
            <Ionicons name="add" color={colors.white} size={26} />
          </Pressable>
        </Link>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Type variant="eyebrow">Items</Type>
          <Type variant="title">{garments.length}</Type>
        </View>
        <View style={styles.metric}>
          <Type variant="eyebrow">Known value</Type>
          <Type variant="title">${totalValue.toLocaleString()}</Type>
        </View>
        <View style={styles.metric}>
          <Type variant="eyebrow">Wears</Type>
          <Type variant="title">{garments.reduce((sum, garment) => sum + garment.wearCount, 0)}</Type>
        </View>
      </View>

      <View style={styles.filters}>
        {filters.map((item) => (
          <Pill
            key={item.value}
            label={item.label}
            selected={filter === item.value}
            onPress={() => setFilter(item.value)}
          />
        ))}
      </View>

      {loading ? <ActivityIndicator style={styles.loader} color={colors.forest} /> : null}
      {error ? <Type style={styles.error}>{error}</Type> : null}

      <View style={styles.grid}>
        {visible.map((garment) => (
          <GarmentTile
            garment={garment}
            key={garment.id}
            onPress={() => router.push({ pathname: '/garment/[id]', params: { id: garment.id } })}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  headerCopy: { flex: 1, gap: spacing.xs },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metrics: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  metric: { flex: 1, backgroundColor: colors.surfaceStrong, padding: spacing.md, borderRadius: radii.md, gap: 3 },
  filters: { marginVertical: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  loader: { marginVertical: spacing.xl },
  error: { color: colors.danger, marginBottom: spacing.md },
});
