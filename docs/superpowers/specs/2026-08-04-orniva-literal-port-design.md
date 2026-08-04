# Orniva Jewels — Literal Static-Site Port into Horizon (Revised Approach)

Date: 2026-08-04

## Why this supersedes the previous spec

The previous spec (`2026-08-04-orniva-horizon-restyle-design.md`) restyled Horizon
using CSS-variable overrides and Shopify's Online Store 2.0 block system
(hero/marquee/collection-list/section+group+icon blocks configured via JSON).
The user reviewed the result and rejected the approach: they want their actual
static site's code — the real HTML structure, the real CSS files, the real JS
files from `/Users/hiral/Desktop/orniva-jewelry` — to be what ships, not a
re-composition using Horizon's generic components. This spec replaces that
approach entirely.

**The previous approach's 7 commits (cb000dc..c23843d, already merged to
`main` and already pushed to GitHub) will be reverted** via `git revert`
(not history rewrite — the commits are already public on the pushed remote,
so we add revert commits rather than force-pushing a rewritten history).

## Goal

Copy Orniva's actual CSS/JS files into the Horizon theme as theme assets, and
write classic Shopify Liquid templates (not JSON/section-based templates)
that reproduce the static site's exact markup, class names, and visual
structure — substituting real Shopify data (products, prices, cart, menus)
only where the static site has hardcoded demo/placeholder content.

## Scope decisions (confirmed with the user)

- **Filter sidebar on the collection page** (category radios, price range,
  material/occasion checkboxes, rating checkboxes): stays purely
  decorative/static for now — exact markup and CSS preserved, no wiring to
  Shopify's native filter system. The product grid itself, its sorting
  (`sort_by`), and pagination ARE real and functional.
- **Product page tabs** (Product Details / Shipping & Returns / Care Guide):
  per-product via Shopify metafields — each product gets its own values.
  Metafield definitions needed (namespace `custom`, single-line-text type
  unless noted): `material`, `plating`, `stone_type`, `weight`,
  `set_contents`, `necklace_length`. SKU comes from the product's variant
  (`variant.sku`), not a metafield. The Description tab uses the product's
  real `description` field. The user will need to create these metafield
  definitions and fill them in per product in Shopify Admin — this spec
  only wires the theme to read them; it doesn't populate data.
- **Homepage "Best Sellers"**: pulls from `collections.all`, first 5
  products, until the user creates a dedicated "best-sellers" collection
  and we point the loop at its handle instead (one-line change later).
- **Newsletter form** (home + footer): wired to Shopify's real customer
  signup (`{% form 'customer' %}`, type hidden field `contact[tags]` =
  `newsletter`) instead of the static `action="#"` — same visual markup,
  now functional.
- **Instagram section**: stays fully decorative (placeholder tiles) — no
  real Instagram feed integration.
- **Cart / checkout**: no AJAX cart, no cart drawer — "Add To Cart" and
  "Buy It Now" become a real `{% form 'product', product %}` with standard
  (non-AJAX) submit buttons, matching the static site's simplicity (it had
  no cart JS at all). Submitting adds to cart and redirects to the cart
  page, which is standard Shopify behavior without extra JS.
- **Color swatches / variants**: map the static "Color: Gold/Silver"
  swatches to the product's real first variant option (whatever the
  merchant names it — typically "Color"). Clicking a swatch selects that
  variant option value and updates the hidden variant ID input the add-to-cart
  form submits, so Add To Cart adds the correct variant.
- **Gallery**: swap product.js's CSS-gradient-class swap logic for real
  `<img>` `src` swapping across the product's real media list, keeping the
  same click-driven thumbnail/prev-next interaction pattern.

## Architecture

1. **Assets** — copy verbatim into `assets/`: `orniva-base.css` (from
   `css/base.css`), `orniva-home.css`, `orniva-necklaces.css`,
   `orniva-product.css`, `orniva-main.js`, `orniva-product.js`. Renamed with
   an `orniva-` prefix to avoid colliding with Horizon's own `base.css`.
   `orniva-product.js`'s gallery-swap function is adapted (see Task 6 below)
   to swap real `<img>` sources instead of CSS gradient classes — everything
   else in these files is copied unmodified.
2. **Layout** — replace `layout/theme.liquid` entirely with a minimal
   layout: `<head>` carries the Google Fonts links + the copied CSS files +
   Shopify's required `{{ content_for_header }}`; `<body>` renders
   `{% render 'orniva-header' %}`, `{{ content_for_layout }}`,
   `{% render 'orniva-footer' %}`, plus the copied JS files at the end of
   body. No Horizon assets/snippets are loaded.
3. **Header/footer snippets** — `snippets/orniva-header.liquid` and
   `snippets/orniva-footer.liquid`, built from `index.html`'s exact header/
   footer markup. Nav menu loops over `linklists.main-menu.links` (falling
   back visually identical to the static site's hardcoded items until the
   user configures the real menu in Admin). Cart icon shows
   `cart.item_count`. Search/account icons point at `routes.search_url`/
   `routes.account_url`. Wishlist stays a static, non-functional button
   (per the earlier decision, carried over from the prior approach).
4. **Templates** — classic `.liquid` files (not JSON), each pairing with a
   dedicated section-less template:
   - `templates/index.liquid`: hero, categories, promos, product-section
     (Best Sellers — real loop), why-us, instagram (static), newsletter
     (real form action).
   - `templates/collection.liquid`: breadcrumb, page banner (dynamic
     collection title/description), decorative filter sidebar (static
     markup), real product grid (`{% paginate collection.products by 12 %}`),
     real sort dropdown (`{{ collection.url }}?sort_by=...`), feature strip,
     footer.
   - `templates/product.liquid`: breadcrumb, real gallery
     (`product.media`), real title/price/compare-at/discount-badge, variant
     color-swatch picker wired to a real add-to-cart form, quantity input,
     Add To Cart / Buy It Now (real form submit), tabs (Description = real
     `product.description`; other 3 tabs = the metafields above), related
     products (`product.recommendations` falling back to the same
     collection's other products), feature strip, footer.
5. **Product card partial** — `snippets/orniva-product-card.liquid`,
   shared by home/collection/related-products, taking a `product` param and
   rendering the exact `.product-card` markup with real
   title/price/compare-at/image/rating (rating has no real Shopify data
   source — kept as static 5-star decorative markup, matching that the
   static site's rating counts were fake too).

## Non-goals (this pass)

- No real product filtering/faceting.
- No AJAX cart or cart drawer.
- No real Instagram feed.
- No per-variant image mapping beyond swapping the gallery's active image
  set (i.e., we don't attempt "show only Gold-variant photos when Gold is
  selected" — that's a further refinement, not in this pass).
- No accessibility or SEO audit beyond what the static site already had.

## Testing / verification

Same limitation as before: no Shopify CLI, no live store, no Liquid linter
in this environment. Verification is: JSON validity where JSON still exists
(the two config files, if touched), Liquid tag balance by manual review,
and CSS/JS files verified as byte-identical copies (`diff` against source)
except where product.js is deliberately adapted (that diff is reviewed by
hand). Real rendering verification happens once the user connects this repo
to their Shopify store and previews it.
