import apiClient from "./axios";

export const wishlistAPI = {
  getMyWishlist: () =>
    apiClient.get("/wishlist"),

  addToWishlist: (listingId: string) =>
    apiClient.post(`/wishlist/${listingId}`),

  removeFromWishlist: (listingId: string) =>
    apiClient.delete(`/wishlist/${listingId}`),
};