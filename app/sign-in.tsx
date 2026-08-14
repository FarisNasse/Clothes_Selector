import { Redirect } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { Type } from '@/components/Type';
import { useSession } from '@/providers/SessionProvider';
import { colors, radii, spacing } from '@/theme/tokens';

export default function SignInScreen() {
  const { session, isDemo, signIn, signUp } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isDemo || session) return <Redirect href="/(tabs)" />;

  async function submit(mode: 'sign-in' | 'sign-up') {
    setLoading(true);
    setError(null);
    const message = mode === 'sign-in' ? await signIn(email.trim(), password) : await signUp(email.trim(), password);
    setError(message);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Screen>
        <View style={styles.hero}>
          <Type variant="eyebrow">Clothes Selector</Type>
          <Type variant="display">Know what to wear.</Type>
          <Type variant="muted">
            Your wardrobe becomes a structured styling system—not a generic fashion chatbot.
          </Type>
        </View>

        <View style={styles.form}>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            placeholder="Password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          {error ? <Type style={styles.error}>{error}</Type> : null}
          <PrimaryButton label="Sign in" loading={loading} onPress={() => void submit('sign-in')} />
          <PrimaryButton
            label="Create account"
            variant="secondary"
            loading={loading}
            onPress={() => void submit('sign-up')}
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { paddingTop: 90, gap: spacing.sm },
  form: { marginTop: spacing.xxl, gap: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    fontSize: 16,
  },
  error: { color: colors.danger },
});
