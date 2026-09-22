import { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Chip } from '@/components/primitives/Chip';
import { IconButton } from '@/components/primitives/IconButton';
import { TextField } from '@/components/primitives/TextField';
import { parseLabels } from '@/features/wardrobe/validation';
import { garmentCategories, type Fit, type GarmentDraft, type Season } from '@/types/domain';
const fits: Fit[] = ['slim', 'tailored', 'regular', 'relaxed', 'oversized'];
const seasons: Season[] = ['spring', 'summer', 'fall', 'winter', 'all-season'];
const colors = ['black', 'white', 'cream', 'navy', 'blue', 'brown', 'olive', 'gray', 'beige'];
type Props = { value: GarmentDraft; onChange: (next: GarmentDraft) => void; disabled?: boolean };
export function GarmentForm({ value, onChange, disabled = false }: Props) {
  const [advanced, setAdvanced] = useState(false);
  function update<K extends keyof GarmentDraft>(key: K, next: GarmentDraft[K]) {
    if (!disabled) onChange({ ...value, [key]: next });
  }
  return (
    <View style={{ gap: 24 }}>
      <TextField
        label="Name"
        value={value.name}
        maxLength={120}
        editable={!disabled}
        onChangeText={(text) => update('name', text)}
      />
      <TextField
        label="Brand · optional"
        value={value.brand ?? ''}
        maxLength={80}
        editable={!disabled}
        onChangeText={(text) => update('brand', text || null)}
      />
      <View style={{ gap: 10 }}>
        <AppText variant="eyebrow">Category</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {garmentCategories.map((category) => (
            <Chip
              key={category}
              label={category === 'footwear' ? 'Shoes' : category}
              selected={value.category === category}
              onPress={disabled ? undefined : () => update('category', category)}
            />
          ))}
        </View>
      </View>
      <TextField
        label="Piece type"
        value={value.subcategory}
        maxLength={80}
        editable={!disabled}
        onChangeText={(text) => update('subcategory', text)}
      />
      <View style={{ gap: 10 }}>
        <AppText variant="eyebrow">Color</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {colors.map((color) => (
            <Chip
              key={color}
              label={color}
              selected={value.primaryColor.toLowerCase() === color}
              onPress={disabled ? undefined : () => update('primaryColor', color)}
            />
          ))}
        </View>
        <TextField
          label="Exact color"
          value={value.primaryColor}
          maxLength={40}
          editable={!disabled}
          onChangeText={(text) => update('primaryColor', text)}
        />
      </View>
      <View style={{ gap: 10 }}>
        <AppText variant="eyebrow">Fit</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {fits.map((fit) => (
            <Chip
              key={fit}
              label={fit}
              selected={value.fit === fit}
              onPress={disabled ? undefined : () => update('fit', fit)}
            />
          ))}
        </View>
      </View>
      <Rating
        label="Dressiness"
        value={value.formality}
        low="Everyday"
        high="Formal"
        disabled={disabled}
        onChange={(number) => update('formality', number)}
      />
      <Rating
        label="Warmth"
        value={value.warmth}
        low="Light"
        high="Cozy"
        disabled={disabled}
        onChange={(number) => update('warmth', number)}
      />
      <View style={{ gap: 10 }}>
        <AppText variant="eyebrow">Season</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {seasons.map((season) => (
            <Chip
              key={season}
              label={season}
              selected={value.seasons.includes(season)}
              onPress={
                disabled
                  ? undefined
                  : () => {
                      const next = value.seasons.includes(season)
                        ? value.seasons.filter((item) => item !== season)
                        : [...value.seasons.filter((item) => item !== 'all-season'), season];
                      update(
                        'seasons',
                        season === 'all-season' || next.length === 0 ? ['all-season'] : next,
                      );
                    }
              }
            />
          ))}
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <AppText variant="eyebrow">Weather</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip
            label="Dry days"
            selected={!value.waterproof}
            onPress={disabled ? undefined : () => update('waterproof', false)}
          />
          <Chip
            label="Water resistant"
            selected={value.waterproof}
            onPress={disabled ? undefined : () => update('waterproof', true)}
          />
        </View>
      </View>
      <Button
        label={advanced ? 'Fewer details' : 'Pattern, materials & more'}
        icon={advanced ? 'chevron-up' : 'chevron-down'}
        variant="quiet"
        onPress={() => setAdvanced(!advanced)}
      />
      {advanced ? (
        <View style={{ gap: 20 }}>
          <TextField
            label="Pattern"
            value={value.pattern}
            maxLength={40}
            editable={!disabled}
            onChangeText={(text) => update('pattern', text)}
          />
          <LabelsField
            label="Materials · separate with commas"
            values={value.materials}
            disabled={disabled}
            onChange={(items) => update('materials', items)}
          />
          <LabelsField
            label="Style tags · separate with commas"
            values={value.styleTags}
            disabled={disabled}
            onChange={(items) => update('styleTags', items)}
          />
          <LabelsField
            label="Secondary colors · separate with commas"
            values={value.secondaryColors}
            disabled={disabled}
            onChange={(items) => update('secondaryColors', items)}
          />
          <PriceField
            value={value.purchasePrice}
            disabled={disabled}
            onChange={(price) => update('purchasePrice', price)}
          />
        </View>
      ) : null}
    </View>
  );
}
function Rating({
  label,
  value,
  low,
  high,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  low: string;
  high: string;
  onChange: (next: number) => void;
  disabled: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <AppText variant="eyebrow">{label}</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <IconButton
          label={'Decrease ' + label.toLowerCase()}
          icon="remove"
          onPress={() => onChange(value - 1)}
          disabled={disabled || value <= 1}
        />
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <AppText>{value} / 10</AppText>
          <AppText variant="metadata">
            {low} → {high}
          </AppText>
        </View>
        <IconButton
          label={'Increase ' + label.toLowerCase()}
          icon="add"
          onPress={() => onChange(value + 1)}
          disabled={disabled || value >= 10}
        />
      </View>
    </View>
  );
}
function LabelsField({
  label,
  values,
  onChange,
  disabled,
}: {
  label: string;
  values: string[];
  onChange: (items: string[]) => void;
  disabled: boolean;
}) {
  const [raw, setRaw] = useState(values.join(', '));
  return (
    <TextField
      label={label}
      value={raw}
      editable={!disabled}
      onChangeText={(text) => {
        setRaw(text);
        onChange(parseLabels(text));
      }}
    />
  );
}
function PriceField({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled: boolean;
}) {
  const [raw, setRaw] = useState(value === null ? '' : String(value));
  return (
    <TextField
      label="Purchase price · optional, USD"
      value={raw}
      keyboardType="decimal-pad"
      editable={!disabled}
      onChangeText={(text) => {
        setRaw(text);
        onChange(text.trim() ? Number(text) : null);
      }}
    />
  );
}
