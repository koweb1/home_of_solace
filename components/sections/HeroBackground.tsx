"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function HeroBackground() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduced) return;

      // The sun starts below the horizon and rises when the loader is done
      gsap.set(".bg-sun", { y: 110 });
      gsap.set(".bg-glow", { opacity: 0.35 });

      const rise = () => {
        gsap.to(".bg-sun", { y: 0, duration: 3.2, ease: "expo.out" });
        gsap.to(".bg-glow", { opacity: 1, duration: 3.2, ease: "power2.out" });
      };

      if (document.documentElement.dataset.loaded === "true") {
        rise();
      } else {
        window.addEventListener("solace:loaded", rise, { once: true });
      }

      // Slow parallax while scrolling past the hero
      gsap.to(".bg-scene", {
        yPercent: 5,
        ease: "none",
        scrollTrigger: {
          trigger: root.current?.parentElement,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      return () => window.removeEventListener("solace:loaded", rise);
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="bg-scene absolute inset-x-0 -inset-y-[6%]">
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          fill="none"
        >
          <defs>
            <linearGradient id="bg-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E9D2C3" />
              <stop offset="0.5" stopColor="#F3DEC6" />
              <stop offset="1" stopColor="#F7E8D2" />
            </linearGradient>
            <linearGradient id="bg-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8A8DB0" />
              <stop offset="1" stopColor="#1B2559" />
            </linearGradient>
            <radialGradient id="bg-glow-grad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#F2C3A0" stopOpacity="0.85" />
              <stop offset="1" stopColor="#F2C3A0" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Sky */}
          <rect width="1600" height="900" fill="url(#bg-sky)" />

          {/* Glow and half-sun (the water below covers the lower half) */}
          <circle
            className="bg-glow"
            cx="800"
            cy="650"
            r="560"
            fill="url(#bg-glow-grad)"
          />
          <circle className="bg-sun" cx="800" cy="650" r="110" fill="#E2936A" />

          {/* Far shore */}
          <path
            d="M0 640 C 200 620, 400 636, 600 628 S 1100 616, 1600 634 V 662 H 0Z"
            fill="#4A5384"
            opacity="0.5"
          />

          {/* Lagoon */}
          <rect y="650" width="1600" height="250" fill="url(#bg-water)" />

          {/* Sun reflection */}
          <g fill="#E2936A" opacity="0.7">
            <rect x="690" y="668" width="220" height="4" rx="2" />
            <rect x="720" y="688" width="160" height="4" rx="2" />
            <rect x="745" y="712" width="110" height="4" rx="2" />
            <rect x="765" y="740" width="70" height="4" rx="2" />
            <rect x="780" y="772" width="40" height="4" rx="2" />
          </g>

          {/* Foreground bank */}
          <path
            d="M0 820 C 300 790, 560 836, 820 824 S 1360 792, 1600 818 V 900 H 0Z"
            fill="#0E1433"
          />

          {/* Palms */}
          <g stroke="#0E1433" strokeLinecap="round">
            <path d="M210 850 C 224 740, 252 650, 300 560" strokeWidth="12" />
            <g strokeWidth="7">
              <path d="M300 560 Q 220 520 150 566" />
              <path d="M300 560 Q 250 490 176 482" />
              <path d="M300 560 Q 316 480 378 462" />
              <path d="M300 560 Q 392 512 466 552" />
              <path d="M300 560 Q 270 510 258 452" />
            </g>

            <path d="M1390 860 C 1384 770, 1404 700, 1446 640" strokeWidth="9" />
            <g strokeWidth="6">
              <path d="M1446 640 Q 1392 610 1336 642" />
              <path d="M1446 640 Q 1420 580 1366 570" />
              <path d="M1446 640 Q 1470 580 1526 572" />
              <path d="M1446 640 Q 1520 616 1570 654" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}