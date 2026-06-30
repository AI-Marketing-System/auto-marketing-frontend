import { useEffect } from 'react';

/**
 * Activates the fade/slide-up animation on every element with the
 * `.reveal` class once it scrolls into view. Mirrors the original
 * IntersectionObserver logic from the static prototype.
 *
 * Usage: call this once at the top of HomePage (or any page that
 * renders sections using the shared `.reveal` class from globals.css).
 */
export default function useScrollReveal(deps = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },

      { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
