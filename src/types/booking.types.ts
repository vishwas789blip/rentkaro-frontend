export interface Booking {
  id: string;
  listingId: string;
  userId: string;
  startDate: string;
  endDate: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";
}

export interface CreateBookingData {
  listingId: string;
  startDate: string;
  endDate: string;
}