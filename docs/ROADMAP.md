# Production Roadmap

## Milestone 0 — Foundation — included in this patch

**Goal:** turn an empty repository into a coherent, proposal-ready product foundation.

Included:

- Expo/Router application
- design language and main navigation
- demo/live environment separation
- authentication/session boundary
- wardrobe repository boundary
- typed garment model
- Postgres schema + RLS
- private image storage policy
- garment capture/analyze flow
- strict AI output contract
- deterministic outfit engine
- garment-detail item locking / “Style This”
- transactional wear persistence
- unit tests, CI, EAS config
- proposal/architecture/security documentation

**Exit criterion:** project can be presented immediately in demo mode and has an explicit path to connected production data.

## Milestone 1 — Wardrobe vertical slice

Build/finish:

- real Supabase project and migrations
- account creation/email verification UX
- garment CRUD beyond create/list
- signed image rendering
- image compression/orientation handling
- background removal provider or deferred processing
- filter/search persistence
- upload retry/idempotency
- AI correction telemetry

**Ship gate:** tester can digitize 30 garments without developer intervention or data cleanup.

## Milestone 2 — Recommendation vertical slice

Build/finish:

- persist recommendation sessions
- persist generated outfits
- swap individual garment
- save outfit
- persist recommendation session/candidate lineage
- feedback reasons
- recommendation fixture/evaluation suite
- optional AI reranker restricted to valid candidates

**Ship gate:** every recommendation contains only owned garments, respects hard constraints, and can be traced to a score breakdown.

## Milestone 3 — Daily utility

Build:

- weather provider
- approximate location permission
- recent-wear penalty
- underused-garment boost
- daily recommendation refresh
- lightweight onboarding style questionnaire
- home-screen retention instrumentation

**Ship gate:** product has a credible reason to open daily.

## Milestone 4 — Closed beta hardening

Build/finish:

- error monitoring
- analytics funnel
- API rate limits / budget controls
- Edge Function timeout/retry policy
- account deletion UI and verification
- data-export path
- accessibility audit
- real-device test matrix
- offline/error states
- migration rehearsals
- automated smoke/E2E tests
- TestFlight / Play closed-track binaries

**Ship gate:** no P0/P1 defects in the core loop and security isolation tests pass.

## Milestone 5 — Intelligence expansion

Only after the core loop shows usage:

- packing mode
- wardrobe analytics
- cost per wear
- wardrobe health
- missing-piece analysis
- purchase compatibility
- inspiration image matching
- calendar context

## Explicitly deferred

- social feed
- marketplace
- photorealistic personal avatar
- AR try-on
- closet video scan
- email receipt scanning
- resale/stylist marketplace

These are not prerequisites for proving the primary product hypothesis.
