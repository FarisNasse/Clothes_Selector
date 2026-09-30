# Implementation status — September 28, 2026

This archive advances the attached product roadmap. It is a source implementation and local build review, not a production certification.

## Implemented in this revision

- Removed the hard-coded Supabase project; connected builds require explicit URL and publishable key. EAS profiles distinguish demo, staging, and production. Staging has a distinct mobile application ID.
- Added native photo decode/resize/re-encode with a picker-byte fallback, upload failure categories, and preserved draft/retry/save-without-photo behavior. Browser normalization remains.
- Added `confirmed_fields` provenance for defaulted fit, formality, warmth, seasons, and rain protection. Outfit reasons now cite the garment IDs and recorded details in the displayed outfit and are recomputed after swaps.
- Added quiet/expressive intent, one-look garment skips, and an opt-in hard rain requirement requiring both a marked water-resistant coat and marked water-resistant shoes.
- Added account-backed favorites and saved looks, local cache, and an explicit import of older device-only collections. Added ownership checks for feedback and wear-event references in the migration.
- Added a JSON export for account rows and a server-only account-deletion function that removes private photos before the Auth user. The export does not contain photo bytes.
- Added targeted tests for reason integrity, unknown rain data, exclusions/intent, and upload error classes. The original design philosophy and engineering roadmap are included in this archive.

## Local verification

The existing dependency install and `npm run check` pass; the updated suite contains **27 passing tests**. Typecheck, lint, and all 27 tests also pass using Node 22.16.0. `npx expo install --check` reports compatible versions, Expo Doctor passes 21/21 checks, and the web export bundles. PostgreSQL syntax parsing accepts all four migrations. Real-device checks remain required.

The database migration and Edge Function have **not** been applied to a project. Docker and a staging database were unavailable in this environment. The Deno check could not fetch its package manifest through this network; the function was transpiled for syntax only. SQL parsing and app typecheck do not validate server behavior against a live database.

## Before a connected staging build

1. Provision a distinct staging Supabase project. Apply all migrations in order. Confirm grants and RLS state in that project; run a two-user test for garments, photos, favorites, saved looks, feedback, wear events, and wear RPC.
2. Deploy `delete-account` with JWT verification enabled. Exercise deletion on a disposable account with multiple photos, including an interrupted cleanup retry. Verify associated rows and objects are removed.
3. Configure Auth redirect URLs, email delivery, Storage limits, and the EAS preview environment's public project URL/key. Build `staging`, then test signup, recovery, add/edit/delete/photo, recommendation, swap, save, favorite, wear, export, and deletion on Android and iOS devices and Chrome/Edge.
4. Confirm a second device sees synced collections; inspect behavior when a garment in a saved look is deleted. Test offline and expired-session paths.

## Remaining release work

- Full export of photo bytes, retention and incident policies, support contact, backup/restore rehearsal.
- Two-account database/Storage/RPC integration tests and a dependable web/native end-to-end smoke gate.
- Screen-reader, large-text, keyboard, reduced-motion, image-crop, and performance testing at 100/300/750 garments.
- Crash/error reporting, privacy-safe beta metrics, release rollback rehearsal, store assets and disclosures, and an actual diverse-user evaluation of outfit quality.
- A robust persisted feedback loop and richer two-top layering are still product work. Outfit ratings remain editorial heuristics pending user calibration.

See `launch-readiness.md` for the release checklist. The design philosophy is in `../product/design-philosophy.md`.
