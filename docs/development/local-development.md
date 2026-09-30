# Local development

## Prerequisites

- Node.js `>=22.13 <23` (CI currently uses 22.16.0)
- npm
- Git
- For native builds: the platform toolchain required by Expo for the target device
- For local Supabase work: Supabase CLI and Docker-compatible container runtime

## Install and start

```bash
cp .env.example .env
npm ci
npm start
```

Run `npm run web`, `npm run android`, or `npm run ios` to target a platform. The usual Expo developer menu and terminal controls are available after startup.

## Environment configuration

Expo reads `.env`; it does not load `.env.example` automatically. `.env` is ignored by Git. Restart Expo after changing environment values; if Metro retains stale values, restart with `npx expo start --clear`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_APP_ENV` | `development` | Build environment label; `production` requires connected mode |
| `EXPO_PUBLIC_DEMO_MODE` | demo enabled | Set to `false` to use connected data/auth |
| `EXPO_PUBLIC_SUPABASE_URL` | none | Required project URL in connected mode |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | none | Required public client key in connected mode |

Values prefixed `EXPO_PUBLIC_` are compiled into client code. Use only public client configuration. Never add a Supabase service-role key or database password here.

There is no built-in Supabase project. Use a separate project for staging and production, and supply each URL and publishable key explicitly. Apply all migrations before pointing a connected build at the project. Deploy the `delete-account` Edge Function for the account-deletion control to work.

EAS profiles set demo versus connected mode. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the EAS `preview` environment for the `staging` build profile, and in `production` for the production profile. A staging app uses a distinct mobile application ID so it can sit alongside the release app. Test migration, Auth redirects, Storage, and the function on staging before promotion.

## Local Supabase

```bash
supabase start
supabase db reset
```

Set the local Supabase API URL and publishable key in `.env`, then use `EXPO_PUBLIC_DEMO_MODE=false`. Do not run a destructive database reset against a hosted project.

## Validation commands

```bash
npm run typecheck
npm run lint
npm test
npm run check
npx expo-doctor
```

`npm run check` includes typecheck, lint, and unit tests. Expo Doctor is a separate compatibility diagnostic. A successful web build does not verify native camera permissions, native linking, VoiceOver/TalkBack, or device performance.

## Web dependency repair

If Expo Router reports `Unable to resolve "react-native-web/dist/index"`, the Windows helper installs SDK-compatible web packages and aligns Expo dependencies:

```powershell
npm run repair:web
npx expo start --clear --web
```

This script is PowerShell-specific. Review package and lockfile changes before committing the result.

## Photo flow

Photos are optional. In connected mode, supported JPEG, PNG, and WebP files up to 12 MiB can be uploaded to the private bucket. Native selections are decoded, resized when needed, and re-encoded before upload; the picker-provided supported bytes serve as a fallback if normalization fails. Browser images are normalized with canvas where supported. Some browser HEIC/AVIF selections need to be exported as JPEG first. A failed read or upload retains the draft, with retry or save-without-photo options. Verify Samsung Android, iPhone, Chrome, and Edge on real devices before release.
