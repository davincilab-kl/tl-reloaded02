'use client';

import { useEffect, useRef } from 'react';

interface Testimonial {
  quote: string;
  name: string;
  school: string;
  subjects: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    quote: 'Lernen funktioniert nur mit Spaß. Und den hatten die Schüler:innen beim Arbeiten mit der Talentslounge.',
    name: 'Michaela',
    school: 'AHS Theodor Kramer',
    subjects: 'Französisch, Ernährungslehre und Haushaltsökonomie, Wissenschaftliches Arbeiten, Digitale Grundbildung',
    image: 'https://talentslounge.com/wp-content/uploads/2024/04/Michaela.png',
  },
  {
    quote: 'Mit Hilfe der begleitenden Erklärvideos war es selbst für Programmieranfänger möglich, innerhalb kürzester Zeit ein spannendes Spiel auf Scratch zu programmieren.',
    name: 'David',
    school: 'AHS Theodor Kramer',
    subjects: 'Bewegung und Sport, Geschichte, Sozialkunde und Politische Bildung, Digitale Grundbildung',
    image: 'https://talentslounge.com/wp-content/uploads/2024/04/David.png',
  },
  {
    quote: 'Den Schülern und Schülerinnen hat es viel Freude bereitet, mit der Talentslounge zu arbeiten. Die Videos haben das Programmieren ungemein erleichtert, positiv war vor allem auch, dass jedes Kind in seinem eigenen Tempo arbeiten konnte.',
    name: 'Yvonne',
    school: 'MS Brüßlgasse',
    subjects: 'Deutsch, Geographie, Wirtschaftsbildung',
    image: 'https://talentslounge.com/wp-content/uploads/2024/04/Yvonne.png',
  },
  {
    quote: 'Die Talentslounge hat insbesondere meinen Schülerinnen die Konzepte des Programmierens und Codierens auf spielerische Art und Weise vermittelt und verborgene Talente in ihnen hervorgebracht.',
    name: 'Anja',
    school: 'MS Steinergasse',
    subjects: 'Englisch, Biologie, Informatik, Digitale Grundbildung, Bewegung und Sport, Kunst und Gestaltung',
    image: 'https://talentslounge.com/wp-content/uploads/2024/04/Anja.png',
  },
  {
    quote: 'Die Talentslounge bot unseren Schülerinnen und Schülern einen großartigen, motivierenden Einstieg ins Programmieren!',
    name: 'Cornelia B.',
    school: 'MS Albrechtsberg',
    subjects: 'Englisch, Geschichte, Biologie, Digitale Grundbildung',
    image: 'https://talentslounge.com/wp-content/uploads/2024/04/Cornelia-B.png',
  },
  {
    quote: 'Durch die Talentslounge konnte jedes Kind Erfahrung im Programmieren im eigenen Tempo machen. Alle Schüler*innen waren mit Freude und Spaß dabei!',
    name: 'Cornelia W.',
    school: 'MS Albrechtsberg',
    subjects: 'Deutsch, EH, Informatik',
    image: 'https://talentslounge.com/wp-content/uploads/2024/04/Cornelia-W.png',
  },
  {
    quote: 'Mit der Talents Lounge wird das Coden selbst zum Spiel! Eine sehr gelungene und motivierende Initiative!',
    name: 'Hildegard',
    school: 'Gymnasium Seekirchen am Wallersee',
    subjects: 'Französisch, Geschichte, Informatik',
    image: 'https://talentslounge.com/wp-content/uploads/2024/04/Hildegard.png',
  },
  {
    quote: 'Die Talentslounge war wirklich eine tolle Möglichkeit für unsere Schüler:innen das Programmieren sehr einfach und verständlich zu erlernen.',
    name: 'Angelika',
    school: 'MS/PTS Mureck',
    subjects: 'Englisch, Geschichte, Software Entwicklung, Digitale Grundbildung',
    image: 'https://talentslounge.com/wp-content/uploads/2024/04/Angelika.png',
  },
  {
    quote: 'Es war beeindruckend zu sehen, wie schnell sich die Schülerinnen und Schüler selbstständig ins Programmieren eingearbeitet haben.',
    name: 'Carolin',
    school: 'Mittelschule Lingenau',
    subjects: '',
    image: 'https://talentslounge.com/wp-content/uploads/2025/05/Carolin-zajonz_MS_Lingenau_VBG.jpg',
  },
];

export function TestimonialsCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const updateCarouselWidth = () => {
      const items = carousel.querySelectorAll('.testimonial-item');
      if (items.length === 0) return;

      const originalCount = testimonials.length;
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

  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="testimonials-wrapper">
      <div ref={carouselRef} id="testimonials-carousel" className="flex gap-4">
        {duplicatedTestimonials.map((testimonial, i) => (
          <div key={i} className="testimonial-item">
            <div className="flex h-full flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow duration-300">
              <q className="text-gray-600 leading-7 text-base">{testimonial.quote}</q>
              <div className="mt-6 flex gap-4 leading-5">
                <span className="relative flex shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200 size-9">
                  <img
                    className="aspect-square size-full object-cover"
                    alt={testimonial.name}
                    src={testimonial.image}
                    loading="lazy"
                    width="36"
                    height="36"
                  />
                </span>
                <div className="text-sm text-left">
                  <p className="font-medium text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{testimonial.school}</p>
                  {testimonial.subjects && (
                    <p className="text-gray-500 text-xs">{testimonial.subjects}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
