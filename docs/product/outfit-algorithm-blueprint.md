# Clothes Selector: a research-based outfit algorithm blueprint

**Research cut-off:** September 29, 2026 (Pacific time)  
**Status:** Product and algorithm design; no implementation code  
**Audience:** Product, styling, design, engineering, and evaluation teams

## The promise

> **Clothes Selector finds the strongest wearable options for this person's day from clothes they actually own, explains the tradeoffs, and learns which option they choose.**

An objectively “best outfit possible” is not a claim the evidence can support. Style depends on the wearer, setting, weather exposure, comfort, culture, and intention. A strong algorithm can still be a real selling point: it can reliably honor known requirements, search more combinations than a person will inspect, make sophisticated visual relationships, adapt from actual feedback, and say exactly what it knows. The app should claim *personalized, context-aware recommendations from your own wardrobe*, then earn stronger performance claims through prospective testing. Research on outfit compatibility often evaluates curated outfits and sampled negatives; that does not prove day-to-day usefulness in a sparse, privately photographed closet [R5–R9].

This proposal extends `docs/product/design-philosophy.md` in the supplied archive and the separate `Clothes_Selector_Product_Quality_Review.md` report. The current engine combines a few fixed garment structures and an editorial weighted score. It does not use an AI model or learn from individual wear decisions. The blueprint specifies a new decision system, not a description of current functionality.

## Research: what can responsibly become a rule?

| Evidence | Finding relevant to the algorithm | Boundary |
| --- | --- | --- |
| [R1] Gray et al., 2014, controlled illustrated outfits | Within tested palettes, aggregate ratings peaked at moderate color coordination. | Four constrained palettes and averaged judgments; no universal ban on monochrome or expressive contrast. |
| [R2] Schloss & Palmer, 2011, color-pair experiments | Pair preference, perceived harmony, and figure-ground preference differ. Component color liking and lightness contrast matter. | Colored patches, not garments or a user's closet. Do not collapse liking and harmony into one fixed hue-distance rule. |
| [R3] Hur, Etcoff & Silva, 2023, 500-person survey | Liked-and-owned, liked-but-not-owned, and owned-but-not-liked clothing are distinct conditions. | Survey-derived factors cannot be imposed as identity labels. Ownership alone is weak evidence of preference. |
| [R4] Observational clothing-insulation study, 2013 | Clothing choice, layers, temperature, and perceived comfort relate in people selecting their own clothes. | Context-specific thermal study, not a garment-by-garment predictor; ask about exposure and comfort. |
| [R5] Cucurull et al., CVPR 2019 | Visual compatibility depends on the other items in the outfit; modeling context improved benchmark performance. | Dataset performance does not prove practical weather or dress-code suitability. |
| [R6] Lu et al., CVPR 2021 | Outfit-level personalization can be learned with limited user history using shared anchors. | Research model and benchmark setting; cold-start defaults need explicit user control. |
| [R7] Yang et al., 2020, conditional tuple compatibility | Fine-grained item categories and requested category choices improve controllability compared with broad category matching. | Reported on Polyvore/IQON data; not a validated taxonomy for this app. |
| [R8] Zhai et al., ICCV 2025 | Text-conditioned seed-to-outfit work explicitly predicts composition and retrieves remaining pieces. | Polyvore feature/compatibility evaluation; an LLM is one possible implementation, not a requirement or a proof of personal suitability. |
| [R9] Wang et al., *Textile Research Journal*, 2026 | Separating preference and compatibility as objectives can yield varied Pareto tradeoffs in reported IQON3000 experiments. | Abstract accessible, full article restricted; findings are under its evaluation protocol, not an established best system for this product. |
| [R10] POSM, 2026 | A whole-outfit representation with multiple item modalities improves reported personalized ranking metrics on IQON subsets. | Positives and sampled negatives from fashion platforms; no direct measurement of offline-owned closet utility or weather. |

**Interpretation:** Studies support context-aware, whole-outfit evaluation and personalization. They do not give the app universal fit, masculinity, proportion, formality, or color laws. Climate evidence supports considering clothing and exposure; it does not justify “rain always requires long pants.” These statements are research-informed design inferences, not direct experimental results [R1–R10].

## Recent fashion-house intelligence: encode techniques, not labels

| Primary collection note | Design move | Transferable, testable pattern |
| --- | --- | --- |
| [D1] Prada Spring/Summer 2027 menswear | Familiar jeans, denim jackets, and tees are reconsidered within a controlled linear silhouette; accessories work as part of the whole. | **Precise edit:** offer a spare look with a deliberate silhouette and a few decisive details. Do not reward a Prada label. |
| [D2] LEMAIRE Spring/Summer 2027 | Matte versus sheen, structure versus fluidity, energetic prints anchored by restrained colors. | **Surface conversation:** model contrast and anchoring across actual material, pattern, and color fields; allow print without treating it as noise. |
| [D3] Dries Van Noten men's Spring/Summer 2027 | Julian Klausner's notes emphasize soft, loose, intimate staples and expressive fabric and color choices. | **Relaxed expression:** offer softness/volume and unconventional combinations when the wearer wants that effect. |
| [D4] ZEGNA Summer 2027 | The house describes a fluid leisure wardrobe with stripes as a recurring visual rhythm. | **Soft tailoring:** bridge relaxed and tailored pieces by line and repetition rather than by a rigid matching formality number. |

These are **editorial hypotheses**, not fashion-house endorsements or measured rules. Maintain a versioned library of such styling patterns, tagged with source, season, concrete attributes, and example counterexamples. A stylist can add or retire patterns; none should silently override a wearer's needs. A runway look may be designed for an image or event rather than a rainy commute.

## Decision system: five layers

### 1. Represent the garments and what is known

Each garment needs a structured identity and a provenance record for every field: **confirmed by wearer, inferred from a photo/name, imported, defaulted, or unknown**, with confidence where inference is used. Distinguish *water-resistant*, *waterproof*, and *unknown* instead of one ambiguous boolean. A later correction by the wearer supersedes an inference. Treat photograph-derived colors as estimates because lighting and screens change them.

**Core, obtainable at entry:** precise category and subcategory; layer role (base, mid, tailored outer, weather shell); leg and arm coverage; fit/volume; approximate length; pattern and prominent color(s); perceived dressiness; warmth; weather protection; comfort notes; clean/available status. A shirt can be a base or an open overshirt, and a suit is a jacket–trouser set with linked pieces, not an opaque alternative to a bottom. Shoe properties include exposure, rain protection, and user-reported comfort; do not infer grip or waterproofness from an image. Metadata fields should be optional, quick to confirm, and requested only when they affect today's choice.

**Richer, optional:** hem/rise, drape, texture, pattern scale, sheen, thickness, dry time, packability, heat sensitivity, disliked garment pairings, maintenance restrictions, and visual reference photos on the wearer. Material names can inform questions but must not alone certify breathability, warmth, or wet-weather performance. Never infer body suitability, religious practice, gender expression, or cultural acceptability from a photograph or name.

A missing value propagates as uncertainty. The score cannot silently use `warmth = 5` as a fact and the explanation cannot call an item water resistant unless that detail has been confirmed.

### 2. Capture the day with minimal friction

Separate **where and why** from **how the wearer wants to feel**:

- Conditions: temperature range across the wearing window, current/forecast rain and intensity, wind if known, time outdoors, activity, indoor climate, and likely changes during the day. Weather can be entered manually; location is optional.
- Occasion: workplace/event requirements as *explicit dress rules* (for example, “suit required” or “closed-toe shoes”), rather than inferring them from “work” or “formal.”
- Personal needs: covered legs, sensory comfort, mobility, modesty, no wool, no heels, garment availability, and any other wearer-entered nonnegotiables.
- Direction for this look: quiet, tonal, soft tailoring, layered, vivid, experimental, or a chosen reference; plus a locked piece and pieces to skip today.

Ask at most one or two high-value follow-ups when the answer would materially change the top choices. If rain is expected and the only coat has unknown protection, ask whether it keeps the wearer dry. If hot rain and shorts versus trousers are both viable, ask whether leg coverage matters; do not invent the preference.

### 3. Generate viable complete outfits

Use a **garment grammar**, not a single category Cartesian product. Valid configurations include tee + overshirt + trousers + shoes; shirt + knit + coat; suit jacket + its trousers + shirt + shoes + rain shell; or a simple shirt + shorts + footwear. Accessory roles are independent (belt, bag, scarf, umbrella) where relevant. Each candidate has a layer graph, visible parts, weather-exposed parts, and semantic roles. Check that layers can coexist and that a suit's pieces are not accidentally mixed with a second bottom.

Apply hard requirements *before* aesthetic ranking:

1. All pieces are owned, available, and nonduplicated; locked pieces remain; explicit skips do not reappear.
2. Explicit dress, coverage, accessibility, comfort, and safety-related requirements are satisfied by confirmed facts. Unknown is not treated as satisfied.
3. The structure is wearable and internally consistent (required shoes, top and bottom/one-piece equivalent, valid layers, no impossible overlaps).
4. If nothing qualifies, show which requirement blocks the closet and the nearest alternatives **without presenting them as compliant**. Let the wearer deliberately relax a requirement when appropriate.

Search should preserve qualifying combinations even in a 750-item closet. First filter per role and requirement, then assemble candidates using category-aware retrieval or beam search; keep guaranteed paths for locks and rare qualifying pieces. Avoid fixed-step sampling that can overlook the only dry shoes or coat. Measure candidate recall against exact enumeration on small closets and bound latency on large ones.

### 4. Compare viable looks on several objectives

Keep an **objective vector**, not a magical universal “style percentage”:

- **Context fit:** degree of weather, activity, and occasion suitability beyond the hard requirements, with an uncertainty estimate.
- **Personal fit:** explicit preferences first; learned individual choices second; generalized defaults last.
- **Visual composition:** color relationships, distribution of light and saturation, silhouette line, volume, texture, pattern scale, focal points, and intentional formality bridges across the *whole outfit*.
- **Practicality:** changes of venue, comfort, availability, garment care, footwear, and optional repetition/rotation.
- **Novelty versus familiarity:** the wearer's chosen appetite for experimentation, including an intentionally repeatable uniform.

Remove Pareto-dominated choices where one outfit is worse on all relevant objectives. Then present a small, diverse set of strong options—such as **Best for your day**, **A quieter route**, and **A different silhouette**—with no false precision. A context-specific ranking model can choose the lead option, but explicit requirements stay above all score weights. Similar recommendations should differ in something meaningful, not just a belt or nearly identical shoe.

The initial visual model can be interpretable rules and pair/whole-outfit features; a learned image/set encoder is optional. A model is adopted only if it improves blinded wearer evaluation on the app's own private-closet tasks while preserving constraints, explanations, privacy, latency, and a usable no-service fallback. The latest academic multimodal models are useful candidate generators or compatibility signals, not automatic proof of product superiority [R5–R10].

### 5. Explain and learn

For every displayed look, retain an internal **decision trace**: requirement checks; garment IDs; each factual feature with source/confidence; the relationship that changed ranking; and the most relevant tradeoff. Compose a short explanation *after* all swaps and locks. “Your marked rain shell and boots cover the rainy walk; the navy shirt repeats the shell's blue” is specific and checkable. “Perfect in any weather” is unsupported. For a low-confidence claim, ask or say “I don't know whether these shoes handle rain.”

Feedback should capture *why* a wearer accepted, rejected, swapped, or repeated a look: too warm, wrong coverage, dislikes a garment, wants bolder color, comfort, dress code, or simply not today. A swap is pairwise preference evidence for that context; a skipped item does not necessarily mean a permanent dislike. Start with explicit profile controls and modest local learning. Use a contextual pairwise ranking model with shrinkage toward a transparent baseline when the person has little data; decay or separate context-specific signals. Never interpret ownership alone as approval [R3, R6]. Ask for consent before using private wardrobe interactions for aggregate research; do not transmit images to a paid API by default.

## The hot-rain test, worked through

**Inputs:** 86°F, 70% chance of rain, a 20-minute outdoor walk, casual event. The closet includes light shorts, thin full-length trousers, heavy jeans, a marked rain shell, marked resistant sneakers, and suede loafers. Leg coverage is initially unknown.

1. The system asks once: “Do you want your legs covered for the rain?” if that answer would change the top recommendation.
2. **If yes:** shorts are excluded by the user's stated constraint. Thin trousers beat heavy jeans on heat comfort if other confirmed properties support that judgment. The rain shell and resistant sneakers are favored for the outdoor walk. If trousers' wet-weather behavior is unknown, the app says so rather than declaring the look waterproof.
3. **If no:** offer a shorts version and a thin-trouser version, with distinct reasons. Rain alone does not mandate pants. Suede loafers can appear only as a clearly labeled tradeoff if footwear protection is a preference; they cannot satisfy an explicit dry-feet requirement without confirmation.
4. **If the person stays indoors:** relax the practical weight of rain exposure, not the stated dress/coverage rules.

This is a proposed behavior, not an empirical claim that a particular garment is cooler or dries faster. It addresses the observed failure without encoding an overbroad “rain means pants” rule.

## What “best” means and how to prove it

Define the target as **the outfit a wearer would choose and feel suited to wear for a stated day from their available closet**. Evaluate separately: compliance, usefulness, personal preference, explanation truth, and diversity. A research benchmark AUC is a supporting diagnostic, not the product success metric [R9, R10].

**Before a model launch:** build a consented, de-identified scenario suite with at least 200 contexts spanning heat/rain/cold, formal codes, layered situations, sparse and large closets, uncertain metadata, different style directions, and explicit comfort/cultural requirements. At least 20 cases should challenge the currently known failures. Have independent stylists mark constraints and plausible alternatives; have each wearer give pairwise preferences for outfits from *their own* closet. Measure agreement and record cases with legitimate disagreement. Avoid claiming stylist consensus equals the user's taste.

**Offline gates:** zero known hard-constraint violations in the curated suite; 100% factual traceability of explanation claims; candidate recall for rare valid sets; percentage of contexts with at least one viable look; latency and memory at 10/100/300/750 items. Report results by sparse closets, uncertain data, weather, and user-chosen style rather than hiding poor segments in an average. Thresholds beyond zero constraint violations should be set from a baseline and pilot, not invented as evidence.

**Prospective blind comparison:** randomize which engine's lead look is shown first to consented wearers for the same closet/day. Compare the current engine, a transparent improved rules baseline, and any optional learned model. Primary outcomes: “would wear today” and actual accepted/worn look; secondary: a 1–5 context-fit rating, reason accuracy, time to an acceptable look, number of swaps, and meaningful variety. Analyze by wearer rather than counting many outfits from one person as independent observations; report confidence intervals and reasons for rejection. Preserve a holdout of users and later dates to detect memorization and drift.

**Continuous governance:** version the garment schema, styling patterns, weights, model, and decision traces; test a new collection-inspired pattern against counterexamples before promotion. Audit popularity bias, price/brand leakage, gender/body stereotypes, and whether the system repeatedly ignores certain garments or wearer-defined requirements. A fashion-house update is a candidate inspiration for a test, never an automatic live rule.

## Implementation sequence, without requiring a paid AI API

1. **Trustworthy input and constraints:** provenance, unknown values, precise garment roles and coverage, contextual rain/heat/exposure, explicit dress and comfort requirements. Fix the wear-action and saved-look identity defects from the quality review in the same trust phase.
2. **Complete outfit grammar and guaranteed search:** layers, suit and rain outerwear, bottom coverage, footwear, rare-case recall, duplicate control.
3. **Interpretable multiobjective ranking:** context, wearer, visual relationships, practicality, novelty, Pareto filtering, three distinct recommendations and factual reason traces.
4. **Personal learning:** explicit controls plus pairwise feedback, cold-start defaults, opt-in and context-aware updates. Validate whether the learned ranker improves over rules; retain a local deterministic path.
5. **Optional visual intelligence:** only after photo reliability and consent are solved, test on-device or self-hosted attribute extraction/embeddings against manual labels and wearer preferences. Avoid a runtime dependency on a paid multimodal API for basic outfit selection.
6. **Research release gate:** blinded wearer study, curated edge cases, device latency, explanation audit, and a documented rollback for ranking changes.

A defensible product line after those gates would be: **“An outfit engine that understands your wardrobe, your day, and your choices—then shows why each look works.”** Claims such as “the world's best algorithm,” “scientifically proven perfect outfits,” or “styled by Prada” would require evidence or permissions the research here does not provide.

## Primary research and house sources

**Research**

- **R1.** Gray, K., Schmitt, P., Strohminger, N., & Kassam, K. S. (2014). [The Science of Style: In Fashion, Colors Should Match Only Moderately](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0102772). *PLOS ONE*, 9(7), e102772. Controlled outfit color judgments.
- **R2.** Schloss, K. B., & Palmer, S. E. (2011). [Aesthetic response to color combinations: preference, harmony, and similarity](https://link.springer.com/article/10.3758/s13414-010-0027-0). *Attention, Perception, & Psychophysics*, 73, 551–571. Color-combination experiments.
- **R3.** Hur, Y.-J., Etcoff, N. L., & Silva, E. S. (2023). [Can Fashion Aesthetics be Studied Empirically? The Preference Structure of Everyday Clothing Choices](https://journals.sagepub.com/doi/10.1177/02762374221143727). *Empirical Studies of the Arts*, 41(2). Publisher abstract; full article restricted.
- **R4.** [Clothing insulation and temperature, layer and mass of clothing under comfortable environmental conditions](https://pmc.ncbi.nlm.nih.gov/articles/PMC3707773/) (2013). Original observational study on self-selected clothing and thermal conditions; summary verified from its indexed abstract because the full page did not load. Assess its sample and setting before using numerical thresholds.
- **R5.** Cucurull, G., Taslakian, P., & Vazquez, D. (2019). [Context-Aware Visual Compatibility Prediction](https://openaccess.thecvf.com/content_CVPR_2019/html/Cucurull_Context-Aware_Visual_Compatibility_Prediction_CVPR_2019_paper.html). *CVPR*.
- **R6.** Lu, Z., Hu, Y., Chen, Y., & Zeng, B. (2021). [Personalized Outfit Recommendation With Learnable Anchors](https://openaccess.thecvf.com/content/CVPR2021/html/Lu_Personalized_Outfit_Recommendation_With_Learnable_Anchors_CVPR_2021_paper.html). *CVPR*.
- **R7.** Yang, X., et al. (2020). [Learning Tuple Compatibility for Conditional Outfit Recommendation](https://arxiv.org/abs/2008.08189). Original research preprint; verify final publication status before treating as peer reviewed.
- **R8.** Zhai, Y., et al. (2025). [Text2Outfit: Controllable Outfit Generation with Multimodal Language Models](https://openaccess.thecvf.com/content/ICCV2025/html/Zhai_Text2Outfit_Controllable_Outfit_Generation_with_Multimodal_Language_Models_ICCV_2025_paper.html). *ICCV*.
- **R9.** Wang, J., Lan, C., & Wang, X. (2026). [Balancing preference and compatibility: A multiobjective optimization framework for outfit recommendation](https://journals.sagepub.com/doi/10.1177/00405175261458637). *Textile Research Journal*, online June 18. Publisher abstract; full article restricted.
- **R10.** [POSM: A Personalized Outfit Recommendation System with Style-Guided Multi-Modal Feature Fusion](https://journals.sagepub.com/doi/10.3233/FAIA250922) (2026). Published research article with IQON evaluation; reported results are dataset-specific.

**Fashion-house primary material**

- **D1.** [Prada, Spring/Summer 2027 menswear collection notes](https://www.prada.com/ww/en/pradasphere/fashion-shows/2027/ss-menswear.html).
- **D2.** [LEMAIRE, Spring/Summer 2027 show notes](https://www.lemaire.fr/pages/runway-spring-summer-2027).
- **D3.** [Dries Van Noten, men's Spring/Summer 2027 show notes](https://www.driesvannoten.com/en-je/pages/show-ss-27-men).
- **D4.** [ZEGNA, Summer 2027 fashion show](https://www.zegna.com/jp-en/spring-summer-fashion-show/). Official collection page; search-indexed excerpt verified, full page did not load during this review.
