// Product detail page behavior: image gallery, quantity stepper, color
// swatches, and description tabs.

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Gallery ---------- */
  const thumbs = document.querySelectorAll(".gallery__thumb");
  const mainImages = document.querySelectorAll(".gallery__main-image");

  const setActiveThumb = (index) => {
    thumbs.forEach((thumb, i) => thumb.classList.toggle("is-active", i === index));
  };

  const setActiveMainImage = (mediaId) => {
    mainImages.forEach((img) => img.classList.toggle("is-active", img.dataset.mediaId === mediaId));
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      setActiveThumb(index);
      setActiveMainImage(thumb.dataset.mediaId);
    });
  });

  const prevBtn = document.querySelector(".gallery__nav .gallery__prev");
  const nextBtn = document.querySelector(".gallery__nav .gallery__next");

  const activeIndex = () =>
    Math.max(0, [...thumbs].findIndex((t) => t.classList.contains("is-active")));

  const goToThumb = (delta) => {
    if (!thumbs.length) return;
    const next = (activeIndex() + delta + thumbs.length) % thumbs.length;
    thumbs[next].dispatchEvent(new Event("click"));
  };

  prevBtn?.addEventListener("click", () => goToThumb(-1));
  nextBtn?.addEventListener("click", () => goToThumb(1));

  /* ---------- Color swatches ---------- */
  document.querySelectorAll(".color-swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("is-selected"));
      swatch.classList.add("is-selected");
    });
  });

  /* ---------- Quantity stepper ---------- */
  const qtyInput = document.querySelector(".qty-stepper input");
  const decreaseBtn = document.querySelector(".qty-stepper .qty-decrease");
  const increaseBtn = document.querySelector(".qty-stepper .qty-increase");
  const MIN_QTY = 1;
  const MAX_QTY = 10;

  const clampQty = (value) => Math.min(MAX_QTY, Math.max(MIN_QTY, value));

  decreaseBtn?.addEventListener("click", () => {
    if (!qtyInput) return;
    qtyInput.value = clampQty(parseInt(qtyInput.value, 10) - 1);
  });

  increaseBtn?.addEventListener("click", () => {
    if (!qtyInput) return;
    qtyInput.value = clampQty(parseInt(qtyInput.value, 10) + 1);
  });

  qtyInput?.addEventListener("change", () => {
    const parsed = parseInt(qtyInput.value, 10);
    qtyInput.value = clampQty(Number.isNaN(parsed) ? MIN_QTY : parsed);
  });

  /* ---------- Tabs ---------- */
  const tabButtons = document.querySelectorAll(".tabs__nav button");
  const tabPanels = document.querySelectorAll(".tabs__panel");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;

      tabButtons.forEach((b) => b.classList.toggle("is-active", b === button));
      tabPanels.forEach((panel) =>
        panel.classList.toggle("is-active", panel.id === target)
      );
    });
  });

  /* ---------- Related products ---------- */
  document.querySelectorAll("[data-related-products]").forEach((container) => {
    const url = container.dataset.url;
    if (!url) return;

    fetch(url)
      .then((res) => res.text())
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const newTrack = doc.querySelector(".product-carousel__track");
        const currentTrack = container.querySelector(".product-carousel__track");

        if (newTrack && newTrack.children.length && currentTrack) {
          currentTrack.innerHTML = newTrack.innerHTML;
        } else {
          container.hidden = true;
        }
      })
      .catch(() => {
        container.hidden = true;
      });
  });
});
