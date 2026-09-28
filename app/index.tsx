import { Redirect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { OutfitSkeleton } from '@/components/primitives/Skeleton';
import { useSession } from '@/providers/SessionProvider';
import { hasSeenOnboarding } from '@/features/onboarding/local';
export default function Index() {
  const { loading, session, isDemo } = useSession();
  if (loading)
    return (
      <Screen>
        <OutfitSkeleton />
      </Screen>
    );
  if (!hasSeenOnboarding()) return <Redirect href="/onboarding" />;
  return <Redirect href={isDemo || session ? '/(tabs)' : '/sign-in'} />;
}
