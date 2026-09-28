# Backlog (earlier proposal)

Automatic garment-analysis items below are archived; the current production route is manual details with an optional photo.

# Initial Engineering Backlog

This backlog is ordered to keep the core wardrobe → recommendation → wear loop ahead of expansion features.

## P0 — Connected vertical slice

1. **Provision Supabase staging and production projects**
   - apply migrations
   - configure auth redirect URLs
   - configure Edge Function secrets
   - document project IDs in deployment tooling (not secrets)

2. **Complete garment CRUD**
   - detail screen
   - edit metadata
   - delete garment + storage object
   - optimistic/retry behavior

3. **Render private garment imagery**
   - signed URL helper
   - expiry refresh
   - image caching policy
   - placeholder and failure states

4. **Persist recommendation lineage before acceptance**
   - recommendation session insert
   - persist candidate IDs / score breakdowns
   - connect accepted outfit back to its originating session

5. **Implement per-slot swap UI**
   - lock all unaffected slots
   - rank compatible replacements for one category
   - record swap as recommendation feedback

## P1 — Closed beta quality

6. Weather provider abstraction and approximate-location consent
7. Recommendation analytics event abstraction
8. Garment-analysis rate limits and cost telemetry
9. Two-user automated RLS/storage isolation suite
10. Account deletion including storage cleanup
11. Error/crash monitoring
12. Maestro smoke flows for signup → add garment → recommend → wear
13. Upload compression, orientation normalization, retry/idempotency
14. Accessibility and dynamic-text pass

## P2 — Personalization

15. Onboarding style questionnaire
16. Persist style profile
17. Feedback reason capture
18. Recent-wear penalty tuning
19. Underused-garment rotation tuning
20. Offline evaluation dataset for recommendation quality
21. Optional AI reranker over deterministic top candidates

## Deferred until core-loop validation

- calendar integration
- packing mode
- cost-per-wear dashboards
- wardrobe health
- shopping compatibility
- inspiration image matching
- generated outfit visualization
- social features
- closet video scanning
- email purchase import
