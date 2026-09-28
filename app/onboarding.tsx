import { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { GarmentIllustration } from '@/components/garment/GarmentIllustration';
import { useExperience } from '@/providers/ExperienceProvider';
import { useSession } from '@/providers/SessionProvider';
import { completeOnboarding } from '@/features/onboarding/local';
const pages = [
  ['Your wardrobe,\nedited for you.', 'A private lookbook composed from the clothes you already own.'],
  ['Add what you\nalready own.', 'Take a photo or enter the details. Every piece has a place.'],
  ['Tell us how\nyou dress.', 'Choose a fit and direction. You can refine them whenever you like.'],
  ['Get dressed\nin seconds.', 'Change a piece, keep a favorite, and wear the look.'],
] as const;
export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const { width } = useWindowDimensions();
  const { colors: c } = useExperience();
  const { isDemo, session } = useSession();
  function finish(destination: 'add' | 'explore') {
    completeOnboarding();
    router.replace(destination === 'add' && (session || isDemo) ? '/garment/add' : session || isDemo ? '/(tabs)' : '/sign-in');
  }
  return <Screen maxWidth={1100}><View style={{ flex: 1, justifyContent: 'center', paddingVertical: 28, gap: 28 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><AppText variant="title">clothes selector <AppText style={{ color: c.accent.bronze }}>/</AppText></AppText><AppText variant="eyebrow">{String(step + 1).padStart(2, '0')} / 04</AppText></View>
    <View style={{ flexDirection: width >= 780 ? 'row' : 'column', gap: 28, alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 570, minHeight: width >= 780 ? 520 : 335, backgroundColor: c.canvas.inverse, borderRadius: 30, overflow: 'hidden', padding: 24 }}>
        <AppText variant="eyebrow" style={{ color: '#CFD6C9' }}>A WARDROBE STUDIO / {step === 3 ? 'THE DAILY EDIT' : 'YOUR COLLECTION'}</AppText>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {(['top', 'bottom', 'footwear'] as const).map((category, i) => <View key={category} style={{ flex: 1, height: i === 1 ? '75%' : '60%', transform: [{ rotate: (i - 1) * 9 + 'deg' }] }}><GarmentIllustration garment={{ category, primaryColor: (['cream', 'navy', 'brown'] as const)[i] ?? 'cream', subcategory: category }} /></View>)}
        </View>
        <AppText variant="micro" style={{ color: '#CFD6C9', textAlign: 'right' }}>THE PIECES YOU OWN / NEW POSSIBILITIES</AppText>
      </View>
      <View style={{ flex: 1, width: '100%', gap: 22 }}><AppText variant="eyebrow">LESS GUESSWORK. MORE YOU.</AppText><AppText variant="displayXXL" style={{ fontSize: width < 380 ? 38 : width < 780 ? 44 : 54 }}>{(pages[step] ?? pages[0])[0]}</AppText><AppText variant="bodyLarge">{(pages[step] ?? pages[0])[1]}</AppText>
        {step < 3 ? <Button label="Continue" icon="arrow-forward" onPress={() => setStep(step + 1)} /> : <><Button label={session || isDemo ? 'Add my first piece' : 'Create my wardrobe'} onPress={() => finish('add')} /><Button label={isDemo ? 'Explore sample wardrobe' : 'Explore my wardrobe'} variant="secondary" onPress={() => finish('explore')} /></>}
        <Button label="Skip introduction" variant="quiet" onPress={() => finish('explore')} />
      </View>
    </View>
  </View></Screen>;
}
