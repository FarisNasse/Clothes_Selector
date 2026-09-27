import { router } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Screen } from '@/components/Screen';
import { PageHeading } from '@/components/navigation/PageHeading';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Notice } from '@/components/primitives/Notice';
import { Entrance } from '@/components/motion/Entrance';
import { GarmentForm } from '@/components/garment/GarmentForm';
import { AnalysisProgress } from '@/components/garment/AnalysisProgress';
import { useGarmentCapture } from '@/features/wardrobe/useGarmentCapture';
import { useExperience } from '@/providers/ExperienceProvider';

export default function AddGarmentScreen() {
  const capture = useGarmentCapture();
  const { colors: c } = useExperience();
  const { width } = useWindowDimensions();
  const reading = capture.busy === 'uploading' || capture.busy === 'analyzing';
  const step = capture.saved ? 3 : capture.draft ? 2 : 1;
  return (
    <Screen maxWidth={1000}>
      <PageHeading
        eyebrow={
          'YOUR WARDROBE / ' +
          (capture.saved ? 'ADDED' : capture.draft ? 'THE DETAILS' : 'A NEW PIECE')
        }
        title={
          capture.saved
            ? 'Welcome to the rotation.'
            : capture.draft
              ? capture.manualFallback ? 'Add the details yourself.' : 'We found the details.'
              : 'Every piece\nhas potential.'
        }
      />
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 28 }}>
        {['Photograph', 'Review', 'Wear'].map((label, index) => (
          <View key={label} style={{ flex: 1, gap: 8 }}>
            <View
              style={{
                height: 2,
                backgroundColor: index < step ? c.accent.forest : c.border.subtle,
              }}
            />
            <AppText variant="micro">
              {String(index + 1).padStart(2, '0')} / {label}
            </AppText>
          </View>
        ))}
      </View>
      {capture.saved ? (
        <Entrance style={{ gap: 20, maxWidth: 550 }}>
          {capture.asset ? (
            <Image
              source={{ uri: capture.asset.uri }}
              contentFit="contain"
              style={{
                width: '100%',
                height: 280,
                borderRadius: 24,
                backgroundColor: c.canvas.sunken,
              }}
            />
          ) : null}
          <Notice
            message={
              capture.saved.name +
              (capture.isDemo
                ? ' is in your demo wardrobe for this session.'
                : ' is now in your wardrobe.')
            }
          />
          <Button
            label="Photograph another"
            icon="camera-outline"
            loading={capture.busy === 'picking'}
            onPress={() => capture.choose('camera')}
          />
          <Button
            label="Choose another photo"
            variant="secondary"
            disabled={Boolean(capture.busy)}
            onPress={() => capture.choose('library')}
          />
          <Button
            label="Back to wardrobe"
            variant="quiet"
            onPress={() => router.replace('/(tabs)/wardrobe')}
          />
        </Entrance>
      ) : reading && capture.asset ? (
        <View style={{ maxWidth: 540, width: '100%', alignSelf: 'center' }}>
          <AnalysisProgress
            uri={capture.asset.uri}
            stage={capture.busy === 'uploading' ? 'uploading' : 'analyzing'}
          />
        </View>
      ) : capture.draft ? (
        <View style={{ flexDirection: width >= 850 ? 'row' : 'column', gap: 32 }}>
          <View style={{ flex: width >= 850 ? 0.8 : undefined, gap: 18 }}>
            {capture.asset ? (
              <Image
                source={{ uri: capture.asset.uri }}
                contentFit="contain"
                style={{
                  width: '100%',
                  aspectRatio: 1,
                  borderRadius: 24,
                  backgroundColor: c.canvas.sunken,
                }}
              />
            ) : null}
            {capture.manualFallback ? (
              <Notice
                tone="info"
                message="Your photo uploaded, but automatic analysis is unavailable. Enter a name, piece type, and color; check the other settings, then add it to your wardrobe."
              />
            ) : (
              <AppText variant="metadata">
                {capture.isDemo
                  ? 'Demo analysis uses sample details. Adjust them to match your photo.'
                  : 'Make it yours. Check the details before adding this piece.'}
              </AppText>
            )}
            {capture.draft.aiConfidence !== null ? (
              <AppText variant="metadata">
                {Math.round(capture.draft.aiConfidence * 100)}% analysis confidence
                {capture.draft.aiConfidence < 0.75 ? ' · A closer check is a good idea.' : ''}
              </AppText>
            ) : null}
            <Button
              label="Choose a different photo"
              variant="quiet"
              disabled={Boolean(capture.busy)}
              onPress={() => capture.choose('library')}
            />
          </View>
          <Entrance style={{ flex: 1, gap: 24 }}>
            <GarmentForm
              key={capture.asset?.uri}
              value={capture.draft}
              onChange={capture.setDraft}
              disabled={Boolean(capture.busy)}
            />
            <Button
              label="Add to wardrobe"
              icon="add"
              loading={capture.busy === 'saving'}
              onPress={capture.save}
            />
          </Entrance>
        </View>
      ) : (
        <View style={{ maxWidth: 640, width: '100%', alignSelf: 'center', gap: 20 }}>
          {capture.asset ? (
            <Image
              source={{ uri: capture.asset.uri }}
              contentFit="contain"
              style={{
                height: 260,
                width: '100%',
                borderRadius: 24,
                backgroundColor: c.canvas.sunken,
              }}
            />
          ) : (
            <View
              style={{
                aspectRatio: 1.25,
                borderRadius: 28,
                backgroundColor: c.canvas.sunken,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 32,
                gap: 24,
              }}
            >
              <View
                style={{
                  width: 128,
                  height: 150,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: c.accent.bronze,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="shirt-outline" size={66} color={c.accent.forest} />
              </View>
              <AppText variant="muted" style={{ textAlign: 'center', maxWidth: 360 }}>
                Lay it flat or hang it against a clean background. Good light makes all the
                difference.
              </AppText>
            </View>
          )}
          <Button
            label="Take photo"
            icon="camera-outline"
            loading={capture.busy === 'picking'}
            onPress={() => capture.choose('camera')}
          />
          <Button
            label="Choose photo"
            icon="images-outline"
            variant="secondary"
            disabled={Boolean(capture.busy)}
            onPress={() => capture.choose('library')}
          />
          <AppText variant="metadata" style={{ textAlign: 'center' }}>
            {capture.isDemo
              ? 'Demo wardrobe · photo analysis uses sample details.'
              : 'Your photo stays in your private wardrobe. Analysis helps identify the garment.'}
          </AppText>
        </View>
      )}
      {capture.error ? (
        <View style={{ marginTop: 20 }}>
          <Notice
            message={capture.error}
            tone="error"
            {...(capture.asset && !capture.draft && !capture.saved
              ? { action: 'Try again', onAction: capture.retry }
              : {})}
          />
        </View>
      ) : null}
    </Screen>
  );
}
