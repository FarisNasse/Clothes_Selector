import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExperience } from '@/providers/ExperienceProvider';
import { layout } from '@/design/layout';
type Props = PropsWithChildren<{ scroll?: boolean; padded?: boolean; maxWidth?: number }>;
export function Screen({
  children,
  scroll = true,
  padded = true,
  maxWidth = layout.maxWidth,
}: Props) {
  const { colors } = useExperience();
  const { width } = useWindowDimensions();
  const content = (
    <View
      style={[
        styles.content,
        { maxWidth },
        padded && {
          paddingHorizontal: width < 380 ? 16 : width < 700 ? 24 : 40,
          paddingBottom: 40,
        },
      ]}
    >
      {children}
    </View>
  );
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.canvas.default }]}
    >
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
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { width: '100%', alignSelf: 'center', flex: 1 },
});
