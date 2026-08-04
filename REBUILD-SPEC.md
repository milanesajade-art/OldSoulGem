# Old Soul Gem Storefront Rebuild

## Goal

Rebuild the jewelry website from a clean storefront baseline under the public brand **Old Soul Gem**, while preserving the luxury editorial direction of the approved model. The existing `main` branch remains untouched as a backup.

## Brand Direction

- Public brand name: Old Soul Gem
- Handmade, vintage, crystal-led jewelry and meaningful objects
- Editorial presentation with an earthy, artistic, spiritual character
- Cream, warm beige, charcoal, deep muted green, mineral tones, and restrained gold accents
- Elegant serif display typography with clean sans-serif body typography
- Warm, high-end product photography that still feels handmade and personal
- Storytelling around energy, intention, self-connection, vintage finds, and giving meaningful materials new life
- Mobile-first presentation

## Public Storefront

- Home page with editorial hero
- Shop grid with filters for Rings, Necklaces, Pendants, Earrings, Bracelets, Suncatchers, and Sacred Space
- Individual product pages with image galleries
- Product details, materials, care, shipping, variants, pricing, and availability
- Add-to-cart flow for purchasable products
- Inquiry flow for one-of-one, custom, vintage, and unavailable pieces
- About section based on the real Old Soul Gem story
- Etsy and Facebook links
- Contact and social links
- Responsive navigation and mobile layout

## Product Content

Use the real product photography, titles, descriptions, categories, prices, variants, and brand language from the Old Soul Gem Etsy and Facebook pages. Product data will be kept in one central file so storefront updates do not require editing page layouts.

## Administration

Keep a simplified private product manager for:

- Adding and editing products
- Publishing or hiding products
- Updating pricing, variants, and availability
- Managing image galleries
- Reviewing inquiry records

The admin experience will be separated from the public storefront and will not carry forward the prior Android, PWA, or test-only complexity unless it is later needed.

## Technical Direction

- Clean static storefront architecture with centralized product data
- Minimal dependencies
- Accessible semantic HTML
- Fast image loading and responsive images
- Simple deployment through GitHub Pages or the selected production host
- Existing legacy files remain available on `main` but are not part of the clean rebuild
