"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import ReserveButton from "@/components/ui/ReserveButton";

type Room = {
  number: string;
  kind: string;
  name: string;
  tagline: string;
  specs: [string, string][];
  features: string[];
  price: string;
  tone: "light" | "dusk" | "night";
  // 📸 REAL IMAGE: portrait 3:4 (for example 1500 x 2000).
  // Put the photo in the path shown in the comment, then set it here.
  image: string;
  imagePath: string;
  imageAlt: string;
};

// Placeholder copy, sizes and prices. Edit freely.
const rooms: Room[] = [
  {
    number: "01",
    kind: "Ground floor",
    name: "Garden Room",
    tagline: "Step off the bed and onto the lawn.",
    specs: [
      ["Size", "42 m²"],
      ["Sleeps", "2 guests"],
      ["Bed", "King"],
      ["View", "Garden"],
    ],
    features: [
      "Rain shower and deep soaking tub",
      "Terrace with morning shade",
      "Stocked minibar, no surprises on the bill",
    ],
    price: "₦185,000",
    tone: "light",
    image: "", // 📸 REAL IMAGE: "/images/rooms/garden-room.jpg"
    imagePath: "public/images/rooms/garden-room.jpg",
    imageAlt: "The Garden Room at House of Solace, Lagos",
  },
  {
    number: "02",
    kind: "First floor",
    name: "Lagoon Suite",
    tagline: "A balcony built for slow evenings.",
    specs: [
      ["Size", "68 m²"],
      ["Sleeps", "3 guests"],
      ["Bed", "King + daybed"],
      ["View", "Lagoon"],
    ],
    features: [
      "Private balcony facing the water",
      "Separate lounge and work desk",
      "Breakfast served in the suite",
    ],
    price: "₦320,000",
    tone: "dusk",
    image: "", // 📸 REAL IMAGE: "/images/rooms/lagoon-suite.jpg"
    imagePath: "public/images/rooms/lagoon-suite.jpg",
    imageAlt: "The Lagoon Suite at House of Solace, Lagos",
  },
  {
    number: "03",
    kind: "Private villa",
    name: "Courtyard Villa",
    tagline: "Two bedrooms around a courtyard of your own.",
    specs: [
      ["Size", "110 m²"],
      ["Sleeps", "4 guests"],
      ["Bed", "2 king rooms"],
      ["View", "Courtyard"],
    ],
    features: [
      "Private plunge pool",
      "Open kitchen and dining table",
      "Dedicated host for the length of your stay",
    ],
    price: "₦540,000",
    tone: "light",
    image: "", // 📸 REAL IMAGE: "/images/rooms/courtyard-villa.jpg"
    imagePath: "public/images/rooms/courtyard-villa.jpg",
    imageAlt: "The Courtyard Villa at House of Solace, Lagos",
  },
  {
    number: "04",
    kind: "The signature",
    name: "The Solace House",
    tagline: "The whole house, for the people you love most.",
    specs: [
      ["Size", "220 m²"],
      ["Sleeps", "6 guests"],
      ["Bed", "3 king rooms"],
      ["View", "Lagoon deck"],
    ],
    features: [
      "Private chef and pool",
      "Lagoon deck with its own fire pit",
      "Airport pickup and a driver on call",
    ],
    price: "₦980,000",
    tone: "night",
    image: "", // 📸 REAL IMAGE: "/images/rooms/solace-house.jpg"
    imagePath: "public/images/rooms/solace-house.jpg",
    imageAlt: "The Solace House at House of Solace, Lagos",
  },
];

const toneClass: Record<Room["tone"], string> = {
  light: "bg-ivory text-ink",
  dusk: "bg-dusk text-ivory",
  night: "bg-night text-ivory",
};

const hairline = {
  borderColor: "color-mix(in srgb, currentColor 18%, transparent)",
};

// Remember which room was chosen, so the reservation form can preselect it
const chooseRoom = (name: string) => {
  try {
    sessionStorage.setItem("solace:room", name);
  } catch {
    // Storage can be blocked in private mode. Reserving still works.
  }
  window.dispatchEvent(new CustomEvent("solace:room", { detail: name }));
};

export default function Rooms() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduced) return;

      // Section heading
      gsap.set(".rooms-line", { yPercent: 115 });
      gsap.set(".rooms-fade", { opacity: 0, y: 24 });

      gsap
        .timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: {
            trigger: ".rooms-head",
            start: "top 82%",
            once: true,
          },
        })
        .to(".rooms-line", { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0)
        .to(
          ".rooms-fade",
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 },
          0.3
        );

      // Each room's entrance
      const items = gsap.utils.toArray<HTMLElement>(".room");

      items.forEach((room) => {
        const q = gsap.utils.selector(room);

        gsap.set(q(".room-arch"), { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(q(".room-scale"), { scale: 1.3 });
        gsap.set(q(".room-line"), { yPercent: 115 });
        gsap.set(q(".room-fade"), { opacity: 0, y: 26 });

        gsap
          .timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: { trigger: room, start: "top 78%", once: true },
          })
          .to(
            q(".room-arch"),
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.9,
              ease: "expo.inOut",
            },
            0
          )
          .to(q(".room-scale"), { scale: 1, duration: 2.4 }, 0)
          .to(q(".room-line"), { yPercent: 0, duration: 1.4 }, 0.35)
          .to(
            q(".room-fade"),
            { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 },
            0.55
          );
      });

      // Desktop only: each panel sinks back as the next one covers it
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        items.forEach((room, i) => {
          const next = items[i + 1];
          if (!next) return;

          gsap
            .timeline({
              scrollTrigger: {
                trigger: next,
                start: "top 90%",
                end: "top 16%",
                scrub: true,
              },
            })
            .to(room.querySelector(".room-card"), { scale: 0.94, ease: "none" }, 0)
            .to(
              room.querySelector(".room-shade"),
              { opacity: 0.55, ease: "none" },
              0
            );
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      id="rooms"
      data-tone="midday"
      ref={root}
      className="relative px-5 py-28 md:px-10 md:py-44"
    >
      <div className="mx-auto max-w-[90rem]">
        {/* Heading */}
        <div className="rooms-head mb-16 grid gap-8 md:mb-28 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="rooms-fade flex items-center gap-4 text-[0.68rem] uppercase tracking-[0.3em] text-clay">
              <span className="h-px w-10 bg-clay" />
              03 — Midday · The Rooms
            </p>

            <h2
              className="mt-8 font-serif text-[clamp(2.6rem,6.2vw,5.4rem)] leading-[1] tracking-[-0.02em]"
              style={{ fontVariationSettings: '"SOFT" 70' }}
            >
              <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <span className="rooms-line block">Find the room</span>
              </span>
              <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <span className="rooms-line block">
                  that feels like <em className="text-clay">yours</em>.
                </span>
              </span>
            </h2>
          </div>

          <p className="rooms-fade max-w-sm text-base leading-relaxed text-sky-fg/75 md:col-span-4 md:justify-self-end md:text-lg">
            Four ways to stay, from a ground-floor room that opens onto the
            lawn to a whole house with its own chef. Every one has the same
            quiet.
          </p>
        </div>

        {/* The line of rooms */}
        <ul className="flex flex-col gap-6 md:block">
          {rooms.map((room, i) => (
            <li
              key={room.name}
              className="room md:sticky md:mb-[22vh] md:h-[calc(100svh-9.5rem)] md:min-h-[32rem] md:last:mb-0"
              style={{ top: `calc(5.5rem + ${i * 0.9}rem)` }}
            >
              <article
                className={`room-card group relative flex h-full origin-top flex-col gap-8 overflow-hidden rounded-[1.75rem] p-5 shadow-[0_40px_90px_-50px_rgba(14,20,51,0.55)] md:gap-12 md:p-8 lg:p-10 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
                } ${toneClass[room.tone]}`}
              >
                {/* Arch */}
                <div className="relative mx-auto aspect-[3/4] w-full max-w-[22rem] shrink-0 md:mx-0 md:h-full md:w-auto md:max-w-none">
                  <div className="room-arch absolute inset-0 overflow-hidden rounded-t-full">
                    <div className="room-scale h-full w-full">
                      <div className="h-full w-full transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]">
                        {room.image ? (
                          <Image
                            src={room.image}
                            alt={room.imageAlt}
                            fill
                            sizes="(min-width: 768px) 30vw, 90vw"
                            className="object-cover"
                          />
                        ) : (
                          <ImagePlaceholder path={room.imagePath} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between gap-8">
                  <div>
                    <p className="room-fade flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] opacity-60">
                      <span>
                        {room.number} / 0{rooms.length}
                      </span>
                      <span>{room.kind}</span>
                    </p>

                    <h3
                      className="mt-6 font-serif text-[clamp(2.2rem,4.4vw,4rem)] leading-[1] tracking-[-0.02em]"
                      style={{ fontVariationSettings: '"SOFT" 70' }}
                    >
                      <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                        <span className="room-line block">{room.name}</span>
                      </span>
                    </h3>

                    <p className="room-fade mt-4 max-w-md font-serif text-lg italic opacity-75 md:text-xl">
                      {room.tagline}
                    </p>
                  </div>

                  <div className="flex flex-col gap-6">
                    <dl
                      className="room-fade grid grid-cols-2 gap-x-6 gap-y-5 border-t pt-6 md:grid-cols-4"
                      style={hairline}
                    >
                      {room.specs.map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-[0.6rem] uppercase tracking-[0.25em] opacity-55">
                            {label}
                          </dt>
                          <dd className="mt-1 font-serif text-lg md:text-xl">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <ul className="room-fade space-y-2 text-sm opacity-80 md:text-[0.95rem]">
                      {room.features.map((feature) => (
                        <li key={feature} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-[0.7em] h-px w-4 shrink-0 bg-current"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div
                      className="room-fade flex flex-wrap items-center justify-between gap-5 border-t pt-6"
                      style={hairline}
                    >
                      <p>
                        <span className="block text-[0.6rem] uppercase tracking-[0.25em] opacity-55">
                          From
                        </span>
                        <span className="font-serif text-2xl md:text-3xl">
                          {room.price}
                        </span>
                        <span className="ml-2 text-xs opacity-55">
                          per night
                        </span>
                      </p>

                      <ReserveButton
                        size="lg"
                        label="Reserve this stay"
                        onNavigate={() => chooseRoom(room.name)}
                      />
                    </div>
                  </div>
                </div>

                {/* Dims the panel while the next one covers it */}
                <div
                  aria-hidden="true"
                  className="room-shade pointer-events-none absolute inset-0 rounded-[1.75rem] bg-night opacity-0"
                />
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}