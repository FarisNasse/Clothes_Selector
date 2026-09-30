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
- Optionally attach JPEG, PNG, or WebP photos in connected mode; demo photos stay in the current app session.
- Filter and search the wardrobe. Saved looks and favorites sync for signed-in accounts; demo collections stay on the device.
- Generate local outfit candidates with factual reason traces, quiet/expressive intent, one-look skips, covered-leg and confirmed rain-protection requirements, two-top layers, and a coat over a suit.
- Switch between a flat lay and an illustrated on-mannequin preview. The drawing conveys broad silhouette and layering, not physical fit or exact fabric drape.
- Lock a garment while exploring compatible outfits, record a worn outfit, and track garment wear counts.
- Sign in with email and password and recover an account through Supabase Auth in connected mode.
- Export account details as JSON and request account deletion through an authenticated server function. The JSON does not include photo bytes.

See [product scope](docs/product/product-overview.md) for boundaries and known limitations.

## Connected mode

Connected mode uses Supabase Auth, PostgreSQL, private Storage, and the `delete-account` Edge Function. Apply the SQL migrations in `supabase/migrations` and deploy `supabase/functions/delete-account` to the intended project before connecting the app. Set the client-safe values in `.env`:

The September 30 migration changes saved-look keys and the wear RPC signature. Apply it before running a connected build from this revision; the older database function cannot accept the new retry token. Verify it against a separate staging project first.

```dotenv
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_APP_ENV=staging
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

The Supabase URL and publishable key are client configuration, not secrets. Never put a service-role key, database password, or other privileged credential in an `EXPO_PUBLIC_*` variable or in the app bundle. See [local development](docs/development/local-development.md) and the [security model](docs/security/security-and-privacy.md).

Connected mode deliberately has no built-in backend URL or key. A missing project setting fails at startup instead of reaching an unintended database. A production build also refuses demo mode. The EAS `staging` profile uses preview environment values; `production` uses production values. Supply each environment's distinct public URL and key in EAS before building.

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
