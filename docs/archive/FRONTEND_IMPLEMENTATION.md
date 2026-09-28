# Frontend Experience-System Implementation — v0.2 Foundation

This patch begins implementing the Clothes Selector frontend architecture as a real experience system rather than a set of independently styled screens.

## What changed

### Design foundation

A semantic token layer now lives under `src/design/`:

- `colors.ts` — canvas, ink, border, accent, and feedback roles
- `spacing.ts` — disciplined spacing scale
- `radii.ts` — surface/media/pill radius roles
- `typography.ts` — editorial and functional type scale
- `motion.ts` — shared timing vocabulary for the later animation pass
- `theme.ts` — combined design contract

`src/theme/tokens.ts` remains as a compatibility facade so the first patch can migrate incrementally without forcing a risky all-at-once rewrite.

### Primitive layer

New primitives under `src/components/primitives/` include:

- `AppText`
- `Button`
- `Chip`
- `Surface`
- `EmptyState`

The older `Type`, `PrimaryButton`, and `Pill` modules now delegate to these primitives so existing screens inherit the newer interaction and visual standards.

### Garment experience layer

New product-specific garment components:

- `GarmentImage`
- `GarmentTile`
- `GarmentHero`

`GarmentImage` is now the single visual boundary for garment presentation. It supports real image URLs and a category-aware visual fallback for the deterministic demo wardrobe, so screens no longer invent their own garment rendering rules.

### Outfit experience layer

New product-specific outfit components:

- `OutfitPiece`
- `OutfitFlatLay`
- `RecommendationHero`

Recommendations now lead with a visual flat-lay composition. Match score and reasoning remain available, but they are subordinate to the actual clothing.

### Today

The Today experience now follows the intended decision hierarchy:

1. greeting and date
2. compact weather context
3. occasion selection
4. large visual recommendation
5. wear/another actions
6. contextual wardrobe insight

The previous metric-heavy recommendation card has been replaced by a clothing-first hero.

### Wardrobe

The Wardrobe experience now includes:

- responsive 2/3/4-column visual layout
- semantic search across name, brand, color, subcategory, and style tags
- horizontal category rail
- deliberately quiet metadata
- a useful search/empty state
- responsive max-width behavior on web/tablet

### Garment detail / Style This

Garment detail now keeps the selected garment visually dominant and makes **Style This** a locked styling session. The locked piece remains marked inside the outfit composition while recommendations change around it.

### Style and You

The Style screen is now an editorial taste/behavior surface rather than a settings-like analytics panel. The fourth navigation destination is labeled **You**, matching the intent-based navigation model.

## Web repair

The original project enables Expo Router and Metro web but does not declare React Native Web. Expo Router therefore fails while resolving `react-native-web/dist/index`.

Run on Windows PowerShell:

```powershell
npm run repair:web
npx expo start --clear --web
```

The repair script intentionally delegates package selection to Expo CLI. It installs the required web runtime, aligns SDK-managed dependencies with `npx expo install --fix`, and runs Expo Doctor.

## Why NativeWind is not forced into this patch

The architecture proposes NativeWind, but the existing repository already has a functioning StyleSheet-based codebase and a committed package lock. The first implementation pass establishes the token/component architecture without forcing an unvalidated dependency migration into the same patch as the Expo web repair.

NativeWind can be introduced as a styling authoring layer in the next dependency-focused change without changing the component contracts created here. The product-specific visual language should remain in the shared primitives and garment/outfit components rather than in one-off screen utility strings.

## Next implementation slice

The highest-value follow-up is:

1. install NativeWind + Reanimated + Gesture Handler + Expo Image/Haptics using Expo-compatible versions;
2. add real cached garment-image rendering through `expo-image`;
3. implement reusable Swap Garment sheet/modal;
4. add shared-element-style garment transitions and outfit assembly motion;
5. move backend server state toward TanStack Query repositories;
6. add a small styling-session store only for cross-surface local interaction state;
7. add capture progress state machine and premium AI analysis reveal.
