// Hero slider: arrow/dot navigation + optional autoplay

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-hero-slider]").forEach((hero) => {
    const slides = hero.querySelectorAll(".hero__slide");
    if (slides.length <= 1) return;

    const dots = hero.querySelectorAll(".hero__dots span");
    const prevBtn = hero.querySelector(".hero__arrow--prev");
    const nextBtn = hero.querySelector(".hero__arrow--next");
    let index = 0;
    let timer = null;

    const goTo = (newIndex) => {
      slides[index]?.classList.remove("is-active");
      dots[index]?.classList.remove("is-active");
      index = (newIndex + slides.length) % slides.length;
      slides[index]?.classList.add("is-active");
      dots[index]?.classList.add("is-active");
    };

    const startAutoplay = () => {
      if (!hero.hasAttribute("data-autoplay")) return;
      const speed = parseInt(hero.dataset.autoplaySpeed, 10) || 5000;
      timer = setInterval(() => goTo(index + 1), speed);
    };

    const resetAutoplay = () => {
      if (timer) clearInterval(timer);
      startAutoplay();
    };

    prevBtn?.addEventListener("click", () => {
      goTo(index - 1);
      resetAutoplay();
    });

    nextBtn?.addEventListener("click", () => {
      goTo(index + 1);
      resetAutoplay();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        goTo(i);
        resetAutoplay();
      });
    });

    hero.addEventListener("mouseenter", () => timer && clearInterval(timer));
    hero.addEventListener("mouseleave", startAutoplay);

    startAutoplay();
  });
});
