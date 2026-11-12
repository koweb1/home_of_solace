export type Enquiry = {
  type: "table" | "event";
  name?: string;
};

/**
 * Remembers what the visitor wants to reserve (a table, or an event),
 * so the reservation form can preselect it later.
 */
export function saveEnquiry(enquiry: Enquiry) {
  try {
    sessionStorage.setItem("solace:enquiry", JSON.stringify(enquiry));
  } catch {
    // Storage can be blocked in private mode. Reserving still works.
  }
  window.dispatchEvent(new CustomEvent("solace:enquiry", { detail: enquiry }));
}