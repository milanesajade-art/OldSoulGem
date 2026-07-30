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

## Findings and repair status

### AUD-001 — P0 — Live inquiry delivery was not activated
Status: **FIXED AND LIVE-VERIFIED**

FormSubmit required one-time activation before the primary inquiry path could deliver. Activation was completed and a real FormSubmit submission was received by `milanesajade@gmail.com` on July 30, 2026.

### AUD-002 — P1 — Creator preview could silently replace live data in the same browser
Status: **FIXED / TEST PASS**

Normal storefront URLs always use repository production data. Browser-local Creator preview data is read only from an explicit Preview URL.

### AUD-003 — P1 — Inquiry behavior changed silently when preview state existed
Status: **FIXED / TEST PASS**

Preview inquiry interception occurs only on explicit Preview URLs. The normal storefront continues to use live inquiry delivery.

### AUD-004 — P2 — General inquiry defaulted to the first public piece
Status: **FIXED / TEST PASS**

General inquiries require an intentional selection. Direct product inquiries still preselect the exact piece.

### AUD-005 — P1 — Creator validation warnings did not block invalid publishing
Status: **FIXED / TEST PASS**

Creator separates production-blocking errors from draft warnings. Invalid public content disables publishing, and GitHub Actions independently validates the package.

### AUD-006 — P1 — Browser-local Creator workspace could overwrite newer production state
Status: **FIXED / TEST PASS**

Creator fingerprints its production baseline. Stale workspaces are marked `STALE` and cannot publish. GitHub Actions independently recomputes the baseline fingerprint before accepting a publish request.

### AUD-007 — P1 — Homepage signature hero was disconnected from collection state
Status: **FIXED / TEST PASS**

The homepage hero derives from the visible collection. Órbita remains preferred while public and imaged; otherwise the hero uses another visible imaged piece.

### AUD-008 — P1 — Product galleries could become mismatched after changing a primary image
Status: **FIXED / TEST PASS**

A gallery renders only when its configured primary matches the piece's current primary image. Otherwise legacy supporting imagery is suppressed.

### AUD-009 — P1 — Product Availability displayed the price
Status: **FIXED / TEST PASS**

Price and availability now have separate logic. Availability derives from the customer-facing piece status.

### AUD-010 — P1 — Internal `Designer Review` language was customer-facing
Status: **FIXED / TEST PASS**

Customer pages translate `Designer Review` to `Private Preview`; Creator retains the internal workflow status.

### AUD-011 — P1 — Destructive Creator actions had no confirmation
Status: **FIXED / TEST PASS**

Removing a piece, resetting the workspace, and clearing preview inquiries now require explicit confirmation. Creator also preserves at least one piece in the workspace.

### AUD-012 — P1 — Creator image sources could silently conflict
Status: **FIXED / TEST PASS**

Media-library selection and custom image URL are mutually exclusive. Choosing one clears the other.

### AUD-013 — P1 — Hidden unfinished drafts incorrectly blocked publishing
Status: **FIXED / TEST PASS**

Hidden drafts may remain unfinished as warnings. Public pieces must remain production-ready. Browser and GitHub validation policies now match.

### AUD-014 — P2 — Installed Preview navigation could leak out of Preview mode
Status: **FIXED / TEST PASS**

Standalone app navigation preserves Preview mode. Native sharing and installation prompts are suppressed for draft Preview sessions.

### AUD-015 — P2 — Installed apps could retain older shell assets after functional changes
Status: **FIXED / DEPLOYMENT VERIFICATION REQUIRED AFTER MERGE**

Customer script revisions were advanced and the service-worker shell was bumped to `vida-shell-v13`. The app still performs a service-worker update check on launch.

### AUD-016 — P1 — Homepage fallback artwork could identify the wrong piece
Status: **FIXED / TEST PASS**

A failed hero image previously fell back to Órbita artwork regardless of which piece was actually featured. Fallback artwork is now piece-specific; when no valid matching fallback exists, the image is removed rather than visually impersonating another design.

### AUD-017 — P1 — WebKit/Safari could develop whole-page horizontal drift at phone width
Status: **FIXED / CHROMIUM + WEBKIT TEST PASS**

The cross-browser audit caught a repeatable 35px horizontal overflow in WebKit at 390px viewport width. The page shell now constrains whole-page horizontal overflow while keeping intentionally scrollable navigation contained within its own element.

## Automated coverage
- production vs Creator Preview isolation
- preview-only inquiry interception
- intentional general inquiry selection
- exact product inquiry context
- hidden/invalid product handling
- production gallery rendering and mismatch suppression
- homepage featured-piece consistency
- piece-specific hero image fallback
- stale Creator publish blocking
- incomplete public-piece publish blocking
- hidden unfinished draft allowance
- destructive Creator confirmations
- minimum one-piece Creator workspace
- Creator image-source exclusivity
- customer-facing status translation
- price vs availability separation
- primary anchor integrity
- card image/link destination consistency
- live and Preview return navigation
- mobile primary navigation
- phone-width horizontal-overflow checks
- standalone app dock navigation
- Preview-mode app isolation
- offline-state messaging
- native product sharing on live products
- share suppression on draft Preview products
- Chromium and WebKit execution

## Pre-merge result
The complete audit suite passed in both Chromium and WebKit after the final Safari overflow repair. The audit branch is ready for production promotion subject to deployment verification after merge.

## Remaining pass criteria
- merge repaired branch into `main`
- verify GitHub Pages deployment completes
- verify key customer routes from the deployed site
- confirm service-worker/app-shell deployment reflects Functional V2
- freeze `milestone/functional-v2-2026-07-30`

## Audit status
**PRE-MERGE PASS.** P0/P1 logic findings identified in this audit are repaired on the audit branch and the automated cross-browser suite is green. Production verification remains required after merge before the audit is marked complete.
