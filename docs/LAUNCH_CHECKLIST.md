# Closed-Beta / Production Launch Checklist

## Core experience

- [ ] Signup, verification, login, logout, recovery tested on iOS and Android
- [ ] 30-item wardrobe ingestion test completed without developer intervention
- [ ] No-photo and optional-photo add/edit flows tested on web and Android with a staging account
- [ ] Photo error, retry, replace, remove, cancel, and save-without-photo paths tested
- [ ] Garment edit/delete implemented
- [ ] Image rendering uses private signed access
- [ ] Recommendation generation always uses owned inventory
- [ ] Item lock / swap UX complete
- [ ] Save outfit complete
- [ ] Wear event persisted and updates garment wear counters safely
- [ ] Feedback reasons persisted

## Recommendation quality

- [ ] Manual details for a full top/bottom/footwear set produce suitable looks
- [ ] Color, fit, and formality changes affect ranking as expected
- [ ] New-item network inspection shows no analysis or AI request

## Data & security

- [ ] RLS tests run with two independent users
- [ ] Storage cross-user access tests pass
- [ ] Service-role keys absent from client bundle
- [ ] Account deletion removes database rows
- [ ] Account deletion removes private storage objects
- [ ] Data export path defined
- [ ] Privacy policy reviewed
- [ ] Logs scrub secrets, auth headers, and signed URLs

## Reliability

- [ ] Observability/crash reporting configured
- [ ] Storage and database errors observable
- [ ] Offline/timeout states implemented
- [ ] Upload retries are idempotent
- [ ] Database migration rehearsed in staging
- [ ] Backup/restore posture documented

## Product analytics

- [ ] `garment_added`
- [ ] `recommendation_generated`
- [ ] `recommendation_viewed`
- [ ] `garment_swapped`
- [ ] `outfit_saved`
- [ ] `outfit_worn`
- [ ] `recommendation_rated`
- [ ] recommendation-to-wear funnel dashboard
- [ ] wardrobe digitization metric
- [ ] 7/30-day retention metric

## Release

- [ ] Preview EAS build succeeds
- [ ] Production EAS build succeeds
- [ ] TestFlight internal testing complete
- [ ] Google Play closed-track testing complete
- [ ] App icons/splash/screenshots final
- [ ] Store privacy/data-safety forms complete
- [ ] Support/contact route exists
- [ ] Production rollback process tested
