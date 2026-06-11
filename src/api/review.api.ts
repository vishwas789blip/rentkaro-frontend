import apiClient from "./axios";

import {
  Review,
  CreateReviewData,
  UpdateReviewData,
} from "../types/review.types";

export const reviewAPI = {
  /* =========================
     Get Reviews By Listing
  ========================= */

  getByListing: (listingId: string) =>
    apiClient.get<Review[]>(
      `/reviews/listing/${listingId}`
    ),

  /* =========================
     Create Review
  ========================= */

  create: (data: CreateReviewData) =>
    apiClient.post(
      "/reviews",
      data
    ),

  /* =========================
     Update Review
  ========================= */

  update: (
    reviewId: string,
    data: UpdateReviewData
  ) =>
    apiClient.put(
      `/reviews/${reviewId}`,
      data
    ),

  /* =========================
     Mark Helpful
  ========================= */

  markHelpful: (reviewId: string) =>
    apiClient.patch(
      `/reviews/${reviewId}/helpful`
    ),

  /* =========================
     Delete Review
  ========================= */

  delete: (reviewId: string) =>
    apiClient.delete(
      `/reviews/${reviewId}`
    ),

  /* =========================
     My Reviews
  ========================= */

  getMyReviews: () =>
    apiClient.get<Review[]>(
      "/reviews/user/my-reviews"
    ),

  /* =========================
     Get Single Review
  ========================= */

  getById: (reviewId: string) =>
    apiClient.get<Review>(
      `/reviews/${reviewId}`
    ),
};