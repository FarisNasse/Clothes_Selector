import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/primitives/Button';
import { Chip } from '@/components/primitives/Chip';
import { AppText } from '@/components/primitives/AppText';
import { Screen } from '@/components/Screen';
import { space } from '@/design/spacing';
import { garmentToDraft } from '@/features/wardrobe/draft';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { colors, radii } from '@/theme/tokens';
import { garmentCategories, type Fit, type GarmentCategory, type GarmentDraft, type Season } from '@/types/domain';

const fits: Fit[] = ['slim', 'tailored', 'regular', 'relaxed', 'oversized'];
const seasons: Season[] = ['spring', 'summer', 'fall', 'winter', 'all-season'];

export default function EditGarmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { garments, editGarment, removeGarment } = useWardrobe();
  const garment = garments.find((item) => item.id === id);
  const initialDraft = useMemo(() => (garment ? garmentToDraft(garment) : null), [garment]);
  const [draft, setDraft] = useState<GarmentDraft | null>(initialDraft);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (garment) setDraft(garmentToDraft(garment));
  }, [garment]);

  if (!garment || !draft) {
    return (
      <Screen maxWidth={720}>
        <View style={styles.header}>
          <AppText variant="title">Garment not found</AppText>
          <AppText variant="muted">Return to your wardrobe and choose another piece.</AppText>
        </View>
      </Screen>
    );
  }

  function update<K extends keyof GarmentDraft>(key: K, value: GarmentDraft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateScore(key: 'formality' | 'warmth', value: string) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return;
    update(key, Math.max(1, Math.min(10, parsed)));
  }

  function toggleSeason(season: Season) {
    setDraft((current) => {
      if (!current) return current;
      const selected = current.seasons.includes(season);
      const next = selected ? current.seasons.filter((item) => item !== season) : [...current.seasons, season];
      return { ...current, seasons: next.length > 0 ? next : ['all-season'] };
    });
  }

  async function save() {
    if (!draft.name.trim() || !draft.subcategory.trim() || !draft.primaryColor.trim()) {
      Alert.alert('Missing details', 'Name, subcategory, and primary color are required.');
      return;
    }

    try {
      setSaving(true);
      await editGarment(garment.id, {
        ...draft,
        name: draft.name.trim(),
        subcategory: draft.subcategory.trim(),
        primaryColor: draft.primaryColor.trim().toLowerCase(),
        brand: draft.brand?.trim() || null,
      });
      router.back();
    } catch (caught) {
      Alert.alert('Could not save garment', caught instanceof Error ? caught.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete garment?',
      `Remove ${garment.name} and its private image from Clothes Selector?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                setDeleting(true);
                await removeGarment(garment.id);
                router.replace('/(tabs)/wardrobe');
              } catch (caught) {
                Alert.alert('Could not delete garment', caught instanceof Error ? caught.message : 'Please try again.');
              } finally {
                setDeleting(false);
              }
            })();
          },
        },
      ],
    );
  }

  return (
    <Screen maxWidth={720}>
      <View style={styles.header}>
        <AppText variant="eyebrow">Wardrobe editor</AppText>
        <AppText variant="display">Refine this piece.</AppText>
        <AppText variant="muted">Correct metadata here and recommendations will use the updated values immediately.</AppText>
      </View>

      <View style={styles.form}>
        <Field label="Name" value={draft.name} onChangeText={(value) => update('name', value)} />
        <Field label="Brand" value={draft.brand ?? ''} onChangeText={(value) => update('brand', value || null)} />
        <Field label="Subcategory" value={draft.subcategory} onChangeText={(value) => update('subcategory', value)} />
        <Field label="Primary color" value={draft.primaryColor} onChangeText={(value) => update('primaryColor', value)} />
        <Field
          label="Secondary colors"
          value={draft.secondaryColors.join(', ')}
          onChangeText={(value) => update('secondaryColors', value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean))}
        />
        <Field label="Pattern" value={draft.pattern} onChangeText={(value) => update('pattern', value)} />
        <View style={styles.scoreRow}>
          <View style={styles.scoreCell}>
            <Field label="Formality (1–10)" value={String(draft.formality)} keyboardType="number-pad" onChangeText={(value) => updateScore('formality', value)} />
          </View>
          <View style={styles.scoreCell}>
            <Field label="Warmth (1–10)" value={String(draft.warmth)} keyboardType="number-pad" onChangeText={(value) => updateScore('warmth', value)} />
          </View>
        </View>
        <Field
          label="Materials"
          value={draft.materials.join(', ')}
          onChangeText={(value) => update('materials', value.split(',').map((item) => item.trim()).filter(Boolean))}
        />
        <Field
          label="Style tags"
          value={draft.styleTags.join(', ')}
          onChangeText={(value) => update('styleTags', value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean))}
        />
        <Field
          label="Purchase price"
          value={draft.purchasePrice === null ? '' : String(draft.purchasePrice)}
          keyboardType="decimal-pad"
          onChangeText={(value) => update('purchasePrice', value.trim() ? Number(value) || 0 : null)}
        />

        <View style={styles.group}>
          <AppText variant="eyebrow">Category</AppText>
          <View style={styles.chips}>
            {garmentCategories.map((category) => (
              <Chip
                key={category}
                label={category}
                selected={draft.category === category}
                onPress={() => update('category', category as GarmentCategory)}
              />
            ))}
          </View>
        </View>

        <View style={styles.group}>
          <AppText variant="eyebrow">Fit</AppText>
          <View style={styles.chips}>
            {fits.map((fit) => (
              <Chip key={fit} label={fit} selected={draft.fit === fit} onPress={() => update('fit', fit)} />
            ))}
          </View>
        </View>

        <View style={styles.group}>
          <AppText variant="eyebrow">Seasons</AppText>
          <View style={styles.chips}>
            {seasons.map((season) => (
              <Chip key={season} label={season} selected={draft.seasons.includes(season)} onPress={() => toggleSeason(season)} />
            ))}
          </View>
        </View>

        <View style={styles.group}>
          <AppText variant="eyebrow">Weather protection</AppText>
          <View style={styles.chips}>
            <Chip label="Dry weather" selected={!draft.waterproof} onPress={() => update('waterproof', false)} />
            <Chip label="Water resistant" selected={draft.waterproof} onPress={() => update('waterproof', true)} />
          </View>
        </View>

        <View style={styles.actions}>
          <Button label="Save changes" loading={saving} onPress={() => void save()} />
          <Button label="Delete garment" variant="secondary" loading={deleting} onPress={confirmDelete} />
        </View>
      </View>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
}) {
  return (
    <View style={styles.group}>
      <AppText variant="eyebrow">{label}</AppText>
      <TextInput
        value={value}
        keyboardType={keyboardType}
        placeholderTextColor={colors.muted}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space.lg, gap: space.sm },
  form: { marginTop: space.xxl, gap: space.lg, paddingBottom: space.sectionLarge },
  group: { gap: space.sm },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: space.lg,
    color: colors.ink,
    backgroundColor: colors.surface,
    fontSize: 15,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  scoreRow: { flexDirection: 'row', gap: space.md },
  scoreCell: { flex: 1 },
  actions: { gap: space.sm, marginTop: space.lg },
});
