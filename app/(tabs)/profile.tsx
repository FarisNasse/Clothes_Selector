import { useState } from 'react';
import { Platform, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { PageHeading } from '@/components/navigation/PageHeading';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Chip } from '@/components/primitives/Chip';
import { Notice } from '@/components/primitives/Notice';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import { BottomSheet } from '@/components/sheets/BottomSheet';
import { SavedLooksSheet } from '@/components/wardrobe/SavedLooksSheet';
import { useExperience } from '@/providers/ExperienceProvider';
import { useSession } from '@/providers/SessionProvider';
import { useCollection } from '@/providers/CollectionProvider';

export default function ProfileScreen() {
  const { session, isDemo, signOut } = useSession();
  const { looks, error: collectionError } = useCollection();
  const { colors: c, preferences, updatePreferences } = useExperience();
  const [sheet, setSheet] = useState<'appearance' | 'privacy' | 'about' | 'saved' | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = isDemo
    ? 'The demo wardrobe'
    : session?.user.user_metadata?.display_name ||
      session?.user.email?.split('@')[0] ||
      'Your wardrobe';
  return (
    <Screen maxWidth={840}>
      <PageHeading eyebrow="You" title="Your own kind of style." />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 32 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: c.accent.forestMist,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText variant="title" style={{ color: c.accent.forest }}>
            {String(name).slice(0, 1).toUpperCase()}
          </AppText>
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <AppText variant="heading">{name}</AppText>
          <AppText variant="metadata">
            {isDemo
              ? 'A sample wardrobe to explore. Changes last for this session.'
              : session?.user.email}
          </AppText>
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <AppText variant="eyebrow">Your space</AppText>
        <SettingRow
          icon="bookmark-outline"
          title="Saved looks"
          detail={looks.length + ' saved on this device'}
          onPress={() => setSheet('saved')}
        />
        <SettingRow
          icon="sparkles-outline"
          title="Style preferences"
          detail="The fits, colors, and aesthetics you gravitate toward"
          onPress={() => router.push('/(tabs)/style')}
        />
        <SettingRow
          icon="contrast-outline"
          title="Appearance"
          detail={
            preferences.appearance === 'system'
              ? 'Follows your device'
              : preferences.appearance + ' mode'
          }
          onPress={() => setSheet('appearance')}
        />
      </View>
      <View style={{ marginTop: 30, gap: 8 }}>
        <AppText variant="eyebrow">Make yourself comfortable</AppText>
        {Platform.OS !== 'web' ? (
          <View
            style={{
              minHeight: 72,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              borderBottomWidth: 1,
              borderColor: c.border.subtle,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <AppText>Touch feedback</AppText>
              <AppText variant="metadata">Small haptics for meaningful actions</AppText>
            </View>
            <Switch
              accessibilityLabel="Touch feedback"
              value={preferences.haptics}
              onValueChange={(haptics) => updatePreferences({ haptics })}
            />
          </View>
        ) : null}
        <View
          style={{
            minHeight: 80,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            borderBottomWidth: 1,
            borderColor: c.border.subtle,
          }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <AppText>Reduce motion</AppText>
            <AppText variant="metadata">Your system preference is always respected</AppText>
          </View>
          <Switch
            accessibilityLabel="Reduce motion"
            value={preferences.reduceMotion}
            onValueChange={(reduceMotion) => updatePreferences({ reduceMotion })}
          />
        </View>
      </View>
      <View style={{ marginTop: 30, gap: 8 }}>
        <AppText variant="eyebrow">Privacy & context</AppText>
        <SettingRow
          icon="shield-checkmark-outline"
          title="Your photos & data"
          detail="Understand what is stored and where"
          onPress={() => setSheet('privacy')}
        />
        <SettingRow
          icon="sunny-outline"
          title="Weather"
          detail="Set the conditions for each look in Today"
        />
        <SettingRow icon="calendar-outline" title="Calendar" detail="Not connected" />
        <SettingRow
          icon="information-circle-outline"
          title="About Clothes Selector"
          detail="A fresh perspective on what you already own"
          onPress={() => setSheet('about')}
        />
      </View>
      {collectionError ? <Notice message={collectionError} tone="error" /> : null}
      {error ? <Notice message={error} tone="error" /> : null}
      {!isDemo ? (
        <View style={{ marginTop: 32 }}>
          <Button
            label="Sign out"
            variant="secondary"
            loading={signingOut}
            onPress={async () => {
              if (signingOut) return;
              setSigningOut(true);
              try {
                await signOut();
              } catch {
                setError('We could not sign you out. Please try again.');
              } finally {
                setSigningOut(false);
              }
            }}
          />
        </View>
      ) : null}
      <View style={{ marginTop: 40, alignItems: 'center', gap: 8 }}>
        <AppText variant="title" style={{ fontSize: 23 }}>
          clothes selector /
        </AppText>
        <AppText variant="micro">LESS GUESSWORK. MORE YOU.</AppText>
      </View>
      <BottomSheet
        visible={sheet === 'appearance'}
        title="Set the mood."
        subtitle="Appearance is saved on this device."
        onClose={() => setSheet(null)}
      >
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {(['system', 'light', 'dark'] as const).map((appearance) => (
            <Chip
              key={appearance}
              label={appearance}
              selected={preferences.appearance === appearance}
              onPress={() => updatePreferences({ appearance })}
            />
          ))}
        </View>
      </BottomSheet>
      <BottomSheet
        visible={sheet === 'privacy'}
        title="Your wardrobe. Your data."
        onClose={() => setSheet(null)}
      >
        <AppText variant="bodyLarge">
          {isDemo
            ? 'Demo photos and changes stay in this app session.'
            : 'Wardrobe photos are private to your account.'}
        </AppText>
        <AppText variant="muted">
          {isDemo
            ? 'Demo additions and photos stay in this app session.'
            : 'You enter garment details yourself. A photo is optional and is stored privately with your wardrobe; it is not sent to an AI service.'}
        </AppText>
        <AppText variant="bodyLarge">What stays on this device</AppText>
        <AppText variant="muted">
          Saved looks, favorites, and appearance preferences use this app’s local storage. They do
          not sync to other devices. Clearing app or browser data removes them. Saved looks and
          favorites are kept separately for each account.
        </AppText>
        <AppText variant="bodyLarge">You choose the context</AppText>
        <AppText variant="muted">
          Location and calendar data are not collected. You set weather conditions per look. You can
          remove an individual garment and its photo from its detail screen.
        </AppText>
      </BottomSheet>
      <BottomSheet
        visible={sheet === 'about'}
        title="A wardrobe, reimagined."
        onClose={() => setSheet(null)}
      >
        <AppText variant="muted">
          Clothes Selector finds new ways to wear the pieces you already own. Keep a favorite piece,
          try a different pairing, and leave the house with one less thing to think about.
        </AppText>
        <AppText variant="metadata">
          Recommendations use your garment details, chosen style preferences, occasion, weather
          settings, and recorded wear history.
        </AppText>
      </BottomSheet>
      <SavedLooksSheet visible={sheet === 'saved'} onClose={() => setSheet(null)} />
    </Screen>
  );
}
function SettingRow({
  icon,
  title,
  detail,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  onPress?: () => void;
}) {
  const { colors: c } = useExperience();
  const content = (
    <>
      <Ionicons name={icon} size={22} color={c.accent.forest} />
      <View style={{ flex: 1, gap: 4 }}>
        <AppText>{title}</AppText>
        <AppText variant="metadata" style={{ textTransform: 'none' }}>
          {detail}
        </AppText>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={17} color={c.ink.tertiary} /> : null}
    </>
  );
  const style = {
    minHeight: 82,
    paddingVertical: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
    borderBottomWidth: 1,
    borderColor: c.border.subtle,
  };
  return onPress ? (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={style}
    >
      {content}
    </AnimatedPressable>
  ) : (
    <View style={style}>{content}</View>
  );
}
