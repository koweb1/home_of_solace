"use client";

import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowUpRight, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { gsap, useGSAP } from "@/lib/gsap";
import LogoMark from "@/components/layout/Logo";
import { site } from "@/lib/site";
import { submitReservation } from "@/services/reservations";
import type { StayRequest } from "@/types/booking";
import type {
  FormState,
  ReservationData,
  ReservationMode,
} from "@/types/reservation";
import type { Enquiry } from "@/utils/saveEnquiry";
import { buildSummary, buildWhatsAppUrl } from "@/utils/reservationMessage";

const modes: { id: ReservationMode; label: string }[] = [
  { id: "stay", label: "A stay" },
  { id: "table", label: "A table" },
  { id: "event", label: "An event" },
];

const roomOptions = [
  "Not sure yet",
  "Garden Room",
  "Lagoon Suite",
  "Courtyard Villa",
  "The Solace House",
];
const venueOptions = ["The Long Table", "Ember Deck", "The Palm Bar"];
const eventOptions = [
  "Not sure yet",
  "Weddings & owambes",
  "Corporate retreats",
  "Private dinners",
  "Something else",
];
const guestOptions = ["1", "2", "3", "4", "5", "6", "7+"].map((value) => ({
  value,
  label: value === "1" ? "1 guest" : `${value} guests`,
}));

const submitLabel: Record<ReservationMode, string> = {
  stay: "Reserve my stay",
  table: "Reserve my table",
  event: "Send event enquiry",
};

const emptyForm: FormState = {
  room: "Not sure yet",
  checkIn: "",
  checkOut: "",
  venue: "The Long Table",
  time: "19:00",
  eventType: "Not sure yet",
  date: "",
  guests: "2",
  name: "",
  phone: "",
  email: "",
  notes: "",
};

const contacts: {
  icon: IconType;
  label: string;
  value: string;
  href?: string;
}[] = [
  {
    icon: FaWhatsapp,
    label: "WhatsApp",
    value: site.phoneDisplay,
    href: `https://wa.me/${site.whatsapp}`,
  },
  {
    icon: FiPhone,
    label: "Call",
    value: site.phoneDisplay,
    href: `tel:${site.phoneHref}`,
  },
  {
    icon: FiMail,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
  },
  { icon: FiMapPin, label: "Find us", value: site.address },
];

const labelClass = "text-[0.6rem] uppercase tracking-[0.25em] opacity-60";
const controlClass =
  "mt-2 w-full border-b border-ivory/25 bg-transparent pb-3 font-sans text-base text-ivory outline-none transition-colors duration-500 placeholder:text-ivory/30 focus:border-ivory [color-scheme:dark]";
const accent = "text-[#D99A78]";

const toISODate = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function validate(mode: ReservationMode, f: FormState) {
  const errors: Record<string, string> = {};

  if (mode === "stay") {
    if (!f.checkIn) errors.checkIn = "Choose your check-in date.";
    if (!f.checkOut) errors.checkOut = "Choose your check-out date.";
    else if (f.checkIn && f.checkOut <= f.checkIn)
      errors.checkOut = "Check-out must be after check-in.";
  }

  if (mode === "table") {
    if (!f.date) errors.date = "Choose a date.";
    if (!f.time) errors.time = "Choose a time.";
  }

  if (mode === "event") {
    if (!f.date) errors.date = "Choose a date.";
    if (!f.guests || Number(f.guests) < 1)
      errors.guests = "Roughly how many guests?";
  }

  if (f.name.trim().length < 2) errors.name = "Please tell us your name.";
  if (f.phone.replace(/\D/g, "").length < 10)
    errors.phone = "Add a number we can reach, ideally on WhatsApp.";
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email))
    errors.email = "That email doesn’t look right.";

  return errors;
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
};

function Field({ id, label, error, optional, className = "", children }: FieldProps) {
  return (
    <div className={`mode-field ${className}`}>
      <label htmlFor={`field-${id}`} className={`block ${labelClass}`}>
        {label}
        {optional && (
          <span className="ml-2 normal-case tracking-normal opacity-70">
            optional
          </span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-2 text-xs text-[#F0A58A]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Reserve() {
  const root = useRef<HTMLElement>(null);
  const formBody = useRef<HTMLDivElement>(null);
  const sentTitle = useRef<HTMLHeadingElement>(null);
  const firstMode = useRef(true);
  const firstStatus = useRef(true);

  const [mode, setMode] = useState<ReservationMode>("stay");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [sent, setSent] = useState<ReservationData | null>(null);
  const [today, setToday] = useState("");

  // Today's date, read in the browser so server and client markup match
  useEffect(() => {
    setToday(toISODate(new Date()));
  }, []);

  // Fill the form from what the visitor chose earlier on the page
  useEffect(() => {
    const read = <T,>(key: string): T | null => {
      try {
        const raw = sessionStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    };

    const applyRequest = (r: StayRequest) => {
      setMode("stay");
      setForm((f) => ({
        ...f,
        checkIn: r.checkIn || f.checkIn,
        checkOut: r.checkOut || f.checkOut,
        guests: r.guests || f.guests,
      }));
    };

    const applyRoom = (name: string) => {
      setMode("stay");
      setForm((f) => ({ ...f, room: name }));
    };

    const applyEnquiry = (e: Enquiry) => {
      if (e.type === "table") {
        setMode("table");
        setForm((f) => ({ ...f, venue: e.name ?? f.venue }));
      } else {
        setMode("event");
      }
    };

    const savedRequest = read<StayRequest>("solace:request");
    if (savedRequest) applyRequest(savedRequest);

    try {
      const savedRoom = sessionStorage.getItem("solace:room");
      if (savedRoom) applyRoom(savedRoom);
    } catch {
      // Storage can be blocked in private mode.
    }

    const savedEnquiry = read<Enquiry>("solace:enquiry");
    if (savedEnquiry) applyEnquiry(savedEnquiry);

    const onPrefill = (e: Event) =>
      applyRequest((e as CustomEvent<StayRequest>).detail);
    const onRoom = (e: Event) => applyRoom((e as CustomEvent<string>).detail);
    const onEnquiry = (e: Event) =>
      applyEnquiry((e as CustomEvent<Enquiry>).detail);

    window.addEventListener("solace:prefill", onPrefill);
    window.addEventListener("solace:room", onRoom);
    window.addEventListener("solace:enquiry", onEnquiry);

    return () => {
      window.removeEventListener("solace:prefill", onPrefill);
      window.removeEventListener("solace:room", onRoom);
      window.removeEventListener("solace:enquiry", onEnquiry);
    };
  }, []);

  // 1. Entrance when the chapter arrives
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.set(".reserve-line", { yPercent: 115 });
      gsap.set(".reserve-fade", { opacity: 0, y: 24 });
      gsap.set(".reserve-panel", { opacity: 0, y: 70 });

      gsap
        .timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: {
            trigger: root.current,
            start: "top 65%",
            once: true,
          },
        })
        .to(".reserve-line", { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0)
        .to(
          ".reserve-fade",
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 },
          0.3
        )
        .to(".reserve-panel", { opacity: 1, y: 0, duration: 1.6 }, 0.2);
    },
    { scope: root }
  );

  // 2. Fields glide in when the form switches between stay, table and event
  useGSAP(
    () => {
      if (firstMode.current) {
        firstMode.current = false;
        return;
      }
      if (prefersReducedMotion()) return;

      gsap.fromTo(
        ".mode-field",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.05,
          ease: "expo.out",
          clearProps: "opacity,transform",
        }
      );
    },
    { scope: root, dependencies: [mode] }
  );

  // 3. Pulsing ring on the button, and the success moment
  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      if (status === "idle") {
        if (!reduced) {
          gsap.fromTo(
            ".reserve-ring",
            { scale: 1, opacity: 0.55 },
            {
              scale: 1.14,
              opacity: 0,
              duration: 2.4,
              ease: "power2.out",
              repeat: -1,
              repeatDelay: 0.8,
            }
          );

          if (!firstStatus.current && formBody.current) {
            gsap.fromTo(
              formBody.current,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }
            );
          }
        }
        firstStatus.current = false;
        return;
      }

      if (status === "sent") {
        sentTitle.current?.focus({ preventScroll: true });

        if (reduced) {
          gsap.set(".logo-arch, .logo-base", { strokeDashoffset: 0 });
          gsap.set(".logo-sun", { opacity: 1 });
          return;
        }

        gsap.set(".sent-line", { yPercent: 115 });
        gsap.set(".sent-fade", { opacity: 0, y: 20 });

        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(
            ".logo-base",
            { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" },
            0
          )
          .to(
            ".logo-arch",
            { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" },
            0.15
          )
          .fromTo(
            ".logo-sun",
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2 },
            0.9
          )
          .to(".sent-line", { yPercent: 0, duration: 1.3 }, 1.1)
          .to(
            ".sent-fade",
            { opacity: 1, y: 0, duration: 1, stagger: 0.1 },
            1.3
          );
      }
    },
    { scope: root, dependencies: [status], revertOnUpdate: true }
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleCheckIn = (value: string) => {
    update("checkIn", value);
    if (form.checkOut && form.checkOut <= value) update("checkOut", "");
  };

  const switchMode = (next: ReservationMode) => {
    if (next === mode) return;
    setMode(next);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "idle") return;

    const found = validate(mode, form);
    setErrors(found);

    const firstError = Object.keys(found)[0];
    if (firstError) {
      document.getElementById(`field-${firstError}`)?.focus();
      return;
    }

    setStatus("sending");
    const data: ReservationData = { mode, ...form };

    try {
      const result = await submitReservation(data);
      if (!result.ok) throw new Error("Request failed");
    } catch {
      setStatus("idle");
      setErrors({
        form: "Something went wrong. Please try again, or message us on WhatsApp.",
      });
      return;
    }

    setSent(data);

    const body = formBody.current;
    if (body && !prefersReducedMotion()) {
      gsap.to(body, {
        opacity: 0,
        y: -16,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => setStatus("sent"),
      });
    } else {
      setStatus("sent");
    }
  };

  const firstName = sent?.name.trim().split(/\s+/)[0] ?? "";

  return (
    <section
      id="reserve"
      data-tone="night"
      ref={root}
      className="relative px-5 pb-28 pt-28 md:px-10 md:pb-44 md:pt-44"
    >
      <div className="mx-auto grid max-w-[90rem] gap-16 md:grid-cols-12 md:items-start md:gap-x-10 md:gap-y-12">
        {/* Heading */}
        <div className="md:col-span-5 md:row-start-1">
          <p
            className={`reserve-fade flex items-center gap-4 text-[0.68rem] uppercase tracking-[0.3em] ${accent}`}
          >
            <span className="h-px w-10 bg-[#D99A78]" />
            06 — Night · Reserve
          </p>

          <h2
            className="mt-8 font-serif text-[clamp(2.8rem,6.6vw,5.8rem)] leading-[1] tracking-[-0.02em]"
            style={{ fontVariationSettings: '"SOFT" 70' }}
          >
            <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
              <span className="reserve-line block">Come and</span>
            </span>
            <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
              <span className="reserve-line block">
                <em className={accent}>rest</em> a while.
              </span>
            </span>
          </h2>

          <p className="reserve-fade mt-8 max-w-md text-base leading-relaxed opacity-75 md:text-lg">
            Tell us when and who is coming. There is no payment today. We
            confirm availability and rates first, then hold your room.
          </p>
        </div>

        {/* Form panel */}
        <div className="reserve-panel rounded-[1.75rem] border border-ivory/10 bg-dusk p-6 shadow-[0_50px_120px_-60px_rgba(0,0,0,0.8)] md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1 md:p-10">
          {status !== "sent" ? (
            <div ref={formBody}>
              {/* What are you planning */}
              <div
                role="radiogroup"
                aria-label="What would you like to reserve?"
                className="flex flex-wrap gap-2"
              >
                {modes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={mode === m.id}
                    onClick={() => switchMode(m.id)}
                    className={`rounded-full border px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.2em] transition-colors duration-500 ${
                      mode === m.id
                        ? "border-ivory bg-ivory text-night"
                        : "border-ivory/25 hover:border-ivory/60"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <form
                noValidate
                onSubmit={handleSubmit}
                aria-busy={status === "sending"}
                className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2"
              >
                {/* Stay */}
                {mode === "stay" && (
                  <>
                    <Field
                      id="room"
                      label="Room"
                      className="sm:col-span-2"
                    >
                      <select
                        id="field-room"
                        value={form.room}
                        onChange={(e) => update("room", e.target.value)}
                        className={controlClass}
                      >
                        {roomOptions.map((o) => (
                          <option key={o} value={o} className="bg-night text-ivory">
                            {o}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field id="checkIn" label="Check in" error={errors.checkIn}>
                      <input
                        id="field-checkIn"
                        type="date"
                        min={today || undefined}
                        value={form.checkIn}
                        onChange={(e) => handleCheckIn(e.target.value)}
                        aria-invalid={Boolean(errors.checkIn)}
                        className={controlClass}
                      />
                    </Field>

                    <Field id="checkOut" label="Check out" error={errors.checkOut}>
                      <input
                        id="field-checkOut"
                        type="date"
                        min={form.checkIn || today || undefined}
                        value={form.checkOut}
                        onChange={(e) => update("checkOut", e.target.value)}
                        aria-invalid={Boolean(errors.checkOut)}
                        className={controlClass}
                      />
                    </Field>

                    <Field id="guests" label="Guests" className="sm:col-span-2">
                      <select
                        id="field-guests"
                        value={form.guests}
                        onChange={(e) => update("guests", e.target.value)}
                        className={controlClass}
                      >
                        {guestOptions.map((o) => (
                          <option
                            key={o.value}
                            value={o.value}
                            className="bg-night text-ivory"
                          >
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}

                {/* Table */}
                {mode === "table" && (
                  <>
                    <Field id="venue" label="Where" className="sm:col-span-2">
                      <select
                        id="field-venue"
                        value={form.venue}
                        onChange={(e) => update("venue", e.target.value)}
                        className={controlClass}
                      >
                        {venueOptions.map((o) => (
                          <option key={o} value={o} className="bg-night text-ivory">
                            {o}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field id="date" label="Date" error={errors.date}>
                      <input
                        id="field-date"
                        type="date"
                        min={today || undefined}
                        value={form.date}
                        onChange={(e) => update("date", e.target.value)}
                        aria-invalid={Boolean(errors.date)}
                        className={controlClass}
                      />
                    </Field>

                    <Field id="time" label="Time" error={errors.time}>
                      <input
                        id="field-time"
                        type="time"
                        value={form.time}
                        onChange={(e) => update("time", e.target.value)}
                        aria-invalid={Boolean(errors.time)}
                        className={controlClass}
                      />
                    </Field>

                    <Field id="guests" label="Guests" className="sm:col-span-2">
                      <select
                        id="field-guests"
                        value={form.guests}
                        onChange={(e) => update("guests", e.target.value)}
                        className={controlClass}
                      >
                        {guestOptions.map((o) => (
                          <option
                            key={o.value}
                            value={o.value}
                            className="bg-night text-ivory"
                          >
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}

                {/* Event */}
                {mode === "event" && (
                  <>
                    <Field
                      id="eventType"
                      label="What are you planning?"
                      className="sm:col-span-2"
                    >
                      <select
                        id="field-eventType"
                        value={form.eventType}
                        onChange={(e) => update("eventType", e.target.value)}
                        className={controlClass}
                      >
                        {eventOptions.map((o) => (
                          <option key={o} value={o} className="bg-night text-ivory">
                            {o}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field id="date" label="Date" error={errors.date}>
                      <input
                        id="field-date"
                        type="date"
                        min={today || undefined}
                        value={form.date}
                        onChange={(e) => update("date", e.target.value)}
                        aria-invalid={Boolean(errors.date)}
                        className={controlClass}
                      />
                    </Field>

                    <Field id="guests" label="Expected guests" error={errors.guests}>
                      <input
                        id="field-guests"
                        type="number"
                        min={1}
                        inputMode="numeric"
                        placeholder="e.g. 150"
                        value={form.guests === "2" ? "" : form.guests}
                        onChange={(e) => update("guests", e.target.value)}
                        aria-invalid={Boolean(errors.guests)}
                        className={controlClass}
                      />
                    </Field>
                  </>
                )}

                {/* About you */}
                <Field id="name" label="Your name" error={errors.name}>
                  <input
                    id="field-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    className={controlClass}
                  />
                </Field>

                <Field id="phone" label="Phone or WhatsApp" error={errors.phone}>
                  <input
                    id="field-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+234 …"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    className={controlClass}
                  />
                </Field>

                <Field
                  id="email"
                  label="Email"
                  optional
                  error={errors.email}
                  className="sm:col-span-2"
                >
                  <input
                    id="field-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    className={controlClass}
                  />
                </Field>

                <Field
                  id="notes"
                  label="Anything we should know?"
                  optional
                  className="sm:col-span-2"
                >
                  <textarea
                    id="field-notes"
                    rows={3}
                    placeholder="An anniversary, an early arrival, a food allergy…"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className={`${controlClass} resize-none`}
                  />
                </Field>

                {/* The Reserve button */}
                <div className="mode-field sm:col-span-2">
                  {errors.form && (
                    <p role="alert" className="mb-4 text-sm text-[#F0A58A]">
                      {errors.form}
                    </p>
                  )}

                  <div className="relative">
                    <span
                      aria-hidden="true"
                      className="reserve-ring pointer-events-none absolute inset-0 rounded-full border border-marigold"
                    />
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="group relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-marigold px-9 py-5 text-xs font-medium uppercase tracking-[0.18em] text-night transition-shadow duration-500 hover:shadow-[0_12px_50px_-12px_rgba(233,162,59,0.85)] disabled:opacity-70"
                    >
                      {status === "sending" ? "Sending…" : submitLabel[mode]}
                      {status !== "sending" && (
                        <FiArrowUpRight
                          aria-hidden="true"
                          className="transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      )}
                    </button>
                  </div>

                  <p className="mt-5 text-center text-xs leading-relaxed opacity-60">
                    No payment today. We confirm availability and rates first.
                    Check in from {site.checkIn}, check out by {site.checkOut}.
                  </p>
                </div>
              </form>
            </div>
          ) : (
            sent && (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center py-6 text-center md:py-10"
              >
                <LogoMark className="h-28 w-20 md:h-36 md:w-28" />

                <h3
                  ref={sentTitle}
                  tabIndex={-1}
                  className="mt-8 font-serif text-4xl leading-tight outline-none md:text-5xl"
                  style={{ fontVariationSettings: '"SOFT" 70' }}
                >
                  <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                    <span className="sent-line block">
                      Thank you, <em className={accent}>{firstName}</em>.
                    </span>
                  </span>
                </h3>

                <p className="sent-fade mt-5 max-w-md text-base leading-relaxed opacity-75">
                  Your request is in. We will confirm availability and rates by
                  WhatsApp or phone, usually within the hour.
                </p>

                <dl
                  className="sent-fade mt-10 grid w-full max-w-md grid-cols-2 gap-x-6 gap-y-5 border-y py-8 text-left"
                  style={{
                    borderColor:
                      "color-mix(in srgb, currentColor 18%, transparent)",
                  }}
                >
                  {buildSummary(sent).map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[0.6rem] uppercase tracking-[0.25em] opacity-55">
                        {label}
                      </dt>
                      <dd className="mt-1 font-serif text-lg">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="sent-fade mt-10 flex w-full max-w-md flex-col gap-4">
                  <a
                    href={buildWhatsAppUrl(sent, site.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-ivory px-9 py-4 text-xs font-medium uppercase tracking-[0.18em] text-night transition-opacity duration-500 hover:opacity-85"
                  >
                    <FaWhatsapp aria-hidden="true" className="text-base" />
                    Send it on WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="text-[0.7rem] uppercase tracking-[0.22em] opacity-70 transition-opacity duration-500 hover:opacity-100"
                  >
                    Edit my request
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Contact */}
        <div className="md:col-span-5 md:row-start-2">
          <ul
            className="reserve-fade border-t"
            style={{
              borderColor: "color-mix(in srgb, currentColor 18%, transparent)",
            }}
          >
            {contacts.map(({ icon: Icon, label, value, href }) => {
              const content = (
                <>
                  <Icon aria-hidden="true" className="text-lg opacity-70" />
                  <span className="text-[0.62rem] uppercase tracking-[0.25em] opacity-55">
                    {label}
                  </span>
                  <span className="ml-auto text-right font-serif text-lg md:text-xl">
                    {value}
                  </span>
                </>
              );

              return (
                <li
                  key={label}
                  className="border-b"
                  style={{
                    borderColor:
                      "color-mix(in srgb, currentColor 18%, transparent)",
                  }}
                >
                  {href ? (
                    <a
                      href={href}
                      {...(href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="flex items-center gap-4 py-5 transition-opacity duration-500 hover:opacity-70"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 py-5">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}