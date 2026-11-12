export type ReservationMode = "stay" | "table" | "event";

export type FormState = {
  // stay
  room: string;
  checkIn: string;
  checkOut: string;
  // table
  venue: string;
  time: string;
  // event
  eventType: string;
  // stay, table and event
  date: string;
  guests: string;
  // everyone
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export type ReservationData = FormState & {
  mode: ReservationMode;
};