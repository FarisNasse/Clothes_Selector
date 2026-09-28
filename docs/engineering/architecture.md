# Architecture

## System overview

Clothes Selector is a client application built with Expo SDK 57, React Native 0.86, TypeScript, and Expo Router. It can run with bundled demo data or connect directly to Supabase. There is no application server or AI service in the current garment-entry or recommendation flow.

```text
Expo Router screens
  → providers and feature modules
  → local demo fixtures OR Supabase client
  → Supabase Auth / PostgreSQL / private Storage
```

The Supabase client runs in the application. PostgreSQL Row Level Security (RLS) and Storage policies are therefore essential security boundaries; client-side user filtering alone is not authorization.

## Client layers

| Area | Responsibility | Location |
| --- | --- | --- |
| Routes and screens | Navigation and screen composition | `app/` |
| Shared presentation | UI primitives, garment and outfit components, design tokens | `src/components/`, `src/design/` |
| Feature logic | Wardrobe validation, photo staging, recommendation scoring, styling sessions, local collections | `src/features/` |
| Providers | Session, wardrobe, style profile, and experience state | `src/providers/` |
| Data access | Supabase client and feature repositories | `src/lib/`, `src/features/*/repository.ts` |
| Domain and sample data | Types and seeded demo wardrobe | `src/types/`, `src/fixtures/` |

Screens should use feature/provider interfaces rather than embedding Supabase queries. New persistence should follow the existing repository boundary so demo and connected behavior remain explicit.

## Demo and connected behavior

`EXPO_PUBLIC_DEMO_MODE` is enabled unless its value is exactly `false`.

- **Demo mode:** uses `src/fixtures/demoWardrobe.ts`; garment edits and additions are session-only. Device-local saved looks and favorites use the platform storage adapter and have separate persistence behavior.
- **Connected mode:** uses Supabase Auth and repositories for wardrobe/style data. Garment photos are stored in the private `garment-images` bucket. Signed URLs are created for display and cached in memory.

Appearance/accessibility preferences and local collections use device storage; they do not sync to Supabase. See [local development](../development/local-development.md) for environment variables and the [data model](data-model.md) for persisted entities.

## Recommendation flow

The recommendation engine in `src/features/recommendations/engine.ts` builds candidates from the provided wardrobe, filters candidates through compatibility constraints, scores and sorts eligible options, and returns recommendations. It runs locally and does not call an AI API. Scoring combines color harmony, personal preference, silhouette, formality, occasion, weather context, texture, and wardrobe rotation. Exact rules and weights belong in the engine and its tests; keep this document at the system level.

Recommendations are generated from the current in-memory wardrobe. The app does not persist every generated candidate/session. Recording an outfit as worn in connected mode calls the `record_outfit_wear` PostgreSQL function, which validates garment ownership and writes the outfit, items, wear event, feedback signal, and garment counter changes in one transaction.

## Persistence and ownership

SQL migrations in `supabase/migrations` define profiles, style profiles, garments, outfits, outfit items, recommendation sessions and feedback, wear events, RLS policies, and private image Storage policies. The app’s main connected write/read paths currently cover authentication, garment CRUD, style preferences, photo upload, and worn-outfit recording. A table existing in the schema does not mean a complete product workflow exists for it.

## Known architectural limits

- The mobile app communicates directly with Supabase; no server-side API boundary is present.
- Recommendation-session persistence and candidate lineage are not wired into the current generation flow.
- Saved looks/favorites are device-local and do not synchronize across devices.
- Weather context is user-provided; no live weather provider or location integration is configured.
- Analytics, crash reporting, remote feature flags, and account deletion/export workflows are not implemented as complete product services.
- Device builds and accessibility behavior require real-device verification; CI does not validate them.
