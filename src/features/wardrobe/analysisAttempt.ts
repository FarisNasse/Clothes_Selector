import { garmentAnalysisSchema, type GarmentAnalysis } from './analysisSchema';

// A failed invocation must not erase a photo already uploaded to Storage.
export async function tryGarmentAnalysis(
  invoke: () => Promise<{ data: unknown; error: unknown }>,
): Promise<{ analysis: GarmentAnalysis; error: null } | { analysis: null; error: unknown }> {
  try {
    const { data, error } = await invoke();
    if (error) throw error;
    const parsed = garmentAnalysisSchema.safeParse(data);
    if (!parsed.success) throw new Error('Garment analysis returned an unexpected shape.');
    return { analysis: parsed.data, error: null };
  } catch (error) {
    return { analysis: null, error };
  }
}
