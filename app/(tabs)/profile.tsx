import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { Type } from '@/components/Type';
import { env } from '@/lib/env';
import { useSession } from '@/providers/SessionProvider';
import { colors, radii, spacing } from '@/theme/tokens';

const controls = [
  ['Wardrobe photos', 'Private by default'],
  ['Location', 'Not requested in this patch'],
  ['Calendar', 'Not requested in this patch'],
  ['AI training permission', 'No implicit opt-in'],
  ['Account deletion', 'Schema supports cascading deletion'],
] as const;

export default function ProfileScreen() {
  const { session, isDemo, signOut } = useSession();

  return (
    <Screen>
      <View style={styles.header}>
        <Type variant="eyebrow">Account & product</Type>
        <Type variant="display">Control your data.</Type>
        <Type variant="muted">
          Privacy is treated as a product surface because wardrobe imagery, purchase history, location, and future calendar context can be sensitive.
        </Type>
      </View>

      <View style={styles.section}>
        <SectionHeader eyebrow="Environment" title={isDemo ? 'Proposal demo mode' : 'Connected production mode'} />
        <View style={styles.card}>
          <Type variant="bodyLarge">{isDemo ? 'No cloud credentials required' : session?.user.email ?? 'Signed in'}</Type>
          <Type variant="muted">
            {isDemo
              ? 'The UI uses deterministic fixture data. Set Supabase environment variables and disable demo mode to use authenticated persistence.'
              : `Environment: ${env.appEnv}. User data is scoped by Supabase Row Level Security.`}
          </Type>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader eyebrow="Privacy" title="Permission surfaces" />
        <View style={styles.listCard}>
          {controls.map(([label, value], index) => (
            <View key={label} style={[styles.controlRow, index > 0 && styles.controlBorder]}>
              <Type style={styles.controlLabel}>{label}</Type>
              <Type variant="muted" style={styles.controlValue}>
                {value}
              </Type>
            </View>
          ))}
        </View>
      </View>

      {!isDemo ? <PrimaryButton label="Sign out" variant="secondary" onPress={() => void signOut()} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.md, gap: spacing.xs },
  section: { marginTop: spacing.xl, gap: spacing.md },
  card: { backgroundColor: colors.forestSoft, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  controlRow: { padding: spacing.md, gap: spacing.xs },
  controlBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  controlLabel: { fontWeight: '700' },
  controlValue: { fontSize: 13, lineHeight: 18 },
});
