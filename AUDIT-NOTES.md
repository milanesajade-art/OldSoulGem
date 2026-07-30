# Vida Functional Audit — Working Notes

This branch is intentionally isolated from production while the customer and Creator workflows are repaired and retested.

Current repair scope:
- live storefront ignores browser-local Creator preview unless an explicit Preview URL is opened
- preview inquiries remain local only in explicit Preview mode
- general inquiries require an intentional interest selection
- direct product inquiries preserve the exact piece context
- static galleries are suppressed when they no longer match the current primary image
- homepage hero follows the current visible collection instead of blindly showing a hidden/stale featured piece
- Creator blocks stale browser workspaces from publishing
- Creator blocks incomplete production data from publishing
- GitHub publish workflow independently verifies the production baseline and critical required fields
- browser smoke tests exercise the above journeys before merge

Production remains unchanged until the audit branch passes and P0/P1 findings are retested.
