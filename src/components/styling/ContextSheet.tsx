import { useEffect, useState } from 'react';
import { View, Switch } from 'react-native';
import { BottomSheet } from '@/components/sheets/BottomSheet';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Chip } from '@/components/primitives/Chip';
import { TextField } from '@/components/primitives/TextField';
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
  const [temperature, setTemperature] = useState(String(weather.temperatureF));
  useEffect(() => {
    if (visible) { setDraft(weather); setTemperature(String(weather.temperatureF)); }
  }, [visible, weather]);
  return (
    <BottomSheet
      visible={visible}
      title="Dress for your day."
      subtitle="Set the weather you expect. Location is never needed."
      onClose={onClose}
    >
      <AppText variant="eyebrow">Temperature</AppText>
      <TextField label="Temperature (°F)" value={temperature} onChangeText={setTemperature}
        keyboardType="number-pad" accessibilityHint="Enter a number between minus 20 and 120" />
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
            onPress={() => { setTemperature(String(value)); setDraft((current) => ({ ...current, temperatureF: Number(value) })); }}
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
            }))
          }
        />
      </View>
      <AppText variant="eyebrow">Chance of rain during your day</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[0, 0.3, 0.7, 1].map((chance) => <Chip key={chance} label={`${chance * 100}%`}
          selected={draft.precipitationProbability === chance}
          onPress={() => setDraft((current) => ({ ...current, precipitationProbability: chance }))} />)}
      </View>
      <AppText variant="eyebrow">Time outdoors</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[[0, 'Mostly indoors'], [10, 'About 10 min'], [30, '30+ min']].map(([minutes, label]) =>
          <Chip key={minutes} label={String(label)} selected={draft.outdoorMinutes === minutes}
            onPress={() => setDraft((current) => ({ ...current, outdoorMinutes: Number(minutes) }))} />)}
      </View>
      <Button
        label="Use these conditions"
        disabled={!Number.isFinite(Number(temperature)) || Number(temperature) < -20 || Number(temperature) > 120 || !temperature.trim()}
        onPress={() => {
          onApply({ ...draft, temperatureF: Number(temperature) });
          onClose();
        }}
      />
    </BottomSheet>
  );
}
