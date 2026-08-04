# Vida Collection Storefront Rebuild

## Goal

Rebuild the jewelry website from a clean storefront baseline while preserving the luxury editorial direction of the approved model. The existing `main` branch remains untouched as a backup.

## Brand Direction

- Vida Collection by Alé
- Editorial fine-jewelry presentation
- Cream, warm beige, charcoal, deep muted green, and restrained gold accents
- Elegant serif display typography with clean sans-serif body typography
- Warm, high-end product photography
- One-of-one and limited-piece storytelling
- Mobile-first presentation

## Public Storefront

- Home page with editorial hero
- Collection grid with filters for All, Rings, Necklaces, Earrings, and One-of-One
- Individual product pages with image galleries
- Product details, materials, care, shipping, and availability
- Add-to-cart flow for purchasable products
- Inquiry flow for custom, one-of-one, and unavailable products
- Private appointment request section for San Antonio clients
- About/story section based on Alé's real brand story
- Contact and social links
- Responsive navigation and mobile layout

## Product Content

Use the real product photography, titles, descriptions, categories, prices, and brand language from Alé's Etsy and Facebook pages. Product data will be kept in one central file so storefront updates do not require editing page layouts.

## Administration

Keep a simplified private product manager for:

- Adding and editing products
- Publishing or hiding products
- Updating pricing and availability
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
