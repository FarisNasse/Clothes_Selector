import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { semanticColors } from '@/design/colors';
import { space } from '@/design/spacing';

type Props = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  maxWidth?: number;
}>;

export function Screen({ children, scroll = true, padded = true, maxWidth = 1080 }: Props) {
  const content = (
    <View style={[styles.content, padded && styles.padded, { maxWidth }]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: semanticColors.canvas.default },
  scrollContent: { flexGrow: 1 },
  content: { width: '100%', alignSelf: 'center', flex: 1 },
  padded: { paddingHorizontal: space.xxl, paddingBottom: 120 },
});
