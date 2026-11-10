"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import NavLogo from "@/components/layout/NavLogo";
import ReserveButton from "@/components/ui/ReserveButton";
import { scrollToSection } from "@/utils/scrollToSection";

const links = [
  { label: "The House", href: "#house" },
  { label: "Rooms", href: "#rooms" },
  { label: "Dining", href: "#dining" },
  { label: "Gallery", href: "#gallery" },
];

export default function Nav() {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const firstRun = useRef(true);

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 1. Appear after the loader has finished
  useGSAP(
    () => {
      const el = header.current;
      if (!el) return;

      const reveal = () =>
        gsap.to(el, {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",
        });

      gsap.set(el, { yPercent: -100, opacity: 0 });

      if (document.documentElement.dataset.loaded === "true") {
        reveal();
        return;
      }

      window.addEventListener("solace:loaded", reveal, { once: true });
      return () => window.removeEventListener("solace:loaded", reveal);
    },
    { scope: root }
  );

  // 2. Compact bar once the page has scrolled
  useGSAP(
    () => {
      setScrolled(window.scrollY > 40);
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => setScrolled(self.scroll() > 40),
      });
    },
    { scope: root }
  );

  // 3. Mobile menu timeline (built once, played and reversed)
  useGSAP(
    () => {
      const el = menu.current;
      if (!el) return;

      gsap.set(el, { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(".menu-item", { yPercent: 110 });
      gsap.set(".menu-foot", { opacity: 0, y: 16 });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.to(el, {
        autoAlpha: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.9,
        ease: "expo.inOut",
      })
        .to(".menu-item", { yPercent: 0, duration: 1, stagger: 0.07 }, 0.35)
        .to(".menu-foot", { opacity: 1, y: 0, duration: 0.8 }, 0.7);

      menuTl.current = tl;
      return () => {
        menuTl.current = null;
      };
    },
    { scope: root }
  );

  // Play or reverse the menu when it opens or closes
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const tl = menuTl.current;
    if (!tl) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    tl.timeScale(reduced ? 5 : open ? 1 : 1.6);

    if (open) tl.play();
    else tl.reverse();
  }, [open]);

  // While the menu is open: lock scroll, allow Escape, close on desktop width
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [open]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (scrollToSection(href)) e.preventDefault();
    setOpen(false);
  };

  return (
    <div ref={root}>
      <header
        ref={header}
        className={`fixed inset-x-0 top-0 z-[70] transition-colors duration-700 ${
          open ? "text-ivory" : "text-sky-fg"
        }`}
      >
        {/* Frosted background, appears after scrolling */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 -z-10 border-b backdrop-blur-md transition-opacity duration-700 ${
            scrolled && !open ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--sky-bg) 78%, transparent)",
            borderColor: "color-mix(in srgb, var(--sky-fg) 12%, transparent)",
          }}
        />

        <nav
          aria-label="Main"
          className={`mx-auto flex max-w-[90rem] items-center justify-between px-5 transition-[padding] duration-700 md:px-10 ${
            scrolled ? "py-3" : "py-5 md:py-7"
          }`}
        >
          <a
            href="#top"
            aria-label="House of Solace, back to top"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(0);
              setOpen(false);
            }}
          >
            <NavLogo />
          </a>

          <ul className="hidden items-center gap-10 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => go(e, link.href)}
                  className="group relative text-[0.7rem] uppercase tracking-[0.22em]"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-out group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <ReserveButton size="sm" />

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
              className="relative -mr-2 flex h-10 w-10 items-center justify-center md:hidden"
            >
              <span
                className={`absolute block h-px w-6 bg-current transition-transform duration-500 ease-out ${
                  open ? "translate-y-0 rotate-45" : "-translate-y-[4px]"
                }`}
              />
              <span
                className={`absolute block h-px w-6 bg-current transition-transform duration-500 ease-out ${
                  open ? "translate-y-0 -rotate-45" : "translate-y-[4px]"
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        ref={menu}
        id="mobile-menu"
        aria-hidden={!open}
        className="fixed inset-0 z-[60] flex flex-col justify-between bg-night px-6 pb-10 pt-28 text-ivory md:hidden"
        style={{ visibility: "hidden" }}
      >
        <ul className="flex flex-col gap-2">
          {links.map((link, i) => (
            <li key={link.href} className="overflow-hidden">
              <a
                href={link.href}
                onClick={(e) => go(e, link.href)}
                className="menu-item flex items-baseline gap-4 py-1 font-serif text-5xl leading-[1.1]"
              >
                <span className="font-sans text-[0.65rem] tracking-[0.3em] text-ivory/40">
                  0{i + 1}
                </span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="menu-foot flex flex-col gap-6">
          <ReserveButton
            size="lg"
            className="w-full justify-center"
            onNavigate={() => setOpen(false)}
          />
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-ivory/50">
            Lagos, Nigeria
          </p>
        </div>
      </div>
    </div>
  );
}