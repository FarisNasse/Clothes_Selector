# Clothes Selector: roadmap to a release quality product

> This is the supplied planning snapshot for the earlier archive. See [the implementation status](implementation-status-2026-09-28.md) for changes made after it was written.

**Snapshot reviewed:** September 28, 2026 archive `Clothes_Selector-asdas (7)(1).zip` and the attached `Clothes_Selector_Design_Philosophy(1).md`
**Purpose:** A prioritized execution plan for a small team or solo developer. “FAANG level” here means disciplined product decisions, measurable quality, privacy, reliability, accessibility, and repeatable releases. It is not a claim that any company would certify the app.

## Product bar

> **Every look should be a clear answer to a real person's real day, written in the clothes they already own.**

The first release succeeds when a new user can create an accurate closet, receive a contextually useful recommendation, understand its specific reasons, change it, save it, and wear it without losing data or exposing private photos. The app should work without a paid AI API. AI based photo labeling can be an optional later experiment, with manual entry remaining complete.

### What exists today

| Area | Observed in this snapshot | Remaining concern |
| --- | --- | --- |
| Experience | Four main tabs, visual system, responsive views, onboarding, empty states, motion preference, garment details and styling sheets | Visual finish still needs actual device, accessibility, and large-closet assessment |
| Closet | Broad garment and color catalog, manual CRUD, optional photo, web image normalization, private connected storage | Native orientation/resize and photo reliability are unverified; the prior photo-read issue needs a device/browser regression matrix |
| Outfits | Local deterministic engine, occasion/weather input, lock/swap/save/wear flows | Generic score rules can overrule a wearer's intent; some explanation text asserts properties not recorded; outfit structures are limited |
| Data | Supabase Auth, migrations, user-scoped RLS, private image bucket, atomic wear RPC | Saved looks/favorites are device-local; no deletion/export flow; cross-user policy tests and deployed-state checks are absent |
| Engineering | TypeScript strict mode, 32 Node test cases in seven test files, PR CI for typecheck/lint/tests, release docs | No connected integration or E2E tests in CI, no native build gate, no production telemetry or rollback practice |

This is a source review, not a verified production audit. I did not install dependencies, build binaries, execute the test suite, connect to the deployed database, or use a physical device. Existing documentation reports a passing web export and checks at an earlier point; that claim was not independently rerun for this roadmap.

## Priorities and dependency order

**P0 blocks a trustworthy beta.** **P1 makes the core experience strong enough to retain users.** **P2 supports wider scale after evidence from beta.** Time ranges are planning estimates for one experienced full-time engineer, with design/research help available; they are not commitments. Parallel work by a team can reduce calendar time, but device testing, user research, and store review remain on the critical path.

| Phase | Priority | Estimate | Release gate |
| --- | --- | --- | --- |
| 0. Establish baseline and scope | P0 | 1–2 weeks | Reproducible builds, explicit platform matrix, issue list, measured starting funnel |
| 1. Make the core data flow trustworthy | P0 | 3–5 weeks | Photo, account, storage, security, and persistence failure cases pass |
| 2. Implement the design philosophy in the engine | P0/P1 | 4–6 weeks | Reasons trace to actual fields and user choices; useful alternatives survive user review |
| 3. Finish the wardrobe and styling journeys | P1 | 3–5 weeks | New users complete the full loop on supported platforms without help |
| 4. Harden quality and accessibility | P0/P1 | 3–5 weeks | Automated and manual release gates pass on representative devices and closets |
| 5. Operate a controlled beta and release | P0 | 2–4 weeks | Privacy, monitoring, support, rollback, and store requirements are complete |

Allow roughly **4–7 months of focused solo work**, plus schedule risk for app review and real-user iteration. The estimates overlap only where work can safely proceed in parallel. Avoid promising a public launch date before phase 0 establishes the baseline.

## Phase 0 — establish the baseline

1. **Declare the release surface.** Choose whether V1 supports Android and web, or Android, iOS, and web. Record minimum OS/browser versions and a device matrix; do not call a platform supported because Expo bundles for it.
2. **Reproduce a clean checkout.** Use the repository's Node 22 requirement; run `npm ci`, `npm run check`, Expo Doctor, web export, and preview native builds. Record commit, build identifiers, failures, durations, and environment. Keep the lockfile pinned and remove ambiguous setup paths.
3. **Separate environments.** Make demo, staging, and production explicit in configuration and EAS profiles. `src/lib/env.ts` currently has a hard-coded public Supabase project URL/key and defaults to demo mode; make accidental production/staging mixups difficult. Publishable keys are not secrets, but the selected project must be intentional.
4. **Create a small issue board.** Each item below gets an owner, severity, reproduction steps, acceptance criteria, and verification evidence. Triage the specific photo-read error, auth redirects, and any clean-build failures first.
5. **Define events before adding analytics.** Instrument privacy-conscious events such as `garment_save_attempt/success`, `photo_prepare/upload_failure` with error class and platform (never photo content or signed URL), `recommendation_shown`, `swap`, `look_saved`, and `wear_recorded`. Define a consent and retention policy for telemetry.

**Gate:** Two fresh machines or CI environments can reproduce the intended demo and staging builds, and a tester can tell which backend each build uses.

## Phase 1 — make the core data flow trustworthy

### 1A. Photo ingestion and garment persistence

- Build an explicit pipeline: pick → decode → normalize orientation/size → inspect MIME and bytes → upload to a user-scoped private path → commit garment row → clean up orphaned object on failure. Keep the selected photo in the draft and let the user retry, replace, or save without photo.
- Extend the current web normalization in `src/features/wardrobe/normalizeWebPhoto.ts` to a tested native path. Test JPEG, PNG, WebP, HEIC conversion where supported, very large files, permissions, cancellation, offline mode, expired sessions, and a server rejection on actual devices. Avoid relying on the preview URI as file bytes.
- Distinguish read, unsupported format, size, network, auth, policy, and upload failures in the UI. Preserve technical diagnostics privately; show actionable wording to users. Make photo replacement/deletion and object cleanup idempotent.
- Use scaled private display images/thumbnails and safe caching where the performance data justifies them. Test 30-item entry and scroll performance with 100/300/750 representative photos.

**Gate:** No silent loss of form data; all listed cases either save correctly or give a working recovery path. Repeat the reported “could not read this photo” scenario on Samsung Android, at least one iPhone if iOS is in scope, and Chrome/Edge web.

### 1B. Ownership, account lifecycle, and sync

- Test every user-owned table, `outfit_items`, Storage read/write/replace/delete, and `record_outfit_wear` with two separate accounts and anonymous access. Check that a user cannot attach someone else's session or outfit in `recommendation_feedback` or `wear_events`: the current policies primarily check the row's `user_id`, while referenced records need their own ownership validation. Treat this as a hypothesis to prove with tests, not an asserted exploit.
- Design account deletion as a server-controlled, resumable operation that removes Storage objects before deleting the Auth user. Add data export, a retention policy, and a visible request/status flow. Verify all tables, orphan photos, local collections, and signed URL caches after deletion and sign-out.
- Decide the ownership contract for favorites and saved looks. For a signed-in user, put them in a synchronized account-backed repository and handle conflict/deleted garments; keep device-local collections for a deliberately temporary demo. This is a product decision and schema work, not a cosmetic change.
- Add migration tests, backup/restore rehearsal, and an environment drift check. Review function grants, triggers, all RLS policies, and Storage policies against the deployed projects. Do not expose a service-role/secret key in any client bundle.

**Gate:** Cross-user attempts fail, the full closet and saved looks survive reinstall/sign-in on another device, and deletion/export work end to end. Official Supabase guidance treats RLS and Storage policies as the data boundary and notes that Storage objects must be removed before deleting their owner.

## Phase 2 — turn the philosophy into a recommendation system

Work in `src/features/recommendations/engine.ts`, `src/types/domain.ts`, and the styling UI. Keep generation deterministic and local unless a measured reason emerges to add a service.

1. **Separate facts, preferences, and guesses.** Model field provenance as confirmed, default, inferred, or unknown. Today the form defaults can make `regular` fit, midrange warmth/formality, all-season, or `waterproof: false` appear certain. Ask only for details that change a decision; never call unknown rain protection “not waterproof.”
2. **Put explicit constraints first.** Collect dress requirements, weather exposure, comfort/mobility boundaries, unavailable pieces, and per-look intent. A “never use” dislike and a “usually avoid” preference need different behavior. A lock is respected or the app explains why the requested combination cannot satisfy a confirmed requirement; it should not silently substitute a garment.
3. **Change candidate structure.** Support tee + overshirt, knit + coat, tailored layer + outerwear, and deliberate mixed-register/tonal/expressive alternatives. Bound the search cost for large closets. Present the best viable answer honestly when the closet is sparse, including the missing category or requirement.
4. **Build a reason trace.** Each recommendation records garment IDs, confirmed attributes, relationship, context, and confidence/source. Compose one or two sentences from that trace *after* locking/swapping. Remove the current templates that credit shoes with texture solely from a high texture score or call an outfit weather-ready because any one piece is marked waterproof.
5. **Rebalance ranking around user choice.** The current score gives color 25% and preferences 20%, penalizes identical colors and multiple patterns, and hard-filters some formality spreads. These are editorial heuristics, not universal laws. Treat user intent and verified constraints as more important; provide quiet, tonal, and bold routes rather than a single ideal score. Do not turn house names or prices into quality signals.
6. **Calibrate with people.** Build a consented evaluation set of wardrobes and scenarios across tastes, sizes, budgets, cultures, and expression. Have wearers judge “would wear,” “fits my day,” “reason is accurate,” and “easy to change.” Review poor cases, including no viable outfit and conflicting requirements. Protect photos and remove identifying context from research exports.

**Gate:** In a curated set of at least 100 scenario/wardrobe combinations, every displayed explanation points to present garments and recorded/user-supplied facts; no known hard constraint is silently violated. Beta wearers should prefer the revised choices to the current baseline in a blind comparison. Set the actual improvement threshold after pilot data rather than inventing an accuracy claim now.

## Phase 3 — complete the daily product loop

- **Onboarding:** Let a new user get value before entering 30 items. Provide honest sample exploration, then guide them to a minimum viable closet (top, bottom or suit, shoes). Be explicit about demo data being temporary.
- **Fast entry:** Keep the complete manual route; offer repeat-last details, bulk entry/photo queue, sensible but visibly editable defaults, and progress recovery. Never require a paid AI service for the full workflow.
- **Styling control:** Show context and assumptions alongside the outfit. Make lock, swap, quieter/bolder, save, undo, and worn confirmation easy to discover and usable with screen readers. Explain when a constraint conflicts with a requested piece.
- **Wardrobe life cycle:** Add availability/laundry/condition and optional seasonal storage only if beta users need them. Handle deleted garments in saved looks and history gracefully; history must not silently rewrite what was worn.
- **Feedback loop:** Add concise “more like this,” “not for me,” and “skip this piece today” signals. Persist signals with consent and use them to improve ranking or reveal alternatives. Do not interpret a one-time skip as a permanent identity trait.

**Gate:** A first-time beta user can sign up, add a small closet, receive a supported recommendation, adjust it, save it, mark it worn, close/reopen, and see the correct state on another device without coaching.

## Phase 4 — quality, performance, and accessibility

| Track | Concrete work | Evidence required |
| --- | --- | --- |
| Automated behavior | Extend unit tests for constraints, unknown data, provenance, sparse wardrobes, swaps and explanation integrity; add repository integration tests and two-account Supabase policy tests | Tests fail for deliberately introduced cross-user and false-explanation cases |
| End-to-end | Automate sign-up/sign-in → add garment/photo → generate → swap/lock → save → wear → reopen; run on native preview builds and web where supported | Stable smoke run before promotion; failures include screenshots/logs without personal images |
| Reliability | Handle offline transitions, expired sessions, upload retries, partial writes, migrations and stale signed URLs; add error boundaries and actionable recovery | Fault-injection checklist completed on staging |
| Performance | Profile cold start, closet search/scroll, image memory, and recommendation latency at 100/300/750 garments on a lower-end Android device and a mainstream iPhone if supported | Budgets set from baseline; no sustained dropped-frame or memory failure in target scenarios |
| Accessibility | Audit VoiceOver, TalkBack, web keyboard and focus order, modal focus, contrast, dynamic text, touch targets, reduced motion, and non-color status cues | Critical paths complete with screen reader and large text; issues recorded and fixed |
| Design consistency | Review empty/loading/error/success states in light/dark modes; check every image crop, typography scale, responsive layout and native icon/splash | Screen matrix approved on devices, not just simulator screenshots |

Current CI only typechecks, lints, and runs Node tests. Add native preview build checks, integration tests, dependency/secret scanning, and a small E2E smoke gate. Expo documents EAS Workflows with Maestro as one supported route; select the tool that your team can keep reliable.

## Phase 5 — controlled beta and production operations

1. **Private beta, then wider beta.** Start with 20–30 varied users for two weeks, watch the complete loop, fix P0 failures, then expand only when the same metrics hold. Include people who do not share the designer's taste or wardrobe.
2. **Privacy and support.** Publish clear privacy policy and data disclosures, support contact, export/deletion instructions, retention plan, and incident response owner. Review image metadata handling and signed URL/logging practices. Set a policy for research and telemetry consent.
3. **Observe the product.** Add privacy-safe crash/error reporting, release/version tagging, upload failure classes, backend health, and funnel metrics. Alert on auth, photo, and wear-recording regressions. Avoid transmitting garment photos or outfit descriptions to telemetry by default.
4. **Release discipline.** Use staging builds on a separate backend, documented migration promotion, feature flags for risky changes, a release checklist with owner/sign-off, phased update rollout, and rehearsed rollback. Test a production-like EAS runtime/channel before a broad update. Prepare store assets and review permissions/disclosures.

**Suggested first targets, to validate with beta data:** at least 95% of attempted garment saves complete or recover without re-entry; at least 99% of accepted wear actions persist exactly once; zero known cross-account reads; no P0 crash or data-loss defect at launch; a clear majority of beta users can explain why their selected look was suggested. These are proposed gates, not current measurements or industry standards. Record denominators, platform, time window, and exclusions for every metric.

## What to postpone until the loop works

Shopping feeds, social posting, image-generated fashion advice, live weather/location, complex ML personalization, calendar integrations, and automatic background removal can all wait. Each adds privacy, cost, or failure modes without fixing trust in the owned-wardrobe loop. Revisit them only when user research shows a specific unmet need and the manual/local path remains dependable.

## First implementation backlog (in order)

| ID | Task | Owner type | Done when |
| --- | --- | --- | --- |
| P0-01 | Clean build and platform matrix | Engineering | Node 22 CI/web/native preview results recorded at a commit |
| P0-02 | Reproduce and fix photo read/upload path | Mobile/web engineering | Original failure cases pass on named devices and browsers; recovery retains draft |
| P0-03 | Two-account RLS/Storage/RPC tests | Backend engineering | Unauthorized selects/writes/references fail in CI and staging |
| P0-04 | Environment isolation and backend drift | Backend/release | Demo, staging, production bundles point to intended projects; migration state recorded |
| P0-05 | Account deletion/export and cleanup | Backend/product | User can complete requests; no orphan photos or access remain beyond defined retention |
| P0-06 | Reason trace and unknown-field semantics | Product/engineering | Every explanation passes fact-to-garment assertions after swaps |
| P1-07 | Explicit constraints, alternatives, richer layering | Product/styling | User-selected intent wins over aesthetic defaults; sparse-closet result is honest |
| P1-08 | Account-backed saved looks/favorites | Backend/mobile | Same data available after reinstall and across devices; conflicts handled |
| P1-09 | Full-loop E2E and accessibility audit | QA/design/engineering | Critical journey passes on release platforms with assistive technology |
| P0-10 | Beta telemetry, privacy, support and rollback | Product/release | Incident owner, metrics dashboard, policy and staged rollback rehearsal exist |

## Evidence and references

- **Attached product direction:** `Clothes_Selector_Design_Philosophy(1).md`, especially the eight principles, product translation, and explanation contract. Its scholarly and fashion-house citations are bounded inspiration for styling choices, not validated universal rules.
- **Repository evidence:** `package.json`, `.github/workflows/ci.yml`, `src/features/recommendations/engine.ts`, `src/features/wardrobe/{photo,pickedImage,normalizeWebPhoto}.ts`, `src/features/collections/storage.ts`, `src/lib/env.ts`, `supabase/migrations/{0001_initial_schema,0002_private_garment_storage,0003_record_wear_transaction}.sql`, `docs/engineering/architecture.md`, and `docs/operations/launch-readiness.md` in the September 28 archive.
- **Current primary technical references:** [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Auth user management](https://supabase.com/docs/guides/auth/managing-user-data), [Expo E2E workflows](https://docs.expo.dev/eas/workflows/examples/e2e-tests/), [Expo monitoring](https://docs.expo.dev/monitoring/services/), and [EAS runtime versions/updates](https://docs.expo.dev/eas-update/runtime-versions/). Review these again during implementation because service behavior changes.
