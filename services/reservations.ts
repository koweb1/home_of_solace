import type { ReservationData } from "@/types/reservation";

/**
 * Sends a reservation request.
 *
 * TODO: save the request to Firestore here (and notify the front desk).
 * Until this is connected nothing is stored or sent, it only pretends to.
 * The WhatsApp button on the success screen is the real way a request
 * reaches the hotel for now.
 */
export async function submitReservation(
  data: ReservationData
): Promise<{ ok: boolean }> {
  void data;
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { ok: true };
}