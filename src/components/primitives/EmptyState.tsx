import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Surface } from '@/components/primitives/Surface';
import { semanticColors } from '@/design/colors';
import { space } from '@/design/spacing';

type Props = {
  title: string;
  detail: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, detail, actionLabel, onAction }: Props) {
  return (
    <Surface variant="sunken" style={styles.root}>
      <View style={styles.iconWrap}>
        <Ionicons name="shirt-outline" size={26} color={semanticColors.accent.forest} />
      </View>
      <AppText variant="heading">{title}</AppText>
      <AppText variant="muted" style={styles.detail}>{detail}</AppText>
      {actionLabel && onAction ? <Button label={actionLabel} variant="secondary" onPress={onAction} /> : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  root: { padding: space.xxl, gap: space.md, alignItems: 'flex-start' },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: semanticColors.accent.forestMist,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  detail: { maxWidth: 520 },
});
