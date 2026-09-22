import { useEffect, useState } from 'react';
import { View, Switch } from 'react-native';
import { BottomSheet } from '@/components/sheets/BottomSheet';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Chip } from '@/components/primitives/Chip';
import type { WeatherContext } from '@/types/domain';
export function ContextSheet({
  visible,
  weather,
  onApply,
  onClose,
}: {
  visible: boolean;
  weather: WeatherContext;
  onApply: (value: WeatherContext) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(weather);
  useEffect(() => {
    if (visible) setDraft(weather);
  }, [visible, weather]);
  return (
    <BottomSheet
      visible={visible}
      title="Dress for your day."
      subtitle="Set the weather you expect. Location is never needed."
      onClose={onClose}
    >
      <AppText variant="eyebrow">Temperature</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[
          [40, 'Cold · 40°'],
          [50, 'Cool · 50°'],
          [65, 'Mild · 65°'],
          [80, 'Warm · 80°'],
          [90, 'Hot · 90°'],
        ].map(([value, label]) => (
          <Chip
            key={value}
            label={String(label)}
            selected={draft.temperatureF === value}
            onPress={() => setDraft((current) => ({ ...current, temperatureF: Number(value) }))}
          />
        ))}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 56,
        }}
      >
        <AppText>Expecting rain</AppText>
        <Switch
          accessibilityLabel="Expecting rain"
          value={draft.raining}
          onValueChange={(raining) =>
            setDraft((current) => ({
              ...current,
              raining,
              precipitationProbability: raining ? 1 : 0,
            }))
          }
        />
      </View>
      <Button
        label="Use these conditions"
        onPress={() => {
          onApply(draft);
          onClose();
        }}
      />
    </BottomSheet>
  );
}
