import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Notice } from '@/components/primitives/Notice';
import { TextField } from '@/components/primitives/TextField';
import { useSession } from '@/providers/SessionProvider';

export default function ResetPasswordScreen() {
  const { session, loading, updatePassword } = useSession();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    if (busy) return;
    if (password.length < 8) {
      setMessage('Use a password with at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setMessage('The two passwords do not match.');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const error = await updatePassword(password);
      if (error) setMessage(error);
      else router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen maxWidth={560}>
      <View style={{ flex: 1, justifyContent: 'center', gap: 20, paddingVertical: 48 }}>
        <AppText variant="eyebrow">Account recovery</AppText>
        <AppText variant="displayXL" accessibilityRole="header">
          A fresh start.
        </AppText>
        {loading ? (
          <AppText variant="muted">Opening your secure reset link…</AppText>
        ) : session ? (
          <>
            <AppText variant="muted">
              Choose a new password for your Clothes Selector account.
            </AppText>
            <TextField
              label="New password"
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry
              editable={!busy}
              value={password}
              onChangeText={setPassword}
            />
            <TextField
              label="Confirm new password"
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry
              editable={!busy}
              value={confirmation}
              onChangeText={setConfirmation}
              onSubmitEditing={save}
            />
            {message ? <Notice message={message} tone="error" /> : null}
            <Button label="Save new password" loading={busy} onPress={save} />
          </>
        ) : (
          <>
            <Notice
              message="This reset link is missing, invalid, or expired. Request a new one from the sign-in screen."
              tone="info"
            />
            <Button label="Back to sign in" onPress={() => router.replace('/sign-in')} />
          </>
        )}
      </View>
    </Screen>
  );
}
