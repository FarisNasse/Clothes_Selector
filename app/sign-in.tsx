import { Redirect } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View, useWindowDimensions } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Notice } from '@/components/primitives/Notice';
import { TextField } from '@/components/primitives/TextField';
import { GarmentIllustration } from '@/components/garment/GarmentIllustration';
import { useSession } from '@/providers/SessionProvider';
import { useExperience } from '@/providers/ExperienceProvider';
export default function SignInScreen() {
  const { session, isDemo, signIn, signUp, requestPasswordReset } = useSession();
  const { colors: c } = useExperience();
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<'sign-in' | 'sign-up' | 'forgot'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  if (isDemo || session) return <Redirect href="/(tabs)" />;
  async function submit() {
    if (busy) return;
    if (!email.includes('@') || (mode !== 'forgot' && password.length < 8)) {
      setMessage(
        !email.includes('@')
          ? 'Enter the email address used for your account.'
          : 'Use a password with at least 8 characters.',
      );
      setConfirmation(false);
      return;
    }
    setBusy(true);
    setMessage(null);
    setConfirmation(false);
    try {
      const error =
        mode === 'sign-in'
          ? await signIn(email.trim(), password)
          : mode === 'sign-up'
            ? await signUp(email.trim(), password)
            : await requestPasswordReset(email.trim());
      if (error) setMessage(error);
      else if (mode === 'sign-up') {
        setConfirmation(true);
        setMessage('Check your email for a confirmation link, then come back to sign in.');
      } else if (mode === 'forgot') {
        setConfirmation(true);
        setMessage(
          'If an account uses that email, a reset link is on its way. Check your spam folder too.',
        );
      }
    } catch {
      setMessage('We could not connect. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Screen maxWidth={1100}>
        <AppText variant="title" style={{ paddingTop: 30, fontSize: 24 }}>
          clothes selector /
        </AppText>
        <View
          style={{
            flex: 1,
            flexDirection: width >= 850 ? 'row' : 'column',
            gap: 40,
            paddingTop: 50,
            paddingBottom: 30,
          }}
        >
          <View style={{ flex: 1, gap: 22, justifyContent: 'center' }}>
            <AppText variant="eyebrow">LESS GUESSWORK. MORE YOU.</AppText>
            <AppText
              variant="displayXL"
              style={{
                fontSize: width >= 850 ? 64 : width < 380 ? 36 : 44,
                lineHeight: width >= 850 ? 69 : width < 380 ? 41 : 49,
              }}
            >
              Good style.{'\n'}Already in{'\n'}your wardrobe.
            </AppText>
            <AppText variant="muted" style={{ maxWidth: 400 }}>
              A fresh perspective on the clothes you own. Find a look, make it yours, and get on
              with your day.
            </AppText>
            {width >= 850 ? (
              <View
                accessible={false}
                style={{
                  height: 240,
                  flexDirection: 'row',
                  backgroundColor: c.canvas.sunken,
                  borderRadius: 24,
                  padding: 12,
                }}
              >
                <View style={{ flex: 1, transform: [{ rotate: '-8deg' }] }}>
                  <GarmentIllustration
                    garment={{ category: 'top', primaryColor: 'cream', subcategory: 'Knit polo' }}
                  />
                </View>
                <View style={{ flex: 0.7, transform: [{ rotate: '7deg' }] }}>
                  <GarmentIllustration
                    garment={{ category: 'bottom', primaryColor: 'navy', subcategory: 'Trousers' }}
                  />
                </View>
              </View>
            ) : null}
          </View>
          <View style={{ flex: 1, justifyContent: 'center', gap: 20, maxWidth: 450 }}>
            <AppText variant="title">
              {mode === 'sign-in'
                ? 'Welcome back.'
                : mode === 'sign-up'
                  ? 'Make room for possibility.'
                  : 'Choose a new password.'}
            </AppText>
            {mode === 'forgot' ? (
              <AppText variant="muted">
                Enter the email used for your account. We will send a secure reset link.
              </AppText>
            ) : null}
            <TextField
              label="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!busy}
            />
            {mode !== 'forgot' ? (
              <TextField
                label="Password"
                autoCapitalize="none"
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!busy}
                onSubmitEditing={submit}
              />
            ) : null}
            {message ? (
              <Notice message={message} tone={confirmation ? 'success' : 'error'} />
            ) : null}
            <Button
              label={
                mode === 'sign-in'
                  ? 'Sign in'
                  : mode === 'sign-up'
                    ? 'Create account'
                    : 'Send reset link'
              }
              loading={busy}
              onPress={submit}
            />
            <Button
              label={mode === 'sign-in' ? 'New here? Create an account' : 'Back to sign in'}
              variant="quiet"
              disabled={busy}
              onPress={() => {
                setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
                setMessage(null);
                setConfirmation(false);
              }}
            />
            {mode === 'sign-in' ? (
              <Button
                label="Forgot your password?"
                variant="quiet"
                disabled={busy}
                onPress={() => {
                  setMode('forgot');
                  setMessage(null);
                  setConfirmation(false);
                }}
              />
            ) : null}
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
