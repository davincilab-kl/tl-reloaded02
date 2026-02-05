import { useEffect } from 'react';

export function useTestimonialsCarousel() {
  useEffect(() => {
    const carousel = document.getElementById('testimonials-carousel');
    if (!carousel) return;

    const updateCarouselWidth = () => {
      const items = carousel.querySelectorAll('.testimonial-item');
      if (items.length === 0) return;

      const originalCount = 9;
      const gap = 16;
      const wrapper = carousel.parentElement;
      const wrapperWidth = wrapper?.getBoundingClientRect().width ?? window.innerWidth;

      let itemWidth: number;
      if (window.innerWidth >= 1024) {
        itemWidth = (wrapperWidth - gap) / 2;
      } else if (window.innerWidth >= 768) {
        itemWidth = (wrapperWidth - gap) * 0.66666;
      } else {
        itemWidth = wrapperWidth;
      }

      items.forEach((item) => {
        const htmlItem = item as HTMLElement;
        htmlItem.style.width = `${itemWidth}px`;
        htmlItem.style.flexBasis = `${itemWidth}px`;
        htmlItem.style.minWidth = `${itemWidth}px`;
      });

      const totalWidth = itemWidth * originalCount + gap * (originalCount - 1);
      if (totalWidth > 0) {
        carousel.style.setProperty('--scroll-distance', `-${totalWidth}px`);
      }
    };

    requestAnimationFrame(() => {
      updateCarouselWidth();
      const images = carousel.querySelectorAll('img');
      let loaded = 0;
      const total = images.length;

      if (total > 0) {
        images.forEach((img) => {
          if (img.complete) {
            loaded++;
          } else {
            img.addEventListener('load', () => {
              loaded++;
              if (loaded === total) setTimeout(updateCarouselWidth, 100);
            }, { once: true });
          }
        });
        if (loaded === total) setTimeout(updateCarouselWidth, 100);
      }
      setTimeout(updateCarouselWidth, 300);
    });

    let timeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(updateCarouselWidth, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, []);
}
