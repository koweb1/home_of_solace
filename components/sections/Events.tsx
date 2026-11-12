"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { saveEnquiry } from "@/utils/saveEnquiry";
import { scrollToSection } from "@/utils/scrollToSection";

type EventType = {
  kind: string;
  count: number;
  unit: string;
  place: string;
  text: string;
  // 📸 REAL IMAGE: tall portrait 2:3 (for example 1200 x 1800).
  image: string;
  imagePath: string;
  imageAlt: string;
  offset: string; // staggered height on desktop
  rise: number; // how far it drifts upward while scrolling (px)
};

// Placeholder copy and capacities. Edit freely.
const events: EventType[] = [
  {
    kind: "Weddings & owambes",
    count: 300,
    unit: "guests",
    place: "on the lagoon lawn",
    text: "Aso-oke, live bands, and a kitchen that feeds everyone twice.",
    image: "", // 📸 REAL IMAGE: "/images/events/wedding.jpg"
    imagePath: "public/images/events/wedding.jpg",
    imageAlt: "A wedding on the lagoon lawn at House of Solace",
    offset: "md:mt-0",
    rise: 30,
  },
  {
    kind: "Corporate retreats",
    count: 120,
    unit: "delegates",
    place: "in the conference house",
    text: "Daylight rooms, fast Wi-Fi, and a pool for the afternoon slump.",
    image: "", // 📸 REAL IMAGE: "/images/events/corporate.jpg"
    imagePath: "public/images/events/corporate.jpg",
    imageAlt: "A corporate retreat at House of Solace",
    offset: "md:mt-24",
    rise: 90,
  },
  {
    kind: "Private dinners",
    count: 24,
    unit: "guests",
    place: "at the Long Table",
    text: "One long table, a menu built for your people, and no clock.",
    image: "", // 📸 REAL IMAGE: "/images/events/private-dinner.jpg"
    imagePath: "public/images/events/private-dinner.jpg",
    imageAlt: "A private dinner at the Long Table, House of Solace",
    offset: "md:mt-12",
    rise: 55,
  },
];

const hairline = {
  borderColor: "color-mix(in srgb, currentColor 18%, transparent)",
};

const accent = "text-[#7C3F2A]";

export default function Events() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduced) return;

      // Heading
      gsap.set(".events-line", { yPercent: 115 });
      gsap.set(".events-fade", { opacity: 0, y: 24 });

      gsap
        .timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: {
            trigger: ".events-head",
            start: "top 85%",
            once: true,
          },
        })
        .to(".events-line", { yPercent: 0, duration: 1.4 }, 0)
        .to(
          ".events-fade",
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 },
          0.3
        );

      // Each event: arch opens, details rise, the number counts up
      const items = gsap.utils.toArray<HTMLElement>(".event");

      items.forEach((item) => {
        const q = gsap.utils.selector(item);

        gsap.set(q(".event-arch"), { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(q(".event-scale"), { scale: 1.3 });
        gsap.set(q(".event-fade"), { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: { trigger: item, start: "top 85%", once: true },
        });

        tl.to(
          q(".event-arch"),
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.9, ease: "expo.inOut" },
          0
        )
          .to(q(".event-scale"), { scale: 1, duration: 2.4 }, 0)
          .to(
            q(".event-fade"),
            { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 },
            0.5
          );

        const count = item.querySelector<HTMLElement>(".event-count");
        if (count) {
          const target = Number(count.dataset.to ?? 0);
          const counter = { value: 0 };
          count.textContent = "0";
          tl.to(
            counter,
            {
              value: target,
              duration: 2.2,
              ease: "power2.out",
              onUpdate: () => {
                count.textContent = String(Math.round(counter.value));
              },
            },
            0.6
          );
        }
      });

      // Desktop only: the arches rise at different speeds while scrolling
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        items.forEach((item) => {
          gsap.to(item, {
            y: -Number(item.dataset.rise ?? 0),
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });
      });

      // Closing line and button
      gsap.set(".events-cta", { opacity: 0, y: 24 });
      gsap.to(".events-cta", {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".events-cta", start: "top 92%", once: true },
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div id="events" ref={root} className="mt-32 md:mt-52">
      {/* Heading */}
      <div className="events-head grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p
            className={`events-fade flex items-center gap-4 text-[0.68rem] uppercase tracking-[0.3em] ${accent}`}
          >
            <span className="h-px w-10 bg-[#7C3F2A]" />
            Events
          </p>

          <h3
            className="mt-8 font-serif text-[clamp(2.6rem,6.2vw,5.4rem)] leading-[1] tracking-[-0.02em]"
            style={{ fontVariationSettings: '"SOFT" 70' }}
          >
            <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
              <span className="events-line block">
                Bring <em className={accent}>everyone</em>.
              </span>
            </span>
          </h3>
        </div>

        <p className="events-fade max-w-sm text-base leading-relaxed opacity-75 md:col-span-4 md:justify-self-end md:text-lg">
          Weddings that spill onto the lawn, retreats that actually get
          something done, and dinners that run until midnight.
        </p>
      </div>

      {/* Three arches at different heights */}
      <ul className="mt-16 grid gap-16 md:mt-24 md:grid-cols-3 md:items-start md:gap-8 lg:gap-12">
        {events.map((event) => (
          <li
            key={event.kind}
            data-rise={event.rise}
            className={`event ${event.offset}`}
          >
            <div className="event-arch relative aspect-[2/3] overflow-hidden rounded-t-full">
              <div className="event-scale h-full w-full">
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={event.imageAlt}
                    fill
                    sizes="(min-width: 768px) 30vw, 90vw"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder
                    path={event.imagePath}
                    ratio="Tall portrait · 2:3"
                  />
                )}
              </div>
            </div>

            <div className="mt-7">
              <p className="event-fade text-[0.65rem] uppercase tracking-[0.3em] opacity-60">
                {event.kind}
              </p>

              <p className="event-fade mt-3 flex items-baseline gap-3">
                <span
                  className="event-count font-serif text-5xl tabular-nums md:text-6xl"
                  data-to={event.count}
                >
                  {event.count}
                </span>
                <span className="text-sm uppercase tracking-[0.2em] opacity-60">
                  {event.unit}
                </span>
              </p>

              <p className="event-fade mt-1 font-serif text-lg italic opacity-75">
                {event.place}
              </p>

              <p className="event-fade mt-4 max-w-xs text-sm leading-relaxed opacity-70 md:text-base">
                {event.text}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Event enquiry: outlined, marigold stays for Reserve only */}
      <div
        className="events-cta mt-24 flex flex-col items-start gap-6 border-t pt-12 md:mt-36 md:flex-row md:items-center md:justify-between"
        style={hairline}
      >
        <p className="max-w-md font-serif text-2xl leading-snug md:text-3xl">
          Planning something bigger? Tell us the date and how many are coming.
        </p>

        <a
          href="#reserve"
          onClick={(e) => {
            saveEnquiry({ type: "event" });
            if (scrollToSection("#reserve")) e.preventDefault();
          }}
          className="inline-flex items-center rounded-full border border-current px-9 py-4 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-500 hover:bg-sky-fg hover:text-sky-bg"
        >
          Plan an event
        </a>
      </div>
    </div>
  );
}