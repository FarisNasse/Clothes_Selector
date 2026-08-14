import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '@/providers/SessionProvider';
import { colors } from '@/theme/tokens';

export default function Index() {
  const { loading, session, isDemo } = useSession();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }

  if (isDemo || session) return <Redirect href="/(tabs)" />;
  return <Redirect href="/sign-in" />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
