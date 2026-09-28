# Impressive experience implementation

This release applies the attached visual experience report to the September 28 application archive. It preserves the manual garment entry, local collections, deterministic recommendation engine, and existing private-photo upload behavior.

## Implemented

- Brand icon, splash image, favicon, light/dark vector wordmarks, reusable slash/rail mark, locally bundled licensed Inter and STIX typefaces.
- Editorial type hierarchy, semantic color surfaces, selective depth, and named motion timings. Motion respects the existing reduced-motion setting.
- A larger Today flat lay with garment-keyed transitions, contextual tint, a shorter mobile story, inline wear confirmation, and prefetch of the next recommendation's images.
- Closet/catalog modes, favorites/unworn/recent groups, contextual style action on wardrobe tiles, and search suggestions for colors, categories, and saved looks.
- Visual Style summary with wardrobe imagery, weighted palette, evidence-based fit/color observations, and rediscovery rail.
- Personal You dashboard with wardrobe, collection, rotation, and favorite summaries; account controls and privacy information live in Settings.
- Garment image inspection, saved looks containing the piece, complementary pieces by category/formality, color/material treatment, and a wear story.
- Mobile photo-first four-step garment capture with detail review and a wardrobe preview; desktop keeps a complete editor. A failed upload retains a save-without-photo action.
- Four-screen introduction with a sample-wardrobe route in demo mode and an account route in normal mode.
- More persistent image caching and differentiated grid/hero/outfit image treatment.

## Production work still needed

- Web photo upload now flattens browser-decoded orientation, bounds the longest edge to 2200 pixels, and strips camera metadata when the browser supports canvas decoding. Native photo ingestion still needs a tested orientation/resize path; neither platform creates separate private display variants or per-image BlurHash/ThumbHash. The current upload limit remains 12 MB after preparation.
- Automatic foreground/background separation is not integrated. Real photos remain intact; the app does not imply cutouts were generated.
- The desktop web export, typecheck, lint and unit tests pass. Native build, low-end-device frame profiling, screen-reader audit, and testing with 100/300/750 real-photo garments require target devices and realistic data.
- Native app icon and splash should be reviewed on final Android and iOS builds, including adaptive icon safe area, before store submission.
- The onboarding's Explore sample wardrobe choice is available only when demo mode is configured. Normal mode directs visitors to account sign-in.

## Verification

Use Node 22 (as required by package.json):

```sh
npm ci
npm run check
npx expo export --platform web
npx expo start
```

On a physical device, verify light and dark mode, larger font scaling, reduced motion, photo permissions, failed photo upload and save-without-photo, garment changes and wear confirmation, private image loading after relaunch, and navigation between the four tabs.
