# Clothes Selector

**The intelligent wardrobe for men.**

Clothes Selector turns a user's existing clothing collection into a structured digital wardrobe and recommends outfits from clothing the user actually owns. The product is deliberately built around **wardrobe intelligence**, not generic fashion chat or ecommerce discovery.

> Stop searching for outfits. Let your wardrobe tell you what to wear.

## What this initial patch proves

This repository starts with a proposal-ready vertical foundation rather than an empty UI shell:

- Expo SDK 57 / React Native mobile application with Expo Router
- polished Today, Wardrobe, Style, Profile, and Add Garment surfaces
- explicit proposal/demo mode with no cloud credentials required
- Supabase Auth/session boundary and live-data repository path
- production database schema with user-scoped Row Level Security
- private garment-image Storage policies
- camera / photo-library garment ingestion
- server-side garment analysis boundary using the OpenAI Responses API
- strict structured garment metadata schema
- deterministic outfit candidate generation and scoring
- locked-garment “Style This” flow in the UI and recommendation engine
- transactional “Wear This” persistence with utilization updates
- unit tests for inventory integrity and recommendation constraints
- EAS development/preview/staging/production channels
- GitHub Actions validation pipeline
- product, architecture, security, roadmap, and demo documentation

The demo mode is intentional: it lets the product be presented immediately while the same screens already connect to the production boundaries used when Supabase is configured.

## Product loop

```text
Photograph garment
      ↓
AI proposes structured metadata
      ↓
User confirms/corrects
      ↓
Garment enters authoritative wardrobe
      ↓
Choose occasion + context
      ↓
Rules generate and rank valid outfits
      ↓
User swaps / saves / wears
      ↓
Behavior becomes personalization data
```

The system never asks a model to invent a wardrobe. Candidate outfits are assembled exclusively from stored garments. AI is used for perception, interpretation, reranking/explanation, and later personalization—not as a substitute for inventory integrity.

## Quick start: proposal/demo mode

Requires Node.js 22.13+ (Expo SDK 57's minimum Node line).

```bash
cp .env.example .env
npm install
npm start
```

Leave `EXPO_PUBLIC_DEMO_MODE=true` to present the application without Supabase or AI credentials.

### Web dependency repair

If Expo Router fails on web with `Unable to resolve "react-native-web/dist/index"`, install the SDK-compatible web runtime and realign Expo packages:

```powershell
npm run repair:web
npx expo start --clear --web
```

The repair script runs Expo's installer for `react-dom`, `react-native-web`, and `@expo/metro-runtime`, then runs `expo install --fix` and Expo Doctor. This keeps the exact versions tied to the project's installed Expo SDK instead of hard-coding them in this patch.

The demo contains a seeded menswear wardrobe and a deterministic recommendation engine. The Add Garment flow uses a clearly disclosed sample classification in demo mode so the full interaction can be shown safely without external calls.

## Connected mode

1. Create a Supabase project.
2. Install the Supabase CLI.
3. Apply `supabase/migrations` to the project.
4. Set the Expo client-safe environment variables:

```dotenv
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

5. Set Edge Function secrets server-side:

```bash
supabase secrets set OPENAI_API_KEY=...
supabase secrets set OPENAI_GARMENT_MODEL=gpt-5.6
```

6. Deploy the function:

```bash
supabase functions deploy analyze-garment
```

Never put `OPENAI_API_KEY` or a Supabase service-role key in an `EXPO_PUBLIC_*` variable. Expo public values are bundled into the client application.

## Validation

```bash
npm run typecheck
npm run lint
npm test
npm run check
```

### Current launch gate

This is an **initial production foundation / proposal beta patch**, not a store-release claim. Before public beta, the project must still complete the gates in `docs/LAUNCH_CHECKLIST.md`, including device testing, observability, analytics wiring, account deletion UI, weather provider selection, migration verification, automated end-to-end flows, and store metadata/privacy disclosures.

## Documentation

- `docs/REDESIGN.md` — redesign setup, interaction behavior, validation, and remaining device checks

- `docs/PRODUCT_PROPOSAL.md` — concise stakeholder/investor/product proposal
- `docs/ARCHITECTURE.md` — system boundaries and data flow
- `docs/ROADMAP.md` — implementation sequence and ship gates
- `docs/SECURITY.md` — data isolation and secret-handling model
- `docs/DEMO_SCRIPT.md` — five-minute product walkthrough
- `docs/LAUNCH_CHECKLIST.md` — closed-beta and production gates
- `docs/PATCH_NOTES.md` — exact initial patch scope, validation, and known gaps

## North-star metric

**Outfits Worn Per Active User**

A recommendation that is viewed but never worn has weak product value. A recommendation seen briefly and worn for the day is a high-quality outcome. Supporting metrics should measure recommendation-to-wear conversion, wardrobe digitization, outfit acceptance, retained users, and wardrobe utilization.
