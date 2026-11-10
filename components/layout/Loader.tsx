"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import LogoMark from "@/components/layout/Logo";

export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  // Lock scrolling while the loader is on screen
  useEffect(() => {
    if (done) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [done]);

  useGSAP(
    () => {
      const finish = () => {
        document.documentElement.dataset.loaded = "true";
        window.dispatchEvent(new CustomEvent("solace:loaded"));
        setDone(true);
      };

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduced) {
        gsap.set(".logo-arch, .logo-base", { strokeDashoffset: 0 });
        gsap.set(".logo-sun, .loader-word, .loader-caption", { opacity: 1 });
        gsap.to(root.current, {
          opacity: 0,
          duration: 0.5,
          delay: 0.8,
          onComplete: finish,
        });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: finish,
      });

      tl.to(
        ".logo-base",
        { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" },
        0.2
      )
        .to(
          ".logo-arch",
          { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" },
          0.4
        )
        .fromTo(
          ".logo-sun",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.3 },
          1.3
        )
        .fromTo(
          ".loader-word",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2 },
          1.6
        )
        .fromTo(
          ".loader-caption",
          { opacity: 0 },
          { opacity: 1, duration: 1 },
          2.1
        )
        .to(
          root.current,
          { yPercent: -100, duration: 1.2, ease: "expo.inOut" },
          3.1
        );
    },
    { scope: root }
  );

  if (done) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-label="Loading House of Solace"
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-night will-change-transform"
    >
      <LogoMark className="h-32 w-24 md:h-44 md:w-32" />
      <p
        className="loader-word mt-8 font-serif text-4xl text-ivory md:text-5xl"
        style={{ opacity: 0 }}
      >
        House <em className="text-[0.7em]">of</em> Solace
      </p>
      <p
        className="loader-caption mt-4 text-[0.65rem] uppercase tracking-[0.4em] text-ivory/60"
        style={{ opacity: 0 }}
      >
        Lagos
      </p>
    </div>
  );
}