# Vida Collection — Functional Audit

Date: 2026-07-30
Branch: audit/functional-v2-2026-07-30
Baseline: current main / Visual V1-era production build

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
6. iPhone installed PWA: launch, nav, product, inquiry, share, update, offline
7. Android installed PWA: launch, nav, product, inquiry, share, install/update, offline
8. Creator: edit → preview → clear → publish → verify production
9. Creator/live-state isolation
10. Restore/rollback and cache freshness

## Findings

### AUD-001 — P0 — Live inquiry delivery is not activated
Status: CONFIRMED

The storefront posts live inquiries to FormSubmit, but the mailbox still contains the FormSubmit activation-required message. Until that one-time activation is approved, the primary customer conversion path cannot be considered operational.

Expected: customer submits inquiry and Alé receives it.
Actual: FormSubmit is awaiting activation.
Fix: approve the FormSubmit activation email, then run a real end-to-end test submission and verify receipt/thank-you flow.

### AUD-002 — P1 — Creator preview can silently replace live data in the same browser
Status: CONFIRMED FROM LOGIC

The storefront automatically uses `vida_creator_preview_v2` from localStorage whenever it exists, unless `?baseline=1` is present. A browser used for Creator Studio can therefore show a different collection/site state from a new customer browser without a deliberate mode selection.

Expected: normal storefront URL always means production; preview requires an explicit preview URL/mode.
Actual: preview state can persist and override production on the normal storefront URL.
Fix direction: make preview opt-in via URL/session flag; normal storefront must always be production by default.

### AUD-003 — P1 — Inquiry behavior changes silently when preview state exists
Status: CONFIRMED FROM LOGIC

When Creator preview exists, the inquiry form is intercepted and stored only in localStorage. This is useful for testing, but the normal storefront URL can therefore stop sending live inquiries in a Creator-used browser.

Expected: live URL sends live inquiry; preview URL saves preview inquiry.
Actual: behavior is determined by persistent browser state.
Fix direction: tie local inquiry interception exclusively to explicit Creator Preview mode.

### AUD-004 — P2 — Inquiry interest defaults to the first public piece
Status: CONFIRMED FROM LOGIC

The interest select contains product options but no neutral placeholder. A general visitor can submit without touching the field and unintentionally identify the first product as their interest.

Expected: visitor must deliberately choose a piece, custom piece, or private appointment.
Actual: first public piece is preselected unless a valid `?interest=` parameter is supplied.
Fix direction: add a disabled `Choose an option` placeholder and require selection, while preserving direct-product preselection.

### AUD-005 — P1 — Creator validation warnings do not block publishing
Status: CONFIRMED FROM LOGIC

Creator validates name, materials, story, price and public imagery for the editor UI, but `publishLive()` does not check those validation results before opening the production publish request. The server workflow also only hard-blocks invalid IDs, duplicate IDs, missing names, and malformed packages.

Expected: a piece marked incomplete by Creator cannot be published until critical validation errors are resolved.
Actual: the same piece can still be included in a production publish package.
Fix direction: separate blocking errors from warnings and prevent Publish Live while any blocking error exists; mirror critical validation in the GitHub workflow.

### AUD-006 — P1 — Browser-local Creator workspace can overwrite newer production state
Status: CONFIRMED FROM LOGIC

Creator loads `vida_creator_workspace_v2` from localStorage before the repo defaults and does not reconcile that workspace against a production revision/version. A long-lived or stale browser workspace can therefore publish older collection/site content over newer repo changes.

Expected: Creator identifies whether its workspace is based on the current production revision and warns/reloads before publishing stale data.
Actual: local workspace is treated as authoritative indefinitely until manually reset.
Fix direction: store a production fingerprint/version with the workspace, compare on Creator load and before publish, then require refresh/reconciliation when stale.

### AUD-007 — P1 — Homepage signature hero is disconnected from collection state
Status: CONFIRMED FROM LOGIC

The homepage hero image/caption is hard-coded to Órbita in `index.html`, while collection visibility, name, image and status are managed separately through Creator/collection data. Órbita can therefore be hidden, renamed, or visually changed while the homepage still presents the old Órbita hero as the signature piece.

Expected: the featured homepage piece is either derived from current collection data or explicitly controlled by Creator.
Actual: hero identity is static and can disagree with production collection state.
Fix direction: add a featured-piece setting to site data or derive the hero from a designated public piece, with a safe fallback.

### AUD-008 — P1 — Product galleries are outside Creator control and can become mismatched
Status: CONFIRMED FROM LOGIC

Primary piece imagery is editable in Creator, but supporting gallery images are stored separately in `media-data.js`. Changing a piece's design/primary image does not validate or update its existing gallery, so old detail/profile images can remain attached to a newly changed piece.

Expected: all product imagery for a piece is managed and validated as one unit.
Actual: primary image and supporting gallery have separate sources of truth.
Fix direction: extend the piece schema/Creator workflow to manage gallery media, or disable legacy galleries automatically when a primary/design identity changes until reviewed.

## Pass criteria before Luxury V2 resumes
- 0 open P0 issues
- 0 open P1 issues
- full first-time customer journey passes in a clean browser
- direct product inquiry preserves exact product context
- iPhone and Android installed-app journeys pass
- Creator preview cannot alter normal live storefront behavior
- Creator cannot publish incomplete or stale production data without an explicit reconciliation step
- homepage featured-piece state remains consistent with collection state
- primary imagery and product galleries cannot silently diverge
- publish + cache/update path passes after a production change

## Audit status
Audit in progress. Do not merge visual redesign work into production until P0/P1 items are cleared and the journeys above have been retested.