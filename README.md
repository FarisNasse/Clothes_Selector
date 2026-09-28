# Clothes Selector

Clothes Selector is an Expo application for cataloging a personal wardrobe and generating outfit recommendations from garments the user owns. The app supports a seeded demo experience and a Supabase-connected experience. Garment details are entered manually; photos are optional. Outfit recommendations are generated locally with deterministic rules. The current product does not require an AI API.

## Project status

This repository is an actively developed product foundation. It includes the main wardrobe, styling, account, and garment-management flows, Supabase migrations, automated unit tests, and a CI workflow. It is not a claim of production readiness: release gaps and unverified device behaviors are listed in [the launch-readiness checklist](docs/operations/launch-readiness.md).

## Get started

**Requirements:** Node.js `>=22.13 <23` and npm. The CI workflow currently validates on Node 22.16.0.

```bash
cp .env.example .env
npm ci
npm start
```

The app starts in demo mode unless `EXPO_PUBLIC_DEMO_MODE=false` is explicitly set. Demo mode uses a bundled sample wardrobe; additions and edits to garments last for the current app session. No Supabase credentials are needed to run the demo.

For a web session:

```bash
npm run web
```

For iOS or Android, use Expo Go where supported or a development build when native capabilities require it. See [local development](docs/development/local-development.md) for environment setup, platform notes, and troubleshooting.

## What the app does

- Create, browse, edit, and delete structured garment records.
- Optionally attach JPEG, PNG, or WebP photos to garments in connected mode.
- Filter and search the wardrobe, and manage device-local saved looks and favorites.
- Generate outfit candidates from the available wardrobe using deterministic compatibility rules and weighted scoring.
- Lock a garment while exploring compatible outfits, record a worn outfit, and track garment wear counts.
- Sign in with email and password and recover an account through Supabase Auth in connected mode.

See [product scope](docs/product/product-overview.md) for boundaries and known limitations.

## Connected mode

Connected mode uses Supabase Auth, PostgreSQL, and private Storage. Apply the SQL migrations in `supabase/migrations` to a Supabase project before connecting the app. Set the client-safe values in `.env`:

```dotenv
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

The Supabase URL and publishable key are client configuration, not secrets. Never put a service-role key, database password, or other privileged credential in an `EXPO_PUBLIC_*` variable or in the app bundle. See [local development](docs/development/local-development.md) and the [security model](docs/security/security-and-privacy.md).

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run check
```

`npm run check` runs typecheck, lint, and the automated Node test suite. GitHub Actions runs the same three checks for pull requests and pushes to `main`.

## Documentation

Start at the [documentation index](docs/README.md). It links to architecture, data, security, local development, contribution, release, and product guidance. Older proposals and patch notes are retained under [docs/archive](docs/archive/README.md) and are not specifications for current behavior.

## License

No license is currently declared in this repository. Do not assume the source is licensed for redistribution or reuse.
