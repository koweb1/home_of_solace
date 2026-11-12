"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import Voices from "@/components/sections/Voices";

type Ratio = "portrait" | "landscape" | "square" | "tall";

type Shot = {
  title: string;
  shape: "arch" | "box";
  ratio: Ratio;
  size: "lg" | "md" | "sm";
  align: "self-start" | "self-center" | "self-end";
  // 📸 REAL IMAGE: use the ratio shown in the comment next to each image.
  image: string;
  imagePath: string;
  imageAlt: string;
};

// Placeholder titles. Edit freely.
const shots: Shot[] = [
  {
    title: "Pool, after the last swim",
    shape: "arch",
    ratio: "portrait",
    size: "lg",
    align: "self-center",
    image: "", // 📸 REAL IMAGE (portrait 3:4): "/images/gallery/pool-dusk.jpg"
    imagePath: "public/images/gallery/pool-dusk.jpg",
    imageAlt: "The pool at House of Solace at dusk",
  },
  {
    title: "The Long Table, set",
    shape: "box",
    ratio: "landscape",
    size: "md",
    align: "self-end",
    image: "", // 📸 REAL IMAGE (landscape 4:3): "/images/gallery/long-table-set.jpg"
    imagePath: "public/images/gallery/long-table-set.jpg",
    imageAlt: "The Long Table set for dinner at House of Solace",
  },
  {
    title: "Lagoon deck",
    shape: "arch",
    ratio: "tall",
    size: "lg",
    align: "self-start",
    image: "", // 📸 REAL IMAGE (tall 2:3): "/images/gallery/lagoon-deck.jpg"
    imagePath: "public/images/gallery/lagoon-deck.jpg",
    imageAlt: "The lagoon deck at House of Solace",
  },
  {
    title: "Linen and light",
    shape: "box",
    ratio: "square",
    size: "sm",
    align: "self-center",
    image: "", // 📸 REAL IMAGE (square 1:1): "/images/gallery/suite-detail.jpg"
    imagePath: "public/images/gallery/suite-detail.jpg",
    imageAlt: "A suite detail at House of Solace, linen in warm light",
  },
  {
    title: "Ember Deck, after dark",
    shape: "arch",
    ratio: "portrait",
    size: "md",
    align: "self-end",
    image: "", // 📸 REAL IMAGE (portrait 3:4): "/images/gallery/ember-deck-night.jpg"
    imagePath: "public/images/gallery/ember-deck-night.jpg",
    imageAlt: "Ember Deck grill glowing after dark at House of Solace",
  },
  {
    title: "The spa, quiet hour",
    shape: "box",
    ratio: "landscape",
    size: "lg",
    align: "self-start",
    image: "", // 📸 REAL IMAGE (landscape 4:3): "/images/gallery/spa.jpg"
    imagePath: "public/images/gallery/spa.jpg",
    imageAlt: "The spa at House of Solace in the quiet hour",
  },
  {
    title: "Courtyard at last light",
    shape: "arch",
    ratio: "portrait",
    size: "lg",
    align: "self-center",
    image: "", // 📸 REAL IMAGE (portrait 3:4): "/images/gallery/courtyard-dusk.jpg"
    imagePath: "public/images/gallery/courtyard-dusk.jpg",
    imageAlt: "The courtyard at House of Solace at last light",
  },
];

const ratioClass: Record<Ratio, string> = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
  tall: "aspect-[2/3]",
};

const ratioLabel: Record<Ratio, string> = {
  portrait: "Portrait · 3:4",
  landscape: "Landscape · 4:3",
  square: "Square · 1:1",
  tall: "Tall portrait · 2:3",
};

const sizeClass: Record<Shot["size"], string> = {
  lg: "h-[50svh] md:h-[60svh]",
  md: "h-[40svh] md:h-[48svh]",
  sm: "h-[32svh] md:h-[38svh]",
};

const accent = "text-[#D99A78]";

export default function Gallery() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduced) return;

      const pin = root.current?.querySelector<HTMLElement>(".gallery-pin");
      const track = root.current?.querySelector<HTMLElement>(".gallery-track");
      if (!pin || !track) return;

      // How far the track has to travel sideways
      const getDist = () => Math.max(0, track.scrollWidth - pin.clientWidth);

      // Intro text
      gsap.set(".gallery-line", { yPercent: 115 });
      gsap.set(".gallery-fade", { opacity: 0, y: 24 });
      gsap.set(".gallery-bar", { scaleX: 0 });

      gsap
        .timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: { trigger: pin, start: "top 75%", once: true },
        })
        .to(".gallery-line", { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0)
        .to(
          ".gallery-fade",
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 },
          0.3
        );

      // The pinned sideways glide, with a soft lag (scrub: 1)
      const glide = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${getDist()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1, // refresh before the triggers below it
        },
      });

      glide
        .to(track, { x: () => -getDist() }, 0)
        .to(".gallery-bar", { scaleX: 1 }, 0);

      // Each frame rises open as it enters, and its photo drifts inside it
      gsap.utils.toArray<HTMLElement>(".gallery-frame").forEach((frame) => {
        const inner = frame.querySelector<HTMLElement>(".gallery-inner");

        gsap.fromTo(
          frame,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              containerAnimation: glide,
              start: "left 98%",
              end: "left 62%",
              scrub: true,
            },
          }
        );

        if (inner) {
          gsap.fromTo(
            inner,
            { scale: 1.18, xPercent: -7 },
            {
              scale: 1.18,
              xPercent: 7,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                containerAnimation: glide,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        }
      });
    },
    { scope: root }
  );

  return (
    <section id="gallery" data-tone="evening" ref={root} className="relative">
      <div className="gallery-pin relative flex h-screen flex-col justify-center overflow-hidden pt-20 motion-reduce:h-auto motion-reduce:overflow-x-auto motion-reduce:py-24">
        <ul className="gallery-track flex w-max items-center gap-10 px-5 pr-[22vw] md:gap-20 md:px-10">
          {/* Intro panel */}
          <li className="w-[82vw] shrink-0 md:w-[36vw]">
            <p
              className={`gallery-fade flex items-center gap-4 text-[0.68rem] uppercase tracking-[0.3em] ${accent}`}
            >
              <span className="h-px w-10 bg-[#D99A78]" />
              05 — Evening · The Gallery
            </p>

            <h2
              className="mt-8 font-serif text-[clamp(2.6rem,6.2vw,5.4rem)] leading-[1] tracking-[-0.02em]"
              style={{ fontVariationSettings: '"SOFT" 70' }}
            >
              <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <span className="gallery-line block">The lights come</span>
              </span>
              <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <span className="gallery-line block">
                  on, <em className={accent}>slowly</em>.
                </span>
              </span>
            </h2>

            <p className="gallery-fade mt-8 max-w-sm text-base leading-relaxed opacity-75 md:text-lg">
              A few frames from golden hour into the night. Keep scrolling,
              nobody is rushing you.
            </p>

            <p className="gallery-fade mt-10 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.3em] opacity-60">
              Scroll
              <span className="h-px w-16 bg-current" />
            </p>
          </li>

          {/* Frames */}
          {shots.map((shot, i) => (
            <li
              key={shot.title}
              className={`flex shrink-0 flex-col gap-4 ${shot.align}`}
            >
              <div
                className={`gallery-frame relative overflow-hidden ${
                  shot.shape === "arch" ? "rounded-t-full" : "rounded-2xl"
                } ${ratioClass[shot.ratio]} ${sizeClass[shot.size]}`}
              >
                <div className="gallery-inner absolute inset-0">
                  {shot.image ? (
                    <Image
                      src={shot.image}
                      alt={shot.imageAlt}
                      fill
                      sizes="(min-width: 768px) 30vw, 70vw"
                      className="object-cover"
                    />
                  ) : (
                    <ImagePlaceholder
                      path={shot.imagePath}
                      ratio={ratioLabel[shot.ratio]}
                      shape={shot.shape}
                    />
                  )}
                </div>
              </div>

              <p className="flex items-baseline gap-4 text-[0.65rem] uppercase tracking-[0.3em] opacity-70">
                <span className="opacity-60">0{i + 1}</span>
                {shot.title}
              </p>
            </li>
          ))}
        </ul>

        {/* Progress line */}
        <div
          aria-hidden="true"
          className="absolute inset-x-5 bottom-8 h-px bg-ivory/20 md:inset-x-10 motion-reduce:hidden"
        >
          <div className="gallery-bar h-full origin-left bg-ivory" />
        </div>
      </div>

      <Voices />
    </section>
  );
}