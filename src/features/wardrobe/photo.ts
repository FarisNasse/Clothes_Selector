import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import { classifyPhotoUploadError, GarmentImageError, readPickedImage } from './pickedImage';
import { normalizeWebPhoto } from './normalizeWebPhoto';

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
  if (Platform.OS === 'web' && asset.file && asset.file.size > 32 * 1024 * 1024)
    throw new GarmentImageError('size');
  let prepared = asset;
  if (Platform.OS === 'web' && asset.file) {
    prepared = { ...asset, file: await normalizeWebPhoto(asset.file) };
  } else if (Platform.OS !== 'web') {
    try {
      const longest = Math.max(asset.width || 0, asset.height || 0);
      const actions: ImageManipulator.Action[] = longest > 2200
        ? [{ resize: asset.width >= asset.height ? { width: 2200 } : { height: 2200 } }]
        : [];
      const png = asset.mimeType === 'image/png';
      const result = await ImageManipulator.manipulateAsync(asset.uri, actions, {
        compress: 0.82,
        format: png ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
        base64: true,
      });
      if (!result.base64) throw new Error('The normalized photo has no bytes.');
      prepared = { ...asset, uri: result.uri, base64: result.base64 };
    } catch (error) {
      // Some pickers return a preview URI the native decoder cannot open. Their
      // original JPEG/PNG/WebP bytes are still usable when the picker supplied them.
      if (!asset.base64 || !['image/jpeg', 'image/png', 'image/webp'].includes(asset.mimeType ?? ''))
        throw new GarmentImageError('read', error);
    }
  }
  const { data, mimeType } = await readPickedImage(prepared, Platform.OS === 'web');
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  try {
    const { error } = await supabase.storage.from('garment-images').upload(path, data, {
      contentType: mimeType,
      upsert: false,
    });
    if (error) throw error;
  } catch (error) {
    throw classifyPhotoUploadError(error);
  }
  return path;
}
