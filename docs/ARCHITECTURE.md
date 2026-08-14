# Architecture

## System objective

Maintain an authoritative, private representation of a user's wardrobe and generate inspectable recommendations from that inventory.

## Client

**Expo SDK 57 / React Native 0.86 / Expo Router**

Responsibilities:

- authentication UX
- garment photo capture
- wardrobe browsing and correction
- recommendation presentation
- feedback and wear actions
- client-side validation

The client never contains an OpenAI API key or Supabase service-role key.

## Supabase

### Auth

Email/password is the initial implementation. Social providers can be added after the core loop is validated.

### PostgreSQL

Core tables:

- `profiles`
- `style_profiles`
- `garments`
- `outfits`
- `outfit_items`
- `recommendation_sessions`
- `recommendation_feedback`
- `wear_events`

All user-owned data is isolated with Row Level Security.

### Storage

`garment-images` is private. Object keys are rooted under the authenticated user's UUID:

```text
garment-images/<user-id>/<asset-id>.jpg
```

Storage policies prevent users from reading or mutating another user's folder.

### Edge Functions

`analyze-garment` receives a storage path, validates the authenticated user, creates a short-lived signed image URL under that user's RLS context, and performs server-side multimodal classification.

## AI boundary

### Garment analysis

Input:
- authenticated private garment image

Output:
- strict JSON schema with category, color, pattern, materials, fit, formality, warmth, seasonality, style tags, and confidence

The user confirms or corrects the output before it becomes authoritative wardrobe data.

### Recommendation engine

The first-generation recommendation engine is deliberately deterministic and testable.

1. Assemble candidates from owned tops, bottoms, footwear, and optional outerwear.
2. Apply hard compatibility constraints.
3. Score candidates with explicit weighted signals:
   - color harmony — 25%
   - personal preference — 20%
   - silhouette compatibility — 15%
   - formality consistency — 10%
   - occasion suitability — 10%
   - weather suitability — 10%
   - texture compatibility — 5%
   - wardrobe rotation — 5%
4. Sort and diversify the strongest results.
5. Return approximately three options.

Later, an AI reranker can operate **on the top valid candidates**, rather than inventing arbitrary outfits.

## Demo/live boundary

`EXPO_PUBLIC_DEMO_MODE=true` uses deterministic fixture data and local demo classification. This exists so the product can be presented without external dependencies.

Connected mode uses:

```text
Expo client
  → Supabase Auth
  → RLS-protected Postgres / Storage
  → authenticated Edge Function
  → OpenAI Responses API
```

The screens and domain types are shared across both modes; demo mode is not a separate mock application.

## Production evolution

Recommended next architectural steps:

1. move recommendation-session persistence into a repository/service boundary
2. add analytics event abstraction
3. add weather provider behind an interface
4. add AI candidate reranking server-side
5. add feature flags / remote config
6. add Sentry or equivalent observability
7. add end-to-end Maestro flows
8. add deletion/export jobs for privacy operations
