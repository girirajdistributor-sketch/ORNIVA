# Orniva Literal Static-Site Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the previous Horizon-block restyle with a literal port of Orniva Jewels' static site (`/Users/hiral/Desktop/orniva-jewelry`) into the Horizon theme (`/Users/hiral/Desktop/horizon-theme`) — the actual CSS/JS files copied in, and classic (non-JSON) Liquid templates that reproduce the exact HTML, wiring in real Shopify data only where the static site had hardcoded placeholders.

**Architecture:** A minimal custom `layout/theme.liquid` loads the copied CSS/JS and renders custom header/footer snippets around `{{ content_for_layout }}`. Three classic Liquid templates (`index.liquid`, `collection.liquid`, `product.liquid`) reproduce `index.html`/`necklaces.html`/`product.html` almost verbatim, with named substitution points for dynamic data (products, cart, menu, variants, metafields).

**Tech Stack:** Shopify Liquid (classic templates, not Online Store 2.0 JSON/sections), plain CSS/JS carried over from the static site.

## Global Constraints

- Reference source (read-only, never edit): `/Users/hiral/Desktop/orniva-jewelry/{index.html,necklaces.html,product.html,css/*,js/*}`.
- Target repo: `/Users/hiral/Desktop/horizon-theme`, currently on `main`.
- Copied asset filenames (all under `assets/`): `orniva-base.css`, `orniva-home.css`, `orniva-necklaces.css`, `orniva-product.css`, `orniva-main.js`, `orniva-product.js`.
- Filters on the collection page stay decorative — no real Shopify filter/facet wiring.
- Product page's "Product Details"/"Shipping & Returns"/"Care Guide" tabs read per-product metafields, namespace `custom`, single-line-text fields: `material`, `plating`, `stone_type`, `weight`, `set_contents`, `necklace_length`. SKU comes from `product.selected_or_first_available_variant.sku`, not a metafield.
- No AJAX cart, no cart drawer — Add To Cart / Buy It Now are a real `{% form 'product', product %}` with standard (non-AJAX, full-page-submit) buttons.
- Newsletter forms (home section + footer) use Shopify's real `{% form 'customer' %}` with `contact[tags]` = `newsletter`.
- No Shopify CLI / live store in this environment — verification is manual review, `diff` against the source files for portions that should be byte-identical, and Liquid tag-balance checks (grep-counted `{% %}` pairs) rather than a real Liquid parse.
- Never edit anything under `/Users/hiral/Desktop/orniva-jewelry` — it is read-only reference.

---

### Task 1: Revert the previous Horizon-block restyle

**Files:** none created; reverts the 7 commits `8035923..c23843d` (all under `assets/orniva-tokens.css`, `blocks/_header-logo.liquid`, `layout/theme.liquid`, `sections/header-group.json`, `snippets/header-actions.liquid`, `snippets/stylesheets.liquid`, `templates/{collection,index,product}.json`).

**Interfaces:** Produces: a `main` branch back at Horizon's pristine state for every file those 7 commits touched (except the two doc commits before/after them, which stay).

- [ ] **Step 1: Confirm the exact commit range**

Run: `cd /Users/hiral/Desktop/horizon-theme && git log --oneline -10`
Expected: top commit is `e4afe77 Add revised design spec...`, followed immediately by `c23843d Fix whole-branch review findings...` down through `8035923 Add Orniva brand tokens and Google Fonts`, then `cb000dc Ignore .worktrees/ directory...`. If the hashes differ from this, STOP and report NEEDS_CONTEXT — do not guess a different range.

- [ ] **Step 2: Revert the range without auto-committing**

Run: `cd /Users/hiral/Desktop/horizon-theme && git revert --no-commit 8035923^..c23843d`
Expected: exits cleanly with the working tree showing reverted content staged (no merge conflicts — `e4afe77` only touched `docs/`, which none of these 7 commits touched).

- [ ] **Step 3: Verify pristine state**

Run:
```bash
cd /Users/hiral/Desktop/horizon-theme
git diff --cached --stat
ls assets/orniva-tokens.css 2>&1
```
Expected: the diffstat shows deletions/reversions across the 9 files listed above (mirroring the original 7 commits' combined diffstat in reverse), and `ls assets/orniva-tokens.css` reports "No such file or directory" (confirming the file this approach created is gone).

- [ ] **Step 4: Commit the revert**

```bash
cd /Users/hiral/Desktop/horizon-theme
git commit -m "Revert Horizon-block restyle (8035923..c23843d) in favor of literal static-site port"
```

---

### Task 2: Copy Orniva's CSS/JS assets verbatim

**Files:**
- Create: `assets/orniva-base.css` (from `css/base.css`)
- Create: `assets/orniva-home.css` (from `css/home.css`)
- Create: `assets/orniva-necklaces.css` (from `css/necklaces.css`)
- Create: `assets/orniva-product.css` (from `css/product.css`)
- Create: `assets/orniva-main.js` (from `js/main.js`)
- Create: `assets/orniva-product.js` (from `js/product.js` — copied as-is here; Task 9 modifies its gallery logic)

**Interfaces:** Produces: these 6 asset filenames, referenced by Task 6 (layout).

- [ ] **Step 1: Copy the 4 CSS files and 2 JS files verbatim**

```bash
cp /Users/hiral/Desktop/orniva-jewelry/css/base.css /Users/hiral/Desktop/horizon-theme/assets/orniva-base.css
cp /Users/hiral/Desktop/orniva-jewelry/css/home.css /Users/hiral/Desktop/horizon-theme/assets/orniva-home.css
cp /Users/hiral/Desktop/orniva-jewelry/css/necklaces.css /Users/hiral/Desktop/horizon-theme/assets/orniva-necklaces.css
cp /Users/hiral/Desktop/orniva-jewelry/css/product.css /Users/hiral/Desktop/horizon-theme/assets/orniva-product.css
cp /Users/hiral/Desktop/orniva-jewelry/js/main.js /Users/hiral/Desktop/horizon-theme/assets/orniva-main.js
cp /Users/hiral/Desktop/orniva-jewelry/js/product.js /Users/hiral/Desktop/horizon-theme/assets/orniva-product.js
```

- [ ] **Step 2: Verify byte-for-byte fidelity**

```bash
diff /Users/hiral/Desktop/orniva-jewelry/css/base.css /Users/hiral/Desktop/horizon-theme/assets/orniva-base.css && echo "base.css: identical"
diff /Users/hiral/Desktop/orniva-jewelry/css/home.css /Users/hiral/Desktop/horizon-theme/assets/orniva-home.css && echo "home.css: identical"
diff /Users/hiral/Desktop/orniva-jewelry/css/necklaces.css /Users/hiral/Desktop/horizon-theme/assets/orniva-necklaces.css && echo "necklaces.css: identical"
diff /Users/hiral/Desktop/orniva-jewelry/css/product.css /Users/hiral/Desktop/horizon-theme/assets/orniva-product.css && echo "product.css: identical"
diff /Users/hiral/Desktop/orniva-jewelry/js/main.js /Users/hiral/Desktop/horizon-theme/assets/orniva-main.js && echo "main.js: identical"
diff /Users/hiral/Desktop/orniva-jewelry/js/product.js /Users/hiral/Desktop/horizon-theme/assets/orniva-product.js && echo "product.js: identical"
```
Expected: all 6 `diff` commands print nothing and each `echo` line prints — confirming exact copies.

- [ ] **Step 3: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add assets/orniva-base.css assets/orniva-home.css assets/orniva-necklaces.css assets/orniva-product.css assets/orniva-main.js assets/orniva-product.js
git commit -m "Copy Orniva's static CSS/JS assets verbatim into the theme"
```

---

### Task 3: Header snippet

**Files:**
- Create: `snippets/orniva-header.liquid`

**Interfaces:** Produces: `{% render 'orniva-header' %}`, called by Task 6 (layout).

**Context:** Reproduces `index.html` lines 16-80 (topbar + site header) exactly, replacing hardcoded links/counts with real Shopify data. The original "COLLECTIONS" nav item had a dropdown chevron SVG for a submenu — the generic menu loop below does not attempt to reproduce per-item dropdown behavior (a known, accepted simplification; if the merchant later adds nested menu items, they won't get a visual dropdown arrow from this snippet).

- [ ] **Step 1: Create the snippet**

```liquid
<!-- ========================= Top announcement bar ========================= -->
<div class="topbar">
  <div class="container topbar__inner">
    <div class="topbar__left topbar__item">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z"/></svg>
      Shine Every Day
    </div>
    <div class="topbar__center topbar__item" style="justify-content:center;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8Z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      FREE SHIPPING ON ORDERS ABOVE &#8377;999
    </div>
    <div class="topbar__right topbar__item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12l2 2 4-4"/></svg>
      COD AVAILABLE
    </div>
  </div>
</div>

<!-- ========================= Site header ========================= -->
<header class="site-header">
  <div class="container site-header__inner">
    <button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>

    <div class="logo">
      <a href="{{ routes.root_url }}">
        <span class="logo__mark">ORNIVA</span>
        <span class="logo__tagline">Shine Every Day</span>
      </a>
    </div>

    <nav class="main-nav" aria-label="Primary">
      <ul class="main-nav__list">
        {%- for link in linklists['main-menu'].links -%}
          <li><a href="{{ link.url }}"{% if link.current %} class="is-active"{% endif %}>{{ link.title | upcase }}</a></li>
        {%- else -%}
          <li><a href="{{ routes.root_url }}" class="is-active">HOME</a></li>
          <li><a href="#">NEW ARRIVALS</a></li>
          <li><a href="#">NECKLACES</a></li>
          <li><a href="#">EARRINGS</a></li>
          <li><a href="#">BRACELETS</a></li>
          <li><a href="#">RINGS</a></li>
          <li><a href="#">COLLECTIONS</a></li>
          <li><a href="#">ABOUT US</a></li>
        {%- endfor -%}
      </ul>
    </nav>
    <div class="nav-backdrop"></div>

    <div class="header-icons">
      <a href="{{ routes.search_url }}" aria-label="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </a>
      <a href="{{ routes.account_url }}" aria-label="Account">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </a>
      <a href="#" aria-label="Wishlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </a>
      <a href="{{ routes.cart_url }}" aria-label="Cart, {{ cart.item_count }} items">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span class="cart-count">{{ cart.item_count }}</span>
      </a>
    </div>
  </div>
</header>
```

- [ ] **Step 2: Verify tag balance**

```bash
cd /Users/hiral/Desktop/horizon-theme
python3 -c "
s = open('snippets/orniva-header.liquid').read()
assert s.count('{%') == s.count('%}'), 'unbalanced liquid tags'
assert s.count('{{') == s.count('}}'), 'unbalanced liquid output tags'
print('orniva-header.liquid: tag balance OK')
"
diff <(sed -n '16,80p' /Users/hiral/Desktop/orniva-jewelry/index.html) <(cat snippets/orniva-header.liquid) | head -60
```
The `diff` is expected to show differences ONLY at: the two `href="index.html"`/`href="#"` root-link lines, the `<nav>`/`<ul>` block (hardcoded `<li>` list vs the `{% for %}` loop), and the 4 icon `href`/label lines plus the `cart-count` line. Every other line (topbar, SVG paths, class names) must show as unchanged context in the diff — if you see any other unexpected difference, stop and report it rather than proceeding.

- [ ] **Step 3: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add snippets/orniva-header.liquid
git commit -m "Add orniva-header snippet ported from index.html"
```

---

### Task 4: Footer and feature-strip snippets

**Files:**
- Create: `snippets/orniva-footer.liquid`
- Create: `snippets/orniva-feature-strip.liquid`

**Interfaces:** Produces: `{% render 'orniva-footer' %}` and `{% render 'orniva-feature-strip' %}`, both called by Task 6 (layout) — the layout renders the feature strip immediately after `{{ content_for_layout }}` and the footer right after that, since both appear identically on every one of the static site's 3 pages (the feature strip's wording had a slight variant on `necklaces.html` — "Long lasting shine guaranteed" vs `index.html`'s "Long lasting shine" — treated as an inconsistency in the original source; this snippet uses `index.html`'s canonical wording everywhere).

**Context:** Footer content is `index.html` lines 391-443. Feature strip is `index.html` lines 108-128.

- [ ] **Step 1: Create the feature-strip snippet**

```liquid
<div class="feature-strip">
  <div class="container feature-strip__inner">
    <div class="feature-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9Z"/><path d="M2 9h20"/><path d="M8 9l4 12 4-12"/></svg>
      <div><div class="feature-item__title">Premium Quality</div><div class="feature-item__desc">Finest craftsmanship &amp; materials</div></div>
    </div>
    <div class="feature-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
      <div><div class="feature-item__title">Tarnish Free</div><div class="feature-item__desc">Long lasting shine</div></div>
    </div>
    <div class="feature-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4"/><path d="M12 8v13"/><path d="M19 12v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7"/></svg>
      <div><div class="feature-item__title">Beautiful Packaging</div><div class="feature-item__desc">Perfect for gifting</div></div>
    </div>
    <div class="feature-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8Z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      <div><div class="feature-item__title">Fast Delivery</div><div class="feature-item__desc">Across India</div></div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Create the footer snippet**

```liquid
<footer class="site-footer">
  <div class="container site-footer__top">
    <div class="footer-brand">
      <div class="logo"><span class="logo__mark">ORNIVA</span><span class="logo__tagline">Shine Every Day</span></div>
      <p>Timeless imitation jewellery crafted to bring elegance to your everyday.</p>
      <div class="footer-brand__socials">
        <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
        <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/></svg></a>
        <a href="#" aria-label="Pinterest"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21c1-3 1.5-5 2-8"/><path d="M12 3a9 9 0 1 0 3.6 17.25c-1.4-.3-2.6-1.2-3-2.6a4.3 4.3 0 0 1 .2-2.7l1-4a2.5 2.5 0 0 1 5 .3c0 1.6-1 3.7-1.6 5.2A2 2 0 0 0 19 19"/></svg></a>
        <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33Z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg></a>
      </div>
    </div>
    <div class="footer-col">
      <h3>Quick Links</h3>
      <ul>
        <li><a href="#">About Us</a></li>
        <li><a href="{{ routes.all_products_collection_url }}">All Products</a></li>
        <li><a href="#">New Arrivals</a></li>
        <li><a href="#">Best Sellers</a></li>
        <li><a href="#">Collections</a></li>
        <li><a href="#">Contact Us</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h3>Customer Service</h3>
      <ul>
        <li><a href="#">Shipping &amp; Delivery</a></li>
        <li><a href="#">Returns &amp; Exchanges</a></li>
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Terms &amp; Conditions</a></li>
        <li><a href="#">FAQ's</a></li>
      </ul>
    </div>
    <div class="footer-col footer-newsletter">
      <h3>Newsletter</h3>
      <p>Subscribe to get special offers, free giveaways and once-in-a-lifetime deals.</p>
      {% form 'customer', class: 'footer-newsletter__form' %}
        {% if form.posted_successfully? %}
          <p class="form-success">Thanks for subscribing!</p>
        {% endif %}
        <input type="hidden" name="contact[tags]" value="newsletter">
        <label class="visually-hidden" for="footer-email">Email address</label>
        <input id="footer-email" type="email" name="contact[email]" placeholder="Enter your email" required />
        <button type="submit" aria-label="Subscribe">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      {% endform %}
    </div>
  </div>
  <div class="container site-footer__bottom">
    <p>&copy; {{ 'now' | date: "%Y" }} Orniva Jewels. All Rights Reserved.</p>
    <div class="payment-icons">
      <span>VISA</span><span>Mastercard</span><span>RuPay</span><span>UPI</span><span>COD</span>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Verify tag balance**

```bash
cd /Users/hiral/Desktop/horizon-theme
python3 -c "
for f in ['snippets/orniva-footer.liquid', 'snippets/orniva-feature-strip.liquid']:
    s = open(f).read()
    assert s.count('{%') == s.count('%}'), f + ': unbalanced liquid tags'
    assert s.count('{{') == s.count('}}'), f + ': unbalanced liquid output tags'
    print(f + ': tag balance OK')
"
```

- [ ] **Step 4: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add snippets/orniva-footer.liquid snippets/orniva-feature-strip.liquid
git commit -m "Add orniva-footer and orniva-feature-strip snippets"
```

---

### Task 5: Product card snippet

**Files:**
- Create: `snippets/orniva-product-card.liquid`

**Interfaces:**
- Consumes: a `product` param (a real Shopify product object) passed by the caller.
- Produces: `{% render 'orniva-product-card', product: product %}`, called by Tasks 7, 8, 9 (home best-sellers, collection grid, product-page related-products).

**Context:** Reproduces the `article.product-card` markup used identically across `index.html` (Best Sellers), `necklaces.html` (grid), and `product.html` (Related Products). Badge logic: the static site had inconsistent hand-picked badges ("Best Seller" on some cards, "Sale" on others, none on others) — this snippet derives a badge automatically: `Sale` if the product has a compare-at price higher than its price, else `Best Seller` if tagged `best-seller`, else no badge. Rating stars stay fully decorative (no real review data source), matching the static site's fake rating counts.

- [ ] **Step 1: Create the snippet**

```liquid
{%- comment -%}
  Orniva product card. Usage: {% render 'orniva-product-card', product: product %}
{%- endcomment -%}
<article class="product-card">
  <a href="{{ product.url }}" class="product-card__media ph-img">
    {%- if product.compare_at_price > product.price -%}
      <span class="product-card__badge product-card__badge--sale">Sale</span>
    {%- elsif product.tags contains 'best-seller' -%}
      <span class="product-card__badge">Best Seller</span>
    {%- endif -%}
    <button class="product-card__wishlist" aria-label="Add to wishlist" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
    {%- if product.featured_image -%}
      <img
        src="{{ product.featured_image | image_url: width: 600 }}"
        alt="{{ product.featured_image.alt | default: product.title | escape }}"
        loading="lazy"
        width="600"
        height="{{ 600 | divided_by: product.featured_image.aspect_ratio | default: 600 }}"
      >
    {%- else -%}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4c0 6 3.5 10 8 10s8-4 8-10"/><circle cx="12" cy="17" r="3"/></svg>
    {%- endif -%}
  </a>
  <div class="product-card__body">
    <h3 class="product-card__title"><a href="{{ product.url }}">{{ product.title }}</a></h3>
    <div class="product-card__price">
      <span class="price-now">{{ product.price | money }}</span>
      {%- if product.compare_at_price > product.price -%}
        <span class="price-old">{{ product.compare_at_price | money }}</span>
      {%- endif -%}
    </div>
    <div class="rating">
      <span class="rating__stars">
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <svg class="is-empty" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </span>
      (24)
    </div>
  </div>
</article>
```

- [ ] **Step 2: Verify tag balance**

```bash
cd /Users/hiral/Desktop/horizon-theme
python3 -c "
s = open('snippets/orniva-product-card.liquid').read()
assert s.count('{%') == s.count('%}'), 'unbalanced liquid tags'
assert s.count('{{') == s.count('}}'), 'unbalanced liquid output tags'
print('orniva-product-card.liquid: tag balance OK')
"
```

- [ ] **Step 3: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add snippets/orniva-product-card.liquid
git commit -m "Add shared orniva-product-card snippet"
```

---

### Task 6: Replace layout/theme.liquid

**Files:**
- Modify: `layout/theme.liquid` (full replacement)

**Interfaces:**
- Consumes: `{% render 'orniva-header' %}` (Task 3), `{% render 'orniva-feature-strip' %}` + `{% render 'orniva-footer' %}` (Task 4), asset filenames from Task 2.
- Produces: the layout every template in Tasks 7-9 renders inside.

**Context:** Mirrors the static site's per-page asset loading: `orniva-home.css` only on the home page, `orniva-necklaces.css` only on collection pages, `orniva-product.css` + `orniva-product.js` only on product pages — matching exactly which `<link>`/`<script>` tags each of `index.html`/`necklaces.html`/`product.html` individually loaded.

- [ ] **Step 1: Read the current layout/theme.liquid to confirm the file exists and note its length**

Run: `wc -l /Users/hiral/Desktop/horizon-theme/layout/theme.liquid`

- [ ] **Step 2: Replace its entire contents**

```liquid
<!doctype html>
<html lang="{{ request.locale.iso_code }}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{{ page_title }}{% unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless %}</title>
{%- if page_description %}
<meta name="description" content="{{ page_description | escape }}">
{%- endif %}
<link rel="canonical" href="{{ canonical_url }}">
{%- if settings.favicon %}
<link rel="icon" type="image/png" href="{{ settings.favicon | image_url: width: 32, height: 32 }}">
{%- endif %}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
{{ 'orniva-base.css' | asset_url | stylesheet_tag }}
{%- if template.name == 'index' %}
{{ 'orniva-home.css' | asset_url | stylesheet_tag }}
{%- endif %}
{%- if template.name == 'collection' %}
{{ 'orniva-necklaces.css' | asset_url | stylesheet_tag }}
{%- endif %}
{%- if template.name == 'product' %}
{{ 'orniva-product.css' | asset_url | stylesheet_tag }}
{%- endif %}
{{ content_for_header }}
</head>
<body>
{% render 'orniva-header' %}
{{ content_for_layout }}
{% render 'orniva-feature-strip' %}
{% render 'orniva-footer' %}
{{ 'orniva-main.js' | asset_url | script_tag }}
{%- if template.name == 'product' %}
{{ 'orniva-product.js' | asset_url | script_tag }}
{%- endif %}
</body>
</html>
```

- [ ] **Step 3: Verify tag balance**

```bash
cd /Users/hiral/Desktop/horizon-theme
python3 -c "
s = open('layout/theme.liquid').read()
assert s.count('{%') == s.count('%}'), 'unbalanced liquid tags'
assert s.count('{{') == s.count('}}'), 'unbalanced liquid output tags'
print('theme.liquid: tag balance OK')
"
grep -c "content_for_header" layout/theme.liquid
grep -c "content_for_layout" layout/theme.liquid
```
Expected: tag balance OK, and both grep counts return `1` — these two are Shopify-required and must appear exactly once.

- [ ] **Step 4: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add layout/theme.liquid
git commit -m "Replace layout/theme.liquid with minimal Orniva layout"
```

---

### Task 7: Home page template

**Files:**
- Create: `templates/index.liquid` (replaces `templates/index.json` — delete the JSON file)

**Interfaces:**
- Consumes: `{% render 'orniva-product-card', product: product %}` from Task 5.

**Context:** Reproduces `index.html` lines 82-389 (hero through newsletter — topbar/header and footer are excluded here since Task 6's layout already wraps every template with those). The only structural change from the static source is the "Best Sellers" section: its 5 hardcoded `article.product-card` elements become a real loop over `collections.all.products limit: 5`, via the shared card snippet.

- [ ] **Step 1: Delete the old JSON template**

```bash
cd /Users/hiral/Desktop/horizon-theme
rm templates/index.json
```

- [ ] **Step 2: Create templates/index.liquid**

```liquid
<!-- ========================= Hero ========================= -->
<section class="hero">
  <div class="container hero__inner">
    <div class="hero__copy">
      <span class="hero__eyebrow">&#10022; ORNIVA JEWELS &#10022;</span>
      <h1>Shine Every Day</h1>
      <p>Timeless Designs, Unmatched You.</p>
      <a href="{{ routes.all_products_collection_url }}" class="btn btn-primary">Shop Now</a>
    </div>
    <div class="hero__media ph-img">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4c0 6 3.5 10 8 10s8-4 8-10"/><circle cx="12" cy="17" r="3"/></svg>
    </div>
  </div>
  <div class="hero__nav">
    <button class="hero__arrow" aria-label="Previous slide">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button class="hero__arrow" aria-label="Next slide">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  </div>
  <div class="hero__dots">
    <span class="is-active"></span><span></span><span></span>
  </div>
</section>

<!-- ========================= Shop by category ========================= -->
<section class="categories">
  <div class="container">
    <div class="section-heading">
      <h2>Shop By Category</h2>
    </div>
    <div class="categories__grid">
      <div class="category-item">
        <div class="category-item__media ph-img ph-img--soft"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4c0 6 3.5 10 8 10s8-4 8-10"/><circle cx="12" cy="17" r="3"/></svg></div>
        <div class="category-item__name">NECKLACES</div>
        <a href="{{ routes.root_url }}collections/necklaces" class="category-item__link" aria-label="Shop Necklaces"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
      </div>
      <div class="category-item">
        <div class="category-item__media ph-img ph-img--soft"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="2"/><path d="M12 8v3"/><path d="M8 11a4 4 0 0 0 8 0"/></svg></div>
        <div class="category-item__name">EARRINGS</div>
        <a href="#" class="category-item__link" aria-label="Shop Earrings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
      </div>
      <div class="category-item">
        <div class="category-item__media ph-img ph-img--soft"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg></div>
        <div class="category-item__name">BRACELETS</div>
        <a href="#" class="category-item__link" aria-label="Shop Bracelets"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
      </div>
      <div class="category-item">
        <div class="category-item__media ph-img ph-img--soft"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="15" r="6"/><path d="M9 9l3-6 3 6"/></svg></div>
        <div class="category-item__name">RINGS</div>
        <a href="#" class="category-item__link" aria-label="Shop Rings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
      </div>
      <div class="category-item">
        <div class="category-item__media ph-img ph-img--soft"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><circle cx="12" cy="18" r="2.5"/></svg></div>
        <div class="category-item__name">MANGALSUTRA</div>
        <a href="#" class="category-item__link" aria-label="Shop Mangalsutra"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
      </div>
      <div class="category-item">
        <div class="category-item__media ph-img ph-img--soft"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z"/></svg></div>
        <div class="category-item__name">COLLECTIONS</div>
        <a href="#" class="category-item__link" aria-label="Shop Collections"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
      </div>
    </div>
  </div>
</section>

<!-- ========================= Promo banners ========================= -->
<section class="promos">
  <div class="container promos__grid">
    <div class="promo-card">
      <div class="promo-card__media ph-img ph-img--dark"></div>
      <div class="promo-card__content">
        <span class="promo-card__eyebrow">NEW ARRIVALS +</span>
        <h3>Latest Designs, Just For You</h3>
        <a href="{{ routes.all_products_collection_url }}" class="btn btn-dark">Explore Now</a>
      </div>
    </div>
    <div class="promo-card">
      <div class="promo-card__media ph-img"></div>
      <div class="promo-card__content">
        <h3>Timeless Beauty For Every Moment</h3>
        <div class="discount">UP TO 30% OFF</div>
        <a href="{{ routes.all_products_collection_url }}" class="btn btn-dark">Shop Collection</a>
      </div>
    </div>
  </div>
</section>

<!-- ========================= Best sellers ========================= -->
<section class="product-section">
  <div class="container">
    <div class="section-heading"><h2>Best Sellers</h2></div>
    <div class="product-carousel">
      <div class="product-carousel__track">
        {%- for product in collections.all.products limit: 5 -%}
          {%- render 'orniva-product-card', product: product -%}
        {%- endfor -%}
      </div>
    </div>
    <div class="product-section__cta">
      <a href="{{ routes.all_products_collection_url }}" class="btn btn-primary">View All Products</a>
    </div>
  </div>
</section>

<!-- ========================= Why choose Orniva ========================= -->
<section class="why-us">
  <div class="container why-us__inner">
    <div class="why-us__copy">
      <span class="why-us__eyebrow">NEW CHOOSE ORNIVA?</span>
      <h2>Designed to Make You Shine</h2>
    </div>
    <div class="why-us__grid">
      <div class="why-us__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9Z"/><path d="M2 9h20"/><path d="M8 9l4 12 4-12"/></svg>
        <h4>Premium Quality</h4>
        <p>Carefully selected materials for a luxurious feel.</p>
      </div>
      <div class="why-us__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z"/></svg>
        <h4>Tarnish Free</h4>
        <p>Advanced coating for long lasting shine.</p>
      </div>
      <div class="why-us__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s7 8 7 13a7 7 0 1 1-14 0c0-5 7-13 7-13Z"/></svg>
        <h4>Skin Friendly</h4>
        <p>Nickel free &amp; hypoallergenic. Safe for all skin types.</p>
      </div>
      <div class="why-us__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
        <h4>Trusted by Thousands</h4>
        <p>Loved by 10,000+ happy customers across India.</p>
      </div>
    </div>
  </div>
</section>

<!-- ========================= Instagram grid ========================= -->
<section class="instagram">
  <div class="container">
    <div class="section-heading"><h2>Explore @orniva.jewels</h2></div>
    <div class="instagram__grid">
      <div class="instagram-item ph-img ph-img--soft">
        <button class="instagram-item__wishlist" aria-label="Save"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
      </div>
      <div class="instagram-item ph-img">
        <button class="instagram-item__wishlist" aria-label="Save"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
      </div>
      <div class="instagram-item ph-img ph-img--dark">
        <button class="instagram-item__wishlist" aria-label="Save"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
      </div>
      <div class="instagram-item ph-img ph-img--soft">
        <button class="instagram-item__wishlist" aria-label="Save"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
      </div>
      <div class="instagram-item ph-img">
        <button class="instagram-item__wishlist" aria-label="Save"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
      </div>
    </div>
    <a href="#" class="btn btn-outline">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
      Follow Us On Instagram
    </a>
  </div>
</section>

<!-- ========================= Newsletter ========================= -->
<section class="newsletter">
  <div class="container newsletter__inner">
    <div class="newsletter__copy">
      <h2>Stay Connected &amp; Get 10% Off</h2>
      <p>Subscribe to get special offers, free giveaways and once-in-a-lifetime deals.</p>
    </div>
    {% form 'customer', class: 'newsletter__form' %}
      {% if form.posted_successfully? %}
        <p class="form-success">Thanks for subscribing!</p>
      {% endif %}
      <input type="hidden" name="contact[tags]" value="newsletter">
      <label class="visually-hidden" for="newsletter-email">Email address</label>
      <input id="newsletter-email" type="email" name="contact[email]" placeholder="Enter your email" required />
      <button type="submit">Subscribe</button>
    {% endform %}
  </div>
</section>
```

Note: the "Necklaces" category tile links to `{{ routes.root_url }}collections/necklaces` — this only resolves once the user creates a collection with the handle `necklaces` in Shopify Admin. Until then it 404s, same as the rest of the still-`#` links resolving to nothing — flag this to the user rather than silently treating it as done.

- [ ] **Step 3: Verify tag balance and diff unchanged sections against source**

```bash
cd /Users/hiral/Desktop/horizon-theme
python3 -c "
s = open('templates/index.liquid').read()
assert s.count('{%') == s.count('%}'), 'unbalanced liquid tags'
assert s.count('{{') == s.count('}}'), 'unbalanced liquid output tags'
print('index.liquid: tag balance OK')
"
diff <(sed -n '130,346p' /Users/hiral/Desktop/orniva-jewelry/index.html) <(sed -n '/categories/,/why-us__inner/p' templates/index.liquid) | head -40
```
The categories/promos/why-us sections should diff as identical except the two href substitutions noted above (Necklaces tile, promo card links) and the Best Sellers loop replacement.

- [ ] **Step 4: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add templates/index.liquid
git rm templates/index.json
git commit -m "Add templates/index.liquid ported from index.html, remove old JSON template"
```

---

### Task 8: Collection template (necklaces.html)

**Files:**
- Create: `templates/collection.liquid` (replaces `templates/collection.json` — delete the JSON file)

**Interfaces:** Consumes: `{% render 'orniva-product-card', product: product %}` from Task 5.

**Context:** This template renders for EVERY collection in the store (not just a "necklaces" one) — Shopify has exactly one collection template. Read `/Users/hiral/Desktop/orniva-jewelry/necklaces.html` in full before starting (it's ~43KB — do not skim). Copy its structure from the breadcrumb through the pagination nav (everything between the site header and the feature-strip/footer, which Task 6's layout already supplies) into `templates/collection.liquid`, applying exactly these substitutions and nothing else:

1. **Breadcrumb**: `Home › Necklaces` becomes `Home › {{ collection.title }}`, with the "Home" link as `{{ routes.root_url }}` and the current-page item using `aria-current="page"` exactly as the source does.
2. **Page banner**: the `<h1>` becomes `{{ collection.title }}`; the description paragraph becomes `{{ collection.description }}` (if the source paragraph had specific marketing copy instead of a generic one, keep that exact copy only as a fallback when `collection.description` is blank — wrap it as `{% if collection.description != blank %}{{ collection.description }}{% else %}<exact original paragraph text>{% endif %}`).
3. **Filter sidebar** (`aside.filters#filters`, all its category radios / price range / material checkboxes / occasion checkboxes / rating checkboxes / clear button): copy VERBATIM, unchanged, byte-for-byte — including the hardcoded counts like "(120)", "(28)" etc. This is the decorative-filters simplification from the spec; do not wire any of it to real data.
4. **Toolbar** ("Showing 1–12 of 120 products" text, sort `<select>`, view-toggle buttons): the count text becomes `Showing {{ paginate.current_offset | plus: 1 }}–{{ paginate.current_offset | plus: paginate.page_size | at_most: paginate.items }} of {{ paginate.items }} products` (only renders correctly once wrapped in the `{% paginate %}` tag from point 5 below). The sort `<select>` becomes a real sort control: wrap it in a form or use `<option>` `value` attributes as the actual sort URLs, e.g. `<option value="{{ collection.url }}?sort_by=manual"{% if collection.sort_by == 'manual' %} selected{% endif %}>Featured</option>`, `<option value="{{ collection.url }}?sort_by=price-ascending"{% if collection.sort_by == 'price-ascending' %} selected{% endif %}>Price Low-High</option>`, `<option value="{{ collection.url }}?sort_by=price-descending"{% if collection.sort_by == 'price-descending' %} selected{% endif %}>Price High-Low</option>`, `<option value="{{ collection.url }}?sort_by=created-descending"{% if collection.sort_by == 'created-descending' %} selected{% endif %}>Newest</option>`, `<option value="{{ collection.url }}?sort_by=best-selling"{% if collection.sort_by == 'best-selling' %} selected{% endif %}>Best Rated</option>` — and give the `<select>` element `onchange="window.location.href=this.value"` so choosing an option navigates there (no framework JS needed for this one interaction). Leave the view-toggle grid/list buttons as decorative (list view was never actually implemented in the static site either, per the source).
5. **Product grid**: wrap the whole toolbar+grid+pagination in `{% paginate collection.products by 12 %}` ... `{% endpaginate %}`. Replace the 12 hardcoded `article.product-card` elements with `{%- for product in collection.products -%}{%- render 'orniva-product-card', product: product -%}{%- endfor -%}`.
6. **Pagination nav**: replace the static prev/numbered/next buttons with Shopify's real paginate object: `{% if paginate.previous %}<a href="{{ paginate.previous.url }}" class="pagination__prev">...</a>{% endif %}`, `{% for part in paginate.parts %}{% if part.is_link %}<a href="{{ part.url }}">{{ part.title }}</a>{% else %}<span class="is-current">{{ part.title }}</span>{% endif %}{% endfor %}`, `{% if paginate.next %}<a href="{{ paginate.next.url }}" class="pagination__next">...</a>{% endif %}` — keep the exact surrounding markup/classes (`nav.pagination`, prev/next SVG icons) from the source, only swapping the href targets and the loop.

- [ ] **Step 1: Delete the old JSON template**

```bash
cd /Users/hiral/Desktop/horizon-theme
rm templates/collection.json
```

- [ ] **Step 2: Read the full source file**

Run: `wc -l /Users/hiral/Desktop/orniva-jewelry/necklaces.html` then read the entire file (it's one page, ~950 lines) before writing anything.

- [ ] **Step 3: Write templates/collection.liquid**

Apply the 6 substitution rules above to the content between (and excluding) the header and feature-strip/footer. Everything not named in those 6 rules — every filter option's exact text/count, every SVG path, every class name, the page-banner media placeholder, the `.filters-toggle` mobile button — is copied unchanged.

- [ ] **Step 4: Verify**

```bash
cd /Users/hiral/Desktop/horizon-theme
python3 -c "
s = open('templates/collection.liquid').read()
assert s.count('{%') == s.count('%}'), 'unbalanced liquid tags'
assert s.count('{{') == s.count('}}'), 'unbalanced liquid output tags'
print('collection.liquid: tag balance OK')
"
grep -c "{% paginate" templates/collection.liquid
grep -c "{% endpaginate %}" templates/collection.liquid
```
Expected: tag balance OK, and both paginate grep counts equal `1`.

- [ ] **Step 5: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add templates/collection.liquid
git rm templates/collection.json
git commit -m "Add templates/collection.liquid ported from necklaces.html"
```

---

### Task 9: Product template and gallery JS adaptation

**Files:**
- Create: `templates/product.liquid` (replaces `templates/product.json` — delete the JSON file)
- Modify: `assets/orniva-product.js` (gallery-swap function only)

**Interfaces:** Consumes: `{% render 'orniva-product-card', product: product %}` from Task 5.

**Context:** Read `/Users/hiral/Desktop/orniva-jewelry/product.html` in full before starting (~38KB, do not skim). Copy its structure from the breadcrumb through the related-products carousel into `templates/product.liquid`, applying exactly these substitutions and nothing else:

1. **Breadcrumb**: `Home › Necklaces › "Kundan Necklace Set" › <current>` becomes `Home › {{ product.collections.first.title | default: 'Products' }} › {{ product.title }}` (drop the extra fake 4th crumb level — the static source had one crumb too many for a real 3-level breadcrumb; use `{{ routes.root_url }}` for Home and `{{ product.collections.first.url }}` for the collection crumb, guarded by `{% if product.collections.first %}`).
2. **Gallery thumbnails** (`.gallery__thumbs`, originally 5 hardcoded `button.gallery__thumb` with `data-variant` CSS-gradient classes): replace with `{%- for media in product.media limit: 8 -%}<button class="gallery__thumb{% if forloop.first %} is-active{% endif %}" aria-label="View image {{ forloop.index }}" data-media-id="{{ media.id }}"><img src="{{ media | image_url: width: 150 }}" alt="{{ media.alt | default: product.title | escape }}" width="150" height="150" loading="lazy"></button>{%- endfor -%}`.
3. **Gallery main image** (`.gallery__main`, originally a single absolutely-positioned `div.ph-img`): replace with `{%- for media in product.media limit: 8 -%}<img class="gallery__main-image{% if forloop.first %} is-active{% endif %}" data-media-id="{{ media.id }}" src="{{ media | image_url: width: 800 }}" alt="{{ media.alt | default: product.title | escape }}" width="800" height="{{ 800 | divided_by: media.aspect_ratio | default: 800 }}" loading="{% if forloop.first %}eager{% else %}lazy{% endif %}">{%- endfor -%}` (all images render stacked; Step 5 below adds the CSS to show only the active one) — keep the `.gallery__badge` (best-seller badge, reuse the same Sale/Best-Seller logic from `snippets/orniva-product-card.liquid`), `.gallery__wishlist` button, and `.gallery__nav` prev/next buttons unchanged around this.
4. **Product info**: `<h1>` becomes `{{ product.title }}`; rating stays static decorative text (no real data source, same as the card snippet); `.product-info__price` becomes `<span class="price-now">{{ product.price | money }}</span>{% if product.compare_at_price > product.price %}<span class="price-old">{{ product.compare_at_price | money }}</span><span class="discount-badge">{{ product.compare_at_price | minus: product.price | times: 100.0 | divided_by: product.compare_at_price | round }}% OFF</span>{% endif %}`; `.trust-row` blocks and `.info-box`/`.offer-box` marketing copy stay unchanged static text (no real data source).
5. **Color swatches / variant picker**: wrap the whole product form starting here in `{% form 'product', product %}` ... `{% endform %}`. Replace the hardcoded 2 `button.color-swatch` elements with a real loop over the product's first option (commonly named "Color" but read whatever `product.options_with_values[0].name` actually is — do not assume it's literally "Color"): `{%- assign option1 = product.options_with_values[0] -%}{%- if option1 -%}<div class="option-block"><span class="option-block__label">{{ option1.name }}: <span class="option-block__value">{{ product.selected_or_first_available_variant.option1 }}</span></span><div class="color-swatches">{%- for value in option1.values -%}<button type="button" class="color-swatch{% if product.selected_or_first_available_variant.option1 == value %} is-selected{% endif %}" data-option-value="{{ value | escape }}" style="--swatch-color: {{ value | handle }};" aria-label="{{ value }}"></button>{%- endfor -%}</div></div><input type="hidden" name="id" id="orniva-selected-variant-id" value="{{ product.selected_or_first_available_variant.id }}">{%- endif -%}` (this drops the static `--gold`/`--silver` CSS-modifier-class pattern in favor of a `--swatch-color` custom property set from the option value's handle — note this in your report as a deliberate simplification since we can't know in advance which color values a merchant will add).
6. **Quantity stepper**: keep the exact `.qty-stepper` markup, but the `<input>` needs `type="number" name="quantity" value="1" min="1" max="10"` (was a plain text input) so it submits as the form's real quantity.
7. **Add To Cart / Buy It Now**: `button.btn.btn-primary.btn-block` "Add To Cart" becomes `<button type="submit" name="add" class="btn btn-primary btn-block">Add To Cart</button>` (a real submit button inside the `{% form 'product' %}` from point 5); `a.btn.btn-outline.btn-block` "Buy It Now" becomes `{{ form | payment_button }}` placed right after the Add To Cart button, still inside the same form (Shopify's dynamic checkout button — replaces the static `<a>` entirely since payment_button renders its own button element(s)).
8. **Tabs**: Description tab's placeholder paragraph becomes `{{ product.description }}`; keep its `.check-list` bullet points as static copy (no per-product source for those). The other 3 tabs' `.spec-box` rows become metafield reads: `<div class="spec-row">{{ spec_icon_svg }}<strong>SKU:</strong> {{ product.selected_or_first_available_variant.sku }}</div>`, and similarly for Material → `{{ product.metafields.custom.material }}`, Plating → `{{ product.metafields.custom.plating }}`, Stone Type → `{{ product.metafields.custom.stone_type }}`, Weight → `{{ product.metafields.custom.weight }}`, Set Contents → `{{ product.metafields.custom.set_contents }}`, necklace length spec → `{{ product.metafields.custom.necklace_length }}` — keep each row's exact icon SVG and `<strong>Label:</strong>` text from the source, only the value after the label becomes the metafield output. Tabs JS behavior (Task 9 Step 6 below) stays as-is — it only toggles `.is-active` classes, no data changes needed there.
9. **Related products**: replace the 5 hardcoded `article.product-card` elements with `{%- for related in product.recommendations limit: 5 -%}{%- render 'orniva-product-card', product: related -%}{%- endfor -%}`.

- [ ] **Step 1: Delete the old JSON template**

```bash
cd /Users/hiral/Desktop/horizon-theme
rm templates/product.json
```

- [ ] **Step 2: Read the full source file**

Run: `wc -l /Users/hiral/Desktop/orniva-jewelry/product.html` then read the entire file before writing anything.

- [ ] **Step 3: Write templates/product.liquid**

Apply the 9 substitution rules above. Everything not named in those rules (trust-row copy, info-box/offer-box marketing text, check-list bullets, tab button markup/labels, spec-row icons) is copied unchanged.

- [ ] **Step 4: Verify Liquid structure**

```bash
cd /Users/hiral/Desktop/horizon-theme
python3 -c "
s = open('templates/product.liquid').read()
assert s.count('{%') == s.count('%}'), 'unbalanced liquid tags'
assert s.count('{{') == s.count('}}'), 'unbalanced liquid output tags'
print('product.liquid: tag balance OK')
"
grep -c "{% form 'product'" templates/product.liquid
grep -c "{% endform %}" templates/product.liquid
```
Expected: tag balance OK, both form/endform counts equal `1`.

- [ ] **Step 5: Adapt orniva-product.js's gallery-swap logic for real images**

The current gallery logic (in `assets/orniva-product.js`, copied verbatim in Task 2) swaps a CSS class on a single `.gallery__main .ph-img` div:
```js
thumbs.forEach((thumb, index) => {
  thumb.addEventListener("click", () => {
    setActiveThumb(index);
    const variant = thumb.dataset.variant;
    if (mainMedia && variant) {
      mainMedia.className = `ph-img ${variant}`;
    }
  });
});
```
Since Step 3 replaced the single `div.ph-img` with multiple stacked `<img class="gallery__main-image">` elements (one per real media item, matched to thumbnails by `data-media-id`), replace this block in `assets/orniva-product.js` with:
```js
const mainImages = document.querySelectorAll(".gallery__main-image");

const setActiveMainImage = (mediaId) => {
  mainImages.forEach((img) => img.classList.toggle("is-active", img.dataset.mediaId === mediaId));
};

thumbs.forEach((thumb, index) => {
  thumb.addEventListener("click", () => {
    setActiveThumb(index);
    setActiveMainImage(thumb.dataset.mediaId);
  });
});
```
Remove the old `const mainMedia = document.querySelector(".gallery__main .ph-img");` line (it's now unused — the new code queries `.gallery__main-image` elements directly). Leave every other behavior in the file (color swatches, quantity stepper, tabs) completely unchanged — only this one block changes.

- [ ] **Step 6: Add the CSS to show only the active main image**

Append to `assets/orniva-product.css`:
```css
.gallery__main-image {
  display: none;
  width: 100%;
  height: auto;
  object-fit: cover;
}

.gallery__main-image.is-active {
  display: block;
}
```

- [ ] **Step 7: Verify the JS/CSS changes**

```bash
cd /Users/hiral/Desktop/horizon-theme
grep -n "gallery__main-image" assets/orniva-product.js assets/orniva-product.css
grep -n "mainMedia" assets/orniva-product.js
python3 -c "
s = open('assets/orniva-product.css').read()
assert s.count('{') == s.count('}'), 'unbalanced CSS braces'
print('orniva-product.css: CSS OK')
"
```
Expected: `gallery__main-image` appears in both files; the `mainMedia` grep should show ZERO remaining references (confirming the old single-image variable was fully removed, not left as dead code); CSS braces balanced.

- [ ] **Step 8: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add templates/product.liquid assets/orniva-product.js assets/orniva-product.css
git rm templates/product.json
git commit -m "Add templates/product.liquid ported from product.html, adapt gallery JS for real images"
```

---

### Task 10: Push to GitHub

**Files:** none (git remote operation only).

**Interfaces:** Consumes: a one-time fine-grained GitHub PAT for the `girirajdistributor-sketch` account, scoped to the `ORNIVA` repo only, "Contents: Read and write," short expiry — supplied by the user in chat for this step only. (The PAT used for the previous push should be treated as spent/already-used-once; ask the user whether to reuse it or provide a fresh one, and remind them to revoke whichever one is used immediately after this push completes.)

- [ ] **Step 1: Confirm local history is clean**

Run: `cd /Users/hiral/Desktop/horizon-theme && git status && git log --oneline -12`
Expected: working tree clean, showing the Task 1-9 commits on top of the existing history already pushed to `origin`/GitHub.

- [ ] **Step 2: Push using the PAT (never echo it)**

Once the user confirms/pastes their PAT, push it in a single command that pipes the token directly without printing it:
```bash
cd /Users/hiral/Desktop/horizon-theme
TOKEN='<paste-value-here>'
git push "https://girirajdistributor-sketch:${TOKEN}@github.com/girirajdistributor-sketch/ORNIVA.git" main 2>&1 | sed "s/${TOKEN}/[REDACTED]/g"
unset TOKEN
```

- [ ] **Step 3: Verify the push**

Run: `git ls-remote https://github.com/girirajdistributor-sketch/ORNIVA.git`
Expected: `refs/heads/main` matches local `git rev-parse main`.

- [ ] **Step 4: Tell the user to revoke the PAT**

Remind the user to delete/revoke the PAT from GitHub → Settings → Developer settings → Personal access tokens now that the push is done.
