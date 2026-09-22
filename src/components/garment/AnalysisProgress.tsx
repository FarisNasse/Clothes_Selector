import { useEffect } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from '@/components/primitives/AppText';
import { useExperience } from '@/providers/ExperienceProvider';
export function AnalysisProgress({
  uri,
  stage,
}: {
  uri: string;
  stage: 'uploading' | 'analyzing';
}) {
  const { colors: c, reducedMotion } = useExperience();
  const scan = useSharedValue(0);
  useEffect(() => {
    scan.value = reducedMotion ? 0.5 : withRepeat(withTiming(1, { duration: 1700 }), -1, true);
    return () => cancelAnimation(scan);
  }, [reducedMotion, scan]);
  const sweep = useAnimatedStyle(() => ({ top: (12 + scan.value * 64 + '%') as `${number}%` }));
  return (
    <View accessibilityState={{ busy: true }} accessibilityLiveRegion="polite" style={{ gap: 22 }}>
      <View
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          aspectRatio: 1,
          backgroundColor: c.canvas.sunken,
        }}
      >
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              height: 2,
              left: '10%',
              right: '10%',
              backgroundColor: c.accent.bronze,
              opacity: 0.8,
            },
            sweep,
          ]}
        />
      </View>
      <AppText variant="title">
        {stage === 'uploading' ? 'Bringing it into view…' : 'Getting to know your piece…'}
      </AppText>
      <AppText variant="muted">
        {stage === 'uploading'
          ? 'Uploading your photo securely.'
          : 'Reading color, shape, and the finer details. You can correct anything next.'}
      </AppText>
    </View>
  );
}
