import { useQuery } from "@tanstack/react-query";
import { reviewAPI } from "@/api";

export const useReviews = (
  listingId: string | undefined
) => {
  return useQuery({
    queryKey: ["reviews", listingId],

    queryFn: async () => {
      const res = await reviewAPI.getByListing(
        listingId
      );

      return (
        res.data?.data?.reviews ||
        res.data?.data ||
        []
      );
    },

    enabled: !!listingId,
  });
};