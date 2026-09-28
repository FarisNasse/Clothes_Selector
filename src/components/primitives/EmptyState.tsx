import { View } from 'react-native';
import { BrandMark } from '@/components/brand/BrandMark';
import { AppText } from './AppText';
import { Button } from './Button';
import { useExperience } from '@/providers/ExperienceProvider';
type Props = { title: string; detail: string; actionLabel?: string; onAction?: () => void };
export function EmptyState({ title, detail, actionLabel, onAction }: Props) {
  const { colors: c } = useExperience();
  return (
    <View
      style={{
        padding: 28,
        gap: 18,
        borderRadius: 24,
        backgroundColor: c.canvas.sunken,
        alignItems: 'flex-start',
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          borderWidth: 1,
          borderColor: c.border.strong,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BrandMark size={28} color={c.accent.forest} accent={c.accent.bronze} />
      </View>
      <AppText variant="title">{title}</AppText>
      <AppText variant="muted" style={{ maxWidth: 500 }}>
        {detail}
      </AppText>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
