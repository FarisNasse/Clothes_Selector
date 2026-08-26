import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Pill } from '@/components/Pill';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { Type } from '@/components/Type';
import { garmentAnalysisSchema, type GarmentAnalysis } from '@/features/wardrobe/analysisSchema';
import { analyzeGarmentImage } from '@/features/wardrobe/analyzeGarment';
import { analysisToDraft } from '@/features/wardrobe/draft';
import { discardStagedGarmentImage } from '@/features/wardrobe/stagedImage';
import { useSession } from '@/providers/SessionProvider';
import { useWardrobe } from '@/providers/WardrobeProvider';
import { colors, radii, spacing } from '@/theme/tokens';
import { garmentCategories, type GarmentCategory } from '@/types/domain';

export default function AddGarmentScreen() {
  const { session, isDemo } = useSession();
  const { addGarment } = useWardrobe();
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [analysis, setAnalysis] = useState<GarmentAnalysis | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingStoragePath = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (pendingStoragePath.current) void discardStagedGarmentImage(pendingStoragePath.current);
    };
  }, []);

  async function chooseImage(source: 'camera' | 'library', replaceExisting = true) {
    setError(null);

    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError(
        source === 'camera'
          ? 'Camera access is required to photograph a garment.'
          : 'Photo-library access is required to import a garment image.',
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.82 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.82 });

    const selected = result.assets?.[0];
    if (result.canceled || !selected) return;

    if (replaceExisting && pendingStoragePath.current) {
      try {
        await discardStagedGarmentImage(pendingStoragePath.current);
      } catch {
        // Do not block a new capture because stale-image cleanup failed.
      }
      pendingStoragePath.current = null;
    }

    setAsset(selected);
    setAnalysis(null);
    setStoragePath(null);
    await runAnalysis(selected);
  }

  async function runAnalysis(selected: ImagePicker.ImagePickerAsset) {
    const userId = isDemo ? 'demo-user' : session?.user.id;
    if (!userId) {
      setError('Sign in before analyzing a garment.');
      return;
    }

    try {
      setAnalyzing(true);
      const result = await analyzeGarmentImage({
        uri: selected.uri,
        mimeType: selected.mimeType ?? null,
        userId,
      });
      setAnalysis(result.analysis);
      setStoragePath(result.storagePath);
      pendingStoragePath.current = result.storagePath;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not analyze the garment.');
    } finally {
      setAnalyzing(false);
    }
  }

  function updateAnalysis<K extends keyof GarmentAnalysis>(key: K, value: GarmentAnalysis[K]) {
    setAnalysis((current) => (current ? { ...current, [key]: value } : current));
  }

  async function save(next: 'done' | 'another' = 'done') {
    if (!analysis) return;
    const validated = garmentAnalysisSchema.safeParse(analysis);
    if (!validated.success) {
      setError('Please correct the garment details before saving.');
      return;
    }

    try {
      setSaving(true);
      await addGarment(analysisToDraft(validated.data, storagePath));
      pendingStoragePath.current = null;

      if (next === 'another') {
        setAsset(null);
        setAnalysis(null);
        setStoragePath(null);
        setError(null);
        await chooseImage('camera', false);
        return;
      }

      Alert.alert('Garment added', 'The item is now available to the recommendation engine.', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the garment.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Type variant="eyebrow">Wardrobe ingestion</Type>
        <Type variant="display">Build your wardrobe.</Type>
        <Type variant="muted">
          Photograph the garment clearly. Confirm the AI details, then keep scanning without leaving this screen.
        </Type>
      </View>

      {asset ? (
        <Image source={{ uri: asset.uri }} style={styles.preview} resizeMode="cover" />
      ) : (
        <View style={styles.capturePlaceholder}>
          <Type variant="title">Garment photo</Type>
          <Type variant="muted">A plain background and even lighting produce the most reliable classification.</Type>
        </View>
      )}

      <View style={styles.actionRow}>
        <View style={styles.actionCell}>
          <PrimaryButton
            label="Take photo"
            variant="primary"
            loading={analyzing}
            onPress={() => void chooseImage('camera')}
          />
        </View>
        <View style={styles.actionCell}>
          <PrimaryButton
            label="Photo library"
            variant="secondary"
            loading={analyzing}
            onPress={() => void chooseImage('library')}
          />
        </View>
      </View>

      {error ? <Type style={styles.error}>{error}</Type> : null}

      {analysis ? (
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <View>
              <Type variant="eyebrow">AI classification</Type>
              <Type variant="title">Confirm the details</Type>
            </View>
            <View style={styles.confidence}>
              <Type style={styles.confidenceValue}>{Math.round(analysis.confidence * 100)}%</Type>
              <Type style={styles.confidenceLabel}>CONFIDENCE</Type>
            </View>
          </View>

          <Field label="Garment name" value={analysis.name} onChangeText={(value) => updateAnalysis('name', value)} />
          <Field
            label="Brand"
            value={analysis.brand ?? ''}
            placeholder="Unknown / optional"
            onChangeText={(value) => updateAnalysis('brand', value.trim() ? value : null)}
          />
          <Field
            label="Primary color"
            value={analysis.primaryColor}
            onChangeText={(value) => updateAnalysis('primaryColor', value.toLowerCase())}
          />
          <Field
            label="Subcategory"
            value={analysis.subcategory}
            onChangeText={(value) => updateAnalysis('subcategory', value)}
          />

          <View style={styles.fieldGroup}>
            <Type variant="eyebrow">Category</Type>
            <View style={styles.pillRow}>
              {garmentCategories.map((category) => (
                <Pill
                  key={category}
                  label={category}
                  selected={analysis.category === category}
                  onPress={() => updateAnalysis('category', category as GarmentCategory)}
                />
              ))}
            </View>
          </View>

          <View style={styles.metadataGrid}>
            <Metadata label="Fit" value={analysis.fit} />
            <Metadata label="Formality" value={`${analysis.formality}/10`} />
            <Metadata label="Warmth" value={`${analysis.warmth}/10`} />
            <Metadata label="Pattern" value={analysis.pattern} />
          </View>

          <PrimaryButton label="Add to wardrobe" loading={saving} onPress={() => void save('done')} />
          <PrimaryButton
            label="Add & photograph another"
            variant="secondary"
            loading={saving}
            onPress={() => void save('another')}
          />
          <Type variant="muted" style={styles.disclosure}>
            {isDemo
              ? 'Demo mode uses a deterministic sample classification so the proposal can be presented without external credentials.'
              : 'In connected mode, analysis runs server-side. The OpenAI API key is never embedded in the mobile application.'}
          </Type>
        </View>
      ) : null}
    </Screen>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Type variant="eyebrow">{label}</Type>
      <TextInput
        value={value}
        placeholder={placeholder ?? ''}
        placeholderTextColor={colors.muted}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metadataItem}>
      <Type variant="eyebrow">{label}</Type>
      <Type style={styles.capitalize}>{value}</Type>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.md, gap: spacing.xs },
  preview: { width: '100%', aspectRatio: 1, borderRadius: radii.lg, marginTop: spacing.xl, backgroundColor: colors.surfaceStrong },
  capturePlaceholder: {
    marginTop: spacing.xl,
    aspectRatio: 1.4,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.lg,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionCell: { flex: 1 },
  error: { color: colors.danger, marginTop: spacing.md },
  analysisCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  analysisHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  confidence: { alignItems: 'flex-end' },
  confidenceValue: { fontSize: 22, fontWeight: '800', color: colors.success },
  confidenceLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1, color: colors.muted },
  fieldGroup: { gap: spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    backgroundColor: colors.background,
    fontSize: 15,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  metadataGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metadataItem: { width: '47%', backgroundColor: colors.surfaceStrong, borderRadius: radii.md, padding: spacing.md, gap: 2 },
  capitalize: { textTransform: 'capitalize', fontWeight: '600' },
  disclosure: { fontSize: 12, lineHeight: 17 },
});
