# Direct checkout activation

The storefront now supports direct product reservations and is ready to switch each item to Stripe Payment Links without rebuilding the interface.

## Current behavior

- Product cards show **Buy direct** or **Reserve direct**.
- Until a Stripe link is configured, the checkout dialog sends a direct reservation request to `oldsoulgemsand@gmail.com` through the existing FormSubmit workflow.
- Etsy remains visible only as an optional backup.
- Card details are never collected by the GitHub Pages site.

## Activate Stripe payment

1. Create one Stripe Payment Link per fixed-price product.
2. Configure shipping address collection, shipping rates, automatic receipts, and any tax settings in Stripe.
3. Set the post-payment redirect to:
   `https://milanesajade-art.github.io/thevidacollection/checkout-success.html`
4. Open `old-soul.js` and paste each `https://buy.stripe.com/...` URL into the matching `stripePaymentLink` field inside `DIRECT_PRODUCTS`.
5. Test each product in Stripe test mode before switching the links live.

Products with size, stone, color, or variable-price choices should keep the reservation flow until each supported option has a matching Stripe price or Payment Link.
