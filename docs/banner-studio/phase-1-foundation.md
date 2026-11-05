# Pro Max Banner Studio — local foundation and future integration boundary

Phase 1 is a device-local editor. It extends Instant Banner, not the backend or security model. No project is persistently saved. The existing account-aware departure guard, Auth/App Check integration and release gates remain the authority. No paid provider is called. Legal review files remain outside public/.

## Implemented composition and input contract

`banner-catalog.js` holds 21 extensible business groups with searchable examples, palettes and three composition presets per group (63 options). Spotlight, Editorial and Showcase remain the three preset families. Priority categories now select structural split, copy-first, gallery, menu-band, type-led and service-header profiles through shared photo/text primitives; these are 63 preset options, not 63 separately authored renderers. Existing Center, Split and Card layouts remain selectable. Category/style changes never generate or replace user wording. New product/offer/CTA/badge layers require a Studio preset; classic headline-only exports remain available.

`renderBanner(canvas, brief)` accepts the original fields plus `product`, `offer`, `cta`, `badge`, `preset`, `designStyle` and `serviceVisual`. `photo` remains a memory-only decoded source, with an optional reversible `enhance` flag. Studio presets fit the whole photo inside its frame; the editor now also passes full-photo protection to original layouts, placing images clear of text/card overlays. The low-level original renderer remains backward compatible for callers that do not request protected photo handling. Abstract service illustrations do not depict an actual business, property or product. Every product fact and badge comes from the user's input. The renderer returns dimensions, fitting status and role boxes; exporting text that does not fit is blocked rather than silently approved.

The publishing package is a rule-based arrangement of entered text, price, offer, brand/contact, CTA and product-name hashtags. It does not infer benefits, testimonials, discounts, delivery offers or endorsements. Keyword checks can miss unsafe text and cannot moderate image content or determine legality. They are not a security boundary or comprehensive moderation service.

Photo assessment samples a bounded 128×128 image for resolution, luminance and edge/blur statistics. It cannot recognize a product, read packaging or certify authenticity. Soft photos are accepted with warnings. Brightness/contrast adjustment is opt-in, slight, reversible, and preserves the decoded original. File signature, encoded size and decoded-pixel limits remain enforced, with best-effort header dimension checks before decode. Very large images and peak decode memory still need physical-device testing.

## Future interface specification — not activated

A future provider adapter would accept a versioned request such as:

```
CreativeRequestV1 {
  projectId, revisionId, purpose: background | relight | removeBackground,
  assetRefs: owner-authorized asset IDs, placementConstraints,
  protectedTextLayers: exact user headline/price/brand/offer/CTA,
  output: dimensions and preview/final quality,
  consent: provider/data-use acknowledgement,
  budgetQuoteId, idempotencyKey
}
CreativeResultV1 {
  requestId, providerVersion, derivedAssetRef, sourceAssetRefs,
  actualUsage, quoteId, reviewRequired, status
}
```

These are design interfaces, not endpoints. Never send Auth tokens to an AI provider. Product pixels, logos and deterministic text must remain separately controllable; a background operation must not invent labels or packaging. Provider-specific rights, safety, data reuse/retention, quality, regions and real prices must be reviewed before activation.

Current billable budget is zero and there is no credits or pricing dialog for local rendering. Future billable operations require server-enforced account ownership, per-user/project/provider limits, a durable usage ledger, a validated expiring price quote and explicit generation confirmation. Start with one low-resolution candidate; final generation is separate. Bind confirmations to the exact brief/assets/revision/quote. Prevent duplicate charges with idempotency and reconcile pending/failed requests before retry. Client checks alone cannot enforce quotas or budgets. Cap spend and stop when pricing, ledger state or quota evidence is unavailable. No numeric provider price or refund arrangement is assumed.

Background removal, AI backgrounds/relighting, cloud projects, custom storage, advanced moderation, subscription charging, provider quotas and the ledger need separate backend/security/owner approval. The previously approved Creative Style Library (aesthetic + mood + video genre, beginner recommendations and More Styles) stays on the roadmap. Phase 1 implements six deterministic palette/style choices only; it does not implement AI style generation or video genres.

## Owner-approved visual refinement

Portrait sources adapt to tall split panels or a portrait gallery. Full-photo bounds, uniform scale, selected composition and any narrow-source/copy-space fallback are returned with the render metadata. No pixel is invented, stretched or cropped in the protected editor path. Extremely narrow/panoramic sources may still need a better input or shorter copy; the UI warns rather than filling space with fabricated content. Packaging readability still needs human inspection.

Service illustrations use fixed logical viewboxes and uniform scale, so a tall layout does not stretch the monitor or leaves. The palette and exact text remain controlled by existing inputs.

Inspect / Zoom copies the current render into one temporary canvas, without PNG encoding, download, paid generation or draft storage. Fit, 100% and 200% are CSS-pixel inspection sizes; enlarged display does not create additional source detail. Scrolling stays inside the dialog. Explicit keyboard focus wrapping and the existing overlay-first Back hook are used; no new popstate handler exists. Closing, account changes and history departure release the inspection pixels.

The four-step Brief and notices are shortened. Full usage limitations remain in About this editor; local-only/AI-planned and unsaved-project information stay visible. The result sheet prioritizes Download Banner and Copy Marketing Package. Quotation remains under collapsed Other tools and uses its existing guarded route.
