import { StyleSheet, View } from 'react-native';

import { Type } from '@/components/Type';
import { spacing } from '@/theme/tokens';

type Props = {
  eyebrow?: string;
  title: string;
  detail?: string;
};

export function SectionHeader({ eyebrow, title, detail }: Props) {
  return (
    <View style={styles.root}>
      {eyebrow ? <Type variant="eyebrow">{eyebrow}</Type> : null}
      <Type variant="title">{title}</Type>
      {detail ? <Type variant="muted">{detail}</Type> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.xs },
});
