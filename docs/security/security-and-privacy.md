# Security and privacy

This page records controls visible in the current repository and work needed before broad release. It is an engineering description, not a privacy policy or a claim of compliance certification.

## Data handled

The app may store account identifiers, garment attributes, optional garment photos, style preferences, saved outfit records, and wear history. Garment photos and wardrobe history can reveal personal preferences and routines; treat them as private user data.

## Client configuration and secrets

Supabase URL and publishable key are client-side values. Any `EXPO_PUBLIC_*` value is public in the compiled application. Never put service-role keys, database passwords, signing secrets, or third-party private credentials in the app or repository. `.env` is ignored by Git; `.env.example` must contain placeholders only.

The application currently includes default public Supabase client configuration in `src/lib/env.ts`. Before external distribution, confirm that the referenced project is the intended environment, has appropriate quotas and policies, and does not contain development data.

## Authorization

- Database tables enable RLS and define user-scoped policies in migration `0001_initial_schema.sql`.
- Storage bucket `garment-images` is private. Policies restrict object access to the authenticated user's UUID folder.
- Connected photo display uses short-lived signed URLs; do not log or share these URLs.
- `record_outfit_wear` runs as an authenticated invoker, checks that supplied garments belong to the caller, and writes the related records in one transaction.
- Client-side checks improve usability but do not replace database and Storage authorization.

These controls should be verified with automated tests using at least two independent users before beta. Schema presence alone is not proof that deployed policies match the repository.

## Photo handling

The bucket accepts JPEG, PNG, and WebP, with a 12 MiB limit. Photos are optional and saved to private Storage in connected mode. The app does not send photos to an AI provider. Review image metadata handling and retention behavior before release; this repository does not document a completed metadata stripping pipeline.

## Current privacy gaps

- No complete in-app account deletion and storage-cleanup flow.
- No user-facing data export or retention controls.
- No published privacy policy or store data-safety disclosure in this repository.
- No documented incident response or production backup/restore procedure.
- No CI dependency/secret scanning or automated cross-user RLS/Storage tests are configured in the current workflow.
- Analytics and crash-reporting integrations are not configured; do not imply such telemetry exists.

Track these gaps in the [launch-readiness checklist](../operations/launch-readiness.md). Revisit this document whenever data flows, providers, permissions, or access policies change.
