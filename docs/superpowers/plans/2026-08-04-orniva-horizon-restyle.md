# Orniva Horizon Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the cloned Shopify Horizon theme at `/Users/hiral/Desktop/horizon-theme` with Orniva Jewels' brand (colors, fonts, header, home page, collection page, product page), using the static reference site at `/Users/hiral/Desktop/orniva-jewelry` as the visual source of truth, so the theme can be pushed to `github.com/girirajdistributor-sketch/ORNIVA` and installed on a Shopify store.

**Architecture:** Horizon is Online Store 2.0 — pages are JSON templates (`templates/*.json`) assembling reusable Liquid sections/blocks, styled with inline `{% stylesheet %}` blocks and CSS custom properties, not separate theme-wide CSS files. Rather than repainting Horizon's entire design system, we add one new site-wide CSS asset (`assets/orniva-tokens.css`) with **scoped overrides limited to the 4 requested surfaces** (header, home, collection, product) — footer, cart drawer, search modal, blog, etc. are left as Horizon's defaults. Content differences (copy, nav links, feature strip, announcement text) are made through each section/block's existing JSON settings and schema, not by inventing new section types where Horizon already has an equivalent.

**Tech Stack:** Shopify Horizon theme (Liquid, Online Store 2.0 JSON templates/sections/blocks), plain CSS, Google Fonts (Playfair Display, Poppins).

## Global Constraints

- Reference design lives in `/Users/hiral/Desktop/orniva-jewelry` — do not edit those files; they are the spec, not the target.
- All theme edits happen in `/Users/hiral/Desktop/horizon-theme` (a git repo, shallow clone of `Shopify/horizon`).
- CSS overrides go only in the new `assets/orniva-tokens.css`, scoped to the classes named in each task below. Do not add global overrides of Horizon's own `--color-*`/`--font-*` root variables — that would repaint sections out of scope (footer, cart drawer, blog, search).
- No Shopify CLI and no store connection are available in this environment. There is no Liquid linter. Every task's "test" step is therefore one of: (a) JSON validity via `python3 -m json.tool`, (b) a brace-balance sanity check for CSS, or (c) a manual diff review against the reference file/line cited in the task. This is a known limitation — real visual verification happens once the user previews the theme in Shopify Admin or via Shopify CLI.
- Color tokens (from `orniva-jewelry/css/base.css`): `--color-bg:#faf6ee; --color-bg-alt:#f5ece0; --color-surface:#fff; --color-black:#1a1714; --color-text:#2b2521; --color-text-light:#6f655c; --color-border:#e9e0d3; --color-gold:#b8860b; --color-gold-light:#d9a441;`
- Fonts: `--font-serif: "Playfair Display", Georgia, serif;` `--font-sans: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;`
- Wishlist: header keeps a static (non-functional) wishlist icon — no app integration.
- Pushing to GitHub is the last task and requires a one-time PAT from the user, used once and never echoed to output.

---

### Task 1: Brand tokens — fonts and color variables

**Files:**
- Create: `assets/orniva-tokens.css`
- Modify: `snippets/stylesheets.liquid` (currently 2 lines; add one line)
- Modify: `layout/theme.liquid:40` (add Google Fonts `<link>` tags right after the existing `{%- render 'fonts' -%}` line)

**Interfaces:**
- Produces: CSS custom properties `--orniva-color-bg`, `--orniva-color-bg-alt`, `--orniva-color-surface`, `--orniva-color-black`, `--orniva-color-text`, `--orniva-color-text-light`, `--orniva-color-border`, `--orniva-color-gold`, `--orniva-color-gold-light`, `--orniva-font-serif`, `--orniva-font-sans`, declared on `:root` in `assets/orniva-tokens.css`. Every later task's CSS overrides reference these variables instead of hardcoded values.

- [ ] **Step 1: Read the current stylesheet loader**

Run: `cat /Users/hiral/Desktop/horizon-theme/snippets/stylesheets.liquid`
Expected output (2 lines, confirm before editing):
```
{{ 'overflow-list.css' | asset_url | preload_tag: as: 'style' }}
{{ 'base.css' | global_asset_url | stylesheet_tag }}
```

- [ ] **Step 2: Create the brand tokens CSS file**

Create `/Users/hiral/Desktop/horizon-theme/assets/orniva-tokens.css`:

```css
/* Orniva Jewels brand tokens — scoped overrides for header, home, collection, product only */
:root {
  --orniva-color-bg: #faf6ee;
  --orniva-color-bg-alt: #f5ece0;
  --orniva-color-surface: #ffffff;
  --orniva-color-black: #1a1714;
  --orniva-color-text: #2b2521;
  --orniva-color-text-light: #6f655c;
  --orniva-color-border: #e9e0d3;
  --orniva-color-gold: #b8860b;
  --orniva-color-gold-light: #d9a441;
  --orniva-font-serif: "Playfair Display", Georgia, serif;
  --orniva-font-sans: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

- [ ] **Step 3: Load Google Fonts**

In `/Users/hiral/Desktop/horizon-theme/layout/theme.liquid`, immediately after line 40 (`{%- render 'fonts' -%}`), insert:

```liquid
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

- [ ] **Step 4: Wire the new stylesheet into the site-wide loader**

In `/Users/hiral/Desktop/horizon-theme/snippets/stylesheets.liquid`, append a new line after the existing `base.css` line:

```liquid
{{ 'orniva-tokens.css' | asset_url | stylesheet_tag }}
```

- [ ] **Step 5: Verify — brace balance and file wiring**

Run:
```bash
cd /Users/hiral/Desktop/horizon-theme
python3 -c "
s = open('assets/orniva-tokens.css').read()
assert s.count('{') == s.count('}'), 'unbalanced braces'
print('CSS OK')
"
grep -n "orniva-tokens.css" snippets/stylesheets.liquid
grep -n "fonts.googleapis.com" layout/theme.liquid
```
Expected: "CSS OK" printed, and both grep commands print a matching line (not empty).

- [ ] **Step 6: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add assets/orniva-tokens.css snippets/stylesheets.liquid layout/theme.liquid
git commit -m "Add Orniva brand tokens and Google Fonts"
```

---

### Task 2: Header — logo wordmark, tagline, nav, icons, wishlist placeholder

**Files:**
- Modify: `blocks/_header-logo.liquid` (add tagline markup + CSS, inside existing `{% stylesheet %}` block at lines 83-139)
- Modify: `snippets/header-actions.liquid` (insert a wishlist link between the account block ending at line 113 and the cart block starting at line 116)
- Modify: `assets/orniva-tokens.css` (append header override rules)

**Interfaces:**
- Consumes: `--orniva-color-*`, `--orniva-font-*` from [[Task 1]].
- Produces: `.header-logo__tagline` class, `.header-actions__action--wishlist` class — later tasks don't depend on these, but note them here so a reviewer can find every new class introduced.

**Context:** `blocks/_header-logo.liquid` already renders `shop.name` as a text fallback when no logo image is set (`render 'image', ..., text_fallback: shop.name`), so the "ORNIVA" wordmark needs no code change — it comes from the store's name, set in Shopify Admin → Settings → General (tell the user this if not already "Orniva Jewels" or "ORNIVA"). We only need to add the tagline line under it.

- [ ] **Step 1: Add the tagline markup to the logo block**

In `/Users/hiral/Desktop/horizon-theme/blocks/_header-logo.liquid`, after the closing `</span>` at line 64 (end of the `header-logo__image-container--original` span) and before the `{% if use_inverse_logo %}` at line 66, insert:

```liquid
  <span class="header-logo__tagline">Shine Every Day</span>
```

- [ ] **Step 2: Style the tagline**

In the same file's `{% stylesheet %}` block (starts line 83), after the `.header-logo` rule's closing `}` (around line 119), add:

```css
  .header-logo {
    flex-direction: column;
    line-height: 1.1;
  }

  .header-logo__tagline {
    display: block;
    font-family: var(--orniva-font-sans);
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    color: var(--orniva-color-text-light);
    text-transform: uppercase;
    margin-top: 2px;
  }
```

Note: the `.header-logo { flex-direction: column; }` rule here is a duplicate selector inside the same stylesheet block as the original `.header-logo` rule (lines 84-119) — CSS allows this; the later declaration wins for the properties it sets (`flex-direction`, `line-height`) while the earlier rule's other properties (`display: flex`, `font-size`, etc.) still apply. This is intentional and avoids editing the original rule's internals.

- [ ] **Step 3: Add a static wishlist icon to header actions**

In `/Users/hiral/Desktop/horizon-theme/snippets/header-actions.liquid`, after line 113 (the `</div>` closing the `account-button` div) and before line 115 (blank line before the cart `{% if %}`), insert:

```liquid
  <a
    href="#"
    class="header-actions__action header-actions__action--wishlist"
    aria-label="Wishlist"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
    </svg>
  </a>
```

- [ ] **Step 4: Add header CSS overrides**

Append to `/Users/hiral/Desktop/horizon-theme/assets/orniva-tokens.css`:

```css
/* Header */
.header-logo {
  font-family: var(--orniva-font-serif);
  color: var(--orniva-color-gold) !important;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.menu-list__link:hover,
.menu-list__link[aria-current="page"] {
  color: var(--orniva-color-gold) !important;
}

.header-actions__action svg {
  stroke: var(--orniva-color-black);
}

.header-actions__action--wishlist svg {
  width: 20px;
  height: 20px;
}
```

- [ ] **Step 5: Verify**

Run:
```bash
cd /Users/hiral/Desktop/horizon-theme
grep -n "header-logo__tagline" blocks/_header-logo.liquid
grep -n "header-actions__action--wishlist" snippets/header-actions.liquid
python3 -c "
s = open('assets/orniva-tokens.css').read()
assert s.count('{') == s.count('}'), 'unbalanced braces'
print('CSS OK')
"
```
Expected: both grep commands return a match, "CSS OK" printed.

- [ ] **Step 6: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add blocks/_header-logo.liquid snippets/header-actions.liquid assets/orniva-tokens.css
git commit -m "Restyle header: tagline, wishlist icon, brand colors/fonts"
```

---

### Task 3: Announcement bar — Orniva's 3 rotating messages

**Files:**
- Modify: `sections/header-group.json`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure JSON content configuration).

**Context:** `blocks/_announcement.liquid` (the block type used by `header-announcements`) exposes `text` (`inline_richtext`) and `link` (`url`) settings — no icon picker exists, so the original SVG icons are replaced with a leading unicode glyph as a simplification (deliberate design decision, not an oversight).

- [ ] **Step 1: Read the current announcement block**

Run: `cat /Users/hiral/Desktop/horizon-theme/sections/header-group.json`
Confirm it currently has one block, `announcement_BxgCk9`, under `header_announcements_9jGBFp.blocks`, with `"text": "Welcome to our store"`.

- [ ] **Step 2: Replace the single block with three**

In `sections/header-group.json`, find the `header_announcements_9jGBFp` section's `"blocks"` object (currently containing only `announcement_BxgCk9`) and its `"block_order"` array. Replace both so the section reads:

```json
"header_announcements_9jGBFp": {
  "type": "header-announcements",
  "blocks": {
    "announcement_BxgCk9": {
      "type": "_announcement",
      "settings": {
        "text": "✦ Shine Every Day ✦"
      }
    },
    "announcement_free_ship": {
      "type": "_announcement",
      "settings": {
        "text": "FREE SHIPPING ON ORDERS ABOVE ₹999"
      }
    },
    "announcement_cod": {
      "type": "_announcement",
      "settings": {
        "text": "COD AVAILABLE"
      }
    }
  },
  "block_order": ["announcement_BxgCk9", "announcement_free_ship", "announcement_cod"],
  "settings": {}
}
```

Keep any `"settings"` keys that already exist on `header_announcements_9jGBFp` (e.g. `speed`, `background_color` if present) — only replace `blocks` and `block_order`, don't drop other existing keys.

- [ ] **Step 3: Verify JSON validity**

Run:
```bash
cd /Users/hiral/Desktop/horizon-theme
python3 -m json.tool sections/header-group.json > /dev/null && echo "JSON OK"
```
Expected: "JSON OK" with no error output.

- [ ] **Step 4: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add sections/header-group.json
git commit -m "Configure Orniva announcement bar messages"
```

---

### Task 4: Home page — hero copy and feature strip

**Files:**
- Modify: `templates/index.json`
- Modify: `assets/orniva-tokens.css` (append home page override rules)
- Read (research, no edit): `sections/section.liquid`, and whichever block files it composes with (look for `blocks/_group.liquid`, `blocks/_icon.liquid`, `blocks/_text.liquid` in `/Users/hiral/Desktop/horizon-theme/blocks/`)

**Interfaces:**
- Consumes: `--orniva-color-*`, `--orniva-font-*` from [[Task 1]].

**Context:** `templates/index.json` currently has `hero_jVaWmY` (hero) and `product_list_fa6P9H` (product-list) in that order. The hero block system is generic (`text`, `button`, `image` blocks), not fixed heading/subheading fields. There is no dedicated "feature strip" section type in this Horizon version — the idiomatic way to build a 4-item icon+title+description row is a `section` (from `sections/section.liquid`) containing 4 `group` blocks, each holding an `icon` block and `text` blocks. Read the schemas below before writing JSON, because their exact setting IDs are not yet confirmed.

- [ ] **Step 1: Research the generic section/group/icon block schemas**

Run:
```bash
cd /Users/hiral/Desktop/horizon-theme
sed -n '/{% schema %}/,/{% endschema %}/p' sections/section.liquid
ls blocks/ | grep -iE "group|icon|text"
sed -n '/{% schema %}/,/{% endschema %}/p' blocks/_group.liquid 2>/dev/null
sed -n '/{% schema %}/,/{% endschema %}/p' blocks/_icon.liquid 2>/dev/null
```
Note down: the `section` type's name/tag, the `group` block's layout setting id (e.g. direction/alignment), and the `icon` block's icon-picker setting id and any accompanying label/text setting id. Use these exact IDs in Step 2 — do not guess.

- [ ] **Step 2: Update the hero block copy**

In `templates/index.json`, under `hero_jVaWmY.blocks.text_YLPk4p.settings`, change `"text"` from `"<p>Browse our latest products</p>"` to `"<h1>Shine Every Day</h1><p>Timeless Designs, Unmatched You.</p>"`. Under `hero_jVaWmY.blocks.button_H9gpTf.settings`, change `"label"` from `"Shop all"` to `"Shop Now"` (leave `"link"` as-is unless the user has a specific collection handle for it — flag this to the user as a follow-up: they should point it at their real "Necklaces" or "All" collection once products exist).

- [ ] **Step 3: Add the feature strip section**

Using the exact block/setting IDs found in Step 1, add a new entry to `templates/index.json`'s top-level `sections` object — call its key `feature_strip_orniva`, type `"section"` — with 4 `group` blocks, each containing an `icon` block plus two `text` blocks (title, description), for:
1. Premium Quality — "Finest craftsmanship & materials"
2. Tarnish Free — "Long lasting shine"
3. Beautiful Packaging — "Perfect for gifting"
4. Fast Delivery — "Across India"

Add `"feature_strip_orniva"` to the `"order"` array, positioned after `"hero_jVaWmY"` and before `"product_list_fa6P9H"`.

- [ ] **Step 4: Add feature strip CSS**

Append to `assets/orniva-tokens.css` (adjust the selector prefix in Step 3's JSON — `section-feature_strip_orniva` — if the actual rendered class differs; confirm by grepping `sections/section.liquid` for how it builds its wrapper class from `section.id`):

```css
/* Home — feature strip */
#shopify-section-feature_strip_orniva {
  background: var(--orniva-color-bg-alt);
  border-block: 1px solid var(--orniva-color-border);
}

#shopify-section-feature_strip_orniva .header-logo__tagline,
#shopify-section-feature_strip_orniva p {
  font-family: var(--orniva-font-sans);
  color: var(--orniva-color-text-light);
}
```

- [ ] **Step 5: Verify**

Run:
```bash
cd /Users/hiral/Desktop/horizon-theme
python3 -m json.tool templates/index.json > /dev/null && echo "JSON OK"
python3 -c "
s = open('assets/orniva-tokens.css').read()
assert s.count('{') == s.count('}'), 'unbalanced braces'
print('CSS OK')
"
```
Expected: both "JSON OK" and "CSS OK", no errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add templates/index.json assets/orniva-tokens.css
git commit -m "Configure home page hero copy and feature strip"
```

---

### Task 5: Collection template (Necklaces and every other collection) — filters and grid styling

**Files:**
- Modify: `templates/collection.json`
- Modify: `assets/orniva-tokens.css` (append collection page override rules)

**Interfaces:**
- Consumes: `--orniva-color-*`, `--orniva-font-*` from [[Task 1]]. Real class names from prior research: grid wrapper `.results-list.section.product-grid-container`, grid list `.product-grid`, filter wrapper `.facets-block-wrapper`, `.facets__form-wrapper`, `.facets__panel`, `.facets__summary`, `.facets__label`, `.facets__inputs-list`.

**Context:** There is exactly one collection template in Horizon — it renders for every collection (Necklaces, Earrings, etc.), matching the design spec's note that we don't build a bespoke "necklaces page."

- [ ] **Step 1: Update grid density and filter layout to match the reference design**

In `templates/collection.json`, under the `main` section's `"settings"`, set `"product_card_size": "medium"` and confirm/set `"layout_type": "grid"` (matches `necklaces.html`'s product grid). `necklaces.html` uses a left sidebar filter panel, not a horizontal bar, so on the `filters` block's `"settings"` set `"filter_style": "vertical"` (confirmed valid values in `blocks/filters.liquid`: `"horizontal"` | `"vertical"`). Note: `"filter_width"` only applies when `filter_style` is `"horizontal"` (it's hidden via `visible_if` otherwise) — remove/ignore it once `filter_style` is `"vertical"`.

- [ ] **Step 2: Add collection page CSS overrides**

Append to `assets/orniva-tokens.css`:

```css
/* Collection page */
.results-list.product-grid-container {
  background: var(--orniva-color-bg);
}

.facets__summary,
.facets__label {
  font-family: var(--orniva-font-sans);
  color: var(--orniva-color-text);
}

.facets__clear-all-link,
.facets__clear-all {
  color: var(--orniva-color-gold);
}

.product-grid .card-information__text,
.product-grid .price {
  font-family: var(--orniva-font-sans);
  color: var(--orniva-color-text);
}
```

- [ ] **Step 3: Verify**

Run:
```bash
cd /Users/hiral/Desktop/horizon-theme
python3 -m json.tool templates/collection.json > /dev/null && echo "JSON OK"
python3 -c "
s = open('assets/orniva-tokens.css').read()
assert s.count('{') == s.count('}'), 'unbalanced braces'
print('CSS OK')
"
```
Expected: both "JSON OK" and "CSS OK".

- [ ] **Step 4: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add templates/collection.json assets/orniva-tokens.css
git commit -m "Restyle collection template filters and product grid"
```

---

### Task 6: Product template — gallery and buy box styling

**Files:**
- Modify: `templates/product.json`
- Modify: `assets/orniva-tokens.css` (append product page override rules)

**Interfaces:**
- Consumes: `--orniva-color-*`, `--orniva-font-*` from [[Task 1]]. Real class names from prior research: `.product-information__grid` (with modifiers `--media-left`/`--media-right`/`--half`), `.product-information__media`.

- [ ] **Step 1: Match the reference layout's media position and column split**

In `templates/product.json`, under the `main` section's `"settings"`, set `"desktop_media_position": "left"` (gallery on the left, matching `product.html`) and `"equal_columns": true` (50/50 split, matching the reference two-column layout). Both confirmed as valid setting IDs/values in `sections/product-information.liquid`'s schema (`desktop_media_position` options: `left`/`right`; `equal_columns` is a checkbox).

- [ ] **Step 2: Add product page CSS overrides**

Append to `assets/orniva-tokens.css`:

```css
/* Product page */
.product-information__grid h1 {
  font-family: var(--orniva-font-serif);
  color: var(--orniva-color-black);
}

.product-information__grid .price {
  color: var(--orniva-color-gold);
  font-weight: 600;
}

.product-information__grid button[type="submit"] {
  background: var(--orniva-color-gold);
  border-color: var(--orniva-color-gold);
}
```

- [ ] **Step 3: Verify**

Run:
```bash
cd /Users/hiral/Desktop/horizon-theme
python3 -m json.tool templates/product.json > /dev/null && echo "JSON OK"
python3 -c "
s = open('assets/orniva-tokens.css').read()
assert s.count('{') == s.count('}'), 'unbalanced braces'
print('CSS OK')
"
```
Expected: both "JSON OK" and "CSS OK".

- [ ] **Step 4: Commit**

```bash
cd /Users/hiral/Desktop/horizon-theme
git add templates/product.json assets/orniva-tokens.css
git commit -m "Restyle product template gallery and buy box"
```

---

### Task 7: Push to GitHub

**Files:** none (git remote operation only).

**Interfaces:** Consumes: a one-time fine-grained GitHub PAT for the `girirajdistributor-sketch` account, scoped to the `ORNIVA` repo only, "Contents: Read and write," short expiry — supplied by the user in chat for this step only.

- [ ] **Step 1: Confirm local history is clean**

Run: `cd /Users/hiral/Desktop/horizon-theme && git status && git log --oneline -8`
Expected: working tree clean, showing the 6 commits from Tasks 1-6 on top of Horizon's initial commit.

- [ ] **Step 2: Add the ORNIVA remote**

Run: `cd /Users/hiral/Desktop/horizon-theme && git remote add orniva https://github.com/girirajdistributor-sketch/ORNIVA.git`

- [ ] **Step 3: Push using the one-time PAT (never echo it)**

Once the user pastes their PAT, push it in a single command that pipes the token directly without printing it, e.g.:
```bash
cd /Users/hiral/Desktop/horizon-theme
git push "https://girirajdistributor-sketch:${ORNIVA_PAT}@github.com/girirajdistributor-sketch/ORNIVA.git" main
```
(set `ORNIVA_PAT` as a shell variable from the user's pasted value immediately before this command, in the same tool call, and do not print the variable's value at any point).

- [ ] **Step 4: Verify the push**

Run: `git ls-remote https://github.com/girirajdistributor-sketch/ORNIVA.git`
Expected: shows `refs/heads/main` pointing at the same commit as local `git rev-parse main`.

- [ ] **Step 5: Tell the user to revoke the PAT**

Remind the user to delete/revoke the PAT from GitHub → Settings → Developer settings → Personal access tokens now that the push is done.
