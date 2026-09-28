import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import { GarmentImageError, readPickedImage } from './pickedImage';

export async function pickGarmentPhoto(source: 'camera' | 'library') {
  if (Platform.OS !== 'web') {
    const permission = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      throw new Error(source === 'camera'
        ? 'Allow camera access in device settings, or choose a photo.'
        : 'Allow photo access in device settings, or save without a photo.');
  }
  const options: ImagePicker.ImagePickerOptions = {
    quality: 0.82,
    mediaTypes: ['images'],
    base64: Platform.OS !== 'web',
  };
  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);
  return result.canceled ? null : result.assets?.[0] ?? null;
}

export async function uploadGarmentPhoto(asset: ImagePicker.ImagePickerAsset, userId: string) {
  if (env.demoMode) return null;
  if (!supabase) throw new GarmentImageError('upload');
  const { data, mimeType } = await readPickedImage(asset, Platform.OS === 'web');
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  try {
    const { error } = await supabase.storage.from('garment-images').upload(path, data, {
      contentType: mimeType,
      upsert: false,
    });
    if (error) throw error;
  } catch (error) {
    throw new GarmentImageError('upload', error);
  }
  return path;
}
