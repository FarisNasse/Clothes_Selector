# Launch readiness

This checklist separates current release obligations from features that are already present. Check an item only after recording evidence for the target platforms and backend environment.

## Core journeys

- [ ] Test sign-up, email confirmation, sign-in, sign-out, password recovery, and password update on supported platforms.
- [ ] Add, view, edit, and delete a representative wardrobe (including a 30-item ingestion session) using a staging account.
- [ ] Test photo selection, camera permission/cancel, retry, replace, remove, save-without-photo, invalid format, oversized image, and network failure.
- [ ] Confirm private garment photos render only for their owner and signed URL failures recover cleanly.
- [ ] Verify recommendations use only wardrobe items and obey tested hard compatibility constraints.
- [ ] Test lock, swap, save-look, favorite, and worn-outfit paths, including expected persistence across restart/sign-in.

## Security and privacy

- [ ] Exercise database RLS and Storage policies with two independent users.
- [ ] Confirm no privileged key appears in source maps, web bundles, native app bundles, logs, or CI artifacts.
- [ ] Verify the deployed schema and Storage policy state matches reviewed migrations.
- [ ] Implement and test account deletion, including database rows and photo objects.
- [ ] Define and publish privacy policy, data retention, data export, and store disclosures.
- [ ] Decide image metadata handling and test the chosen behavior.
- [ ] Establish incident response, support contact, and production backup/restore procedures.

## Reliability and quality

- [ ] Run `npm ci`, `npm run check`, and Expo Doctor from a clean checkout.
- [ ] Build/export every intended platform and test binaries on physical devices.
- [ ] Verify VoiceOver/TalkBack, keyboard navigation on web, reduced motion, and larger text.
- [ ] Define production monitoring and support workflows; configure them if needed.
- [ ] Test network loss, storage/database failures, session expiry, and migration rollout/recovery.
- [ ] Add end-to-end smoke automation for sign-in → add garment → recommend → record wear.

## Release operations

- [ ] Confirm target Supabase project, quotas, Auth redirect URLs, email settings, and Storage policies.
- [ ] Review app permissions, icons, screenshots, store metadata, and data-safety disclosures.
- [ ] Complete TestFlight and Google Play closed-track validation if distributing mobile binaries.
- [ ] Document build identifier, source commit, backend environment, migration state, and known issues.
- [ ] Review every unchecked item with the release owner and explicitly accept or defer it.

This list is not an assertion that the application is production-ready. See [security and privacy](../security/security-and-privacy.md) and [release process](release.md) for current limitations.
