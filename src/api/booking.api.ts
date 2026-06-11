import apiClient from "./axios";

import {
  Booking,
  CreateBookingData,
} from "../types/booking.types";

export const bookingAPI = {
  /* =========================
     Create Booking
  ========================= */

  create: (
    data: CreateBookingData
  ) =>
    apiClient.post(
      "/bookings",
      data
    ),

  /* =========================
     User Bookings
  ========================= */

  getMyBookings: () =>
    apiClient.get<Booking[]>(
      "/bookings/my"
    ),

  /* =========================
     PG Owner Bookings
  ========================= */

  getOwnerBookings: () =>
    apiClient.get<Booking[]>(
      "/bookings/owner"
    ),

  /* =========================
     Admin Bookings
  ========================= */

  getAllBookings: () =>
    apiClient.get<Booking[]>(
      "/bookings/admin/all"
    ),

  /* =========================
     Approve Booking
  ========================= */

  approve: (id: string) =>
    apiClient.patch(
      `/bookings/${id}/approve`
    ),

  /* =========================
     Reject Booking
  ========================= */

  reject: (
    id: string,
    rejectionReason: string
  ) =>
    apiClient.patch(
      `/bookings/${id}/reject`,
      {
        rejectionReason,
      }
    ),

  /* =========================
     Cancel Booking
  ========================= */

  cancel: (id: string) =>
    apiClient.patch(
      `/bookings/${id}/cancel`
    ),
};