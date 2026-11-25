import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis = null;

export function startSmoothScroll() {
  if (lenis || reducedMotion()) return lenis;
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
  if (import.meta.env.DEV) window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const scrollToTop = () => {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
};

export const lockScroll = (locked) => {
  if (lenis) locked ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
};

/**
 * Watches the DOM for [data-reveal] elements and adds `.is-in` once they
 * enter the viewport. One observer for the whole app.
 */
export function startReveals() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  const scan = (root) => {
    if (root.nodeType !== 1) return;
    if (root.matches?.('[data-reveal]:not(.is-in)')) io.observe(root);
    root.querySelectorAll?.('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
  };
  scan(document.body);
  const mo = new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach(scan)));
  mo.observe(document.body, { childList: true, subtree: true });
  return () => {
    io.disconnect();
    mo.disconnect();
  };
}

export { gsap, ScrollTrigger };
