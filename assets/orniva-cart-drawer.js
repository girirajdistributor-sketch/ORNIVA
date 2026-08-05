// Cart drawer: AJAX add/update/remove via Shopify's Cart API, no page reload

(() => {
  const drawer = document.getElementById("cart-drawer");
  if (!drawer) return;

  const backdrop = document.querySelector("[data-cart-drawer-backdrop]");
  const body = drawer.querySelector("[data-cart-drawer-body]");
  const footer = drawer.querySelector("[data-cart-drawer-footer]");
  const closeButtons = () => drawer.querySelectorAll("[data-cart-drawer-close]");
  const cartCountEls = () => document.querySelectorAll(".cart-count");

  const formatMoney = (cents) => "₹" + Math.round(cents / 100).toLocaleString("en-IN");

  const openDrawer = () => {
    drawer.classList.add("is-open");
    backdrop?.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    drawer.querySelector(".cart-drawer__close")?.focus();
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    drawer.classList.remove("is-open");
    backdrop?.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const updateCartCount = (count) => {
    cartCountEls().forEach((el) => (el.textContent = count));
  };

  const itemMarkup = (item) => {
    const variantLine =
      item.variant_title && item.variant_title !== "Default Title"
        ? `<div class="cart-drawer__item-variant">${item.variant_title}</div>`
        : "";
    const imageMarkup = item.image
      ? `<img src="${item.image}&width=160" alt="${(item.product_title || "").replace(/"/g, "&quot;")}" width="80" height="80" loading="lazy">`
      : "";

    return `
      <li class="cart-drawer__item" data-cart-item-key="${item.key}">
        <a href="${item.url}" class="cart-drawer__item-image">${imageMarkup}</a>
        <div class="cart-drawer__item-info">
          <a href="${item.url}" class="cart-drawer__item-title">${item.product_title}</a>
          ${variantLine}
          <div class="cart-drawer__item-price">${formatMoney(item.final_price)}</div>
          <div class="cart-drawer__item-controls">
            <div class="cart-drawer__qty-stepper">
              <button type="button" data-cart-qty-decrease aria-label="Decrease quantity">&minus;</button>
              <input type="number" value="${item.quantity}" min="0" data-cart-qty-input aria-label="Quantity">
              <button type="button" data-cart-qty-increase aria-label="Increase quantity">&plus;</button>
            </div>
            <button type="button" class="cart-drawer__item-remove" data-cart-item-remove aria-label="Remove item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </li>
    `;
  };

  const renderCart = (cart) => {
    if (cart.item_count === 0) {
      body.innerHTML = `
        <div class="cart-drawer__empty">
          <p>Your cart is empty.</p>
          <a href="/collections/all" class="btn btn-primary" data-cart-drawer-close>Continue Shopping</a>
        </div>
      `;
      if (footer) footer.hidden = true;
    } else {
      body.innerHTML = `<ul class="cart-drawer__items" data-cart-drawer-items>${cart.items.map(itemMarkup).join("")}</ul>`;
      if (footer) {
        footer.hidden = false;
        const subtotal = footer.querySelector("[data-cart-subtotal]");
        if (subtotal) subtotal.textContent = formatMoney(cart.total_price);
      }
    }
    updateCartCount(cart.item_count);
    body.querySelectorAll("[data-cart-drawer-close]").forEach((el) => el.addEventListener("click", closeDrawer));
  };

  const fetchCart = () => fetch("/cart.js").then((res) => res.json());

  const refreshDrawer = () => fetchCart().then(renderCart);

  const changeItem = (key, quantity) => {
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: key, quantity }),
    })
      .then((res) => res.json())
      .then(renderCart);
  };

  closeButtons().forEach((btn) => btn.addEventListener("click", closeDrawer));
  backdrop?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  });

  document.querySelectorAll("[data-cart-drawer-toggle]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openDrawer();
      refreshDrawer();
    });
  });

  body.addEventListener("click", (e) => {
    const item = e.target.closest("[data-cart-item-key]");
    if (!item) return;
    const key = item.dataset.cartItemKey;
    const input = item.querySelector("[data-cart-qty-input]");

    if (e.target.closest("[data-cart-qty-decrease]")) {
      changeItem(key, Math.max(0, (parseInt(input.value, 10) || 0) - 1));
    } else if (e.target.closest("[data-cart-qty-increase]")) {
      changeItem(key, (parseInt(input.value, 10) || 0) + 1);
    } else if (e.target.closest("[data-cart-item-remove]")) {
      changeItem(key, 0);
    } else if (e.target.closest("[data-cart-drawer-close]")) {
      closeDrawer();
    }
  });

  body.addEventListener("change", (e) => {
    if (!e.target.matches("[data-cart-qty-input]")) return;
    const item = e.target.closest("[data-cart-item-key]");
    changeItem(item.dataset.cartItemKey, Math.max(0, parseInt(e.target.value, 10) || 0));
  });

  // Product page: add to cart via AJAX, then open the drawer
  const addToCartForm = document.getElementById("orniva-product-form");
  if (addToCartForm) {
    addToCartForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitButton = addToCartForm.querySelector('button[name="add"]');
      submitButton?.setAttribute("disabled", "disabled");

      fetch("/cart/add.js", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(addToCartForm),
      })
        .then((res) => {
          if (!res.ok) throw new Error("add-to-cart failed");
          return res.json();
        })
        .then(() => {
          openDrawer();
          return refreshDrawer();
        })
        .catch(() => {
          addToCartForm.submit();
        })
        .finally(() => {
          submitButton?.removeAttribute("disabled");
        });
    });
  }
})();
