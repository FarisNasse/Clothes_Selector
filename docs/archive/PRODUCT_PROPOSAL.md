# Product proposal (historical concept)

The AI photo-classification concepts below describe an earlier proposal. The current app uses manual garment entry, optional private photos, and deterministic outfit recommendations without an AI API. See `README.md` for current behavior.

# Clothes Selector — Product Proposal

## Executive summary

Clothes Selector is a mobile-first **personal wardrobe intelligence system for men**. Users digitize clothing they already own; the application converts those garments into structured wardrobe objects and then recommends context-appropriate outfits using that actual inventory.

The product is not positioned as an AI fashion chatbot, virtual closet scrapbook, or shopping feed. Its central question is narrower and more valuable:

> Given everything this specific person owns, what is the best thing for him to wear right now?

## Customer problem

Many men own enough clothing but still repeatedly wear a small subset, struggle to coordinate colors and formality, buy redundant pieces, and spend unnecessary time deciding what to wear. Existing products frequently optimize for inspiration, shopping, social content, or manual closet organization rather than daily decision quality.

## Product promise

**Know what to wear.**

The product creates an increasingly accurate digital model of:

- the user's garments
- garment compatibility
- style preferences
- actual wear behavior
- occasion and dress code
- weather and later calendar context

The recommendation system should become more trustworthy over time because it learns from actual decisions rather than relying only on a one-time style quiz.

## MVP loop

1. Photograph a garment.
2. AI proposes category, color, material, fit, formality, seasonality, and style metadata.
3. The user confirms/corrects the result.
4. The garment becomes part of the authoritative wardrobe database.
5. The user selects an occasion.
6. The system generates valid outfit candidates from owned garments.
7. Candidates are scored for color, preference, silhouette, formality, occasion, weather, texture, and wardrobe rotation.
8. The user receives approximately three strong options.
9. Swaps, saves, rejections, and especially actual wear become personalization data.

## Why the recommendation architecture matters

A naive implementation would send a wardrobe summary to a general-purpose model and ask it to “make an outfit.” That is difficult to debug, prone to inventory hallucination, and weak as defensible product logic.

Clothes Selector instead separates concerns:

- **Inventory system** — authoritative garment records
- **Rules engine** — removes impossible/inappropriate combinations
- **Scoring engine** — ranks candidates with explicit, inspectable signals
- **AI perception** — turns photos into proposed structured metadata
- **AI reasoning/explanation** — interprets user intent and explains/reranks candidates
- **Behavioral learning** — adjusts preferences from observed choices

This produces a product whose recommendations can be evaluated and improved systematically.

## Initial patch scope

The first repository patch contains a substantial portion of the production foundation:

### User-facing

- Today dashboard
- occasion selection
- three-option recommendation core
- proposal-quality outfit explanation
- digital wardrobe browser and garment-detail “Style This” flow
- garment capture/import flow
- AI classification confirmation surface
- personal style model visualization
- privacy/account surface

### Engineering

- Expo SDK 57 / React Native 0.86 foundation
- typed routing and strict TypeScript
- Supabase client/session architecture
- production Postgres schema
- RLS policies across user-owned tables
- private image bucket policies
- Edge Function for server-side AI analysis
- strict garment JSON schema
- deterministic recommendation engine
- atomic accepted-outfit / wear-event persistence
- unit tests and CI
- EAS environment/channel structure

## What V1 intentionally excludes

The following features should remain out of the first validation release:

- social network
- ecommerce marketplace
- personal photorealistic avatar
- AR virtual try-on
- automated email receipt parsing
- closet video scanning
- resale marketplace
- stylist marketplace
- complex body measurement capture

These can create impressive demos while avoiding the central product-risk question: **will users digitize a wardrobe and actually wear the outfits the system recommends?**

## Business model hypothesis

A freemium model is appropriate after product validation:

**Free**
- limited wardrobe
- core outfit generation
- manual wear tracking

**Pro**
- unlimited wardrobe
- advanced personalization
- weather and calendar context
- packing optimization
- wardrobe analytics
- style-image recreation
- shopping compatibility analysis

Commerce should remain subordinate to recommendation integrity. The default should be “use what I own,” not “buy something.”

## Defensibility

The long-term asset is not access to a foundation model. It is the private behavioral dataset connecting:

**Person → wardrobe → context → recommendation → actual choice**

At scale, the system can learn both aggregate compatibility patterns and highly individual preferences. Switching costs rise because another product would need to reconstruct the wardrobe and relearn dressing behavior.

## Success metric

### North star: Outfits Worn Per Active User

Supporting measures:

- recommendation-to-wear conversion
- wardrobe digitization percentage
- weekly outfits recorded
- outfit acceptance rate
- 30-day retained users
- unique garments utilized per month
- average wardrobe coverage

## Investment/build thesis

The strongest early product is not the one with the most AI features. It is the one that becomes reliable enough that a user can stand in front of his wardrobe, open the app, and trust the answer to a simple request:

> **Wear this today.**
