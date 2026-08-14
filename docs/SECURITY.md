# Security & Privacy Model

## Data classification

Potentially sensitive product data includes:

- wardrobe photographs
- purchase price/history
- wear history
- future location data
- future calendar context
- future body/personal imagery

Treat privacy controls as a product capability rather than a legal footer.

## Client secrets

Allowed in the Expo bundle:

- Supabase Project URL
- Supabase publishable client key

Never bundle:

- Supabase service-role key
- OpenAI API key
- third-party server secret

All server secrets belong in Edge Function/runtime secret storage.

## Database isolation

Every directly user-owned table carries `user_id` and has RLS enabled. Child outfit-item access is authorized through ownership of the parent outfit and referenced garment.

The database migration deliberately does not create broad anonymous read policies.

## Storage isolation

The `garment-images` bucket is private. Paths are user-rooted and policies require:

```text
(storage.foldername(name))[1] = auth.uid()::text
```

The analysis Edge Function creates only short-lived signed URLs under the caller's authenticated Supabase context.

## AI data flow

The mobile app does not call OpenAI directly.

```text
User photo → private Supabase Storage → short-lived signed URL → Edge Function → OpenAI
```

The generated metadata is proposed, not silently accepted. A human confirmation step reduces classification errors becoming durable profile data.

## Required pre-beta security work

- automated RLS isolation tests using two distinct users
- rate limit garment-analysis calls
- reject unsupported image content types and oversized payloads
- strip unnecessary image metadata where practical
- add abuse/cost monitoring
- verify account deletion removes database rows and storage objects
- create privacy policy and user-facing data-retention controls
- define AI/provider data retention settings
- verify logs never include signed image URLs, authorization headers, or secrets
- dependency and secret scanning in CI
