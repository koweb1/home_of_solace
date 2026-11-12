import type { ReservationData } from "@/types/reservation";

const formatDate = (iso: string) => {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** The key details of a request, as label / value pairs. */
export function buildSummary(d: ReservationData): [string, string][] {
  if (d.mode === "stay") {
    return [
      ["Room", d.room],
      ["Check in", formatDate(d.checkIn)],
      ["Check out", formatDate(d.checkOut)],
      ["Guests", d.guests],
    ];
  }

  if (d.mode === "table") {
    return [
      ["Venue", d.venue],
      ["Date", formatDate(d.date)],
      ["Time", d.time],
      ["Guests", d.guests],
    ];
  }

  return [
    ["Event", d.eventType],
    ["Date", formatDate(d.date)],
    ["Expected guests", d.guests],
  ];
}

const intro = {
  stay: "I’d like to reserve a stay.",
  table: "I’d like to reserve a table.",
  event: "I’d like to plan an event.",
};

/** A WhatsApp link with the whole request already written out. */
export function buildWhatsAppUrl(d: ReservationData, number: string) {
  const lines = [`Hello House of Solace, ${intro[d.mode]}`, ""];

  buildSummary(d).forEach(([label, value]) => lines.push(`${label}: ${value}`));

  lines.push("", `Name: ${d.name}`, `Phone: ${d.phone}`);
  if (d.email) lines.push(`Email: ${d.email}`);
  if (d.notes.trim()) lines.push(`Notes: ${d.notes.trim()}`);

  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
}