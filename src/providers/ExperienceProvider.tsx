import 'expo-sqlite/localStorage/install';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AccessibilityInfo, Platform, StyleSheet, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { darkColors, semanticColors, type Colors } from '@/design/colors';

type Appearance = 'system' | 'light' | 'dark';
type Preferences = { appearance: Appearance; haptics: boolean; reduceMotion: boolean };
type Experience = {
  colors: Colors;
  dark: boolean;
  reducedMotion: boolean;
  preferences: Preferences;
  updatePreferences: (next: Partial<Preferences>) => void;
  haptic: (kind?: 'selection' | 'impact' | 'success') => void;
};
const defaults: Preferences = { appearance: 'system', haptics: true, reduceMotion: false };
const Context = createContext<Experience | null>(null);

export function ExperienceProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [preferences, setPreferences] = useState(defaults);
  const [systemReduced, setSystemReduced] = useState(true);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('clothes-selector:experience:v1') ?? 'null');
      if (raw)
        setPreferences({
          appearance: ['system', 'light', 'dark'].includes(raw.appearance)
            ? raw.appearance
            : 'system',
          haptics: raw.haptics !== false,
          reduceMotion: raw.reduceMotion === true,
        });
    } catch {
      /* Private browsing may disable device storage. */
    }
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setSystemReduced(value);
      })
      .catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduced);
    return () => {
      active = false;
      listener.remove();
    };
  }, []);
  const dark =
    preferences.appearance === 'dark' || (preferences.appearance === 'system' && system === 'dark');
  const value = useMemo<Experience>(
    () => ({
      colors: dark ? darkColors : semanticColors,
      dark,
      reducedMotion: systemReduced || preferences.reduceMotion,
      preferences,
      updatePreferences: (next) =>
        setPreferences((current) => {
          const updated = { ...current, ...next };
          try {
            localStorage.setItem('clothes-selector:experience:v1', JSON.stringify(updated));
          } catch {
            /* Keep the session preference. */
          }
          return updated;
        }),
      haptic: (kind = 'selection') => {
        if (!preferences.haptics || Platform.OS === 'web') return;
        const action =
          kind === 'success'
            ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            : kind === 'impact'
              ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              : Haptics.selectionAsync();
        void action.catch(() => {});
      },
    }),
    [dark, preferences, systemReduced],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useExperience() {
  const value = useContext(Context);
  if (!value) throw new Error('ExperienceProvider is required');
  return value;
}
export function useStyles<T extends StyleSheet.NamedStyles<T>>(factory: (colors: Colors) => T): T {
  const { colors } = useExperience();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors, factory]);
}
