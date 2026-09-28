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
- third-party server secret

No AI service key is needed for garment entry or outfit recommendations.

## Database isolation

Every directly user-owned table carries `user_id` and has RLS enabled. Child outfit-item access is authorized through ownership of the parent outfit and referenced garment.

The database migration deliberately does not create broad anonymous read policies.

## Storage isolation

The `garment-images` bucket is private. Paths are user-rooted and policies require:

```text
(storage.foldername(name))[1] = auth.uid()::text
```

Stored photos are displayed through short-lived signed URLs.

```text
Optional user photo → private Supabase Storage → signed URL for display
```

Garment metadata is entered and reviewed by the user. There is no AI data flow in garment entry.

## Required pre-beta security work

- automated RLS isolation tests using two distinct users
- reject unsupported image content types and oversized payloads
- strip unnecessary image metadata where practical
- add storage abuse/cost monitoring
- verify account deletion removes database rows and storage objects
- create privacy policy and user-facing data-retention controls
- verify logs never include signed image URLs, authorization headers, or secrets
- dependency and secret scanning in CI
