# Editorial wardrobe redesign

This patch targets GitHub main **3402618992d3944d7afa817d1e11f16ecf613566**. The supplied ZIP and that commit's source tree matched before changes.

## Apply and run

From your clean repository root, with the downloaded patch in that folder:

```bash
git apply --check clothes-selector-redesign.patch
git apply clothes-selector-redesign.patch
npm ci
npm run check
```

Use **Node 22.13 or later within Node 22**, matching `package.json`. The lockfile includes the Expo SDK 57 compatible animation, gesture, image, SVG, haptics, and system appearance packages.

For a local demo:

```bash
EXPO_PUBLIC_DEMO_MODE=true npx expo start --clear --web
```

PowerShell:

```powershell
$env:EXPO_PUBLIC_DEMO_MODE = "true"
npx expo start --clear --web
```

For connected mode, use `EXPO_PUBLIC_DEMO_MODE=false` with your existing Supabase configuration. The existing database migrations, private photo bucket, RLS policies, and transactional wear RPC remain unchanged. This redesign requires no new database migration.

Rebuild any custom development client before running this code on iOS or Android: native dependencies have changed. This patch is not suitable as a JavaScript-only update to an older installed binary. The current app-version runtime policy requires a new runtime/version before publishing an update to existing users.

## Experience and architecture

- **Today:** editorial, category-aware 3–5 piece compositions; direct piece actions; multiple locks; compatible swap previews and undo; another-look button and horizontal gesture; manual weather; subordinate explanations; wear confirmation and local saves.
- **Wardrobe:** virtualized responsive grid, photos through `expo-image`, semantic name/color/brand/category/tag search, filters, sort, favorites, and explicit add actions.
- **Garment:** product-style detail, real wear history/cost per wear, favorite, edit, delete, and an anchored Style This session.
- **Garment entry (current):** manual details first, optional photo upload at save, validation, retry/save-without-photo choices, and add-another flow. Unsaved uploads are cleaned up on replacement or cancellation when the request succeeds.
- **Style:** selected preference descriptors, colors and fit summarized from actual garments, least-worn rediscovery, and editable style preferences.
- **You:** account identity, saved looks, style preferences, appearance, reduced motion, native haptics, and concise data/context explanations.
- **Shared system:** semantic light/dark palettes; editorial/system typography; existing spacing/radius tokens; layout and motion tokens; animated pressables, chips, images, skeletons, notices, and dismissible sheets. Web focus indicators and native safe areas are retained.

Presentation state is in `src/features/styling`; filtering and draft validation are independent of UI; collections have a separate storage/provider boundary. Recommendation scoring weights and hard compatibility rules are preserved. The engine adds multi-lock, suit/accessory structures, and re-evaluates edited outfits so scores and explanations match their contents.

Candidate enumeration is deterministic for a fixed wardrobe, context, and time. It samples at most 8,000 combinations for larger closets, so it prioritizes responsive interaction over guaranteeing an exhaustive global optimum. Tests use a fixed time.

## Data behavior

Favorites and saved looks persist **on this device only**, separately per account. They do not sync to Supabase. Appearance and accessibility preferences are device-wide. Clearing browser/app data removes these local settings and collections. Storage failures produce a recoverable notice without claiming a save succeeded.

Demo garment edits, additions, wear counts, and style preference changes last for the app session. Demo photo selections are local previews. Demo favorites and saved looks still use device storage. A saved demo look can reference a demo-added item that disappears on reload; the saved-look screen handles missing garments explicitly.

Weather is set by the user, not fetched from a live provider. No location or calendar connection is implied. Demo garments use category-aware SVG illustrations when a photo is absent. These are fallbacks, not synthetic photographs presented as the user's clothing. Private garment photos use memory caching.

Screen/image entrances approximate visual continuity using supported Reanimated transitions and consistent garment rendering. The patch does not depend on experimental shared-element navigation. Reduced motion removes entrance/scan/press animation; the visible Another look button remains available.

## Validation and remaining device checks

Completed during implementation:

- TypeScript and ESLint.
- 15 automated tests: auth error handling, inventory integrity, hard compatibility, multiple locks, locked shoes, suit/accessory anchors, swaps, undo, index wrapping, context reset, deterministic large-wardrobe sampling, compound filters, immutable sorting, owner-isolated device persistence, corrupt storage, and capture validation.
- Production web export and Android/iOS Hermes bundle exports.
- Browser interaction checks: navigation, lock/unlock, another look, compatible swap/undo, wear confirmation, favorite/filter/search, saved look reload/reopen, style preference save, anchored styling, garment edit/delete, photo review/save, and dark appearance persistence.
- Rendered review at 320, 390, 768, and 1440 pixels, with compact heading fixes. Normal/reduced-motion rendering and sheet keyboard focus trapping, Escape dismissal, and focus restoration were exercised.
- Expo Doctor: 19 of 21 checks passed; the two remote checks (Expo config schema and React Native Directory) could not complete because their network requests failed. Local dependency compatibility checks passed.
- Clean application of the delivered patch to the original source ZIP.

Not verified here: physical-device camera permissions/cancel behavior, native drag/haptic feel, VoiceOver/TalkBack and large Dynamic Type, authenticated Supabase mutations, optional photo upload failures, and device frame-rate profiling. Bundle export validates compilation; it does not replace those runtime checks. Run them before a release, alongside the existing `LAUNCH_CHECKLIST.md`.

The signed-out web shell can be checked without creating an account. Real sign-in/sign-up, upload, deletion, preference persistence and transactional wear should be tested against a staging account before deployment.

## Account recovery and hosted Auth settings

The sign-in screen includes **Forgot your password?**. It sends a Supabase recovery email and opens the public `/reset-password` route, where the authenticated recovery session can choose a new password. Existing passwords cannot be read back from Supabase because Auth stores a one-way hash.

In the hosted Supabase Dashboard, add the deployed web reset URL and the native scheme to **Authentication → URL Configuration → Redirect URLs**. For local web development, allow the localhost origin used by Expo. Examples:

- `http://localhost:8081/reset-password`
- `http://localhost:8081/sign-in`
- `https://your-production-domain.example/reset-password`
- `https://your-production-domain.example/sign-in`
- `clothesselector://**`

The local `supabase/config.toml` contains equivalent localhost/native entries for local Supabase, but it does not change the hosted project's dashboard configuration.
