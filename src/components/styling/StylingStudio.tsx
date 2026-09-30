import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useEffect } from 'react';
import { Image } from 'expo-image';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Chip } from '@/components/primitives/Chip';
import { EmptyState } from '@/components/primitives/EmptyState';
import { Notice } from '@/components/primitives/Notice';
import { BottomSheet } from '@/components/sheets/BottomSheet';
import { GarmentImage } from '@/components/garment/GarmentImage';
import { RecommendationHero } from '@/components/outfit/RecommendationHero';
import { ContextSheet } from './ContextSheet';
import { SwapGarmentSheet } from './SwapGarmentSheet';
import { defaultWeather, lookTitles, occasionLabels } from '@/features/styling/context';
import { missingPieces } from '@/features/styling/session';
import { useStylingSession } from '@/features/styling/useStylingSession';
import { newWearRequestId } from '@/features/recommendations/request';
import { savedLookId, type SavedLook } from '@/features/collections/storage';
import { useCollection } from '@/providers/CollectionProvider';
import { useExperience } from '@/providers/ExperienceProvider';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { useStyleProfile } from '@/providers/StyleProfileProvider';
import { useSession } from '@/providers/SessionProvider';
import type { Occasion, StylingIntent, WeatherContext } from '@/types/domain';

export function StylingStudio({
  anchorId,
  initialLook,
}: {
  anchorId?: string;
  initialLook?: SavedLook;
}) {
  const { garments, recordWear } = useWardrobe();
  const { profile } = useStyleProfile();
  const { isDemo, session } = useSession();
  const { looks, toggleLook, error: collectionError, retry: retryCollection } = useCollection();
  const { haptic } = useExperience();
  const [occasion, setOccasion] = useState<Occasion>(initialLook?.occasion ?? 'everyday');
  const [weather, setWeather] = useState<WeatherContext>(initialLook?.weather ?? defaultWeather);
  const [intent, setIntent] = useState<StylingIntent>('balanced');
  const [requireRainProtection, setRequireRainProtection] = useState(initialLook?.requirements?.rainProtection ?? false);
  const [requireCoveredLegs, setRequireCoveredLegs] = useState(initialLook?.requirements?.coveredLegs ?? false);
  const [excludedGarmentIds, setExcludedGarmentIds] = useState<string[]>([]);
  const [now] = useState(() => new Date());
  const context = useMemo(
    () => ({ occasion, weather, styleProfile: profile, now, intent, requireRainProtection, requireCoveredLegs, excludedGarmentIds }),
    [occasion, weather, profile, now, intent, requireRainProtection, requireCoveredLegs, excludedGarmentIds],
  );
  const styling = useStylingSession(garments, context, anchorId, initialLook?.garmentIds);
  const { state, dispatch, recommendation, selected, swaps, canChange, another, toggleLock } =
    styling;
  const [contextOpen, setContextOpen] = useState(false);
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [recording, setRecording] = useState(false);
  const recordingRef = useRef(false);
  const wearRequests = useRef(new Map<string, string>());
  const [worn, setWorn] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  useEffect(() => {
    const next = styling.recommendations.filter((item) => item.id !== recommendation?.id).slice(0, 1);
    const urls = next.flatMap((item) => item.garments.map((garment) => garment.imageUrl).filter((url): url is string => Boolean(url)));
    if (urls.length) void Image.prefetch(urls, 'memory-disk').catch(() => {});
  }, [styling.recommendations, recommendation?.id]);
  function resetContext(nextOccasion: Occasion, nextWeather: WeatherContext) {
    setOccasion(nextOccasion);
    setWeather(nextWeather);
    if (!nextWeather.raining && !nextWeather.precipitationProbability) setRequireRainProtection(false);
    styling.reset();
    setMessage(null);
    setSwapping(false);
  }
  function closePiece() {
    dispatch({ type: 'select', id: null });
    setSwapping(false);
  }
  async function wear() {
    if (!recommendation || recordingRef.current || worn.includes(recommendation.id)) return;
    const accepted = recommendation;
    const requestKey = `clothes-selector:wear-request:v1:${isDemo ? 'demo' : session?.user.id}:${accepted.id}`;
    let requestId = wearRequests.current.get(accepted.id);
    if (!requestId) {
      try { requestId = localStorage.getItem(requestKey) ?? undefined; } catch { /* In-memory retry remains available. */ }
    }
    requestId ??= newWearRequestId();
    wearRequests.current.set(accepted.id, requestId);
    try { localStorage.setItem(requestKey, requestId); } catch { /* Server still deduplicates retries in this session. */ }
    recordingRef.current = true;
    setRecording(true);
    setMessage(null);
    dispatch({ type: 'keep', ids: accepted.garments.map((item) => item.id) });
    try {
      await recordWear(accepted, occasion, weather, requestId, {
        coveredLegs: requireCoveredLegs, rainProtection: requireRainProtection,
      });
      wearRequests.current.delete(accepted.id);
      try { localStorage.removeItem(requestKey); } catch { /* A future retry returns the prior receipt. */ }
      setWorn((current) => [...current, accepted.id]);
      haptic('success');
      setMessage({
        text: isDemo
          ? 'Added to your demo rotation for this session.'
          : 'Added to your rotation. Have a good day.',
        error: false,
      });
    } catch {
      setMessage({
        text: 'We could not record this look. Your outfit is still here; please try again.',
        error: true,
      });
    } finally {
      recordingRef.current = false;
      setRecording(false);
    }
  }
  const label = occasionLabels.find((item) => item.key === occasion)?.label ?? 'Everyday';
  const anchor = garments.find((item) => item.id === anchorId);
  return (
    <View style={{ gap: 24 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 4,
        }}
      >
        <AppText variant="eyebrow">
          {anchor ? 'Build around your piece' : 'What is the occasion?'}
        </AppText>
        <Button
          label={
            weather.temperatureF + '°F · ' + (weather.raining ? 'Raining' : weather.precipitationProbability ? `${Math.round(weather.precipitationProbability * 100)}% rain` : 'Dry') + ' · Set weather'
          }
          variant="quiet"
          icon={weather.raining ? 'rainy-outline' : 'sunny-outline'}
          onPress={() => setContextOpen(true)}
          disabled={recording}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
      >
        {occasionLabels.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={occasion === item.key}
            onPress={recording ? undefined : () => resetContext(item.key, weather)}
          />
        ))}
      </ScrollView>
      <View style={{ gap: 8 }}>
        <AppText variant="eyebrow">How do you want to dress?</AppText>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {(['quiet', 'balanced', 'expressive'] as const).map((option) => (
            <Chip key={option} label={option === 'balanced' ? 'Open to anything' : option}
              selected={intent === option} onPress={() => { setIntent(option); styling.reset(); }} />
          ))}
        </View>
        <Chip label="Require covered legs" selected={requireCoveredLegs}
          onPress={() => { setRequireCoveredLegs((value) => !value); styling.reset(); }} />
        {(weather.raining || weather.precipitationProbability > 0) ? <Chip label="Require marked rain protection for coat and shoes"
          selected={requireRainProtection}
          onPress={() => { setRequireRainProtection((value) => !value); styling.reset(); }} /> : null}
      </View>
      {excludedGarmentIds.length ? <Notice
        message={`${excludedGarmentIds.length} piece${excludedGarmentIds.length === 1 ? '' : 's'} skipped for this look.`}
        action="Show all pieces" onAction={() => setExcludedGarmentIds([])} /> : null}
      {recommendation ? (
        <RecommendationHero
          recommendation={recommendation}
          title={anchor ? 'One piece.\nNew possibilities.' : lookTitles[occasion]}
          contextLabel={label + ' / your wardrobe'}
          mood={weather.raining ? 'rain' : occasion === 'date' || occasion === 'dinner' ? 'evening' : 'day'}
          lockedIds={state.lockedIds}
          wearLoading={recording}
          wearSuccess={worn.includes(recommendation.id)}
          onWear={wear}
          canChange={canChange}
          onAnother={() => {
            another();
            setMessage(null);
            haptic();
          }}
          onPrevious={() => {
            another(-1);
            setMessage(null);
            haptic();
          }}
          onGarmentPress={(item) => {
            if (!recording) dispatch({ type: 'select', id: item.id });
          }}
          onExplain={() => setExplanationOpen(true)}
          countLabel={
            styling.recommendations.some((item) => item.id === recommendation.id)
              ? String(
                  styling.recommendations.findIndex((item) => item.id === recommendation.id) + 1,
                ).padStart(2, '0') +
                ' / ' +
                String(styling.recommendations.length).padStart(2, '0')
              : 'YOUR EDIT'
          }
          saved={looks.some((item) => item.id === savedLookId(recommendation, occasion))}
          onSave={async () => {
            const wasSaved = looks.some((item) => item.id === savedLookId(recommendation, occasion));
            if (await toggleLook(recommendation, occasion, weather, {
              coveredLegs: requireCoveredLegs, rainProtection: requireRainProtection,
            })) {
              haptic('success');
              setMessage({
                text: wasSaved
                  ? 'Removed from saved looks.'
                  : isDemo ? 'Saved on this device. Find it in You → Saved looks.'
                    : 'Saved to your account. Find it in You → Saved looks.',
                error: false,
              });
            }
          }}
        />
      ) : (
        <EmptyState
          title={
            missingPieces(garments) ? 'A few pieces away.' : 'Let’s try a different direction.'
          }
          detail={
            missingPieces(garments)
              ? 'Add ' + missingPieces(garments) + ' to build a complete look.'
              : requireRainProtection && (weather.raining || weather.precipitationProbability > 0)
                ? 'No complete look has both a coat and shoes that you marked water resistant. Turn off the rain requirement or add the missing pieces.'
                : requireCoveredLegs
                  ? 'No complete look meets your covered-legs request. Add trousers or change that requirement.'
                : 'These pieces do not make a complete match for this occasion. Try another occasion, show skipped pieces, or release your locks.'
          }
          actionLabel={missingPieces(garments) ? 'Add a piece' : 'Reset this look'}
          onAction={() => {
            if (missingPieces(garments)) router.push('/garment/add');
            else resetContext('everyday', defaultWeather);
          }}
        />
      )}
      {state.undoIds ? (
        <Notice
          message="A fresh way to wear it."
          action="Undo swap"
          onAction={() => {
            dispatch({ type: 'undo' });
            haptic();
          }}
        />
      ) : null}
      {message ? (
        <Notice message={message.text} tone={message.error ? 'error' : 'success'} />
      ) : null}
      {collectionError ? <Notice message={collectionError} tone="error" action="Retry sync" onAction={retryCollection} /> : null}
      <ContextSheet
        visible={contextOpen}
        weather={weather}
        onApply={(next) => resetContext(occasion, next)}
        onClose={() => setContextOpen(false)}
      />
      <BottomSheet
        visible={explanationOpen}
        title="Why this works."
        subtitle="A little thought behind the look."
        onClose={() => setExplanationOpen(false)}
      >
        {recommendation?.reasons?.slice(0, 3).map((reason, index) => (
          <AppText key={reason.kind + index} variant="bodyLarge">{reason.text}</AppText>
        )) ?? <AppText variant="bodyLarge">{recommendation?.explanation}</AppText>}
        <AppText variant="muted">For {label.toLowerCase()} at {weather.temperatureF}°F. Weather details depend on what you have confirmed for each piece.</AppText>
        <AppText variant="metadata">Only details you have recorded can support a specific claim. You can change any unlocked piece.</AppText>
      </BottomSheet>
      {selected && !swapping ? (
        <BottomSheet
          visible
          title={selected.name}
          subtitle={selected.primaryColor + ' · ' + selected.subcategory}
          onClose={closePiece}
        >
          <View style={{ alignItems: 'center' }}>
            <GarmentImage
              garment={selected}
              variant="thumbnail"
              style={{ width: 130, height: 160 }}
            />
          </View>
          <Button
            label={state.lockedIds.includes(selected.id) ? 'Unlock this piece' : 'Keep this piece'}
            icon={
              state.lockedIds.includes(selected.id) ? 'lock-open-outline' : 'lock-closed-outline'
            }
            disabled={selected.id === anchorId}
            onPress={() => {
              toggleLock(selected.id);
              haptic('impact');
            }}
          />
          {selected.id === anchorId ? (
            <AppText variant="metadata">This is the starting piece for your look.</AppText>
          ) : null}
          <Button
            label="Swap this piece"
            icon="swap-horizontal"
            variant="secondary"
            disabled={state.lockedIds.includes(selected.id)}
            onPress={() => setSwapping(true)}
          />
          <Button
            label="Skip this piece for this look"
            variant="quiet"
            disabled={state.lockedIds.includes(selected.id)}
            onPress={() => {
              setExcludedGarmentIds((ids) => [...new Set([...ids, selected.id])]);
              closePiece();
            }}
          />
          <Button
            label="View garment"
            variant="quiet"
            icon="arrow-forward-outline"
            onPress={() => {
              closePiece();
              router.push({ pathname: '/garment/[id]', params: { id: selected.id } });
            }}
          />
          {selected.id !== anchorId ? (
            <Button
              label="Style around this piece"
              variant="quiet"
              onPress={() => {
                closePiece();
                router.push({ pathname: '/garment/[id]', params: { id: selected.id, style: '1' } });
              }}
            />
          ) : null}
        </BottomSheet>
      ) : null}
      {selected && swapping && recommendation ? (
        <SwapGarmentSheet
          key={selected.id}
          garment={selected}
          options={swaps}
          onClose={closePiece}
          onApply={(outfit) => {
            dispatch({
              type: 'swap',
              ids: outfit.garments.map((item) => item.id),
              previous: recommendation.garments.map((item) => item.id),
            });
            setSwapping(false);
            setMessage(null);
            haptic('impact');
          }}
        />
      ) : null}
    </View>
  );
}
