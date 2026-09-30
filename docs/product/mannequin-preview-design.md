# Outfit mannequin preview: code review and implementation design

**Project reviewed:** `Clothes_Selector-asdas` (Expo / React Native app)  
**Review date:** 30 September 2026  
**Status:** design proposal; no application code changed

## Recommendation

Add an **On mannequin** view beside the existing flat lay. The first production version should render a front-facing, illustrated mannequin with garment-specific silhouettes, colors, simple patterns, deliberate overlap, and visible footwear and accessories. It should use the same recommended garments and swap/lock actions as the current view. Label it **“Illustrative preview · fit and drape may differ.”**

This directly addresses the difficulty of seeing an outfit as a whole. It is feasible with the app's current cross-platform SVG dependency and does not require users to provide a body photo. A later photo-based mode can incorporate isolated garment imagery after the capture and asset pipeline is upgraded. A generated photorealistic picture is an optional experiment, subject to fidelity checks; it should never be presented as a fit prediction.

## What the current code does

| Area | Current behavior | Consequence for mannequin view |
|---|---|---|
| `src/components/outfit/RecommendationHero.tsx` | Displays `OutfitFlatLay` inside a horizontal swipe gesture; the hero also supports garment presses and saving. | Put a view selector and shared preview host here. Keep swiping and the rest of the controls attached to the same recommendation. |
| `src/components/outfit/OutfitFlatLay.tsx` | Positions each `OutfitPiece` absolutely in a fixed 0.8 aspect-ratio canvas and animates entry, exit, and layout. | This is a flat lay composition, not a dressed body. Retain it as a useful alternate view. |
| `src/components/outfit/composition.ts` | Uses one position, size, rotation, and z-index per broad category. | These placements cannot represent body anchors, sleeve/hem length, shoe pairing, or front/back occlusion. Build a separate mannequin layout model; do not stretch this table into one. |
| `src/components/outfit/OutfitPiece.tsx`, `src/components/garment/GarmentImage.tsx` | Each piece shows a photo through `expo-image`, or a category illustration when absent/failed. Photos are contained in their own tile; backgrounds are not removed. | A rectangular item photo pasted on a body would look false. Mannequin rendering needs a shaped asset or a drawn silhouette. |
| `src/components/garment/GarmentIllustration.tsx` | SVG fallback draws broad category shapes. Every bottom is drawn as full-length trousers, even a short; every accessory is drawn as a watch; suits use a jacket-like shape. | These are concrete misleading-preview bugs to correct or bypass with a richer subcategory-to-silhouette map. The mannequin must never silently turn shorts into trousers or a bag into a watch. |
| `src/types/domain.ts` | A garment has category, free-text subcategory, colors, pattern, materials, fit, image URL and storage path. | It lacks a validated visual type, hem/sleeve lengths, dressing position, transparent asset/mask, anchors, photo angle, and body/garment measurements. Existing `fit` is a style label, not physical fit data. |
| `src/features/recommendations/engine.ts` | Candidate structures are optional outerwear + top + bottom + shoes + optional accessory, or suit + top + shoes + optional accessory. Evaluation rejects suit with bottom/outerwear. | Model these exact supported structures initially. A `suit` is one recommendation item that may visually include jacket and trousers; clarify its semantics before drawing it. Multiple accessories and more elaborate layering require an outfit-model change. |
| `src/features/wardrobe/photo.ts`, `normalizeWebPhoto.ts` | Accepts one image and normalizes/re-encodes it for upload. No isolation, mask, canonical front view, or pose extraction. Demo uploads do not persist. | Illustrations must work without photos. A photo dressing mode requires a separate preparation pipeline and a demo-safe fallback. |
| `src/features/wardrobe/repository.ts` | Reads private garment images via signed URLs with a one-hour TTL and a 50-minute in-memory cache. | Store durable asset paths and versions, then resolve access at render time. Do not key previews or persisted metadata by expiring signed URLs. |
| `package.json`, `app.config.ts` | Expo app for iOS, Android, and web, with `react-native-svg`, `expo-image`, and Reanimated; no 3D or cloth simulation engine. | Start with 2D SVG for cross-platform consistency. 3D is a separate feasibility and content-production project. |

The mannequin is a **presentation layer** over the same `OutfitRecommendation`. It must not change the recommendation score or claim to solve the recommendation engine's weather and category-selection issues. If an outfit is wrong, rendering it beautifully does not make it correct.

## Product contract

1. The user can switch **Flat lay / On mannequin** on the recommendation hero. Remember the choice locally, with Flat lay available at any time.
2. The mannequin depicts every garment in the current recommendation in a stable front pose. Selecting a garment from a labeled piece list invokes the existing swap/lock action; the wearer can still swipe to another outfit.
3. Color and broad silhouette should correspond to recorded garment attributes. Unknown or unsupported detail gets a clearly generic shape and the original item photo/name nearby; it must not be invented as a specific feature.
4. The mode is an **illustration of styling and layering**, not a measurement of size, tightness, drape, exact texture, or waterproofness. The disclosure belongs next to the preview, including any share/export surface.
5. No body photo is needed. Offer neutral mannequin options that the user explicitly selects; never infer body type, gender, skin tone, or measurements from the wardrobe.
6. The UI remains usable with no item photos, photo load failure, demo inventory, low memory, reduced motion, screen reader, small phone, tablet, and web.

## Rendering choices

| Approach | What it actually shows | Inputs and build effort | Decision |
|---|---|---|---|
| **Template-based 2D mannequin** | Consistent outfit silhouette, main colors, approximate hem/neck/sleeve shapes and layering. | Controlled garment taxonomy and SVG assets. Works offline with the current package stack. | **Build first.** Most dependable way to make the full outfit legible now. |
| **2D garment cutouts on mannequin** | More of each real item's color, print, and surface detail. | Isolated front-view photos, alpha masks, landmarks, quality review, image warping, occlusion handling, private derived assets. | Pilot after a representative capture dataset exists. Never equate a warped cutout with true drape. |
| **Generative full-outfit image** | Potentially realistic overall image. | External or hosted image model, prompts/conditioning, inference time and cost, consent and retention controls, item-level fidelity gate. | Research spike only; offer as an explicitly generated concept if it passes evaluation. |
| **3D garment simulation** | Could support multiple viewpoints and physical behavior if measurements, patterns, material properties and body geometry are available. | New rendering runtime and substantial asset creation/data collection. One ordinary closet photo is insufficient input. | Out of initial scope; reconsider only for a separately justified fit product. |

The research supports careful positioning. [M&M VTO (CVPR 2024)](https://openaccess.thecvf.com/content/CVPR2024/html/Zhu_MM_VTO_Multi-Garment_Virtual_Try-On_and_Editing_CVPR_2024_paper.html) and [AnyDressing (CVPR 2025)](https://openaccess.thecvf.com/content/CVPR2025/html/Li_AnyDressing_Customizable_Multi-Garment_Virtual_Dressing_via_Latent_Diffusion_Models_CVPR_2025_paper.html) demonstrate multi-garment image generation. The [Garments2Look study (2026 preprint)](https://arxiv.org/abs/2603.14153) tests more varied full outfits and reports remaining errors in layering, garment detail and accessories as more references are supplied. These are research results, not evidence that this app can reliably show the exact wardrobe item on a specific body. A deliberately illustrative renderer is the safer initial product promise.

## Proposed component and data boundaries

**UI boundary.** `RecommendationHero` owns the mode selector and renders either the existing `OutfitFlatLay` or a new `OutfitMannequin` inside the current gesture region. Both receive `recommendation.garments`, lock state, and `onGarmentPress`. The list of selectable pieces below or beside the canvas provides a reliable hit target when visual layers overlap. A view change should not regenerate or save a different outfit.

**Presentation model.** Before drawing, convert each garment into a validated `VisualPiece`: garment ID, render slot, silhouette ID, displayed color(s), pattern treatment, layer order, coverage, and confidence/reason for fallback. Derive it deterministically from confirmed category/subcategory and future structured fields. Keep the mapping versioned; do not parse arbitrary names as the sole source of truth. Unknown types remain visible in a named companion item/card, with a generic on-body marker only if its wearing location is known.

**Rig and scene.** Define a normalized front-view body coordinate system with head/neck, shoulders, wrists, waist, hips, knees, ankles and feet. Garment templates attach to these anchors. A typical draw order is body rear sections → trousers/skirt or suit lower portion → inner top → outerwear/suit jacket → body foreground (hands, where needed) → shoes → accessories. Occlusion rules should be slot-specific: a jacket may cover the top torso but leave collar and hem visible; a bag may cross the torso; a watch belongs at the wrist. Masks and clipping are useful inside SVG. Keep the wearer pose stable between outfits so differences are attributable to the outfit rather than the pose.

**Subtype map.** Start with a small, well-reviewed set matching the actual wardrobe catalog: T-shirt, shirt, sweater, jacket/coat, jeans/trousers, shorts, skirt if present, sneaker/shoe/boot, suit, and supported accessories. Validate catalog values against the map. Record sleeve length, hem length, open/closed outerwear, rise, and shoe profile where known. A suit must explicitly specify whether the one item represents a two-piece ensemble; otherwise show the jacket with an honest note about the unspecified lower half. A single accessory slot cannot represent multiple objects until the outfit structure changes.

**Asset model for later photo mode.** Preserve the current private original or normalized image path; add separate versioned derived asset records for isolated transparent garment image/mask, capture view (front/side/back), landmarks, segmentation confidence, review status, and renderer provenance. An asset is eligible for on-body use only when its orientation, boundaries, and class pass a quality gate. If it fails, use the illustration. Signed URLs are temporary access credentials; the persistent identity is the private storage path plus asset version. Deleting a garment should remove its derived assets and invalidate local/remote previews.

**Preview caching.** Illustration may render directly; cache only if performance warrants it. For future generated/cutout results, key by sorted garment IDs **and asset versions**, silhouette/pose, view, layer rules, and renderer version. A swap, edit, deletion, or mannequin setting change invalidates the relevant key. Never retain another user's private image or a signed URL in a shared cache.

## Delivery sequence

### Phase 0 — resolve the picture's meaning

- Inventory the real subcategories and demo garments; decide what a suit and each accessory represent.
- Add a reviewed subtype-to-shape coverage table and fallback policy. Fix the known shorts-as-trousers and accessory-as-watch behavior in the new preview design; separately align the existing fallback illustrations when implementation starts.
- Produce representative static design comps for a hot/rain look, a suit look, shorts, outerwear, and at least three accessory placements. Review whether users can recognize all included pieces.

**Exit:** no catalog item silently displays as a contradictory garment type; unsupported items have explicit presentation.

### Phase 1 — shippable illustrated view

- Build front-view mannequin templates and a versioned visual mapping; add a Flat lay / On mannequin selector in the hero.
- Preserve existing swipe, lock, swap, save, recommendation count, and outfit reasoning. Put selectable item labels outside the artwork as well as visually indicating the selected layer.
- Add the illustrative-preview disclosure, reduced-motion behavior, accessible labels/order, and fallback after a render error.
- Keep all processing local to this render path and support image-free demo mode.

**Exit:** the same outfit IDs and garments appear in both modes; all supported items occupy sensible body locations without disappearing under a layer; iOS, Android, and web show the same essential composition.

### Phase 2 — garment photo fidelity pilot

- Guide capture of one front-facing garment on a plain contrasting background; retain a reshoot route. Prepare a private transparent image and mask asynchronously and allow review/correction.
- Pilot only a narrow class set, such as tops and outerwear, where anchors and cutouts can be judged. Keep exact product photos in an adjacent strip for comparison.
- Measure whether the cutout actually helps recognition versus the illustration. Disable photo projection for low confidence, patterned boundaries, severe perspective, folded clothing, or inconsistent sizing.

**Exit:** a blinded reviewer can match the rendered item to its source photo at a predefined acceptable rate, and bad projections reliably fall back. Set the numerical threshold using a pilot before launch rather than inventing one now.

### Phase 3 — optional generated concepts

- Evaluate multi-garment models on the app's real categories and photos, including suits, shoes, bags, long outerwear, and patterned garments. Review every item separately for omissions, changes in cut/details, layering errors, and misleading body/fit cues.
- Define explicit opt-in, image handling and deletion rules, latency/cost budget, and a visible “Generated concept” label. Preserve the deterministic illustrated view as the default/recovery path.

**Exit:** ship only if item-level fidelity, privacy, latency, and operating cost meet recorded product targets. Attractive images alone are not an acceptance criterion.

## Verification matrix

| Case | Expected preview behavior |
|---|---|
| Hot day with rain: shorts/trousers, top, shoes, optional shell | Show the recommendation exactly as selected, including the lower garment. If selection is unsuitable, fix the recommendation logic separately. |
| Shorts, skirt, wide trousers, long coat | Each has distinguishable coverage and hem; no trousers substituted for shorts. |
| Suit + top + shoes | Jacket and specified suit lower half are coherent; ambiguity in the current single `suit` item is resolved before drawing. |
| Top partly hidden by open/closed outerwear | Correct occlusion; inner collar or hem visible only where plausible; piece still accessible by name. |
| Watch, hat, bag, scarf or unsupported accessory | Correct location when supported; honest named fallback otherwise. No universal watch icon. |
| Missing photo, failed image request, demo mode | Full illustrated outfit remains visible with item labels. |
| Swap/lock, previous/next, saved look reopen | Same garment IDs and state across modes, no stale preview or incorrect highlight. |
| Small phone, tablet, web, screen reader, reduced motion | Readable view toggle and piece list; no need to tap tiny overlapping shapes; no essential information conveyed by motion or color alone. |
| Different mannequin settings | Garments remain identifiable; no unconsented inference about the user. |
| Deleted/edited garment or expired signed URL | Correct invalidation or refreshed access; never show a stale or another user's private image. |

For human evaluation, ask users to identify the pieces and order of layers from the mannequin alone, then compare against the flat lay. Record recognition errors, omissions, trust in the “illustrative” label, preference, and task completion time. For any photo/generated mode, compare the original item against the preview at the **item level**, especially length, closures, logo/print, color, shoes, and accessory geometry. The Garments2Look paper's outfit-level evaluation likewise checks garment consistency, layering, and styling separately.

## Decisions to make before implementation

1. **Suit semantics:** one jacket, jacket-and-trousers set, or a full outfit? This determines whether a lower garment is missing from the visual and whether the recommendation model needs a change.
2. **Accessory scope:** which subtypes exist in this wardrobe and where can each be worn? The current engine permits one accessory.
3. **Mannequin customization:** fixed neutral form at launch, or a small user-selected set of shapes and tones? Avoid language implying size accuracy.
4. **Photo fidelity ambition:** whether the goal is better styling comprehension or representation of exact prints and details. The latter requires asset capture and QA investment.
5. **Success bar:** choose a representative catalog test set and user recognition criteria before approving the photo pilot.

**Proposed first build:** Phase 0 plus Phase 1. This delivers an actual dressed-outfit view with dependable coverage and leaves a measured path toward higher fidelity.

## Sources

- Code reviewed: `src/components/outfit/{RecommendationHero,OutfitFlatLay,OutfitPiece,composition}.tsx` (composition is `.ts`), `src/components/garment/{GarmentImage,GarmentIllustration}.tsx`, `src/types/domain.ts`, `src/features/recommendations/engine.ts`, `src/features/wardrobe/{photo,normalizeWebPhoto,repository}.ts`, `package.json`, and `app.config.ts` in the supplied project archive.
- [Expo documentation: SVG in React Native](https://docs.expo.dev/versions/latest/sdk/svg/) — platform drawing capability; the app already declares `react-native-svg`.
- [Zhu et al., M&M VTO, CVPR 2024](https://openaccess.thecvf.com/content/CVPR2024/html/Zhu_MM_VTO_Multi-Garment_Virtual_Try-On_and_Editing_CVPR_2024_paper.html).
- [Li et al., AnyDressing, CVPR 2025](https://openaccess.thecvf.com/content/CVPR2025/html/Li_AnyDressing_Customizable_Multi-Garment_Virtual_Dressing_via_Latent_Diffusion_Models_CVPR_2025_paper.html).
- [Hu et al., Garments2Look, March 2026 preprint](https://arxiv.org/abs/2603.14153) — outfit-level dataset and observed limitations; preprint findings should be treated as provisional.
