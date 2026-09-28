import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { GarmentImage } from '@/components/garment/GarmentImage';
import { SavedLooksSheet } from '@/components/wardrobe/SavedLooksSheet';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import { useSession } from '@/providers/SessionProvider';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { useCollection } from '@/providers/CollectionProvider';
import { useStyleProfile } from '@/providers/StyleProfileProvider';
import { useExperience } from '@/providers/ExperienceProvider';
import { summarizeStyle } from '@/features/style/summary';
import type { Garment } from '@/types/domain';

export default function ProfileScreen() {
  const { session, isDemo } = useSession();
  const { garments } = useWardrobe();
  const { favorites, looks } = useCollection();
  const { profile } = useStyleProfile();
  const { colors: c } = useExperience();
  const { width } = useWindowDimensions();
  const [savedOpen, setSavedOpen] = useState(false);
  const summary = useMemo(() => summarizeStyle(garments, profile), [garments, profile]);
  const name = isDemo ? 'The demo wardrobe' : String(session?.user.user_metadata?.display_name || session?.user.email?.split('@')[0] || 'Your wardrobe');
  const worn = useMemo(() => [...garments].filter((item) => item.lastWornAt).sort((a, b) => (b.lastWornAt ?? '').localeCompare(a.lastWornAt ?? '')), [garments]);
  const favoriteItems = garments.filter((item) => favorites.includes(item.id));
  return <Screen maxWidth={1050}>
    <View style={{ paddingTop: 30, gap: 25 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        <View style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: c.canvas.inverse, alignItems: 'center', justifyContent: 'center' }}>
          <AppText variant="title" style={{ color: '#FBF9F5' }}>{name[0]?.toUpperCase()}</AppText>
        </View>
        <View style={{ flex: 1 }}><AppText variant="eyebrow">Your wardrobe / your point of view</AppText><AppText variant="title">{name}</AppText></View>
        <Button label="Settings" icon="settings-outline" variant="quiet" onPress={() => router.push('/settings')} />
      </View>
      <View style={{ backgroundColor: c.canvas.inverse, borderRadius: 28, padding: 28, minHeight: 215, justifyContent: 'space-between', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', right: -20, top: -30, width: 180, height: 270, borderWidth: 1, borderColor: '#B99670', borderRadius: 120, transform: [{ rotate: '-25deg' }], opacity: .65 }} />
        <AppText variant="eyebrow" style={{ color: '#BFCBBF' }}>THE PERSONAL EDIT</AppText>
        <AppText variant="display" style={{ color: '#FBF9F5', maxWidth: 560, textTransform: 'capitalize' }}>{summary.descriptor ? summary.descriptor + ' with a ' + (summary.fit ?? 'personal') + ' point of view.' : 'A wardrobe entirely your own.'}</AppText>
        <Button label="Explore your style" variant="secondary" onPress={() => router.push('/(tabs)/style')} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        {[['PIECES', garments.length], ['FAVORITES', favoriteItems.length], ['SAVED LOOKS', looks.length], ['WORN', worn.length]].map(([label, count]) => <View key={label} style={{ minWidth: width < 600 ? '46%' : 150, flex: 1, borderTopWidth: 1, borderColor: c.border.strong, paddingTop: 12 }}><AppText variant="title">{count}</AppText><AppText variant="eyebrow">{label}</AppText></View>)}
      </View>
      {worn.length ? <View style={{ gap: 12 }}><AppText variant="eyebrow">From your rotation</AppText><AppText variant="title">Worn, and worth wearing again.</AppText><GarmentRail items={worn.slice(0, 5)} /></View> : <View style={{ padding: 24, backgroundColor: c.canvas.editorial, borderRadius: 22, gap: 8 }}><AppText variant="title">Your story starts with a piece.</AppText><AppText variant="muted">Record a look to see your rotation take shape.</AppText><Button label="Find a look" variant="quiet" onPress={() => router.push('/(tabs)')} /></View>}
      {garments.some((item) => item.wearCount >= 3) ? <View style={{ padding: 24, backgroundColor: c.canvas.editorial, borderRadius: 22, gap: 8 }}><AppText variant="eyebrow">A piece earning its place</AppText><AppText variant="title">{[...garments].sort((a, b) => b.wearCount - a.wearCount)[0]?.name}</AppText><AppText variant="bodySmall">{[...garments].sort((a, b) => b.wearCount - a.wearCount)[0]?.wearCount} recorded wears. Good style deserves a repeat.</AppText></View> : null}
      <View style={{ gap: 12 }}><AppText variant="eyebrow">Collections</AppText><View style={{ flexDirection: width >= 700 ? 'row' : 'column', gap: 12 }}>
        <CollectionCard title="Saved looks" count={looks.length} detail="Outfits you want to return to" onPress={() => setSavedOpen(true)} />
        <CollectionCard title="Favorites" count={favoriteItems.length} detail="The pieces you reach for" onPress={() => router.push('/(tabs)/wardrobe')} />
      </View></View>
      {favoriteItems.length ? <View style={{ gap: 10 }}><AppText variant="eyebrow">Favorite pieces</AppText><GarmentRail items={favoriteItems.slice(0, 5)} /></View> : null}
      <AppText variant="metadata" style={{ textAlign: 'center', paddingVertical: 24 }}>CLOTHES SELECTOR / LESS GUESSWORK. MORE YOU.</AppText>
    </View>
    <SavedLooksSheet visible={savedOpen} onClose={() => setSavedOpen(false)} />
  </Screen>;
}
function GarmentRail({ items }: { items: Garment[] }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>{items.map((item) => <AnimatedPressable key={item.id} accessibilityRole="button" accessibilityLabel={'View ' + item.name} onPress={() => router.push({ pathname: '/garment/[id]', params: { id: item.id } })} style={{ width: 140, gap: 8 }}><GarmentImage garment={item} /><AppText variant="bodySmall" numberOfLines={1}>{item.name}</AppText></AnimatedPressable>)}</ScrollView>;
}
function CollectionCard({ title, detail, count, onPress }: { title: string; detail: string; count: number; onPress: () => void }) {
  const { colors: c } = useExperience();
  return <AnimatedPressable accessibilityRole="button" onPress={onPress} style={{ flex: 1, minHeight: 135, backgroundColor: c.canvas.editorial, borderRadius: 22, padding: 20, justifyContent: 'space-between' }}><AppText variant="eyebrow">{String(count).padStart(2, '0')} / YOUR EDIT</AppText><View><AppText variant="title">{title} →</AppText><AppText variant="metadata">{detail}</AppText></View></AnimatedPressable>;
}
