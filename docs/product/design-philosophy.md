# Clothes_Selector — Design Philosophy

> This research brief predates the changes described in [the implementation status](../operations/implementation-status-2026-09-28.md). Its app snapshot section describes the earlier codebase.

*Research and app snapshot reviewed September 28, 2026. This document describes a product direction; it does not claim every proposed behavior is implemented.*

## North star

**Every look should be a clear answer to a real person's real day, written in the clothes they already own.**

The question behind every suggestion is: **“Why does this outfit make sense for this person, from these garments, on this occasion?”** The answer begins with actual pieces and practical conditions, then explains the relationship among them. A quiet uniform, a deliberately awkward color pairing, and a sharply tailored suit can each succeed for different wearers. Price, label, trend, gender convention, and a prescribed body shape are never substitutes for that answer.

### What informs this view

**Empirical findings.** Controlled judgments of illustrated outfits found a preference peak at moderate color coordination within four tested palettes [R1]. Studies of color pairs separate *harmony* from *liking*: hue similarity can raise perceived harmony, while lightness contrast and liking of the individual colors affect preference [R2]. Studies of color preference and everyday clothing find meaningful associations and individual differences, not a universal wardrobe formula [R3–R6]. None establish an ideal silhouette, a compulsory focal point, or a formula for a particular person's closet.

**Designers' points of view.** Prada's Spring/Summer 2027 menswear centers deliberate choice and a controlled silhouette made from familiar garments [D1]. Zegna's Summer 2026 campaign presents light linen tailoring and softened structure [D2]. Hermès's men's summer 2026 runway language pairs clear contours with air and room to play at the edge of rules [D3]. LEMAIRE's Spring/Summer 2027 notes contrast matte and sheen, structure and fluidity, prints and grounded colors [D4]. Julian Klausner's Dries Van Noten Spring/Summer 2027 menswear description privileges loose, soft, intimate clothing [D5]. These are different creative positions, not evidence that any house endorses Clothes_Selector or that its products are necessary.

**Our proposal.** Treat context and the wearer's judgment as decisive. Use visual relationships as explainable possibilities, not commandments. A garment from a thrift store, a tailor, a family tradition, or a luxury house is evaluated by what it does in this outfit.

## Eight principles

### 1. Answer the day before arranging the look

**In plain language.** An outfit must first work where it is going and in the conditions in which it will be worn. Explicit dress requirements, rain protection, temperature, and the wearer's own mobility or sensory needs matter more than palette neatness. “Formal” as a broad app label is not the same as a confirmed black-tie rule.

**Ordinary example.** For a rainy commute, a navy sweater, dark jeans, waterproof shell, and waterproof boots make sense even if a suede jacket would create a more delicate color relationship.

**Outfit implication.** Filter only against real, known constraints; rank practical suitability before visual refinement. If a requirement is unknown, ask or label the assumption. Never infer an event's dress code from “dinner” or “formal.” *Informed by [D2, D3]; weather suitability is a product judgment, not a result of the color studies.*

### 2. Give the wearer the deciding vote

**In plain language.** The person's stated likes, dislikes, comfort, cultural practice, and preferred expression of masculinity decide whether a technically coherent combination belongs to them. Owning a piece does not prove they like wearing it [R5]. Fit words describe a garment's shape, not which body should wear it. The same person may want a reserved work look and a dramatic evening look.

**Ordinary example.** If someone dislikes beige, a blue Oxford shirt with charcoal trousers is a better proposal than the algorithm's beige chinos, even if the latter score higher on a generic palette rule.

**Outfit implication.** Explicit dislikes and chosen directions should outweigh learned defaults. Offer a user-controlled quiet-to-expressive preference by context; let a wearer lock or swap a piece and keep the resulting look where feasible. Never frame an override as a correction to the wearer. *Informed by [R3–R6, D4, D5].*

### 3. Make a color relationship legible

**In plain language.** Colors can repeat, sit near one another, change in lightness, or contrast. Similar hues often make a calm field; a light shirt against dark trousers supplies definition even when both are neutral. Contrast can give a wearer energy. Harmony and preference are different questions, and “moderate matching” is a useful starting point rather than a law [R1, R2]. A fully tonal look can have interest through lightness or surface; a strong clash can be intentional.

**Ordinary example.** A pale blue shirt, navy chinos, and white sneakers repeat blue while the white shoes lift the darker lower half. A red shirt with green trousers can work for someone who explicitly wants that strong opposition.

**Outfit implication.** Consider named hues, approximate lightness, and where each color appears. Offer tonal, restrained accent, and high-contrast routes. Do not penalize a monochrome look or an expressive contrast merely for departing from the middle. Photo lighting and named-color swatches are estimates, so avoid precise claims about actual fabric color. *Informed by [R1–R4, D4].*

### 4. Shape the whole silhouette

**In plain language.** Read the volume, length, and line of pieces together: a roomy shirt over straight trousers has a different rhythm from a close-fitting top over wide trousers. Neither is intrinsically superior. Proportion is a relationship among garments and the wearer's desired effect, never a rule for “fixing” a body. Layering can repeat a line or interrupt it on purpose.

**Ordinary example.** A relaxed overshirt over a plain tee and straight jeans creates a roomy top with a clear leg line. An oversized hoodie with wide trousers can also be the intended continuous volume.

**Outfit implication.** Current fit labels can support a cautious volume cue; exact hem length, rise, drape, shoulder, and how a piece sits on this wearer require new information. Show alternative silhouettes rather than automatically punishing oversized-with-oversized or slim-with-relaxed pairings. *Informed by [D1, D2, D3, D5]; no cited experiment validates a universal proportion rule.*

### 5. Let texture and pattern earn their place

**In plain language.** Surfaces change what colors and shapes feel like. Denim beside knit, linen beside smooth cotton, or one plaid beside solids can make a simple outfit distinct. Two patterns can also converse if their scale or colors relate. Fabric name alone does not establish weight, sheen, breathability, softness, or weather performance.

**Ordinary example.** A gray wool sweater, dark denim jeans, and smooth black boots vary surface without needing another color. A checked overshirt over a plain tee keeps the check easy to read.

**Outfit implication.** Use recorded material and pattern as tentative signals. Ask for pattern scale, texture, thickness, and comfort only if these claims will affect ranking or wording. Do not treat a second pattern as automatically wrong. *Informed by [D2, D4, D5]; editorial judgment, not an experimentally proven pattern limit.*

### 6. Give the eye a place to begin

**In plain language.** A focal point is a useful editing choice: one graphic tee, vivid scarf, patterned shirt, unusual cut, or contrast in value can hold attention while other pieces support it. “One” is a default for clarity, not a cap on expression. For an exuberant wearer, two active pieces may be the point; for a quiet wearer, the focal point may be a subtle texture or none at all.

**Ordinary example.** A floral camp shirt with dark trousers and simple sneakers lets the shirt lead. A muted gray suit with a patterned tie lets a small detail lead.

**Outfit implication.** Identify an actual, recorded feature before calling it a focal point. Provide a “quieter” or “more expressive” alternative when the closet permits. *Informed by [D1, D4, D5]; proposed editorial principle, not a conclusion of [R1].*

### 7. Bridge the level of dress

**In plain language.** Items need not share one formality score, but they should have a reason to be together. A bridging piece can make a soft jacket and jeans feel deliberate. An explicit formal code can narrow that freedom. Cultural and religious dress practices are context supplied by the wearer, never guessed from their name, location, or appearance.

**Ordinary example.** A navy blazer, light Oxford shirt, dark straight jeans, and loafers move from tailored to casual through the shirt and shoes. For a ceremony requiring a suit, use the confirmed requirement instead of averaging these pieces into “formal enough.”

**Outfit implication.** Rank coherent mixed-register looks, allow deliberate high-low styling when selected, and treat a confirmed code as a constraint. The current broad “formal” category cannot certify specific codes. *Informed by [D1, D3, D4]; proposed styling judgment.*

### 8. Use the wardrobe as a living resource

**In plain language.** Start from pieces the person has saved, including inexpensive, altered, often worn, or underused clothes. Repeat an excellent combination without apology; suggest rediscovery when it genuinely fits the day. Do not equate a new purchase or a runway date with quality. A garment may be unavailable because it is in the wash, damaged, borrowed, or simply unwanted today.

**Ordinary example.** The same white tee and black jeans can reappear with canvas sneakers for errands or a denim jacket and boots for a cool evening.

**Outfit implication.** Keep ownership and availability separate. Wear history can diversify suggestions gently; it never outranks comfort, explicit preference, or the occasion. Offer no-buy explanations and a clear “not available today” control if that data is added. *Informed by [R5, D1]; product principle rather than a studied optimal rotation interval.*

## Decision hierarchy

| Order | The app's question | Decision rule | Example |
| --- | --- | --- | --- |
| 1 — establish facts | Which pieces actually belong to this wardrobe, and which attributes are known rather than defaults or guesses? | Do not recommend a nonexistent piece or assert an unknown property. Ask for a missing detail only if necessary. | “Waterproof” must be recorded or confirmed before claiming rain protection. |
| 2 — honor hard constraints | Did the wearer state a required code, coverage need, comfort boundary, a garment exclusion, or conditions that make a choice unsuitable? | Exclude demonstrably incompatible choices; explain the constraint and offer the closest viable alternative. Do not convert a subjective preference into a universal ban. | A confirmed suit requirement; a wearer marking a fabric intolerable; a heavy coat in extreme heat. |
| 3 — satisfy the person's direction | What do their explicit likes, dislikes, chosen mood, and locked pieces say? | Favor these over generic harmony. Treat “avoid this color” as a strong exclusion when the user means it; let them reverse it for one look. | Their favorite bright shirt remains eligible with quiet trousers. |
| 4 — optimize the composition | Which viable combinations make color/lightness, silhouette, surface, focal point, and formality relationships clear? | Rank and diversify by context. Offer restrained and adventurous options; do not collapse taste to one numerical ideal. | A tonal set and a deliberate contrast can both be candidates. |
| 5 — leave authorship with the person | Do they prefer a tuck, open collar, cuff, multiple patterns, unusual shoes, or a convention-breaking combination? | Explain the tradeoff and preserve the choice. Never say their taste is wrong. | “The sneakers make this suit less formal; keep them if that is the effect you want.” |

**What is a genuine constraint?** An explicit dress code, confirmed rain exposure without suitable protection, known discomfort, and actual unavailability may be genuine. A formality score, an average silhouette preference, or a style-house convention is a heuristic. When a genuine constraint conflicts with a chosen piece, show the conflict and let the person revise the context or choose a different look; a user can knowingly accept a practical tradeoff. The app should never silently relax a stated requirement to produce a higher score.

## Explanation philosophy

An explanation is **one or two useful sentences naming the actual garments and the relationship that makes the recommendation coherent**. Mention the occasion or conditions when they explain the choice. Start with a reason traceable to reliable garment fields or an explicit user choice; omit generic approval words such as “stylish,” “perfect,” and “elevated.” Say “the navy sweater and gray trousers share a quiet palette, while the white sneakers add a lighter finish,” not “the colors are amazing.” If the app knows only names and colors, explain only names and colors. Do not infer that a garment is breathable, flattering, waterproof, culturally appropriate, or comfortable from a photo, brand, or category. If a claim rests on estimated swatches or user entered data, phrase it as an approximate relationship. If no specific relationship can be supported, say what is known and invite the missing input instead of manufacturing a reason.

**Candidate reason contract for implementation:** `garment IDs + verified attribute(s) + relationship + optional context + source/confidence`. The explanation must be generated from the chosen candidate after any lock or swap; no canned line may name a piece that is absent. A score may help sorting but cannot itself justify a sentence.

## The voice in practice

*These are illustrative saved wardrobes and stated contexts, not claims that the attached app can already capture every detail. “Waterproof,” material, color, fit, and pattern are assumed recorded for the specific examples. Where the scenario needs a dress code or desired expression, that is user-provided context.*

| Situation and pieces | Weak explanation | Clothes_Selector explanation |
| --- | --- | --- |
| **Casual errands:** white tee, straight blue jeans, olive overshirt, white canvas sneakers | “A stylish everyday outfit.” | “The white tee and sneakers repeat a light note around the blue jeans; the olive overshirt adds a separate layer for a casual day.” |
| **Work with a smart-casual policy supplied by the wearer:** light-blue Oxford shirt, navy chinos, brown loafers | “Professional and polished.” | “The light-blue Oxford and navy chinos keep the blue family together at different depths, while the brown loafers bring the outfit into your stated smart-casual work setting.” |
| **Formal ceremony with a confirmed suit requirement:** charcoal suit, white dress shirt, black Oxfords | “Perfect for any formal event.” | “The charcoal suit and black Oxfords meet the suit requirement you entered; the white dress shirt gives the dark pieces a clear light contrast.” |
| **Warm weather, 86°F:** cream linen shirt, tan shorts, canvas sneakers | “Summer ready and breathable.” | “The cream linen shirt and tan shorts keep the palette light, and the outfit has no heavy outer layer for the 86°F conditions you set.” |
| **Rainy commute:** navy sweater, dark jeans, waterproof black rain shell, waterproof black boots | “Weatherproof and fashionable.” | “The rain shell and boots are both marked waterproof for your rainy commute; their black color repeats around the navy sweater and dark jeans.” |
| **Expressive dinner, wearer asks for print:** floral camp shirt, charcoal trousers, black loafers | “Statement look with personality.” | “The floral camp shirt is the visible pattern; the charcoal trousers and black loafers leave it room to lead at dinner.” |
| **Tonal day:** charcoal tee, mid-gray chinos, black sneakers | “Monochrome is always sophisticated.” | “The charcoal tee, gray chinos, and black sneakers stay in a dark-to-mid gray range, with the lighter trousers separating top from shoes.” |
| **Intentional contrast, wearer selects bold colors:** red graphic tee, forest-green work pants, black boots | “Bold colors that somehow work.” | “The red tee and green pants make the strong contrast you asked for; the black boots add no third bright color.” |
| **Mixed formality:** navy blazer, white Oxford shirt, dark jeans, brown loafers | “Dressy casual done right.” | “The Oxford shirt and loafers connect the navy blazer to the dark jeans, making the tailored-and-casual mix legible for a relaxed dinner.” |
| **Cold weekend, repeated favorite:** rust knit sweater, black jeans, black boots, wool coat | “A fresh look for winter.” | “The black jeans and boots make a quiet base for the rust sweater; the recorded warm coat adds a layer for the cold conditions you set.” |

## Tradeoffs and exceptions

- **Incomplete wardrobe metadata.** Unknown pattern, material, exact shade, rise, drape, and comfort remain unknown. Offer “I can pair your blue shirt with your dark trousers; add material or fit details for a closer match.” Mark default `regular` fit, `5` warmth/formality, `all-season`, and `waterproof: false` as unconfirmed where they came from form initialization. Absence of a waterproof mark is not proof of non-waterproofness.
- **Few choices.** Present the best viable combination honestly, even if it repeats garments or has a weak palette relationship. If the closet cannot satisfy an explicit dress code or conditions, say so and name the missing category without pretending the user owns it or pushing a purchase.
- **Unconventional combinations.** A full tonal outfit, oversized layers, mixed prints, sneakers with tailoring, or contrasting saturated colors can be a reasoned choice. Ask whether the wearer wants that effect; do not assign a moral or masculine value to restraint or flamboyance.
- **Conflicting signals.** If the wearer loves a suede shoe but has marked rain, tell them the rain concern and offer the recorded waterproof shoe. If the weather is mild and the wearer is mostly indoors, the suede pair may be their choice. If a disliked color is locked, a one-look exception should be explicit rather than treated as a silent change to the saved preference.
- **Culture, body, and comfort.** Do not assume what is modest, masculine, flattering, or acceptable to an employer. Ask the relevant person. A personal practice or sensory boundary can be a hard constraint for that person even when another wearer has no such boundary.
- **Trends and age.** Runway references teach possibilities for silhouette, surface, and styling, not what will remain popular. Keep a look if its internal reason survives after the collection date fades; never boost a garment solely because its label or cut is currently fashionable.
- **Override language.** “Keep the green trousers; this increases the color contrast with your red tee. Try black trousers for a quieter version.” The first option remains valid if the wearer chooses it. Let feedback mean “more like this,” “not for me,” or “skip this piece today,” rather than forcing a binary right/wrong judgment.

## Product translation: current app and proposed decisions

The attached September 28 snapshot is an Expo/React Native app with a rule-based recommender. A saved garment has category, subcategory/name, primary and secondary color names, pattern, materials, fit, 1–10 formality and warmth, waterproof flag, seasons, style tags, image, wear history, and optional AI confidence. Its style profile holds preferred fits, style weights, and disliked colors. The styling view takes one of six broad occasions and manually entered temperature/rain; users can lock and swap garments and save or wear a look. The generator currently combines a top, bottom, shoes, and optionally one outerwear/accessory, or a suit, top, shoes, and optional accessory. It cannot truly evaluate a two-top layer, exact garment dimensions, fabric hand, an event-specific dress code, laundry status, or a full wearer's silhouette.

| Principle | Observable signal available now | Appropriate ranking or explanation use now | Additional input or product change needed | Editorial boundary |
| --- | --- | --- | --- | --- |
| **1. Answer the day** | Occasion; manually set temperature, precipitation/raining; warmth, seasons, waterproof flag | Rank plausible temperature and rain matches; explain weather only when relevant recorded fields support it | Explicit dress code, time outdoors, activity, mobility and comfort boundaries; distinguish unknown from false/default | No invented calendar, location, or waterproof proof |
| **2. Wearer's vote** | Preferred fits, style weights, disliked colors; lock/swap and saved looks | Prioritize explicit selections; respect locks; explain a requested contrast | Per-look mood/intensity, dislike as soft vs never, quick feedback, garment exclusions; improve preference semantics | Do not infer taste from gender, body, culture, or ownership alone |
| **3. Color relationship** | Named primary/secondary colors; approximate catalog swatches | Compare broad hue family and approximate lightness; support tonal or contrast alternatives | Better color confirmation and print color weighting from wearer; account for lighting and unknown custom shades | No “complementary color rule” presented as universal |
| **4. Silhouette** | Coarse fit categories; item category | Use fit as a tentative volume cue, preferably for diversified options | Hem, rise, length, cut, drape, wearer styling preference, optional outfit photo/feedback | No body-shape diagnosis or compulsory wide/narrow formula |
| **5. Texture and pattern** | Free-text pattern and materials | Give grounded reasons such as “plaid shirt against solid trousers,” if recorded | Surface, weight, sheen, pattern scale, touch and heat comfort | Fabric name is not proof of softness or insulation |
| **6. Focal point** | Pattern, color, style tags, named piece | Identify a recorded prominent element; diversify a quiet and active version | User's preferred visual intensity, pattern scale or placement | “One focal point” is guidance, never a hard rule |
| **7. Register** | Garment formality scores, category, occasion | Rank plausible combinations; explain a specific bridge among pieces | Confirmed event code and exclusions; distinguish high-low intent from accidental mismatch | No assertion that broad “formal” satisfies black tie or a cultural ceremony |
| **8. Living wardrobe** | Saved garments, last-worn date, wear count | Use history for gentle variety and name actual repeated/underused pieces | Availability, laundry, condition, lending, seasonal storage, opt-in rotation goal | No need to buy new items; no invented cost or sustainability claim |

**Important gap between direction and implementation.** The current engine weights color harmony at 25% and personal preference at 20%, with weather and occasion at 10% each. It penalizes identical colors, more than two saturated accents, multiple patterns, and some fit pairings; disliked colors are downweighted but not excluded. It treats some formality spreads and formal-outfit requirements as hard filters, plus very warm outerwear at 82°F or above. Its explanation templates can say that footwear adds texture even when no footwear texture is recorded, or that an outfit is weather-ready because *some* garment has a waterproof flag. These are existing heuristics, not empirical laws or the full philosophy above. The first implementation step is to make factual constraints and explicit user choice outrank the visual score, distinguish unknown from confirmed attributes, and generate explanations from a reason trace. Then calibrate aesthetic ranking and its alternatives with diverse wearers' feedback. The collection references should guide editorial review of options, not become brand features in the model.

### Acceptance test for a recommendation

A product designer can identify the wearer/context, the anchor and visual relationship, and the exception if any. An engineer can point to the specific garment IDs, recorded attributes, explicit user inputs, and ranking reason. A user can read the same one- or two-sentence explanation, recognize their own pieces and the day ahead, and change the choice without being told they failed a style rule. If one of these three cannot answer **why this outfit**, the recommendation is unfinished.

## Evidence ledger

The studies below support bounded claims; the fashion houses below are primary creative statements. “Informed principle” refers to the numbered section above, not a claim of endorsement. Dates are first-online publication where verified; where a collection page gives a season but no publication date, that limitation is explicit. Links were checked September 28, 2026.

| ID and source | Date | Relevant finding or design position | Limits of use | Informed principle |
| --- | --- | --- | --- | --- |
| **R1** [Gray, Schmitt, Strohminger & Kassam, *The Science of Style*](https://doi.org/10.1371/journal.pone.0102772), *PLOS ONE* | July 17, 2014 | 239 online participants judged controlled illustrated outfits; within four palettes, moderate coordination received the highest aggregated fashion ratings, including the men's palettes. | Simplified color-controlled images, limited palettes, aggregate judgments; not real closet, weather, culture, or individual fit. | **3** color relationship only; it does not establish principle **6**. |
| **R2** [Schloss & Palmer, *Aesthetic response to color combinations*](https://doi.org/10.3758/s13414-010-0027-0), *Attention, Perception, & Psychophysics* | Online November 10, 2010; February 2011 issue | Pair harmony and pair preference are distinct; hue similarity raised both in their experiments, while individual color liking and lightness contrast mattered more to preference. | Controlled two-color displays, not fabrics, whole outfits, or individual styling goals. | **3** color/lightness; **2** preference distinction. |
| **R3** [Palmer & Schloss, *An ecological valence theory of human color preference*](https://doi.org/10.1073/pnas.0906172107), *PNAS* | May 11, 2010 issue | Their tested ecological account links color preferences to affective responses to associated objects. | Explains patterns of preference for colors in an experimental setting; it cannot predict whether a person wants to wear a particular garment or claim a culture's color meaning. | **2** personal choice; **3** color preference. |
| **R4** [Schloss & Heck, *Seasonal Changes in Color Preferences Are Linked to Variations in Environmental Colors*](https://doi.org/10.1177/2041669517742177), *i-Perception* | December 4, 2017 | Repeated ratings over nine sessions in 11 autumn weeks: preferences for leaf colors changed with the season, with variation related to participants' liking of fall-associated things. | Analysis included 22 participants near one US university; colored patches and autumn context, not clothing advice or automatic seasonal palettes. | **2** changing preference; **3** color as context sensitive. |
| **R5** [Hur, Etcoff & Silva, *Can Fashion Aesthetics be Studied Empirically?*](https://doi.org/10.1177/02762374221143727), *Empirical Studies of the Arts* | Online December 6, 2022; July 2023 issue | Survey of 500 people yielded four everyday clothing preference factors; liked-and-owned, liked-but-not-owned, and owned-but-not-liked were distinct judgment conditions. | Survey factors describe this sample, not a fixed taxonomy for all gender expressions or a causal outfit predictor; full article access is restricted, so claims here rely on the publisher's abstract. | **2** preference; **8** ownership versus liking. |
| **R6** [Stolovy, *Styling the Self*](https://doi.org/10.3389/fpsyg.2021.719318), *Frontiers in Psychology* | September 8, 2021; [abstract-language corrigendum](https://doi.org/10.3389/fpsyg.2021.789720) November 2, 2021 | In 792 Israeli women, clothing style and reported functions such as comfort and individuality varied together. | Correlational, one-country sample of women; cannot dictate choices for men, other cultures, or any individual body. | **2** comfort and expression; **4** reject body-shape prescription. |
| **D1** [Prada, Spring/Summer 2027 menswear](https://www.prada.com/ww/en/pradasphere/fashion-shows/2027/ss-menswear.html) | [Official show index](https://www.prada.com/ww/en/pradasphere/fashion-shows.html) dates it June 2026 | Miuccia Prada and Raf Simons frame choice and distillation through a controlled linear silhouette and reworked jeans, denim jackets, tees, and integrated accessories. | House-authored collection position, not empirical evidence or a required aesthetic. | **4** silhouette; **6** editing; **7** familiar pieces in new registers; **8** reuse. |
| **D2** [Zegna, *Summer on Lake Maggiore*](https://www.zegna.com/us-en/italian-summer-lake-maggiore/) | Summer 2026 campaign; page does not state publication day | Linen tailoring, earthy brown and raw off-white, softly structured sweaters, summer context. | Campaign merchandising and environment; not evidence that linen always feels cool or that luxury equals quality. | **1** context; **4** soft tailoring; **5** material. |
| **D3** [Hermès, men's summer 2026 runway statement](https://www.hermes.com/au/en/content/340122-men-spring-summer-2026-runway-show/) and [Spring/Summer 2026 product collection](https://www.hermes.com/us/en/category/men/ready-wear/spring-summer-collection/) | Runway shown in June 2025 per [Hermès first-half 2025 report](https://assets-finance.hermes.com/s3fs-public/node/pdf_file/2025-07/1753810528/hermes_20250730_pr_firsthalfresults_va.pdf); collection page undated | Runway text stresses straight lines, contours, air between lines, and room to play at rules' edge; current product page shows varied cuts and garment types. | Poetic show text and changing catalog, not a measurable guarantee of comfort or a universal dress rule. | **1** conditions; **4** line and air; **7** convention with choice. |
| **D4** [LEMAIRE, Spring/Summer 2027 show and lookbook](https://www.lemaire.fr/pages/runway-spring-summer-2027) | Spring/Summer 2027 collection; page gives no publication day | Menswear puts tropical prints against smoky browns/chalk/blues; matte versus sheen and structure versus fluidity; nylon, cotton voile and mesh are described as lightness cues. | House's authored description and runway pieces, not measured material performance or an endorsement. | **2** individuality; **3** grounded contrast; **5** surface; **6** focal choices; **7** mixed register. |
| **D5** [Dries Van Noten, Spring/Summer 2027 men's show](https://www.driesvannoten.com/pages/show-ss-27-men) | Spring/Summer 2027 collection; show page gives no publication day | Julian Klausner's show statement emphasizes sensuality, soft intimate staples, and loose, delicate forms; runway images include expressive prints and relaxed layers. | Designer intention and styled runway images; not an empirical rule, wearer comfort guarantee, or endorsement. | **2** expression; **4** volume; **5** surfaces; **6** visual intensity. |
