// Cart page: quantity stepper buttons adjust the input value; submitting
// the form (Update Cart / Checkout) is what actually applies the change.

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".cart-page__item-qty .qty-stepper").forEach((stepper) => {
    const input = stepper.querySelector("input");
    const decreaseBtn = stepper.querySelector(".qty-decrease");
    const increaseBtn = stepper.querySelector(".qty-increase");

    decreaseBtn?.addEventListener("click", () => {
      input.value = Math.max(0, parseInt(input.value, 10) - 1);
    });

    increaseBtn?.addEventListener("click", () => {
      input.value = parseInt(input.value, 10) + 1;
    });
  });
});
