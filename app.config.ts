import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Clothes Selector',
  slug: 'clothes-selector',
  scheme: 'clothesselector',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  runtimeVersion: { policy: 'appVersion' },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.farisnasse.clothesselector',
  },
  android: {
    package: 'com.farisnasse.clothesselector',
  },
  web: {
    bundler: 'metro',
  },
  plugins: [
    'expo-image',
    'expo-router',
    [
      'expo-image-picker',
      {
        photosPermission:
          'Clothes Selector uses your photo library to add garments to your private wardrobe.',
        cameraPermission:
          'Clothes Selector uses your camera to photograph garments for your private wardrobe.',
        microphonePermission: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
