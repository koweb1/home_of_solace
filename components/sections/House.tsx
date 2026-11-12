"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import ReserveButton from "@/components/ui/ReserveButton";

// 📸 REAL IMAGE: put your photo in public/images/house.jpg (portrait, 3:4,
// for example 1500 x 2000), then set this to "/images/house.jpg".
// While it is empty, a placeholder is shown in the arch.
const HOUSE_IMAGE: string = "";

// Describe your photo here for screen readers and SEO.
const HOUSE_IMAGE_ALT = "A quiet morning at House of Solace, Lagos";

const moments = [
  {
    time: "06:30",
    title: "The pool, before anyone else",
    text: "Twenty-five metres of still water and nobody in it. The towels are warm and the mist is still lifting off the lagoon.",
  },
  {
    time: "07:00",
    title: "Breakfast, until you are ready",
    text: "Akara and pap beside fresh croissants. Yam and egg sauce, if that is the kind of morning it is. Served until noon, no questions asked.",
  },
  {
    time: "10:00",
    title: "Hands that know Lagos",
    text: "A spa for shoulders that have sat in Third Mainland Bridge traffic. Book a massage, or just the steam room.",
  },
  {
    time: "12:00",
    title: "Shade and something cold",
    text: "Cabanas under the almond trees, with a jug of cold zobo within reach and nowhere you need to be.",
  },
  {
    time: "All day",
    title: "Light that never blinks",
    text: "Steady power, Wi-Fi that keeps up, and a generator you will never hear.",
  },
];

export default function House() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduced) return;

      // Arch opens upward, the picture settles
      gsap.set(".house-arch", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".house-scale", { scale: 1.25 });
      gsap.set(".house-outline", { opacity: 0, scale: 0.95 });

      gsap
        .timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: {
            trigger: ".house-arch-wrap",
            start: "top 78%",
            once: true,
          },
        })
        .to(
          ".house-arch",
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.inOut" },
          0
        )
        .to(".house-scale", { scale: 1, duration: 2.2 }, 0)
        .to(".house-outline", { opacity: 1, scale: 1, duration: 1.5 }, 0.5);

      // The picture drifts slower than its frame
      gsap.fromTo(
        ".house-par",
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: ".house-arch-wrap",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Headline lines rise from behind a mask
      gsap.set(".house-line", { yPercent: 115 });
      gsap.set(".house-fade", { opacity: 0, y: 24 });

      gsap
        .timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: {
            trigger: ".house-head",
            start: "top 82%",
            once: true,
          },
        })
        .to(".house-line", { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0)
        .to(
          ".house-fade",
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 },
          0.3
        );

      // Moments rise one after another as they arrive
      gsap.set(".house-row", { opacity: 0, y: 32 });
      ScrollTrigger.batch(".house-row", {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.1,
            ease: "expo.out",
          }),
      });

      // Reserve button
      gsap.set(".house-cta", { opacity: 0, y: 24 });
      gsap.to(".house-cta", {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".house-cta", start: "top 92%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section
      id="house"
      data-tone="morning"
      ref={root}
      className="relative px-5 py-28 md:px-10 md:py-44"
    >
      <div className="mx-auto grid max-w-[90rem] gap-16 md:grid-cols-12 md:gap-10">
        {/* Arch, pinned while the moments scroll beside it on desktop */}
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <div className="house-arch-wrap relative aspect-[3/4] w-[min(80vw,24rem)] md:w-full md:max-w-[30rem]">
              <div
                aria-hidden="true"
                className="house-outline pointer-events-none absolute -inset-3 rounded-t-full border border-sky-fg/20 md:-inset-4"
              />
              <div className="house-arch absolute inset-0 overflow-hidden rounded-t-full bg-dusk">
                <div className="house-par absolute inset-x-0 -inset-y-[8%]">
                  <div className="house-scale absolute inset-0">
                    {HOUSE_IMAGE ? (
                      <Image
                        src={HOUSE_IMAGE}
                        alt={HOUSE_IMAGE_ALT}
                        fill
                        sizes="(min-width: 768px) 34vw, 80vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-dusk px-8 text-center text-ivory/60">
                        <span className="text-[0.65rem] uppercase tracking-[0.3em]">
                          Photo goes here
                        </span>
                        <span className="font-serif text-lg italic text-ivory/80">
                          public/images/house.jpg
                        </span>
                        <span className="text-[0.65rem] uppercase tracking-[0.3em]">
                          Portrait · 3:4
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-7 text-[0.65rem] uppercase tracking-[0.3em] text-sky-fg/55">
              02 — Morning
            </p>
          </div>
        </div>

        {/* Copy */}
        <div className="md:col-span-7 md:pl-10">
          <div className="house-head">
            <p className="house-fade flex items-center gap-4 text-[0.68rem] uppercase tracking-[0.3em] text-clay">
              <span className="h-px w-10 bg-clay" />
              The House
            </p>

            <h2
              className="mt-8 font-serif text-[clamp(2.6rem,6.2vw,5.4rem)] leading-[1] tracking-[-0.02em]"
              style={{ fontVariationSettings: '"SOFT" 70' }}
            >
              <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <span className="house-line block">Mornings here</span>
              </span>
              <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <span className="house-line block">
                  are <em className="text-clay">never</em> rushed.
                </span>
              </span>
            </h2>

            <p className="house-fade mt-8 max-w-lg text-base leading-relaxed text-sky-fg/75 md:text-lg">
              Wake up to the sound of water, not horns. House of Solace sits
              behind a quiet wall in Lagos, with a garden, a pool and a kitchen
              that starts early so you do not have to.
            </p>
          </div>

          <ul className="mt-16 md:mt-24">
            {moments.map((m) => (
              <li
                key={m.title}
                className="house-row group grid gap-x-8 gap-y-2 border-t border-sky-fg/15 py-8 md:grid-cols-[7rem_1fr]"
              >
                <span className="text-[0.7rem] uppercase tracking-[0.25em] text-sky-fg/55 transition-colors duration-500 group-hover:text-clay md:pt-2">
                  {m.time}
                </span>
                <div className="transition-transform duration-700 ease-out group-hover:translate-x-2">
                  <h3 className="font-serif text-2xl leading-snug md:text-3xl">
                    {m.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-sky-fg/70 md:text-base">
                    {m.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="house-cta mt-12 border-t border-sky-fg/15 pt-12">
            <ReserveButton size="lg" label="Reserve your morning" />
          </div>
        </div>
      </div>
    </section>
  );
}