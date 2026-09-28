import { useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { PageHeading } from '@/components/navigation/PageHeading';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Notice } from '@/components/primitives/Notice';
import { OutfitSkeleton } from '@/components/primitives/Skeleton';
import { GarmentTile } from '@/components/garment/GarmentTile';
import { GarmentImage } from '@/components/garment/GarmentImage';
import { PreferenceSheet } from '@/components/styling/PreferenceSheet';
import { swatches } from '@/components/garment/GarmentIllustration';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { useStyleProfile } from '@/providers/StyleProfileProvider';
import { useExperience } from '@/providers/ExperienceProvider';
import { summarizeStyle } from '@/features/style/summary';
export default function StyleScreen() {
  const { garments, error: wardrobeError } = useWardrobe();
  const { profile, loading, error, refresh } = useStyleProfile();
  const { colors: c } = useExperience();
  const { width } = useWindowDimensions();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const summary = useMemo(() => summarizeStyle(garments, profile), [garments, profile]);
  return (
    <Screen maxWidth={1120}>
      <PageHeading
        eyebrow="Your point of view"
        title="Style is personal."
        detail="More of what feels like you. New ways to wear it."
      />
      {loading ? (
        <OutfitSkeleton />
      ) : (
        <>
          {error ? (
            <Notice
              message="We could not load your preferences."
              tone="error"
              action="Try again"
              onAction={refresh}
            />
          ) : null}
          <View style={{ flexDirection: width >= 850 ? 'row' : 'column', gap: 24 }}>
            <View
              style={{
                flex: 1.3,
                borderRadius: 28,
                backgroundColor: c.accent.forestDeep,
                padding: width < 380 ? 24 : 32,
                gap: 24,
              }}
            >
              <AppText variant="eyebrow" style={{ color: '#C3CCBA' }}>
                Your style direction
              </AppText>
              <AppText
                variant="displayXL"
                style={{
                  color: '#FBF9F5',
                  fontSize: width >= 1000 ? 48 : width < 380 ? 30 : 36,
                  lineHeight: width >= 1000 ? 54 : width < 380 ? 36 : 42,
                  textTransform: 'capitalize',
                }}
              >
                {summary.descriptor
                  ? summary.descriptor + '.\n' + (summary.fit ? summary.fit + '.' : 'Always you.')
                  : 'Not a label.\nA point of view.'}
              </AppText>
              <AppText variant="bodySmall" style={{ color: '#D6DDCE', maxWidth: 390 }}>
                {summary.descriptor
                  ? 'A direction shaped by your selected preferences. Room to try something unexpected.'
                  : 'Choose the fits and aesthetics you enjoy. Your next look starts there.'}
              </AppText>
              {garments.length ? <View style={{ flexDirection: 'row', height: 112, gap: 7, overflow: 'hidden' }}>
                {garments.slice(0, 4).map((item, index) => <View key={item.id} style={{ flex: 1, transform: [{ rotate: (index % 2 ? 3 : -3) + 'deg' }] }}><GarmentImage garment={item} variant="outfit" /></View>)}
              </View> : null}
              <Button
                label="Refine your style"
                icon="options-outline"
                variant="secondary"
                disabled={Boolean(error)}
                onPress={() => setEditing(true)}
              />
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                gap: 24,
                paddingVertical: 20,
                paddingHorizontal: width >= 850 ? 18 : 0,
              }}
            >
              <AppText variant="eyebrow">The colors you keep</AppText>
              <View style={{ flexDirection: 'row', gap: 6, minHeight: 104 }}>
                {summary.colors.map(([color, count]) => (
                  <View key={color} style={{ gap: 8, flex: Math.max(1, count), minWidth: 42 }}>
                    <View
                      accessibilityRole="image"
                      accessibilityLabel={color + ', ' + count + ' pieces'}
                      style={{
                        width: '100%',
                        height: 70,
                        borderRadius: 12,
                        backgroundColor: swatches[color] ?? c.ink.tertiary,
                        borderWidth: 1,
                        borderColor: c.border.strong,
                      }}
                    />
                    <AppText variant="micro" style={{ textTransform: 'capitalize' }}>
                      {color}
                    </AppText>
                  </View>
                ))}
              </View>
              <AppText variant="bodyLarge">{summary.description}</AppText>
              {garments.length ? <View style={{ padding: 18, backgroundColor: c.canvas.editorial, borderRadius: 18, gap: 8 }}><AppText variant="eyebrow">YOUR SIGNATURE</AppText><AppText variant="bodyLarge">{summary.fit ? 'You reach for ' + summary.fit + ' silhouettes.' : 'Your wardrobe is taking shape.'}</AppText><AppText variant="metadata">{summary.colors[0] ? Math.round(summary.colors[0][1] / garments.length * 100) + '% of your pieces are ' + summary.colors[0][0] + '.' : ''}</AppText></View> : null}
              <AppText variant="metadata">
                {garments.length
                  ? 'Drawn from ' + garments.length + ' pieces in your wardrobe.'
                  : 'Your wardrobe palette will appear here.'}
              </AppText>
            </View>
          </View>
          {saved ? (
            <View style={{ marginTop: 20 }}>
              <Notice message="Preferences saved. Your next look will use them." />
            </View>
          ) : null}
          {wardrobeError ? (
            <Notice
              message="Your wardrobe could not load. Your style preferences are still available."
              tone="info"
            />
          ) : null}
          {summary.rediscover.length ? (
            <View style={{ marginTop: 44, gap: 22 }}>
              <View style={{ gap: 8 }}>
                <AppText variant="eyebrow">A second look</AppText>
                <AppText variant="title">Familiar pieces. Fresh possibilities.</AppText>
                <AppText variant="muted">Build a look around something you wear less.</AppText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
                {summary.rediscover.map((item) => (
                  <View key={item.id} style={{ width: width < 700 ? 175 : 240 }}>
                    <GarmentTile
                      garment={item}
                      onPress={() =>
                        router.push({
                          pathname: '/garment/[id]',
                          params: { id: item.id, style: '1' },
                        })
                      }
                    />
                    <AppText variant="metadata" style={{ marginTop: -16, marginBottom: 22 }}>
                      {item.wearCount} recorded wears · Tap to restyle
                    </AppText>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={{ marginTop: 24 }}>
              <Button
                label="Start your wardrobe"
                icon="add"
                onPress={() => router.push('/garment/add')}
              />
            </View>
          )}
          <View
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTopWidth: 1,
              borderColor: c.border.subtle,
              gap: 10,
            }}
          >
            <AppText variant="eyebrow">Good style, on repeat</AppText>
            <AppText variant="muted">
              Your preferences guide the fit and feel. Recording what you wear helps balance
              familiar favorites with pieces worth rediscovering.
            </AppText>
          </View>
        </>
      )}
      <PreferenceSheet
        visible={editing}
        onClose={() => setEditing(false)}
        onSaved={() => setSaved(true)}
      />
    </Screen>
  );
}
