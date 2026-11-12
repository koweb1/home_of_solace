"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type Tone = { bg: string; fg: string };

const tones: Record<string, Tone> = {
  dawn: { bg: "#F3EADC", fg: "#12183A" },
  morning: { bg: "#FAF5EC", fg: "#12183A" },
  midday: { bg: "#FBF7EE", fg: "#12183A" },
  golden: { bg: "#E8C39A", fg: "#2B1A14" },
  evening: { bg: "#1B2559", fg: "#F1E8D8" },
  night: { bg: "#0E1433", fg: "#F1E8D8" },
};

/**
 * Fades the page colours as each section with a data-tone attribute
 * reaches the middle of the screen. Renders nothing.
 */
export default function DayCycle() {
  useGSAP(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const root = document.documentElement;
    const sections = gsap.utils.toArray<HTMLElement>("[data-tone]");

    const apply = (name: string | undefined) => {
      const tone = name ? tones[name] : undefined;
      if (!tone) return;
      gsap.to(root, {
        "--sky-bg": tone.bg,
        "--sky-fg": tone.fg,
        duration: reduced ? 0 : 1.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 55%",
        onEnter: () => apply(section.dataset.tone),
        onEnterBack: () => apply(section.dataset.tone),
      });
    });
  });

  return null;
}