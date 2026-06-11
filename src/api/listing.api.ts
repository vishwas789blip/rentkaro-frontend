import apiClient from "./axios";
import {
  Listing,
  ListingFilters,
} from "../types/listing.types";

export const listingAPI = {
  /* =========================
     Get All Listings
  ========================= */

  getAll: (
    params?: ListingFilters
  ) =>
    apiClient.get<Listing[]>(
      "/pg-listings",
      {
        params,
      }
    ),

  /* =========================
     Get Listing By Id
  ========================= */

  getById: (id: string) =>
    apiClient.get<Listing>(
      `/pg-listings/${id}`
    ),

  /* =========================
     Create Listing
  ========================= */

  create: (
    data: FormData
  ) =>
    apiClient.post(
      "/pg-listings",
      data,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    ),

  /* =========================
     Update Listing
  ========================= */

  update: (
    id: string,
    data: FormData
  ) =>
    apiClient.put(
      `/pg-listings/${id}`,
      data,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    ),

  /* =========================
     Delete Listing
  ========================= */

  delete: (id: string) =>
    apiClient.delete(
      `/pg-listings/${id}`
    ),

  /* =========================
     Owner Listings
  ========================= */

  getOwnerListings: () =>
    apiClient.get(
      "/pg-listings/owner/my-listings"
    ),

  /* =========================
     Update Availability
  ========================= */

  updateAvailability: (
    id: string,
    availableRooms: number
  ) =>
    apiClient.patch(
      `/pg-listings/${id}/availability`,
      {
        availableRooms,
      }
    ),
};