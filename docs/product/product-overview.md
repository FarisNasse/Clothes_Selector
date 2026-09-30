# Product overview

## Purpose

Clothes Selector helps a user organize clothing they already own and decide what to wear. The core loop is:

1. Add garment details, optionally with a photo.
2. Browse and correct the wardrobe.
3. Choose an occasion and context.
4. Review locally generated outfits built from the available wardrobe.
5. Adjust or lock pieces, then optionally record an outfit as worn.

## Current product behavior

- Garment details are entered by the user; photos are optional.
- Outfit generation uses deterministic client-side rules and scoring.
- Connected mode persists garments and photos through Supabase.
- Demo mode uses sample data and session-only garment changes.
- Signed-in saved looks and favorites sync through account-scoped tables; demo collections remain on the device. Older device-only collections can be imported in Settings.
- Style intensity, skipped garments for this look, and an optional confirmed rain requirement give the wearer more control. Explanations cite recorded pieces and attributes.
- Weather/context inputs are user-selected; the app does not fetch live weather or location.
- No AI API, commerce feed, social network, calendar integration, or recommendation analytics is required by the current experience.

## Product principles

- Recommendations must be assembled from known wardrobe items.
- The user controls garment metadata and can correct it.
- Show clear recoverable states when photos or persistence fail.
- Keep demo-mode behavior explicit so temporary data is not confused with cloud persistence.
- Treat private wardrobe data as a product responsibility, not merely a technical implementation detail.

## Measurement hypothesis

The product hypothesis is that a useful recommendation becomes valuable when a user wears it. A future north-star candidate is outfits recorded as worn per active user. No analytics pipeline is currently configured, so this is a proposed measurement—not a live metric.

## Out of scope for the current build

Automated photo classification, AI-generated advice, live weather, shopping recommendations, and social features are not current capabilities. Historical concept material is retained in [the archive](../archive/README.md).
