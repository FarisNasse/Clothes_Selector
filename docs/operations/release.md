# Release process

## Current automation

GitHub Actions runs `npm ci`, TypeScript typechecking, ESLint, and the unit test suite on pull requests and pushes to `main`. The workflow does not currently build signed app binaries, deploy database migrations, or publish to an app store.

## Before a release candidate

1. Confirm the target Supabase project and environment configuration. Do not rely on the repository's built-in default project for production without explicit review.
2. Review schema changes and apply migrations to a staging project first.
3. Run `npm ci` and `npm run check` from a clean checkout.
4. Run Expo Doctor and export/build each target platform using the selected EAS profile.
5. Test authentication/recovery, garment CRUD, photo upload/read failures, recommendation constraints, and wear persistence against staging.
6. Verify two-user RLS and Storage isolation, account lifecycle/privacy flows, accessibility, and device behavior.
7. Complete the [launch-readiness checklist](launch-readiness.md) and document known issues.
8. Confirm the app version/runtime policy and store metadata before distributing a binary.

## EAS profiles

`eas.json` defines `development`, `preview`, `staging`, and `production` build profiles. Development is an internal development-client build; preview and staging are internal distribution channels; production uses the production channel and auto-increment. These profiles are configuration only: credentials, update channels, backend environments, and store submissions must be set up and verified independently.

## Database rollout

Treat migrations as forward-only changes once applied to shared environments. Review access policy changes, test on staging, and prepare a recovery plan before production rollout. The repository does not currently automate migration deployment or document a tested production rollback/restore process.

## Release records

For each external test or release, record the app version, source commit, EAS profile/build identifier, backend project/environment, migrations applied, validation performed, and known issues in the release channel or an attached release note. Do not put secrets or user data in release notes.
