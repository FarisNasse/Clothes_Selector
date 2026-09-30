# Implementation status — September 30, 2026

This revision continues the supplied app and implements a focused part of the product quality review, algorithm blueprint, and mannequin design. It remains a source release, not a production certification.

## Implemented here

- Weather entry accepts a specific Fahrenheit temperature, independent current-rain and forecast-chance inputs, and time outdoors. A wearer can require covered legs or a confirmed water-resistant coat and shoes. Unknown protection never satisfies that requirement. Warmth is evaluated per piece, and heat no longer triggers an unexplained 82°F hard cutoff.
- Outfit grammar supports a base top plus a sweater-like mid layer, an outer layer over a two-piece suit, and up to one accessory. Candidate search filters hard constraints before sampling and uses integer-safe product enumeration for large closets. The score retains a decimal for ranking and remains an editorial heuristic.
- An illustrated, front-facing mannequin view shares the same recommendation and controls as the flat lay. The choice persists locally. Its shape map distinguishes shorts, trousers, supported accessory positions, and unknown subtypes; the garment list remains accessible. A suit category represents a matching jacket and trousers set. The preview does not predict physical fit or exact print/drape.
- Saved looks use combination plus occasion identity, so the same garments can be saved for work and dinner. Weather and explicit requirements are saved with the look. A migration converts older account keys; the device cache upgrades older keys while reading. Saved looks with deleted pieces offer a restyle route and removal.
- Wear recording uses a persistent per-attempt UUID and an authenticated, security-invoker RPC that serializes and deduplicates retries. A failed post-commit wardrobe refresh cannot report a failed wear action. Demo photo selections and wardrobe edits remain available in memory for the current session.
- Search no longer treats shorts as pants or unconfirmed fit/season/formality as facts. The active filter badge counts category. Style summaries omit unconfirmed fit. Signed photo links refresh periodically and on app resume when older than the cache window; offline images fall back to illustrations.

## Verification in this workspace

- `npm ci`, `npm run check` (typecheck, lint, and 32 Node tests), and `npx expo export --platform web` completed. The scenario tests cover hot rain, covered legs, rain uncertainty, suit with shell, two-top layering, visual classification, wear-token shape, context-specific saved IDs, and a large synthetic closet.
- All SQL migrations parsed with `pglast`. This checks syntax only; no database was started, no migration was applied to an actual project, and no live RLS/RPC transaction was exercised.

## Before a connected beta

1. Apply migrations to a disposable staging project and deploy the existing account-deletion function. Verify two-account RLS/Storage isolation, new Data API grants, saved look migration, and idempotent wear RPC under concurrent and interrupted requests. Review database advisors and the actual migration state.
2. Exercise iOS and Android physical devices and web with photo selection/camera, expired signed URLs, offline and resume behavior, account recovery/deletion, image-free mannequin rendering, assistive technology, and different display sizes. Test the app's UI, not just a successful web bundle.
3. Define and run a wearer study before claiming personalized superiority or a best outfit. The proposed research and photo-fidelity phases in the attached blueprints are still future work. No generated virtual try-on, body measurement, learned ranker, or fashion-house endorsement is shipped.
4. Complete the remaining security, support, privacy, backup, monitoring, store, and release items in [launch readiness](launch-readiness.md). Orphaned Storage objects after interrupted garment writes still require backend reconciliation.

The database migration is a prerequisite for connected clients built from this source. Do not deploy the new client against an older schema.
