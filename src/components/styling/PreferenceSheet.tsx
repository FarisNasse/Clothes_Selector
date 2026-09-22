import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from '@/components/sheets/BottomSheet';
import { AppText } from '@/components/primitives/AppText';
import { Chip } from '@/components/primitives/Chip';
import { Button } from '@/components/primitives/Button';
import { TextField } from '@/components/primitives/TextField';
import { Notice } from '@/components/primitives/Notice';
import { useStyleProfile } from '@/providers/StyleProfileProvider';
import { useExperience } from '@/providers/ExperienceProvider';
import { parseLabels } from '@/features/wardrobe/validation';
import type { Fit, StyleProfile } from '@/types/domain';
const fits: Fit[] = ['slim', 'tailored', 'regular', 'relaxed', 'oversized'];
export function PreferenceSheet({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { profile, save, loading, error: loadError } = useStyleProfile();
  const { haptic } = useExperience();
  const [draft, setDraft] = useState<StyleProfile>(profile);
  const [avoid, setAvoid] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (visible) {
      setDraft(profile);
      setAvoid(profile.dislikedColors.join(', '));
      setError(null);
    }
  }, [visible, profile]);
  const styles = [
    ...new Set([
      'minimalist',
      'contemporary',
      'classic',
      'streetwear',
      'preppy',
      'workwear',
      'athleisure',
      ...Object.keys(profile.styleWeights),
    ]),
  ];
  async function persist() {
    if (saving || loading || loadError) return;
    setSaving(true);
    try {
      await save({ ...draft, dislikedColors: parseLabels(avoid) });
      haptic('success');
      onSaved();
      onClose();
    } catch {
      setError('We could not save your preferences. Try again; your choices are still here.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <BottomSheet
      visible={visible}
      title="Make it feel like you."
      subtitle="Choose what you gravitate toward. There are no wrong answers."
      onClose={() => {
        if (!saving) onClose();
      }}
    >
      <AppText variant="eyebrow">Your kind of fit</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {fits.map((fit) => (
          <Chip
            key={fit}
            label={fit}
            selected={draft.preferredFits.includes(fit)}
            onPress={
              saving
                ? undefined
                : () =>
                    setDraft((current) => ({
                      ...current,
                      preferredFits: current.preferredFits.includes(fit)
                        ? current.preferredFits.filter((item) => item !== fit)
                        : [...current.preferredFits, fit],
                    }))
            }
          />
        ))}
      </View>
      <AppText variant="eyebrow">A little more of this</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {styles.map((style) => (
          <Chip
            key={style}
            label={style}
            selected={(draft.styleWeights[style] ?? 0.5) >= 0.65}
            onPress={
              saving
                ? undefined
                : () =>
                    setDraft((current) => ({
                      ...current,
                      styleWeights: {
                        ...current.styleWeights,
                        [style]: (current.styleWeights[style] ?? 0.5) >= 0.65 ? 0.35 : 0.85,
                      },
                    }))
            }
          />
        ))}
      </View>
      <TextField
        label="Colors to avoid · separate with commas"
        value={avoid}
        editable={!saving}
        onChangeText={setAvoid}
        placeholder="Neon green, hot pink"
      />
      {error ? <Notice message={error} tone="error" /> : null}
      <Button
        label="Save my preferences"
        loading={saving}
        disabled={loading || Boolean(loadError)}
        onPress={persist}
      />
    </BottomSheet>
  );
}
