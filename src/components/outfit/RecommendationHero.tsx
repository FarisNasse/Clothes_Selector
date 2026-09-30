import { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { OutfitFlatLay } from './OutfitFlatLay';
import { OutfitMannequin } from './OutfitMannequin';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Chip } from '@/components/primitives/Chip';
import { IconButton } from '@/components/primitives/IconButton';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import { Entrance } from '@/components/motion/Entrance';
import { useExperience } from '@/providers/ExperienceProvider';
import { motion } from '@/design/motion';
import { swatches } from '@/components/garment/GarmentIllustration';
import { canonicalColor } from '@/features/wardrobe/catalog';
import type { Garment, OutfitRecommendation } from '@/types/domain';
type Props = {
  recommendation: OutfitRecommendation;
  title?: string;
  contextLabel?: string;
  lockedGarmentId?: string | null;
  lockedIds?: string[];
  wearLoading?: boolean;
  wearSuccess?: boolean;
  onWear: () => void;
  onAnother: () => void;
  onPrevious?: () => void;
  canChange?: boolean;
  onGarmentPress?: (item: Garment) => void;
  onExplain?: () => void;
  onSave?: () => void;
  saved?: boolean;
  countLabel?: string;
  mood?: 'day' | 'rain' | 'evening';
};
export function RecommendationHero({
  recommendation,
  title = 'A look worth wearing.',
  contextLabel = 'From your wardrobe',
  lockedGarmentId = null,
  lockedIds = [],
  wearLoading = false,
  wearSuccess = false,
  onWear,
  onAnother,
  onPrevious,
  canChange = true,
  onGarmentPress,
  onExplain,
  onSave,
  saved = false,
  countLabel,
  mood = 'day',
}: Props) {
  const { width, fontScale } = useWindowDimensions();
  const { colors: c, reducedMotion } = useExperience();
  const wide = width >= 1000;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [view, setView] = useState<'flat' | 'mannequin'>('flat');
  useEffect(() => {
    try { if (localStorage.getItem('clothes-selector:outfit-view') === 'mannequin') setView('mannequin'); }
    catch { /* Keep the default if device storage is unavailable. */ }
  }, []);
  function selectView(next: 'flat' | 'mannequin') {
    setView(next);
    if (next === 'mannequin') setDetailsOpen(true);
    try { localStorage.setItem('clothes-selector:outfit-view', next); } catch { /* Session choice still works. */ }
  }
  const dominant = mood === 'rain' ? c.accent.navy : mood === 'evening' ? c.accent.burgundy : swatches[canonicalColor(recommendation.garments[0]?.primaryColor ?? '')] ?? c.canvas.editorial;
  const x = useSharedValue(0);
  const successScale = useSharedValue(1);
  useEffect(() => {
    if (wearSuccess && !reducedMotion) successScale.value = withSpring(0.98, motion.springSoft);
    else successScale.value = withSpring(1, motion.springSoft);
  }, [wearSuccess, reducedMotion, successScale]);
  const drag = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { rotate: x.value / 180 + 'deg' }, { scale: successScale.value }],
  }));
  const pan = Gesture.Pan()
    .enabled(canChange && !wearLoading && !reducedMotion)
    .activeOffsetX([-18, 18])
    .failOffsetY([-12, 12])
    .runOnJS(true)
    .onUpdate((event) => {
      x.value = Math.max(-110, Math.min(110, event.translationX));
    })
    .onEnd((event) => {
      if (event.translationX < -60) onAnother();
      else if (event.translationX > 60) (onPrevious ?? onAnother)();
    })
    .onFinalize(() => {
      x.value = withSpring(0, motion.springSoft);
    });
  return (
    <View
      style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 52 : 14, alignItems: 'stretch' }}
    >
      <View style={{ flex: wide ? 1.6 : undefined, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 12 }}>
          <Chip label="Flat lay" selected={view === 'flat'} onPress={() => selectView('flat')} />
          <Chip label="On mannequin" selected={view === 'mannequin'} onPress={() => selectView('mannequin')} />
        </View>
        <GestureDetector gesture={pan}>
          <Animated.View style={[drag, { shadowColor: '#17261C', shadowOpacity: .13, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 5 }]}>
            {view === 'flat' ? <OutfitFlatLay
              garments={recommendation.garments}
              tint={dominant}
              label={contextLabel.toUpperCase()}
              lockedGarmentId={lockedGarmentId}
              lockedIds={lockedIds}
              onGarmentPress={onGarmentPress}
            /> : <OutfitMannequin garments={recommendation.garments} label={contextLabel.toUpperCase()} />}
          </Animated.View>
        </GestureDetector>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}
        >
          <AppText variant="metadata">
            {view === 'mannequin' ? 'Illustrative preview · fit and drape may differ.' : onGarmentPress ? 'Tap a piece. Make it yours.' : 'Selected from your wardrobe.'}
          </AppText>
          <AppText variant="micro" style={{ letterSpacing: 1 }}>
            {countLabel}
          </AppText>
        </View>
      </View>
      <View style={{ flex: wide ? 1 : undefined, minWidth: 0, justifyContent: 'center', gap: wide ? 22 : 15 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AppText variant="eyebrow" style={{ flex: 1 }}>
            {contextLabel}
          </AppText>
          {onSave ? (
            <IconButton
              label={saved ? 'Remove saved look' : 'Save look on this device'}
              icon={saved ? 'bookmark' : 'bookmark-outline'}
              onPress={onSave}
              selected={saved}
            />
          ) : null}
        </View>
        <Entrance>
          <AppText
            variant="displayXL"
            accessibilityRole="header"
            style={{ fontSize: wide ? 54 : width < 380 ? 37 : 43, lineHeight: wide ? 61 : width < 380 ? 43 : 49 }}
          >
            {title}
          </AppText>
        </Entrance>
        {!wide ? <Button label={detailsOpen ? 'Hide the pieces' : 'Pieces in this look'} variant="quiet" icon={detailsOpen ? 'chevron-up' : 'chevron-down'} onPress={() => setDetailsOpen(!detailsOpen)} /> : null}
        {(wide || detailsOpen || view === 'mannequin') ? <View>
          {recommendation.garments.map((item) => (
            <AnimatedPressable
              key={item.id}
              accessibilityRole={onGarmentPress ? 'button' : 'text'}
              accessibilityLabel={'Options for ' + item.name}
              onPress={onGarmentPress ? () => onGarmentPress(item) : undefined}
              disabled={!onGarmentPress}
              style={{
                minHeight: 46,
                paddingVertical: 9,
                borderBottomWidth: 1,
                borderBottomColor: c.border.subtle,
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: swatches[canonicalColor(item.primaryColor)] ?? c.ink.tertiary,
                  borderWidth: 1,
                  borderColor: c.border.strong,
                }}
              />
              <AppText variant="bodySmall" style={{ flex: 1 }}>
                {item.name}
              </AppText>
              <AppText variant="micro">
                {lockedIds.includes(item.id) || item.id === lockedGarmentId
                  ? 'KEEPING'
                  : item.category === 'footwear'
                    ? 'SHOES'
                    : item.category.toUpperCase()}
              </AppText>
            </AnimatedPressable>
          ))}
        </View> : null}
        <View style={{ flexDirection: width < 380 || fontScale > 1.3 ? 'column' : 'row', gap: 10 }}>
          <View style={{ flex: 1.15 }}>
            <Button
              label={wearSuccess ? 'Wearing this' : 'Wear this'}
              icon={wearSuccess ? 'checkmark-circle' : 'checkmark'}
              loading={wearLoading}
              disabled={wearSuccess}
              onPress={onWear}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Another look"
              icon="refresh-outline"
              variant="secondary"
              disabled={!canChange || wearLoading}
              onPress={onAnother}
            />
          </View>
        </View>
        {!canChange ? (
          <AppText variant="metadata">
            {lockedIds.length
              ? 'Unlock a piece to explore more combinations.'
              : 'This is your complete look for these conditions. Add more pieces for variety.'}
          </AppText>
        ) : null}
        {onExplain ? (
          <Button
            label="Why this works"
            icon="sparkles-outline"
            variant="quiet"
            onPress={onExplain}
          />
        ) : (
          <AppText variant="muted">{recommendation.explanation}</AppText>
        )}
      </View>
    </View>
  );
}
