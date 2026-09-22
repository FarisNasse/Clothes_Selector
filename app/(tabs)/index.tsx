import { router } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Notice } from '@/components/primitives/Notice';
import { OutfitSkeleton } from '@/components/primitives/Skeleton';
import { PageHeading } from '@/components/navigation/PageHeading';
import { StylingStudio } from '@/components/styling/StylingStudio';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { useStyleProfile } from '@/providers/StyleProfileProvider';
import { useSession } from '@/providers/SessionProvider';
import { useExperience } from '@/providers/ExperienceProvider';

export default function TodayScreen() {
  const { garments, loading, error, refresh } = useWardrobe();
  const {
    loading: profileLoading,
    error: profileError,
    refresh: refreshProfile,
  } = useStyleProfile();
  const { isDemo } = useSession();
  const { colors: c } = useExperience();
  const { width } = useWindowDimensions();
  const date = new Date();
  const greeting =
    date.getHours() < 12
      ? 'Good morning.'
      : date.getHours() < 18
        ? 'Good afternoon.'
        : 'Good evening.';
  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 20,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: c.border.subtle,
        }}
      >
        <AppText
          variant="title"
          style={{ fontSize: width < 380 ? 20 : 23, letterSpacing: -1, flexShrink: 0 }}
        >
          clothes selector<AppText style={{ color: c.accent.bronze }}> /</AppText>
        </AppText>
        <AppText
          variant="micro"
          style={{
            letterSpacing: width < 380 ? 0.6 : 1.5,
            marginLeft: 10,
            flexShrink: 1,
            textAlign: 'right',
          }}
        >
          {isDemo ? 'DEMO WARDROBE' : 'YOUR DAILY EDIT'}
        </AppText>
      </View>
      <PageHeading
        eyebrow={new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        }).format(date)}
        title={greeting}
        action={
          <IconButton
            label="Add a garment"
            icon="add"
            onPress={() => router.push('/garment/add')}
          />
        }
      />
      {error ? (
        <Notice
          message="Your wardrobe could not load. Try again when you are connected."
          tone="error"
          action="Try again"
          onAction={refresh}
        />
      ) : (loading && !garments.length) || profileLoading ? (
        <OutfitSkeleton />
      ) : (
        <StylingStudio />
      )}
      {profileError ? (
        <Notice
          message="Your style preferences could not load. These looks use a neutral starting point."
          tone="error"
          action="Reload preferences"
          onAction={refreshProfile}
        />
      ) : null}
      <View
        style={{
          marginTop: 40,
          paddingTop: 20,
          borderTopWidth: 1,
          borderTopColor: c.border.subtle,
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <View style={{ flex: 1, minWidth: 180, gap: 5 }}>
          <AppText variant="eyebrow">More possibility. Less effort.</AppText>
          <AppText variant="muted">The best wardrobe is the one you wear.</AppText>
        </View>
        <Button
          label="Explore your wardrobe"
          icon="arrow-forward-outline"
          variant="quiet"
          onPress={() => router.push('/(tabs)/wardrobe')}
        />
      </View>
    </Screen>
  );
}
