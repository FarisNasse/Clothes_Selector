import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { AppText } from './AppText';
import { useExperience } from '@/providers/ExperienceProvider';
export function TextField({
  label,
  style,
  onFocus,
  onBlur,
  ...props
}: TextInputProps & { label: string }) {
  const { colors: c } = useExperience();
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <AppText variant="bodySmall" style={{ fontWeight: '500' }}>
        {label}
      </AppText>
      <TextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={c.ink.tertiary}
        onFocus={(event) => {
          setFocus(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocus(false);
          onBlur?.(event);
        }}
        style={[
          {
            minHeight: 52,
            backgroundColor: c.canvas.elevated,
            borderWidth: 1,
            borderColor: focus ? c.accent.forest : c.border.subtle,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: c.ink.primary,
            fontSize: 16,
          },
          style,
        ]}
      />
    </View>
  );
}
