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

## Pass criteria before Luxury V2 resumes
- 0 open P0 issues
- 0 open P1 issues
- full first-time customer journey passes in a clean browser
- direct product inquiry preserves exact product context
- iPhone and Android installed-app journeys pass
- Creator preview cannot alter normal live storefront behavior
- publish + cache/update path passes after a production change

## Audit status
Audit in progress. Do not merge visual redesign work into production until P0/P1 items are cleared and the journeys above have been retested.