import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/primitives/Button';
import { AppText } from '@/components/primitives/AppText';
import { Surface } from '@/components/primitives/Surface';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
import { env } from '@/lib/env';
import { useSession } from '@/providers/SessionProvider';

const controls = [
  ['Wardrobe photos', 'Private by default', 'images-outline'],
  ['Location', 'Off until you opt in', 'location-outline'],
  ['Calendar', 'Not connected', 'calendar-outline'],
  ['AI training permission', 'No implicit opt-in', 'shield-checkmark-outline'],
  ['Account deletion', 'Supported by the data model', 'trash-outline'],
] as const;

export default function ProfileScreen() {
  const { session, isDemo, signOut } = useSession();

  return (
    <Screen maxWidth={820}>
      <View style={styles.header}>
        <AppText variant="eyebrow">You</AppText>
        <AppText variant="displayXL">Your wardrobe. Your data.</AppText>
        <AppText variant="muted" style={styles.headerDetail}>
          Personalization should feel useful without making the product feel invasive. Sensitive context stays explicit and permissioned.
        </AppText>
      </View>

      <Surface variant="sunken" style={styles.identityCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={24} color={semanticColors.accent.forest} />
        </View>
        <View style={styles.identityCopy}>
          <AppText variant="bodyLarge">
            {isDemo ? 'Proposal profile' : session?.user.email ?? 'Signed in'}
          </AppText>
          <AppText variant="metadata">
            {isDemo ? 'Demo mode · deterministic wardrobe data' : `${env.appEnv} environment · user-scoped persistence`}
          </AppText>
        </View>
        {isDemo ? <View style={styles.demoDot} /> : null}
      </Surface>

      <View style={styles.section}>
        <SectionHeader eyebrow="Privacy" title="Permission surfaces" />
        <Surface variant="interactive" style={styles.listCard}>
          {controls.map(([label, value, icon], index) => (
            <View key={label} style={[styles.controlRow, index > 0 && styles.controlBorder]}>
              <View style={styles.controlIcon}>
                <Ionicons name={icon} size={18} color={semanticColors.accent.forest} />
              </View>
              <View style={styles.controlCopy}>
                <AppText variant="bodySmall" style={styles.controlLabel}>{label}</AppText>
                <AppText variant="metadata">{value}</AppText>
              </View>
              <Ionicons name="chevron-forward" size={17} color={semanticColors.ink.tertiary} />
            </View>
          ))}
        </Surface>
      </View>

      <View style={styles.section}>
        <SectionHeader eyebrow="Product principle" title="Intelligence without surveillance" />
        <Surface variant="sunken" style={styles.principleCard}>
          <AppText variant="bodyLarge">Context should earn its way into the product.</AppText>
          <AppText variant="metadata">
            Weather, location, calendar, purchases, and feedback can improve recommendations, but each should have a clear user-facing benefit and a visible control surface.
          </AppText>
        </Surface>
      </View>

      {!isDemo ? (
        <View style={styles.signOutWrap}>
          <Button label="Sign out" variant="secondary" onPress={() => void signOut()} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space.lg, gap: space.sm },
  headerDetail: { maxWidth: 620 },
  identityCard: {
    marginTop: space.section,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.accent.forestMist,
  },
  identityCopy: { flex: 1, gap: 2 },
  demoDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: semanticColors.feedback.positive },
  section: { marginTop: space.sectionLarge, gap: space.lg },
  listCard: { overflow: 'hidden', borderRadius: radius.lg },
  controlRow: {
    minHeight: 68,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  controlBorder: { borderTopWidth: 1, borderTopColor: semanticColors.border.subtle },
  controlIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.accent.forestMist,
  },
  controlCopy: { flex: 1, gap: 2 },
  controlLabel: { fontWeight: '700' },
  principleCard: { padding: space.xxl, gap: space.sm },
  signOutWrap: { marginTop: space.sectionLarge },
});
