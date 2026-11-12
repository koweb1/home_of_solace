"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Voice = {
  quote: string;
  name: string;
  from: string;
  stay: string;
};

// Sample copy with made-up names. Replace with real reviews when you have them.
const voices: Voice[] = [
  {
    quote:
      "I came for a weekend between two work trips. I left on Monday and cancelled my Tuesday meeting. Nobody has ever made Lagos this quiet for me.",
    name: "Adaeze O.",
    from: "Abuja",
    stay: "Lagoon Suite",
  },
  {
    quote:
      "We held our wedding weekend here. Three hundred guests, a generator we never once heard, and my mother-in-law asked for the jollof recipe.",
    name: "Tunde & Ife B.",
    from: "Ibadan",
    stay: "Weddings & owambes",
  },
  {
    quote:
      "The breakfast alone is worth the stay. Akara hot from the kitchen at 11:40, because I overslept and nobody minded.",
    name: "Kelechi M.",
    from: "Port Harcourt",
    stay: "Garden Room",
  },
];

const hairline = {
  borderColor: "color-mix(in srgb, currentColor 18%, transparent)",
};

const accent = "text-[#D99A78]";

export default function Voices() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduced) return;

      gsap.set(".voices-line", { yPercent: 115 });
      gsap.set(".voices-fade", { opacity: 0, y: 24 });

      gsap
        .timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: {
            trigger: ".voices-head",
            start: "top 85%",
            once: true,
          },
        })
        .to(".voices-line", { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0)
        .to(
          ".voices-fade",
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 },
          0.3
        );

      gsap.utils.toArray<HTMLElement>(".voice").forEach((voice) => {
        const q = gsap.utils.selector(voice);

        gsap.set(q(".voice-fade"), { opacity: 0, y: 36 });

        gsap.to(q(".voice-fade"), {
          opacity: 1,
          y: 0,
          duration: 1.4,
          stagger: 0.14,
          ease: "expo.out",
          scrollTrigger: { trigger: voice, start: "top 85%", once: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className="relative px-5 pb-32 pt-24 md:px-10 md:pb-52 md:pt-40"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="voices-head">
          <p
            className={`voices-fade flex items-center gap-4 text-[0.68rem] uppercase tracking-[0.3em] ${accent}`}
          >
            <span className="h-px w-10 bg-[#D99A78]" />
            Voices
          </p>

          <h3
            className="mt-8 font-serif text-[clamp(2.6rem,6.2vw,5.4rem)] leading-[1] tracking-[-0.02em]"
            style={{ fontVariationSettings: '"SOFT" 70' }}
          >
            <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
              <span className="voices-line block">Said by people</span>
            </span>
            <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
              <span className="voices-line block">
                who <em className={accent}>stayed</em>.
              </span>
            </span>
          </h3>
        </div>

        <ul className="mt-16 md:mt-28">
          {voices.map((voice, i) => (
            <li
              key={voice.name}
              className="voice border-t py-12 last:border-b md:py-16"
              style={hairline}
            >
              <figure className="grid gap-8 md:grid-cols-12 md:gap-10">
                <figcaption className="voice-fade flex flex-col gap-2 md:col-span-3">
                  <span className="text-[0.7rem] tracking-[0.25em] opacity-55">
                    0{i + 1}
                  </span>
                  <span className="font-serif text-xl">{voice.name}</span>
                  <span className="text-[0.65rem] uppercase tracking-[0.3em] opacity-60">
                    {voice.from}
                  </span>
                  <span className={`text-sm italic ${accent}`}>
                    {voice.stay}
                  </span>
                </figcaption>

                <blockquote className="voice-fade md:col-span-9">
                  <p className="font-serif text-[clamp(1.7rem,3.4vw,3rem)] leading-[1.2] tracking-[-0.01em]">
                    <span className={accent}>“</span>
                    {voice.quote}
                    <span className={accent}>”</span>
                  </p>
                </blockquote>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}