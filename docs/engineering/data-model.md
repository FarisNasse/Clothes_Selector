# Data model and migrations

## Schema ownership

The canonical database schema is the ordered SQL migration history in `supabase/migrations`. Do not edit an already-applied migration to change an existing environment. Add a new numbered migration, review its rollback and access implications, and test it against a local or staging database before applying it elsewhere.

## Main entities

| Entity | Purpose | Ownership / relationships |
| --- | --- | --- |
| `profiles` | User-facing account metadata | Primary key references `auth.users.id` |
| `style_profiles` | Style preference data | One row per authenticated user |
| `garments` | Structured user wardrobe items and optional Storage path | Each row has `user_id`; category and scoring fields are constrained |
| `outfits` | Persisted outfit record | Each row has `user_id` |
| `outfit_items` | Garments assigned to a persisted outfit | References outfit and garment; policies verify ownership |
| `recommendation_sessions` | Context and candidate-count record | User-scoped; current generation flow does not persist sessions |
| `recommendation_feedback` | User signals associated with recommendations/outfits | User-scoped; current app records the wear signal through the RPC |
| `wear_events` | History of outfits recorded as worn | User-scoped; written by the wear RPC in connected mode |

New Auth users receive a profile and style-profile row through the `handle_new_user` database trigger.

## Current migrations

1. `0001_initial_schema.sql` creates product tables, update triggers, initial-user provisioning, indexes, RLS, and ownership policies.
2. `0002_private_garment_storage.sql` creates/configures the private `garment-images` bucket and user-folder policies. Allowed image MIME types are JPEG, PNG, and WebP; the configured limit is 12 MiB.
3. `0003_record_wear_transaction.sql` adds the authenticated `record_outfit_wear` function and its atomic write path.

## Local workflow

Install and run the Supabase CLI using its official installation method, then from the repository root:

```bash
supabase start
supabase db reset
```

`db reset` recreates the local database and applies migrations. It is destructive to local Supabase data; use it only when that reset is intended. For a hosted project, link the intended project and review the CLI's pending migration plan before applying migrations. Never paste service-role credentials into source, docs, or client environment variables.

When changing a schema, update this page if entity ownership, behavior, or migration workflow changes. Add tests for security-sensitive invariants, especially user ownership and references between outfits and garments.
