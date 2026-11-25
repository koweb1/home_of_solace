"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type Voice = {
  time: string;
  place: string;
  before: string;
  key: string; // the phrase picked out in clay
  after: string;
  name: string;
  from: string;
  stay: string;
  image: string;
  imageAlt: string;
};

// Sample copy with made-up names. Replace with real reviews when you have them.
// The photos are ones already on the site (all 3:4).
const voices: Voice[] = [
  {
    time: "06:40",
    place: "The pool",
    before:
      "I came for a weekend between two work trips. By half past six I was in the pool, alone, and I realised I had ",
    key: "left my phone in the room",
    after: ". Lagos has never been this quiet for me.",
    name: "Adaeze O.",
    from: "Abuja",
    stay: "Garden Room",
    image: "/images/gallery/pool-dusk.jpg",
    imageAlt: "The pool at House of Solace",
  },
  {
    time: "13:15",
    place: "The Lagoon Suite",
    before:
      "We meant to rest for an hour after lunch. We woke up at five with the balcony doors still open, and ",
    key: "the lagoon had gone gold",
    after: ". Best nap of our marriage.",
    name: "Tunde & Ife B.",
    from: "Ibadan",
    stay: "Lagoon Suite",
    image: "/images/rooms/lagoon-suite.jpg",
    imageAlt: "The Lagoon Suite at House of Solace",
  },
  {
    time: "22:10",
    place: "Ember Deck",
    before:
      "Suya off the grill, a cold drink in my hand, the lagoon black and still. ",
    key: "I did not check the time once",
    after: ". For a man who lives by his calendar, that is the whole review.",
    name: "Kelechi M.",
    from: "Port Harcourt",
    stay: "Courtyard Villa",
    image: "/images/gallery/ember-deck-night.jpg",
    imageAlt: "Ember Deck glowing after dark at House of Solace",
  },
];

type Mode = "list" | "stage" | "swipe";

const accent = "text-[#D99A78]";
const total = voices.length;
const pad = (n: number) => String(n).padStart(2, "0");

const hairline = {
  borderColor: "color-mix(in srgb, currentColor 18%, transparent)",
};

// The picked-out phrase gets an underline that can be drawn in
const markStyle: React.CSSProperties = {
  backgroundImage: "linear-gradient(currentColor, currentColor)",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0 100%",
  backgroundSize: "100% 1px",
  WebkitBoxDecorationBreak: "clone",
  boxDecorationBreak: "clone",
  paddingBottom: "0.08em",
};

const softStyle = { fontVariationSettings: '"SOFT" 70' };

function Time({
  value,
  lineClass,
  className,
}: {
  value: string;
  lineClass: string;
  className: string;
}) {
  const [h, m] = value.split(":");
  return (
    <p className={className} style={softStyle}>
      <span className="block overflow-hidden pb-[0.08em]">
        <span className={`${lineClass} block`}>
          {h}
          <span className={accent}>:</span>
          {m}
        </span>
      </span>
    </p>
  );
}

function Quote({ voice, className }: { voice: Voice; className: string }) {
  return (
    <blockquote className={className}>
      <p>
        <span className={accent}>“</span>
        {voice.before}
        <span className={`v-mark italic ${accent}`} style={markStyle}>
          {voice.key}
        </span>
        {voice.after}
        <span className={accent}>”</span>
      </p>
    </blockquote>
  );
}

function Who({ voice, className }: { voice: Voice; className: string }) {
  return (
    <figcaption className={className}>
      <span className="font-serif text-xl">{voice.name}</span>
      <span className="text-[0.65rem] uppercase tracking-[0.3em] opacity-60">
        {voice.from}
      </span>
      <span className={`text-sm italic ${accent}`}>
        Stayed in the {voice.stay}
      </span>
    </figcaption>
  );
}

function Label({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-center gap-4 text-[0.68rem] uppercase tracking-[0.3em] ${accent} ${className}`}
    >
      <span className="h-px w-10 bg-[#D99A78]" />
      Voices · Overheard at Solace
    </p>
  );
}

export default function Voices() {
  const root = useRef<HTMLDivElement>(null);
  const swipe = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  // "list" is the safe default (also used for reduced motion and before load)
  const [mode, setMode] = useState<Mode>("list");
  const [active, setActive] = useState(0);

  // Pick the layout: laptop, phone, or reduced motion
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");

    const update = () =>
      setMode(reduce.matches ? "list" : wide.matches ? "stage" : "swipe");

    update();
    reduce.addEventListener("change", update);
    wide.addEventListener("change", update);

    return () => {
      reduce.removeEventListener("change", update);
      wide.removeEventListener("change", update);
    };
  }, []);

  // The layout changes the page height, so everything below recalculates
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [mode]);

  // Stop any pending scroll frame when the component goes away
  useEffect(() => {
    return () => cancelAnimationFrame(raf.current);
  }, []);

  // 1. Laptop: the scroll steps through the voices
  useGSAP(
    () => {
      if (mode !== "stage") return;

      const wrapper = root.current?.querySelector<HTMLElement>(".v-wrap");
      if (!wrapper) return;

      const slides = gsap.utils.toArray<HTMLElement>(".v-slide", wrapper);
      const photos = gsap.utils.toArray<HTMLElement>(".v-photo", wrapper);
      const scales = gsap.utils.toArray<HTMLElement>(".v-photo-scale", wrapper);

      // Starting states: only the first voice is showing
      slides.forEach((slide, i) => {
        if (i === 0) return;
        const q = gsap.utils.selector(slide);
        gsap.set(q(".v-line"), { yPercent: 115 });
        gsap.set(q(".v-fade"), { opacity: 0, y: 30 });
        gsap.set(q(".v-mark"), { backgroundSize: "0% 1px" });
      });

      photos.forEach((photo, i) => {
        if (i === 0) return;
        gsap.set(photo, { opacity: 0 });
        gsap.set(scales[i], { scale: 1.12 });
      });

      gsap.set(".v-bar", { scaleX: 0 });

      // The whole panel fades up as the section arrives
      gsap.from(".v-stage-inner", {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: wrapper, start: "top 75%", once: true },
      });

      // One scrubbed timeline: hold, change voice, hold, change voice, hold
      const HOLD = 0.8;
      const MOVE = 0.5;
      const count = slides.length;
      const end = HOLD + (count - 1) * (MOVE + HOLD);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      slides.forEach((slide, i) => {
        const next = slides[i + 1];
        if (!next) return;

        const T = HOLD + i * (MOVE + HOLD);
        const now = gsap.utils.selector(slide);
        const then = gsap.utils.selector(next);

        // The current voice slides up and away
        tl.to(
          now(".v-line"),
          { yPercent: -115, duration: MOVE * 0.55, ease: "power2.in" },
          T
        )
          .to(
            now(".v-fade"),
            { opacity: 0, y: -30, duration: MOVE * 0.5, ease: "power2.in" },
            T
          )
          // The photo of the place changes
          .to(
            photos[i],
            { opacity: 0, duration: MOVE, ease: "power1.inOut" },
            T
          )
          .to(
            photos[i + 1],
            { opacity: 1, duration: MOVE, ease: "power1.inOut" },
            T
          )
          .to(
            scales[i + 1],
            { scale: 1, duration: MOVE * 1.6, ease: "power2.out" },
            T
          )
          // The next voice rises in
          .to(
            then(".v-line"),
            { yPercent: 0, duration: MOVE * 0.6, ease: "power3.out" },
            T + MOVE * 0.4
          )
          .to(
            then(".v-fade"),
            {
              opacity: 1,
              y: 0,
              duration: MOVE * 0.6,
              stagger: 0.04,
              ease: "power3.out",
            },
            T + MOVE * 0.45
          )
          .to(
            then(".v-mark"),
            { backgroundSize: "100% 1px", duration: MOVE * 0.5, ease: "power2.out" },
            T + MOVE * 0.9
          );
      });

      // Progress line along the bottom
      tl.to(".v-bar", { scaleX: 1, duration: end, ease: "none" }, 0);
    },
    { scope: root, dependencies: [mode], revertOnUpdate: true }
  );

  // 2. Phone: the voice you land on rises into place
  useGSAP(
    () => {
      if (mode !== "swipe") return;

      const card = root.current?.querySelectorAll<HTMLElement>(".m-card")[active];
      if (!card) return;

      const q = gsap.utils.selector(card);
      const trigger = { trigger: card, start: "top 85%", once: true };

      gsap.fromTo(
        q(".m-line"),
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: trigger,
        }
      );

      gsap.fromTo(
        q(".m-fade"),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.08,
          delay: 0.1,
          ease: "expo.out",
          scrollTrigger: trigger,
        }
      );
    },
    { scope: root, dependencies: [mode, active], revertOnUpdate: true }
  );

  const stepWidth = () => {
    const card = swipe.current?.querySelector<HTMLElement>(".m-card");
    return card ? card.offsetWidth + 16 : 0; // 16 = gap-4
  };

  const onSwipeScroll = () => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = swipe.current;
      const step = stepWidth();
      if (!el || !step) return;
      const index = Math.round(el.scrollLeft / step);
      setActive(Math.min(total - 1, Math.max(0, index)));
    });
  };

  const goTo = (index: number) => {
    swipe.current?.scrollTo({ left: index * stepWidth(), behavior: "smooth" });
  };

  return (
    <div ref={root} className="relative">
      {/* LAPTOP: a panel that sticks while the scroll steps through the voices */}
      {mode === "stage" && (
        <div className="v-wrap relative h-[300svh]">
          <div className="sticky top-0 flex h-screen items-center overflow-hidden px-10 pt-16">
            <div className="v-stage-inner mx-auto grid w-full max-w-[90rem] grid-cols-12 items-center gap-10">
              <div className="col-span-7 pr-6">
                <h3 className="sr-only">Overheard at Solace</h3>
                <Label className="mb-8" />

                <div className="grid">
                  {voices.map((voice, i) => (
                    <figure
                      key={voice.name}
                      className="v-slide"
                      style={{ gridArea: "1 / 1" }}
                    >
                      <p className="v-fade flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.3em]">
                        <span className="opacity-60">
                          {pad(i + 1)} / {pad(total)}
                        </span>
                        <span className="h-px w-8 bg-current opacity-40" />
                        {voice.place}
                      </p>

                      <Time
                        value={voice.time}
                        lineClass="v-line"
                        className="mt-3 font-serif text-[clamp(4rem,16vh,9rem)] leading-[0.95] tracking-[-0.03em] tabular-nums"
                      />

                      <Quote
                        voice={voice}
                        className="v-fade mt-5 max-w-[38rem] font-serif text-[clamp(1.25rem,min(2vw,3.6vh),2rem)] leading-[1.25] tracking-[-0.01em]"
                      />

                      <Who
                        voice={voice}
                        className="v-fade mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-1"
                      />
                    </figure>
                  ))}
                </div>
              </div>

              {/* The place being talked about */}
              <div className="col-span-5 flex justify-end">
                <div className="relative aspect-[3/4] h-[62svh] max-h-[42rem]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-4 rounded-t-full border border-ivory/20"
                  />
                  <div className="absolute inset-0 overflow-hidden rounded-t-full bg-dusk">
                    {voices.map((voice) => (
                      <div key={voice.image} className="v-photo absolute inset-0">
                        <div className="v-photo-scale absolute inset-0">
                          <Image
                            src={voice.image}
                            alt={voice.imageAlt}
                            fill
                            sizes="34vw"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="absolute inset-x-10 bottom-8 h-px bg-ivory/20"
            >
              <div className="v-bar h-full origin-left bg-ivory" />
            </div>
          </div>
        </div>
      )}

      {/* PHONE: swipe through the voices */}
      {mode === "swipe" && (
        <div className="pb-24 pt-20">
          <div className="px-5">
            <Label />
            <h3
              className="mt-6 font-serif text-[2.6rem] leading-[1.02] tracking-[-0.02em]"
              style={softStyle}
            >
              Overheard at <em className={accent}>Solace</em>.
            </h3>
          </div>

          <div
            ref={swipe}
            onScroll={onSwipeScroll}
            className="mt-10 flex snap-x snap-mandatory scroll-pl-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {voices.map((voice, i) => (
              <figure key={voice.name} className="m-card w-[86%] shrink-0 snap-start">
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-dusk">
                  <Image
                    src={voice.image}
                    alt={voice.imageAlt}
                    fill
                    sizes="86vw"
                    className="object-cover"
                  />
                </div>

                {/* The text fades back on the card you are not on, so a
                    half-visible neighbour never competes with the quote */}
                <div
                  className={`mt-7 transition-opacity duration-500 ${
                    active === i ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <p className="m-fade flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.28em]">
                    <span className="opacity-60">
                      {pad(i + 1)} / {pad(total)}
                    </span>
                    <span className="h-px w-6 bg-current opacity-40" />
                    {voice.place}
                  </p>

                  <Time
                    value={voice.time}
                    lineClass="m-line"
                    className="mt-3 font-serif text-[3.5rem] leading-[0.95] tracking-[-0.03em] tabular-nums"
                  />

                  <Quote
                    voice={voice}
                    className="m-fade mt-6 text-pretty font-serif text-[1.3rem] leading-[1.38] tracking-[-0.005em]"
                  />

                  <div
                    className="m-fade mt-7 border-t pt-5"
                    style={hairline}
                  >
                    <p className="font-serif text-[1.2rem] leading-tight">
                      {voice.name}
                    </p>
                    <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-[0.65rem] uppercase tracking-[0.28em] opacity-60">
                        {voice.from}
                      </span>
                      <span aria-hidden="true" className="opacity-40">
                        ·
                      </span>
                      <span className={`text-sm italic ${accent}`}>
                        Stayed in the {voice.stay}
                      </span>
                    </p>
                  </div>
                </div>
              </figure>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between px-5">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] opacity-60">
              {pad(active + 1)} / {pad(total)}
            </p>
            <div className="flex">
              {voices.map((voice, i) => (
                <button
                  key={voice.name}
                  type="button"
                  aria-label={`Show voice ${i + 1}`}
                  aria-current={active === i}
                  onClick={() => goTo(i)}
                  className="flex h-8 w-8 items-center justify-center"
                >
                  <span
                    className={`block h-1.5 rounded-full bg-ivory transition-all duration-500 ${
                      active === i ? "w-6" : "w-1.5 opacity-40"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REDUCED MOTION (and before load): all voices, one after another */}
      {mode === "list" && (
        <div className="px-5 py-24 md:px-10 md:py-40">
          <div className="mx-auto max-w-[90rem]">
            <Label />
            <h3
              className="mt-6 font-serif text-[clamp(2.6rem,6vw,5rem)] leading-[1.02] tracking-[-0.02em]"
              style={softStyle}
            >
              Overheard at <em className={accent}>Solace</em>.
            </h3>

            <ul className="mt-14 space-y-20 md:mt-24 md:space-y-28">
              {voices.map((voice, i) => (
                <li key={voice.name}>
                  <figure className="grid gap-8 md:grid-cols-12 md:items-center md:gap-12">
                    <div className="relative aspect-[3/4] w-[min(70vw,18rem)] overflow-hidden rounded-t-full bg-dusk md:col-span-4">
                      <Image
                        src={voice.image}
                        alt={voice.imageAlt}
                        fill
                        sizes="(min-width: 768px) 24vw, 70vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="md:col-span-8">
                      <p className="flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.3em]">
                        <span className="opacity-60">
                          {pad(i + 1)} / {pad(total)}
                        </span>
                        <span className="h-px w-8 bg-current opacity-40" />
                        {voice.place}
                      </p>

                      <Time
                        value={voice.time}
                        lineClass="list-line"
                        className="mt-3 font-serif text-[clamp(4rem,9vw,8rem)] leading-[0.95] tracking-[-0.03em] tabular-nums"
                      />

                      <Quote
                        voice={voice}
                        className="mt-5 max-w-[40rem] font-serif text-[clamp(1.4rem,2.4vw,2.1rem)] leading-[1.25]"
                      />

                      <Who
                        voice={voice}
                        className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-1"
                      />
                    </div>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}