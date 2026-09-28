import { router } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Screen } from '@/components/Screen';
import { PageHeading } from '@/components/navigation/PageHeading';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Notice } from '@/components/primitives/Notice';
import { GarmentForm } from '@/components/garment/GarmentForm';
import { useGarmentCapture } from '@/features/wardrobe/useGarmentCapture';
import { useExperience } from '@/providers/ExperienceProvider';

export default function AddGarmentScreen() {
  const capture = useGarmentCapture();
  const { colors: c } = useExperience();
  const { width } = useWindowDimensions();
  return (
    <Screen maxWidth={1000}>
      <PageHeading
        eyebrow={capture.saved ? 'YOUR WARDROBE / ADDED' : 'YOUR WARDROBE / A NEW PIECE'}
        title={capture.saved ? 'Welcome to the rotation.' : 'Add a piece.'}
        detail={capture.saved ? capture.saved.name : 'Start with the details. A photo is optional.'}
      />
      {capture.saved ? (
        <View style={{ maxWidth: 550, gap: 16 }}>
          <Notice message={capture.saved.name +
            (capture.isDemo ? ' is in your demo wardrobe for this session.' : ' is now in your wardrobe.')} />
          <Button
            label="View saved piece"
            onPress={() => router.replace({ pathname: '/garment/[id]', params: { id: capture.saved!.id } })}
          />
          <Button label="Add another piece" variant="secondary" onPress={capture.addAnother} />
          <Button label="Back to wardrobe" variant="quiet" onPress={() => router.replace('/(tabs)/wardrobe')} />
        </View>
      ) : (
        <View style={{ flexDirection: width >= 850 ? 'row' : 'column', gap: 32 }}>
          <View style={{ flex: width >= 850 ? 0.8 : undefined, gap: 14 }}>
            <AppText variant="eyebrow">PHOTO · OPTIONAL</AppText>
            {capture.asset ? (
              <Image source={{ uri: capture.asset.uri }} contentFit="contain"
                style={{ width: '100%', aspectRatio: 1, borderRadius: 24, backgroundColor: c.canvas.sunken }} />
            ) : (
              <View style={{ aspectRatio: 1.4, borderRadius: 24, backgroundColor: c.canvas.sunken,
                alignItems: 'center', justifyContent: 'center', padding: 28 }}>
                <AppText variant="muted" style={{ textAlign: 'center' }}>
                  Add a photo to recognize this piece later, or save the details alone.
                </AppText>
              </View>
            )}
            <Button label={capture.asset ? 'Replace with camera photo' : 'Take photo'}
              icon="camera-outline" disabled={Boolean(capture.busy)}
              onPress={() => capture.choose('camera')} />
            <Button label={capture.asset ? 'Choose another photo' : 'Choose photo'}
              icon="images-outline" variant="secondary" disabled={Boolean(capture.busy)}
              onPress={() => capture.choose('library')} />
            {capture.asset ? (
              <Button label="Remove photo" variant="quiet" disabled={Boolean(capture.busy)}
                onPress={capture.clearPhoto} />
            ) : null}
            {capture.photoError ? (
              <View style={{ gap: 10 }}>
                <Notice message={capture.photoError} tone="error" />
                {capture.asset ? (
                  <Button label="Retry photo" variant="secondary" disabled={Boolean(capture.busy)}
                    onPress={() => capture.save(true)} />
                ) : null}
                <Button label="Save without photo" variant="quiet" disabled={Boolean(capture.busy)}
                  onPress={() => capture.save(false)} />
              </View>
            ) : null}
          </View>
          <View style={{ flex: 1, gap: 20 }}>
            <GarmentForm key={capture.formVersion} value={capture.draft} onChange={capture.setDraft}
              disabled={capture.busy === 'saving'} />
            {capture.error ? <Notice message={capture.error} tone="error" /> : null}
            <Button label="Add to wardrobe" icon="add" loading={capture.busy === 'saving'}
              disabled={capture.busy === 'picking'} onPress={() => capture.save()} />
            <AppText variant="metadata">
              Review fit, dressiness, and warmth before saving. The shown values are starting points.
              {capture.isDemo ? ' Demo additions last for this session.' : ''}
            </AppText>
          </View>
        </View>
      )}
    </Screen>
  );
}
