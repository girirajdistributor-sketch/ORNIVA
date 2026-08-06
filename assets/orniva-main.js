// Shared behavior across all pages: mobile nav toggle + filter sidebar toggle

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");
  const navBackdrop = document.querySelector(".nav-backdrop");

  const closeNav = () => {
    mainNav?.classList.remove("is-open");
    navBackdrop?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = mainNav?.classList.toggle("is-open");
    navBackdrop?.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  navBackdrop?.addEventListener("click", closeNav);

  document.querySelectorAll(".main-nav__list a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  const filtersToggle = document.querySelector(".filters-toggle");
  const filters = document.querySelector(".filters");

  filtersToggle?.addEventListener("click", () => {
    const isOpen = filters?.classList.toggle("is-open");
    filtersToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  const viewToggleButtons = document.querySelectorAll(".view-toggle button");
  const productGrid = document.querySelector(".product-grid");

  viewToggleButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      viewToggleButtons.forEach((b) => {
        b.classList.toggle("is-active", b === button);
        b.setAttribute("aria-pressed", String(b === button));
      });
      productGrid?.classList.toggle("is-list-view", index === 1);
    });
  });

  const searchToggle = document.querySelector("[data-search-toggle]");
  const searchPanel = document.querySelector("[data-search-panel]");
  const searchInput = document.querySelector("[data-search-input]");

  const closeSearch = () => {
    if (!searchPanel || searchPanel.hidden) return;
    searchPanel.hidden = true;
    searchToggle?.setAttribute("aria-expanded", "false");
  };

  searchToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = searchPanel?.hidden === false;
    if (searchPanel) searchPanel.hidden = isOpen;
    searchToggle.setAttribute("aria-expanded", String(!isOpen));
    if (!isOpen) searchInput?.focus();
  });

  searchPanel?.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", closeSearch);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSearch();
  });
});
