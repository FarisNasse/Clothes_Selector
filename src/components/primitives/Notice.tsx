import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Button } from './Button';
import { useExperience } from '@/providers/ExperienceProvider';
export function Notice({
  message,
  tone = 'success',
  action,
  onAction,
}: {
  message: string;
  tone?: 'success' | 'error' | 'info';
  action?: string;
  onAction?: () => void;
}) {
  const { colors: c } = useExperience();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{ backgroundColor: c.canvas.sunken, padding: 16, borderRadius: 16, gap: 8 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons
          name={
            tone === 'error'
              ? 'alert-circle-outline'
              : tone === 'info'
                ? 'information-circle-outline'
                : 'checkmark-circle'
          }
          size={20}
          color={tone === 'error' ? c.feedback.negative : c.accent.forest}
        />
        <AppText variant="bodySmall" style={{ flex: 1 }}>
          {message}
        </AppText>
      </View>
      {action && onAction ? <Button label={action} onPress={onAction} variant="quiet" /> : null}
    </View>
  );
}
