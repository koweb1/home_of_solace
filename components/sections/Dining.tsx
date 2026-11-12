"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import Events from "@/components/sections/Events";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import ReserveButton from "@/components/ui/ReserveButton";
import { saveEnquiry } from "@/utils/saveEnquiry";
import { scrollToSection } from "@/utils/scrollToSection";

type Venue = {
  name: string;
  kind: string;
  hours: string;
  text: string;
  // 📸 REAL IMAGE: portrait 3:4 (for example 1500 x 2000).
  image: string;
  imagePath: string;
  imageAlt: string;
};

// Placeholder copy and hours. Edit freely.
const venues: Venue[] = [
  {
    name: "The Long Table",
    kind: "Restaurant",
    hours: "Daily · 07:00 – 23:00",
    text: "A Nigerian-led kitchen. Smoky jollof, slow stews and fish done the way it should be, at one very long table.",
    image: "", // 📸 REAL IMAGE: "/images/dining/long-table.jpg"
    imagePath: "public/images/dining/long-table.jpg",
    imageAlt: "The Long Table restaurant at House of Solace",
  },
  {
    name: "Ember Deck",
    kind: "Lagoon grill",
    hours: "Daily · 17:00 – 00:00",
    text: "Suya, grilled fish and cold drinks at the water's edge, once the heat finally lets go.",
    image: "", // 📸 REAL IMAGE: "/images/dining/ember-deck.jpg"
    imagePath: "public/images/dining/ember-deck.jpg",
    imageAlt: "Ember Deck grill by the lagoon at House of Solace",
  },
  {
    name: "The Palm Bar",
    kind: "Bar & lounge",
    hours: "Daily · 16:00 – 01:00",
    text: "Cocktails, palm wine, and a corner quiet enough to hear yourself think.",
    image: "", // 📸 REAL IMAGE: "/images/dining/palm-bar.jpg"
    imagePath: "public/images/dining/palm-bar.jpg",
    imageAlt: "The Palm Bar at House of Solace",
  },
];

const hairline = {
  borderColor: "color-mix(in srgb, currentColor 18%, transparent)",
};

const accent = "text-[#7C3F2A]";

type Mover = ReturnType<typeof gsap.quickTo>;

function VenueImage({
  venue,
  decorative = false,
}: {
  venue: Venue;
  decorative?: boolean;
}) {
  return venue.image ? (
    <Image
      src={venue.image}
      alt={decorative ? "" : venue.imageAlt}
      fill
      sizes="(min-width: 768px) 16rem, 14rem"
      className="object-cover"
    />
  ) : (
    <ImagePlaceholder path={venue.imagePath} />
  );
}

export default function Dining() {
  const root = useRef<HTMLElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const moveX = useRef<Mover | null>(null);
  const moveY = useRef<Mover | null>(null);
  const reduced = useRef(false);
  const [active, setActive] = useState<number | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      reduced.current = prefersReduced;

      // Cursor arch (mouse only)
      const canHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      ).matches;

      if (canHover && cursor.current) {
        gsap.set(cursor.current, {
          yPercent: -50,
          clipPath: "inset(100% 0% 0% 0%)",
        });
        moveX.current = gsap.quickTo(cursor.current, "x", {
          duration: 0.8,
          ease: "power3.out",
        });
        moveY.current = gsap.quickTo(cursor.current, "y", {
          duration: 0.8,
          ease: "power3.out",
        });
      }

      if (prefersReduced) return;

      // The sun sets while the chapter scrolls by
      gsap.fromTo(
        ".dining-sun",
        { yPercent: -10, opacity: 1 },
        {
          yPercent: 90,
          opacity: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: true,
          },
        }
      );

      // Heading
      gsap.set(".dining-head-line", { yPercent: 115 });
      gsap.set(".dining-head-fade", { opacity: 0, y: 24 });

      gsap
        .timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: {
            trigger: ".dining-head",
            start: "top 82%",
            once: true,
          },
        })
        .to(".dining-head-line", { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0)
        .to(
          ".dining-head-fade",
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 },
          0.3
        );

      // Venue rows
      gsap.utils.toArray<HTMLElement>(".dining-row").forEach((row) => {
        const q = gsap.utils.selector(row);

        gsap.set(q(".dining-line"), { yPercent: 115 });
        gsap.set(q(".dining-fade"), { opacity: 0, y: 24 });

        gsap
          .timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: { trigger: row, start: "top 88%", once: true },
          })
          .to(q(".dining-line"), { yPercent: 0, duration: 1.4 }, 0)
          .to(
            q(".dining-fade"),
            { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 },
            0.3
          );
      });

      // Closing line and button
      gsap.set(".dining-cta", { opacity: 0, y: 24 });
      gsap.to(".dining-cta", {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".dining-cta", start: "top 92%", once: true },
      });
    },
    { scope: root }
  );

  const showCursor = contextSafe((e: React.MouseEvent) => {
    const el = cursor.current;
    if (!el || !moveX.current) return;
    gsap.set(el, { x: e.clientX + 48, y: e.clientY });
    gsap.to(el, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: reduced.current ? 0 : 0.9,
      ease: "expo.out",
      overwrite: "auto",
    });
  });

  const hideCursor = contextSafe(() => {
    setActive(null);
    const el = cursor.current;
    if (!el || !moveX.current) return;
    gsap.to(el, {
      clipPath: "inset(100% 0% 0% 0%)",
      duration: reduced.current ? 0 : 0.7,
      ease: "expo.inOut",
      overwrite: "auto",
    });
  });

  const moveCursor = (e: React.MouseEvent) => {
    moveX.current?.(e.clientX + 48);
    moveY.current?.(e.clientY);
  };

  return (
    <section
      id="dining"
      data-tone="golden"
      ref={root}
      className="relative px-5 py-28 md:px-10 md:py-44"
    >
      {/* The setting sun, pinned behind the whole chapter */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="dining-sun absolute right-[-14vw] top-[16vh] aspect-square w-[min(70vw,40rem)] rounded-full bg-clay/50 md:right-[-8vw] md:w-[min(52vw,40rem)]" />
        </div>
      </div>

      {/* Cursor arch that follows the mouse over the venue list */}
      <div
        ref={cursor}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[55] hidden aspect-[3/4] w-56 overflow-hidden rounded-t-full md:block lg:w-64"
      >
        {venues.map((venue, i) => (
          <div
            key={venue.name}
            className={`absolute inset-0 transition-opacity duration-700 ${
              active === i ? "opacity-100" : "opacity-0"
            }`}
          >
            <VenueImage venue={venue} decorative />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-[90rem]">
        {/* Heading */}
        <div className="dining-head grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p
              className={`dining-head-fade flex items-center gap-4 text-[0.68rem] uppercase tracking-[0.3em] ${accent}`}
            >
              <span className="h-px w-10 bg-[#7C3F2A]" />
              04 — Golden hour · Dining
            </p>

            <h2
              className="mt-8 font-serif text-[clamp(2.6rem,6.2vw,5.4rem)] leading-[1] tracking-[-0.02em]"
              style={{ fontVariationSettings: '"SOFT" 70' }}
            >
              <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <span className="dining-head-line block">
                  When the light goes
                </span>
              </span>
              <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <span className="dining-head-line block">
                  <em className={accent}>gold</em>, we eat.
                </span>
              </span>
            </h2>
          </div>

          <p className="dining-head-fade max-w-sm text-base leading-relaxed opacity-75 md:col-span-4 md:justify-self-end md:text-lg">
            Three places to eat and drink, all of them a short walk in slippers
            from your room.
          </p>
        </div>

        {/* Venue list */}
        <ul
          className="mt-16 md:mt-28"
          onMouseEnter={showCursor}
          onMouseMove={moveCursor}
          onMouseLeave={hideCursor}
        >
          {venues.map((venue, i) => (
            <li
              key={venue.name}
              onMouseEnter={() => setActive(i)}
              className={`dining-row border-t transition-opacity duration-700 last:border-b ${
                active !== null && active !== i ? "md:opacity-30" : ""
              }`}
              style={hairline}
            >
              <div className="grid gap-6 py-10 md:grid-cols-12 md:items-center md:py-14">
                <span className="dining-fade text-[0.7rem] tracking-[0.25em] opacity-55 md:col-span-1">
                  0{i + 1}
                </span>

                <div className="md:col-span-7">
                  <h3
                    className="font-serif text-[clamp(2.6rem,7vw,6.4rem)] leading-[1] tracking-[-0.02em]"
                    style={{ fontVariationSettings: '"SOFT" 70' }}
                  >
                    <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                      <span className="dining-line block">{venue.name}</span>
                    </span>
                  </h3>
                  <p className="dining-fade mt-4 max-w-md text-sm leading-relaxed opacity-75 md:text-base">
                    {venue.text}
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:col-span-4 md:items-end md:text-right">
                  <p className="dining-fade text-[0.65rem] uppercase tracking-[0.3em] opacity-60">
                    {venue.kind}
                  </p>
                  <p className="dining-fade font-serif text-lg">{venue.hours}</p>
                  <a
                    href="#reserve"
                    onClick={(e) => {
                      saveEnquiry({ type: "table", name: venue.name });
                      if (scrollToSection("#reserve")) e.preventDefault();
                    }}
                    className="dining-fade group relative mt-1 inline-block w-fit text-[0.7rem] uppercase tracking-[0.22em]"
                  >
                    Reserve a table
                    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-current transition-transform duration-500 ease-out group-hover:scale-x-0" />
                  </a>
                </div>

                {/* Touch screens: the photo sits right under the row */}
                <div className="dining-fade relative aspect-[3/4] w-52 overflow-hidden rounded-t-full md:hidden">
                  <VenueImage venue={venue} />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Events />

        {/* Closing line with the main Reserve action */}
        <div
          className="dining-cta mt-28 flex flex-col items-start gap-8 border-t pt-12 md:mt-40 md:flex-row md:items-center md:justify-between"
          style={hairline}
        >
          <p className="max-w-md font-serif text-2xl leading-snug md:text-3xl">
            Evenings fill up first. Save yours.
          </p>
          <ReserveButton size="lg" label="Reserve your evening" />
        </div>
      </div>
    </section>
  );
}