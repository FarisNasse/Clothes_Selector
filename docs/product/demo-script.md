# Product walkthrough

This walkthrough uses demo mode and is designed to show the current app in about five minutes. Demo garment changes are temporary for the running session. Avoid presenting them as cloud-saved data.

## 0:00 — Today

Open **Today** and describe the product question: what can I wear from the wardrobe I already own? Show the occasion/context controls and current outfit recommendation.

## 0:45 — Explore a recommendation

Review the pieces in the outfit. Explain that candidates are assembled from the available wardrobe and ranked by deterministic local rules. Use the another-look or garment-lock interactions if available in the current build, and show how the outfit can be adjusted.

## 1:45 — Wardrobe

Open **Wardrobe**. Search or filter the sample garments, then open an item to show its structured details. The wardrobe is the source of truth for recommendation candidates.

## 2:30 — Add a garment

Open the add flow and enter details manually. A photo is optional. In demo mode the entry is session-only; in connected mode a selected photo is uploaded to private Supabase Storage. Show the option to retry a photo or save the details without one if the current build presents that state.

## 3:30 — Style and personalization

Open **Style** and show editable preferences and wardrobe-derived summaries. Explain that recommendations use those preferences and user-selected occasion/weather context. The app does not fetch live weather or use an AI API.

## 4:20 — You, saved looks, and privacy

Open **You**. Show saved looks, preferences, and appearance controls. Demo collections are device-local; connected collections sync with the account. In connected mode, garment images use a private bucket and database rows are protected by user-scoped policies.

## Closing

Describe the product thesis as a hypothesis: make it easier to wear more of what the user already owns. Do not claim analytics, live weather, AI analysis, or production launch readiness; these are not configured current capabilities.
