# Vida Collection — Functional Audit

Date: 2026-07-30
Branch: `audit/functional-v2-2026-07-30`
Baseline: production `main` / Visual V1-era build

## Severity
- P0 — blocks a customer or core workflow
- P1 — works but is confusing or can produce the wrong result
- P2 — friction or resilience issue
- P3 — polish only

## Audit journeys
1. First-time visitor: homepage → collection → product → inquiry → confirmation
2. Direct product link → gallery → inquiry for exact piece → confirmation
3. Multi-piece browsing → return navigation → inquiry
4. Private / Coming Soon / In Development states
5. Hidden, invalid, and missing-image product states
6. iPhone/Safari-equivalent WebKit: nav, product, inquiry, preview isolation, share/update/offline behavior
7. Android/Chrome-equivalent Chromium: nav, product, inquiry, preview isolation, share/update/offline behavior
8. Creator: edit → preview → clear → publish safeguards → verify production package
9. Creator/live-state isolation
10. Restore/rollback and cache freshness

## Findings

### AUD-001 — P0 — Live inquiry delivery was not activated
Status: **FIXED AND LIVE-VERIFIED**

FormSubmit required one-time activation before the primary inquiry path could deliver. Activation was completed and a real FormSubmit submission was received by `milanesajade@gmail.com` on July 30, 2026.

Result: live inquiry delivery is operational.

### AUD-002 — P1 — Creator preview could silently replace live data in the same browser
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST PASS**

Normal storefront URLs now always use repository production data. Browser-local Creator preview data is read only when an explicit `?preview=` URL is opened.

### AUD-003 — P1 — Inquiry behavior changed silently when preview state existed
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST PASS**

Preview inquiry interception now occurs only on explicit Preview URLs. The normal storefront continues to post to the live inquiry service even when Creator preview data exists in localStorage.

### AUD-004 — P2 — General inquiry defaulted to the first public piece
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST PASS**

General inquiries now begin with a required neutral `Choose an option` selection. Direct product inquiries still preselect the exact piece.

### AUD-005 — P1 — Creator validation warnings did not block invalid publishing
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST PASS**

Creator now separates blocking production errors from draft warnings. `Publish Live` is disabled when public content is incomplete, and the GitHub workflow independently enforces critical required fields.

### AUD-006 — P1 — Browser-local Creator workspace could overwrite newer production state
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST PASS**

Creator now fingerprints the production collection/site baseline. A workspace created from an older production state is marked `STALE` and cannot publish until reconciled/reset. GitHub Actions independently recomputes and verifies the same fingerprint before accepting a publish package.

### AUD-007 — P1 — Homepage signature hero was disconnected from collection state
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST PASS**

The homepage hero now derives from the current visible collection. Órbita remains preferred while it is public and has imagery; otherwise the hero safely falls back to another visible imaged piece.

### AUD-008 — P1 — Product galleries could become mismatched after changing a primary image
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST PASS**

A configured gallery now renders only when its first image matches the piece's current primary image. If a design/primary image changes, legacy supporting views are suppressed instead of silently presenting the wrong jewelry.

### AUD-009 — P1 — Product Availability displayed the price
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST ADDED**

The product page previously populated both Price and Availability from `piece.price`. Availability is now derived from customer status while price remains a separate field.

### AUD-010 — P1 — Internal `Designer Review` language was customer-facing
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST ADDED**

Creator can keep internal status language, but customer pages translate `Designer Review` to `Private Preview`. Other customer statuses remain intentionally readable.

### AUD-011 — P1 — Destructive Creator actions had no confirmation
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST ADDED**

Removing a piece and resetting the Creator workspace now require explicit confirmation. Creator also refuses to remove the final remaining piece. Clearing preview inquiries requires confirmation and does not affect live emailed inquiries.

### AUD-012 — P1 — Creator image sources could silently conflict
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST ADDED**

A pasted custom image URL previously had priority over the media-library selector even after a creator chose a library image. The two inputs are now mutually exclusive: choosing one clears the other.

### AUD-013 — P1 — Hidden unfinished drafts incorrectly blocked publishing
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST ADDED**

Hidden drafts may remain incomplete without blocking unrelated valid production changes. Missing hidden-draft fields are warnings. Public pieces still require production-ready content and imagery. Browser policy now matches the GitHub publish workflow.

### AUD-014 — P2 — Installed Preview navigation could leak out of Preview mode
Status: **FIXED ON AUDIT BRANCH / AUTOMATED TEST ADDED**

Standalone app dock links now preserve explicit Preview mode. Native `Share Piece` and installation prompts are suppressed in Preview mode so unreleased draft URLs are not accidentally shared as customer links.

### AUD-015 — P2 — Installed apps could retain older shell assets after functional changes
Status: **FIXED ON AUDIT BRANCH / RETEST PENDING FINAL MERGE**

Customer script versions were bumped and the service-worker shell was advanced to `vida-shell-v13`, forcing the installed app shell to refresh after deployment. Runtime requests remain network-first.

## Current automated coverage
- production vs Creator Preview isolation
- preview-only inquiry interception
- intentional general inquiry selection
- exact product inquiry context
- hidden/invalid product handling
- production gallery rendering and mismatch suppression
- homepage featured-piece consistency
- stale Creator publish blocking
- incomplete public-piece publish blocking
- hidden unfinished draft allowance
- destructive Creator confirmations
- Creator image-source exclusivity
- customer-facing status translation
- price vs availability separation
- mobile primary navigation
- standalone app dock navigation
- Preview-mode app isolation
- offline-state messaging
- native product sharing on live products
- share suppression on draft Preview products
- Chromium and WebKit execution before merge

## Pass criteria before Luxury V2 resumes
- 0 open P0 issues
- 0 open P1 issues
- full first-time customer journey passes
- direct product inquiry preserves exact product context
- Chromium/Android-equivalent journeys pass
- WebKit/iPhone-equivalent journeys pass
- Creator preview cannot alter normal live storefront behavior
- Creator cannot publish incomplete or stale production data
- hidden drafts may remain unfinished without blocking unrelated valid publishes
- homepage featured-piece state remains consistent with collection state
- primary imagery and product galleries cannot silently diverge
- app shell/cache refresh path is versioned for deployment
- repaired branch is merged only after final automated pass
- live deployment is checked after merge

## Audit status
**Audit in progress.** Repairs are isolated from production in draft PR #3. Do not resume Luxury V2 or merge visual redesign work until the audit branch passes Chromium + WebKit and the repaired build is verified after deployment.
