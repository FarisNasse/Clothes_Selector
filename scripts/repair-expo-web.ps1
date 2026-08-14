$ErrorActionPreference = 'Stop'

Write-Host 'Installing Expo SDK-compatible web runtime dependencies...'
npx expo install react-dom react-native-web @expo/metro-runtime

Write-Host 'Aligning direct dependencies with the installed Expo SDK...'
npx expo install --fix

Write-Host 'Running Expo Doctor...'
npx expo-doctor@latest

Write-Host ''
Write-Host 'Repair complete. Start web with:'
Write-Host '  npx expo start --clear --web'
