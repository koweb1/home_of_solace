"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/site";
import { scrollToSection } from "@/utils/scrollToSection";

const links = [
  { label: "The House", href: "#house" },
  { label: "Rooms", href: "#rooms" },
  { label: "Dining", href: "#dining" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reserve", href: "#reserve" },
];

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const [year, setYear] = useState<number | null>(null);

  // Read the year in the browser, so it is never frozen at build time
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.set(".footer-word", { yPercent: 40, opacity: 0 });
      gsap.to(".footer-word", {
        yPercent: 0,
        opacity: 1,
        duration: 2,
        ease: "expo.out",
        scrollTrigger: { trigger: ".footer-word", start: "top 95%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <footer
      ref={root}
      data-tone="night"
      className="relative overflow-hidden px-5 pb-8 pt-4 md:px-10"
    >
      <div className="mx-auto max-w-[90rem]">
        <div
          className="grid gap-10 border-t pt-10 md:grid-cols-12 md:items-start"
          style={{
            borderColor: "color-mix(in srgb, currentColor 18%, transparent)",
          }}
        >
          <p className="font-serif text-2xl md:col-span-5">
            House <em className="text-[0.75em]">of</em> Solace
            <span className="mt-2 block font-sans text-sm opacity-60">
              A quiet resort in {site.city}.
            </span>
          </p>

          <nav aria-label="Footer" className="md:col-span-4">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (scrollToSection(link.href)) e.preventDefault();
                    }}
                    className="text-[0.7rem] uppercase tracking-[0.22em] opacity-70 transition-opacity duration-500 hover:opacity-100"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3 md:text-right">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(0);
              }}
              className="text-[0.7rem] uppercase tracking-[0.22em] opacity-70 transition-opacity duration-500 hover:opacity-100"
            >
              Back to top ↑
            </a>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="footer-word mt-16 select-none whitespace-nowrap text-center font-serif text-[clamp(3rem,12.5vw,14rem)] leading-none tracking-[-0.03em] opacity-[0.08]"
        >
          House of Solace
        </p>

        <p className="mt-8 flex flex-wrap justify-between gap-3 text-[0.65rem] uppercase tracking-[0.25em] opacity-50">
          <span>{year ? `© ${year} ${site.name}` : `© ${site.name}`}</span>
          <span>{site.city}</span>
        </p>
      </div>
    </footer>
  );
}