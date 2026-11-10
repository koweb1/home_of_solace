import { gsap } from "@/lib/gsap";

/**
 * Smoothly scrolls to a section ("#rooms") or to a pixel position (0 = top).
 * Returns false when the target does not exist yet, so the caller can
 * let the browser handle the link normally.
 */
export function scrollToSection(target: string | number): boolean {
  let y: number | HTMLElement;

  if (typeof target === "number") {
    y = target;
  } else {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) return false;
    y = el;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  gsap.to(window, {
    scrollTo: { y, autoKill: true },
    duration: reduced ? 0 : 1.6,
    ease: "power3.inOut",
    overwrite: true,
  });

  if (typeof target === "string") {
    window.history.replaceState(null, "", target);
  }

  return true;
}