import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { space } from '@/design/spacing';

type Props = {
  eyebrow?: string;
  title: string;
  detail?: string;
};

export function SectionHeader({ eyebrow, title, detail }: Props) {
  return (
    <View style={styles.root}>
      {eyebrow ? <AppText variant="eyebrow">{eyebrow}</AppText> : null}
      <AppText variant="heading">{title}</AppText>
      {detail ? <AppText variant="muted" style={styles.detail}>{detail}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.sm },
  detail: { maxWidth: 660 },
});
