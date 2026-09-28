import { useState } from 'react';
import { router } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Screen } from '@/components/Screen';
import { PageHeading } from '@/components/navigation/PageHeading';
import { GarmentImage } from '@/components/garment/GarmentImage';
import { GarmentForm } from '@/components/garment/GarmentForm';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Notice } from '@/components/primitives/Notice';
import { useGarmentCapture } from '@/features/wardrobe/useGarmentCapture';
import { useExperience } from '@/providers/ExperienceProvider';
import type { Garment } from '@/types/domain';

export default function AddGarmentScreen() {
  const capture = useGarmentCapture();
  const { colors: c } = useExperience();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const wide = width >= 850;
  const preview = { ...capture.draft, id: 'preview', userId: 'preview', wearCount: 0, lastWornAt: null, imageUrl: capture.asset?.uri ?? null } as Garment;
  const photo = <View style={{ flex: wide ? .82 : undefined, gap: 12 }}>
    <AppText variant="eyebrow">01 / THE PIECE</AppText>
    {capture.asset ? <Image source={{ uri: capture.asset.uri }} contentFit="contain" style={{ width: '100%', aspectRatio: wide ? .9 : 1.12, borderRadius: 24, backgroundColor: c.canvas.media }} /> : <View style={{ aspectRatio: wide ? .9 : 1.12, borderRadius: 24, backgroundColor: c.canvas.media, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 8 }}><AppText variant="display">A new piece.</AppText><AppText variant="muted" style={{ textAlign: 'center' }}>A photo helps you recognize it later. The details are enough to get started.</AppText></View>}
    <Button label={capture.asset ? 'Retake photo' : 'Take photo'} icon="camera-outline" disabled={Boolean(capture.busy)} onPress={() => capture.choose('camera')} />
    <Button label={capture.asset ? 'Choose another photo' : 'Choose photo'} icon="images-outline" variant="secondary" disabled={Boolean(capture.busy)} onPress={() => capture.choose('library')} />
    {capture.asset ? <Button label="Remove photo" variant="quiet" disabled={Boolean(capture.busy)} onPress={capture.clearPhoto} /> : null}
    {capture.photoError ? <Notice message={capture.photoError} tone="error" /> : null}
  </View>;
  return <Screen maxWidth={1040}>
    <PageHeading eyebrow={capture.saved ? 'YOUR WARDROBE / ADDED' : 'YOUR WARDROBE / A NEW PIECE'} title={capture.saved ? 'Welcome to the rotation.' : 'Add a piece.'} detail={capture.saved ? capture.saved.name : 'Build your collection one good piece at a time.'} />
    {capture.saved ? <View style={{ maxWidth: 550, gap: 16 }}><GarmentImage garment={capture.saved} variant="preview" /><Notice message={capture.saved.name + (capture.isDemo ? ' is in your demo wardrobe for this session.' : ' is now in your wardrobe.')} /><Button label="View saved piece" onPress={() => router.replace({ pathname: '/garment/[id]', params: { id: capture.saved!.id } })} /><Button label="Add another piece" variant="secondary" onPress={() => { capture.addAnother(); setStep(0); }} /><Button label="Back to wardrobe" variant="quiet" onPress={() => router.replace('/(tabs)/wardrobe')} /></View> :
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: 30 }}>
      {wide || step === 0 ? photo : null}
      <View style={{ flex: 1, gap: 20 }}>
        {!wide ? <View style={{ flexDirection: 'row', gap: 5 }}>{['Photo', 'Describe', 'Details', 'Review'].map((label, i) => <View key={label} style={{ flex: 1, borderTopWidth: 3, borderColor: i <= step ? c.accent.forest : c.border.subtle, paddingTop: 8 }}><AppText variant="micro">{label}</AppText></View>)}</View> : null}
        {wide || step === 1 ? <View style={{ gap: 14 }}><AppText variant="eyebrow">02 / DESCRIBE IT</AppText><GarmentForm key={capture.formVersion + ':essentials'} value={capture.draft} onChange={capture.setDraft} disabled={capture.busy === 'saving'} step={wide ? 'all' : 'essentials'} /></View> : null}
        {!wide && step === 2 ? <View style={{ gap: 14 }}><AppText variant="eyebrow">03 / THE FINER DETAILS</AppText><GarmentForm key={capture.formVersion + ':details'} value={capture.draft} onChange={capture.setDraft} disabled={capture.busy === 'saving'} step="details" /></View> : null}
        {!wide && step === 3 ? <View style={{ gap: 16 }}><AppText variant="eyebrow">04 / READY FOR YOUR WARDROBE</AppText><GarmentImage garment={preview} variant="preview" style={{ maxWidth: 410, alignSelf: 'center' }} /><AppText variant="title">{capture.draft.name || 'Your new piece'}</AppText><AppText variant="muted">{capture.draft.primaryColor || 'Color'} · {capture.draft.fit} · {capture.draft.subcategory || 'Type'}</AppText><Button label="Edit description" variant="quiet" onPress={() => setStep(1)} /></View> : null}
        {capture.error ? <Notice message={capture.error} tone="error" /> : null}
        {capture.photoError && (step !== 0 || wide) ? <View style={{ gap: 8 }}><Notice message={capture.photoError} tone="error" /><Button label="Save without photo" variant="secondary" disabled={Boolean(capture.busy)} onPress={() => capture.save(false)} /></View> : null}
        {wide ? <Button label="Add to wardrobe" icon="add" loading={capture.busy === 'saving'} disabled={capture.busy === 'picking'} onPress={() => capture.save()} /> : step === 3 ? <Button label="Add to wardrobe" icon="add" loading={capture.busy === 'saving'} onPress={() => capture.save()} /> : <Button label={step === 0 && !capture.asset ? 'Continue without photo' : 'Continue'} icon="arrow-forward" disabled={Boolean(capture.busy)} onPress={() => setStep((current) => current + 1)} />}
        {!wide && step > 0 ? <Button label="Previous step" variant="quiet" onPress={() => setStep((current) => current - 1)} /> : null}
        {wide ? <AppText variant="metadata">Fit, dressiness, and warmth start at neutral values. Check them before saving.{capture.isDemo ? ' Demo changes last for this session.' : ''}</AppText> : null}
      </View>
    </View>}
  </Screen>;
}
