# Initial Patch Notes — v0.1.0

## Purpose

This is the first substantial repository patch for Clothes Selector. It converts an empty repository into a proposal-ready, production-oriented mobile foundation centered on the core loop:

**wardrobe ingestion → structured inventory → outfit recommendation → actual wear**.

The patch intentionally supports two modes:

- **Proposal/demo mode:** runs with seeded wardrobe data and deterministic garment analysis without cloud credentials.
- **Connected mode:** uses Supabase Auth/Postgres/Storage/Edge Functions and server-side AI garment analysis.

The demo path is not a separate throwaway prototype; it exercises the same domain model, recommendation engine, screens, and repository boundaries.

## Included product surfaces

- authentication entry surface
- Today dashboard
- occasion-driven recommendations
- three-result recommendation engine
- wardrobe browser with category filters and summary metrics
- garment detail screen
- locked-item **Style This** recommendations
- camera/photo-library garment capture
- AI classification confirmation/correction
- style-profile visualization
- profile/privacy surface
- proposal/demo disclosure states

## Included engineering foundation

- Expo SDK 57 / React Native / Expo Router configuration
- strict TypeScript project configuration
- environment separation and demo/live mode
- persistent Supabase session boundary
- typed garment, outfit, style, weather, and scoring domain models
- private user-scoped garment image Storage bucket
- PostgreSQL schema for profiles, garments, outfits, recommendations, feedback, and wear events
- Row Level Security on all user-owned data
- server-side `analyze-garment` Edge Function
- structured AI garment schema validation
- deterministic candidate generation + hard compatibility rules + weighted scoring
- atomic `record_outfit_wear` database RPC
- GitHub Actions quality workflow
- EAS development/preview/staging/production profiles
- recommendation behavioral tests

## Recommendation design

Candidates are assembled only from the stored wardrobe. The engine currently scores:

- color harmony — 25%
- personal preference — 20%
- silhouette compatibility — 15%
- formality consistency — 10%
- occasion suitability — 10%
- weather suitability — 10%
- texture compatibility — 5%
- wardrobe rotation — 5%

Hard constraints run before ranking. The initial tests verify inventory integrity, locked-garment behavior, and formal-footwear constraints.

## Wear event transaction

The `record_outfit_wear` RPC performs the highest-value product event atomically:

1. verifies the user is authenticated;
2. verifies every garment is owned by that user;
3. creates the accepted outfit;
4. records outfit items;
5. writes a wear event;
6. writes a `wear` recommendation-feedback signal;
7. increments wear counts and updates `last_worn_at`.

This keeps the north-star event consistent even if a client request fails midway.

## Validation performed in the build environment

- whole-source TypeScript parser pass: **0 parser/syntax diagnostics**
- internal `@/…` import resolution check: **0 missing internal imports**
- recommendation core isolated strict TypeScript compilation: **pass**
- recommendation behavioral checks: **3/3 pass**
  - recommendations use known wardrobe inventory only
  - a locked garment remains in every returned outfit
  - formal recommendations reject insufficiently formal footwear

### Environment limitation

The build environment used to create this patch did not have outbound npm package installation available. Therefore a dependency-backed `npm install`, full Expo bundle, ESLint run, and complete project typecheck against installed React Native package typings were **not** claimed as executed here.

The repository CI is configured to run install → typecheck → lint → tests in a network-enabled GitHub Actions environment. A fresh checkout should run `npm install` followed by `npm run check` before merge/release.

## Deliberately incomplete for the next patch

- real Supabase project provisioning/deployment
- signed display URLs for private garment imagery
- edit/delete garment flows
- per-slot Swap Item UI
- saved outfits UI
- persisted recommendation candidate/session lineage before acceptance
- live weather provider and location consent
- analytics/observability vendors
- account deletion UI/storage cleanup
- E2E device automation
- background-removal provider

None of these gaps require replacing the initial architecture.

---

# Frontend Experience-System Patch — v0.2

This follow-up implements the first large slice of the proposed frontend experience architecture while preserving the v0.1 recommendation, Supabase, and garment-ingestion boundaries.

## Added

- semantic `src/design/` token layer
- reusable primitive component layer
- centralized garment visual subsystem
- outfit flat-lay and recommendation hero subsystem
- clothing-first Today redesign
- searchable responsive Wardrobe redesign
- locked-garment visual styling session
- refreshed Style intelligence surface
- intent-aligned **You** navigation destination
- responsive web/tablet content widths
- improved empty/error/loading/accessibility states
- Windows Expo web-repair script

## Dependency strategy

No new UI library is silently introduced in this source patch. The existing web failure is repaired by running `npm run repair:web`, which delegates compatible dependency selection to Expo CLI and updates the local lockfile correctly. NativeWind/Reanimated/Image/Haptics remain the next dependency-focused slice rather than being mixed into an unvalidated lockfile edit.
