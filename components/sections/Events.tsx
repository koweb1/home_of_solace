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
    image: "/images/events/wedding.jpg",
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
    image: "/images/events/corporate.jpg",
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
    image: "/images/events/private-dinner.jpg",
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

// Counts a number up from 0 inside a timeline
function addCounter(
  tl: gsap.core.Timeline,
  el: HTMLElement | null,
  at: number,
  duration: number
) {
  if (!el) return;
  const target = Number(el.dataset.to ?? 0);
  const counter = { value: 0 };
  el.textContent = "0";
  tl.to(
    counter,
    {
      value: target,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = String(Math.round(counter.value));
      },
    },
    at
  );
}

export default function Events() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          phone: "(max-width: 767px)",
        },
        (context) => {
          const { reduce, phone } = context.conditions as {
            reduce: boolean;
            phone: boolean;
          };

          // Reduced motion: gentle fades only, nothing moves
          if (reduce) {
            gsap
              .utils.toArray<HTMLElement>(".events-head, .event, .events-cta")
              .forEach((el) => {
                gsap.fromTo(
                  el,
                  { opacity: 0 },
                  {
                    opacity: 1,
                    duration: 0.9,
                    ease: "power1.out",
                    scrollTrigger: { trigger: el, start: "top 92%", once: true },
                  }
                );
              });
            return;
          }

          // Heading
          gsap.set(".events-line", { yPercent: 115 });
          gsap.set(".events-fade", { opacity: 0, y: 24 });

          gsap
            .timeline({
              defaults: { ease: "expo.out" },
              scrollTrigger: {
                trigger: ".events-head",
                start: phone ? "top 90%" : "top 85%",
                once: true,
              },
            })
            .to(".events-line", { yPercent: 0, duration: 1.4 }, 0)
            .to(
              ".events-fade",
              { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 },
              0.3
            );

          const items = gsap.utils.toArray<HTMLElement>(".event");

          if (phone) {
            // PHONE: "curtains open". The arch opens sideways from the
            // centre, the light comes up, then the text slides in.
            items.forEach((item, i) => {
              const q = gsap.utils.selector(item);
              const arch = item.querySelector<HTMLElement>(".event-arch");
              const text = item.querySelector<HTMLElement>(".event-text");
              if (!arch || !text) return;

              const fromX = i % 2 === 0 ? -36 : 36;

              gsap.set(arch, { clipPath: "inset(0% 50% 0% 50%)" });
              gsap.set(q(".event-scale"), { scale: 1.25 });
              gsap.set(q(".event-veil"), { opacity: 0.7 });
              gsap.set(q(".event-slide"), { opacity: 0, x: fromX });

              gsap
                .timeline({
                  defaults: { ease: "expo.out" },
                  scrollTrigger: { trigger: arch, start: "top 68%", once: true },
                })
                .to(
                  arch,
                  {
                    clipPath: "inset(0% 0% 0% 0%)",
                    duration: 1.6,
                    ease: "expo.inOut",
                  },
                  0
                )
                .to(q(".event-scale"), { scale: 1, duration: 2.4 }, 0)
                .to(
                  q(".event-veil"),
                  { opacity: 0, duration: 1.8, ease: "power2.out" },
                  0.8
                );

              const words = gsap.timeline({
                defaults: { ease: "expo.out" },
                scrollTrigger: { trigger: text, start: "top 90%", once: true },
              });

              words.to(
                q(".event-slide"),
                { opacity: 1, x: 0, duration: 1.1, stagger: 0.1 },
                0
              );
              addCounter(
                words,
                item.querySelector<HTMLElement>(".event-count-m"),
                0.2,
                2
              );
            });
          } else {
            // TABLET AND LAPTOP: unchanged
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
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  duration: 1.9,
                  ease: "expo.inOut",
                },
                0
              )
                .to(q(".event-scale"), { scale: 1, duration: 2.4 }, 0)
                .to(
                  q(".event-fade"),
                  { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 },
                  0.5
                );

              addCounter(
                tl,
                item.querySelector<HTMLElement>(".event-count"),
                0.6,
                2.2
              );
            });

            // The arches rise at different speeds while scrolling
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

            // Closing line and button (on phones this block is merged into
            // the closing block of the Dining section)
            gsap.set(".events-cta", { opacity: 0, y: 24 });
            gsap.to(".events-cta", {
              opacity: 1,
              y: 0,
              duration: 1.1,
              ease: "expo.out",
              scrollTrigger: {
                trigger: ".events-cta",
                start: "top 92%",
                once: true,
              },
            });
          }
        }
      );

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
              <div className="event-scale relative h-full w-full">
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

              {/* Phone: the veil that lifts to bring the light up */}
              <div
                aria-hidden="true"
                className="event-veil pointer-events-none absolute inset-0 bg-night opacity-0 md:hidden"
              />
            </div>

            {/* Phone: title, one stat line, paragraph, link.
                overflow-x-clip: a block waiting at the side can never
                make the page wider than the screen */}
            <div className="event-text mt-8 overflow-x-clip md:hidden">
              <h4
                className="event-slide font-serif text-[2rem] leading-[1.05] tracking-[-0.01em]"
                style={{ fontVariationSettings: '"SOFT" 70' }}
              >
                {event.kind}
              </h4>

              <p className="event-slide mt-5 flex items-center gap-4">
                <span
                  className="event-count-m font-serif text-[3.75rem] leading-none tabular-nums"
                  data-to={event.count}
                >
                  {event.count}
                </span>
                <span className="font-serif text-lg italic leading-snug opacity-80">
                  {event.unit} {event.place}
                </span>
              </p>

              <p className="event-slide mt-5 max-w-sm text-base leading-relaxed opacity-75">
                {event.text}
              </p>

              <a
                href="#reserve"
                onClick={(e) => {
                  saveEnquiry({ type: "event", name: event.kind });
                  if (scrollToSection("#reserve")) e.preventDefault();
                }}
                className="event-slide group relative mt-6 inline-block text-[0.7rem] uppercase tracking-[0.22em]"
              >
                Plan this event
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-current transition-transform duration-500 ease-out group-hover:scale-x-0" />
              </a>
            </div>

            {/* Tablet and laptop: as before */}
            <div className="mt-7 hidden md:block">
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

      {/* Event enquiry, tablet and laptop only. On a phone it is merged into
          the closing block of the Dining section. Marigold stays for Reserve. */}
      <div
        className="events-cta mt-24 hidden flex-col items-start gap-6 border-t pt-12 md:mt-36 md:flex md:flex-row md:items-center md:justify-between"
        style={hairline}
      >
        <p className="max-w-md text-balance font-serif text-2xl leading-snug md:text-3xl">
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