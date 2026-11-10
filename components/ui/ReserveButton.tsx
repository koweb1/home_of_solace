"use client";

import { useRef } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToSection } from "@/utils/scrollToSection";

type ReserveButtonProps = {
  href?: string;
  label?: string;
  size?: "sm" | "lg";
  className?: string;
  onNavigate?: () => void;
};

const sizes = {
  sm: "px-5 py-2.5 text-[0.68rem]",
  lg: "px-9 py-4 text-xs",
};

export default function ReserveButton({
  href = "#reserve",
  label = "Reserve",
  size = "sm",
  className = "",
  onNavigate,
}: ReserveButtonProps) {
  const button = useRef<HTMLAnchorElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  // Subtle magnetic pull (desktop with a mouse only)
  useGSAP(
    () => {
      const el = button.current;
      const text = inner.current;
      if (!el || !text) return;

      const canHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      ).matches;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (!canHover || reduced) return;

      const opts = { duration: 0.7, ease: "power3.out" };
      const xTo = gsap.quickTo(el, "x", opts);
      const yTo = gsap.quickTo(el, "y", opts);
      const textX = gsap.quickTo(text, "x", opts);
      const textY = gsap.quickTo(text, "y", opts);

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * 0.25);
        yTo(dy * 0.35);
        textX(dx * 0.12);
        textY(dy * 0.18);
      };

      const onLeave = () => {
        xTo(0);
        yTo(0);
        textX(0);
        textY(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);

      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: button }
  );

  return (
    <a
      ref={button}
      href={href}
      onClick={(e) => {
        if (scrollToSection(href)) e.preventDefault();
        onNavigate?.();
      }}
      className={`group relative inline-flex items-center gap-2 rounded-full bg-marigold font-medium uppercase tracking-[0.18em] text-night transition-shadow duration-500 will-change-transform hover:shadow-[0_12px_40px_-12px_rgba(233,162,59,0.8)] ${sizes[size]} ${className}`}
    >
      <span ref={inner} className="inline-flex items-center gap-2">
        {label}
        <FiArrowUpRight
          aria-hidden="true"
          className="transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </span>
    </a>
  );
}