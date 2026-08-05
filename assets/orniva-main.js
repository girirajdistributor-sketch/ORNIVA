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
});
