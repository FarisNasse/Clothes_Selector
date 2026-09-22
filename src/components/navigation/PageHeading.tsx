import { View, useWindowDimensions } from 'react-native';
import type { ReactNode } from 'react';
import { AppText } from '@/components/primitives/AppText';
import { layout } from '@/design/layout';
import { typography } from '@/design/typography';
export function PageHeading({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  const { width, fontScale } = useWindowDimensions();
  const compact = width < layout.compact || fontScale > 1.3;
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingTop: 28,
        gap: 16,
        marginBottom: 28,
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AppText variant="eyebrow" style={{ flex: 1 }}>
            {eyebrow}
          </AppText>
          {compact ? action : null}
        </View>
        <AppText
          variant="displayXL"
          accessibilityRole="header"
          style={compact ? { fontSize: typography.display, lineHeight: 41 } : undefined}
        >
          {title}
        </AppText>
        {detail ? (
          <AppText variant="muted" style={{ maxWidth: 580 }}>
            {detail}
          </AppText>
        ) : null}
      </View>
      {compact ? null : action}
    </View>
  );
}
