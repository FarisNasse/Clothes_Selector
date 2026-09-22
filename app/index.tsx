import { Redirect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { OutfitSkeleton } from '@/components/primitives/Skeleton';
import { useSession } from '@/providers/SessionProvider';
export default function Index() {
  const { loading, session, isDemo } = useSession();
  if (loading)
    return (
      <Screen>
        <OutfitSkeleton />
      </Screen>
    );
  return <Redirect href={isDemo || session ? '/(tabs)' : '/sign-in'} />;
}
