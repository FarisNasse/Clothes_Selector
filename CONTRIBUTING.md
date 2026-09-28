# Contributing

Thanks for helping improve Clothes Selector. Keep changes focused, explain user-visible behavior, and update documentation when implementation or configuration changes.

## Before opening a change

1. Check existing issues and current docs to understand intended behavior.
2. Create a short-lived branch from the current default branch.
3. Keep the change scoped; avoid mixing unrelated refactors with behavior changes.
4. Add or update tests for meaningful business logic, data ownership, and error paths.
5. Run `npm run check`. For dependency, routing, native, or environment changes, run Expo Doctor and the relevant platform checks too.

## Engineering expectations

- Use TypeScript types and the existing feature/repository/provider boundaries.
- Keep recommendation logic deterministic and covered by tests.
- Do not trust client-side filtering as an access control; enforce user ownership in Supabase RLS/Storage policies.
- Keep credentials out of source, commits, screenshots, logs, and examples.
- Make errors actionable and preserve user-entered data through recoverable failures.
- Follow the existing formatting and lint conventions.
- Document behavior that changes setup, data handling, environment variables, or release steps.

## Pull request checklist

- [ ] The change explains the problem and the resulting behavior.
- [ ] Tests cover the important behavior and failure conditions.
- [ ] `npm run check` passes, or the PR explains any blocker.
- [ ] Screenshots/video are included for material UI changes when useful.
- [ ] Documentation and `.env.example` are updated where appropriate.
- [ ] Database migrations are additive, reviewed, and tested against a local database.
- [ ] No secret, private user data, generated build output, or unrelated file is included.

## Review and merging

The GitHub Actions workflow runs typecheck, lint, and unit tests on pull requests and pushes to `main`. Passing CI is required evidence for these checks, not proof that native-device, backend-policy, accessibility, or release behavior was exercised. Obtain appropriate code review and complete the checks relevant to the affected surfaces before merging.

## Reporting security issues

Do not publish credentials, exploitable details, or private user data in a public issue. Contact the repository maintainer through a private channel. No dedicated security disclosure address is currently configured in this repository.
