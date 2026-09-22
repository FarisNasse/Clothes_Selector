import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { AppText } from '@/components/primitives/AppText';
import { IconButton } from '@/components/primitives/IconButton';
import { layout } from '@/design/layout';
import { motion } from '@/design/motion';
import { useExperience } from '@/providers/ExperienceProvider';

type Props = PropsWithChildren<{
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  scroll?: boolean;
}>;
export function BottomSheet({ visible, title, subtitle, onClose, children, scroll = true }: Props) {
  const { colors: c, reducedMotion } = useExperience();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const y = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const pan = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((event) => {
      y.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 80 || event.velocityY > 750) onClose();
      y.value = reducedMotion ? 0 : withSpring(0, motion.springSoft);
    });
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onClose}
      onShow={() => {
        y.value = 0;
      }}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            flex: 1,
            justifyContent: width >= layout.tablet ? 'center' : 'flex-end',
            alignItems: 'center',
          }}
        >
          <Pressable
            accessible={false}
            importantForAccessibility="no"
            onPress={onClose}
            style={{ position: 'absolute', inset: 0, backgroundColor: layout.overlay }}
          />
          <Animated.View
            accessibilityViewIsModal
            style={[
              {
                width: '100%',
                maxWidth: 580,
                maxHeight: height * 0.88,
                backgroundColor: c.canvas.default,
                borderRadius: 28,
                paddingBottom: Math.max(insets.bottom, 20),
                overflow: 'hidden',
              },
              style,
            ]}
          >
            <GestureDetector gesture={pan}>
              <View
                accessible={false}
                style={{ height: 28, justifyContent: 'center', alignItems: 'center' }}
              >
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 4,
                    backgroundColor: c.border.strong,
                  }}
                />
              </View>
            </GestureDetector>
            <View
              style={{
                paddingHorizontal: 24,
                paddingBottom: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <View style={{ flex: 1, gap: 6 }}>
                <AppText variant="title" accessibilityRole="header">
                  {title}
                </AppText>
                {subtitle ? <AppText variant="metadata">{subtitle}</AppText> : null}
              </View>
              <IconButton label="Close sheet" icon="close" onPress={onClose} />
            </View>
            {scroll ? (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 12, gap: 16 }}
              >
                {children}
              </ScrollView>
            ) : (
              <View style={{ flexShrink: 1, paddingHorizontal: 24 }}>{children}</View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}
