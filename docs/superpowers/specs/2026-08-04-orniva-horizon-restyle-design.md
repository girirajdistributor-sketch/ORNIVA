# Orniva Jewels — Restyle Shopify Horizon Theme

Date: 2026-08-04

## Goal

Take the static Orniva Jewels site (`index.html`, `necklaces.html`, `product.html` in
`/Users/hiral/Desktop/orniva-jewelry`) and re-create its look inside the official
Shopify **Horizon** theme, so the result can run as a real Shopify theme in the
`girirajdistributor-sketch/ORNIVA` GitHub repo and be installed on a Shopify store.

## Context / constraints discovered during brainstorming

- `ORNIVA` on GitHub is currently empty — this will be the first content pushed to it.
- Horizon is Online Store 2.0: pages are JSON templates that assemble reusable Liquid
  sections. There is no such thing as a standalone "necklaces page" file — one
  `templates/collection.json` renders *every* collection, and one `templates/product.json`
  renders *every* product. So:
  - `necklaces.html` → becomes the styling for the **collection template**, which will
    also apply to Earrings/Bracelets/Rings once those collections exist in the store.
  - `product.html` → becomes the styling for the **product template**, applying to every
    product.
  - `index.html` → becomes `templates/index.json`, the home page.
- No Shopify CLI, no store connection, and no working push credentials for the target
  repo are available in this environment. Verification is therefore limited to Liquid/CSS
  correctness by inspection — real visual verification happens once the user previews the
  theme in Shopify Admin (Online Store → Themes → Preview) or runs Shopify CLI themselves.
- A GitHub token for a different account (`hiral-v`) was found stored on this machine; it
  has no write access to `ORNIVA`. Push will use a short-lived, narrowly-scoped
  fine-grained PAT for `girirajdistributor-sketch`, provided by the user for this session
  only, and revoked immediately after the push. It is used once, piped directly into git,
  and never echoed to output.
- Wishlist icon: kept visually in the header (static, non-functional) — no wishlist app
  is being integrated now.

## Approach

Work happens in a local clone of `Shopify/horizon` at `/Users/hiral/Desktop/horizon-theme`
(already cloned, shallow). We reskin it in place rather than writing a theme from scratch,
so we keep Horizon's real cart/search/variant/menu logic and accessibility behavior, and
only replace the visual layer and content.

1. **Brand tokens** — new `assets/orniva-tokens.css` translating
   `orniva-jewelry/css/base.css`'s `:root` variables (colors, `--font-serif`/`--font-sans`,
   radii, shadows) into Horizon's CSS variable names, loaded once from `layout/theme.liquid`.
   Fonts (Playfair Display, Poppins) added as a Google Fonts `<link>` alongside Horizon's
   existing font-loading, matching current `index.html` head tags.
2. **Header** — edit `sections/header-announcements.liquid` (topbar: "Shine Every Day" /
   free shipping / COD messages) and `sections/header.liquid` (logo, nav, search, account,
   wishlist placeholder, cart) to match `site-header` markup/behavior from `index.html`,
   using Shopify's `linklists.main-menu`, `routes.cart_url`, `cart.item_count`,
   `routes.account_url`, and predictive search, instead of hardcoded links.
3. **Home page** (`templates/index.json`) — configure Horizon's existing `hero`,
   `marquee`/feature-row, and collection-list sections with Orniva's copy ("Shine Every
   Day", "Timeless Designs, Unmatched You.", the 4-item feature strip: Premium Quality /
   Tarnish Free / Beautiful Packaging / Fast Delivery) instead of writing new section
   types, since Horizon already ships equivalents.
4. **Collection template** (`templates/collection.json` + `sections/main-collection.liquid`
   filter styling) — restyle the filter sidebar and product grid CSS to match
   `necklaces.html`, keeping Shopify's native faceted filtering/sorting logic.
5. **Product template** (`templates/product.json` + product-information sections) —
   restyle the gallery + buy box to match `product.html`, keeping Horizon's variant
   picker/add-to-cart form logic.
6. **Push** — add `girirajdistributor-sketch/ORNIVA` as a remote, commit, push `main`
   using a one-time PAT supplied by the user for this session.

## Non-goals

- No wishlist backend/app integration.
- No real product/collection data entry in the store — that's the user's job in Shopify
  Admin; we only style the templates that render whatever data exists.
- No other collections (earrings, bracelets, rings) get bespoke pages — they automatically
  render through the same restyled collection template.
- No Shopify CLI theme-check run (not installed); no live preview (no store connection).

## Testing / verification

- Liquid files reviewed by hand for syntax correctness (balanced tags, valid object/filter
  usage per Horizon's existing conventions).
- CSS reviewed against the same visual spec as `orniva-jewelry`'s existing pages (colors,
  fonts, spacing, breakpoints).
- Real rendering verification is out of reach in this environment — flagged to the user as
  a known limitation. They should preview via Shopify Admin after upload, or install
  Shopify CLI (`shopify theme dev`) for a live local preview against their store.
