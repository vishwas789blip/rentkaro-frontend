import { useQuery } from "@tanstack/react-query";
import { listingAPI } from "@/api";

export const useListing = (id: string | undefined) => {
  return useQuery({
    queryKey: ["listing", id],

    queryFn: async () => {
      const res = await listingAPI.getById(id!);

      return (
        res.data?.data?.listing ||
        res.data?.data ||
        res.data?.listing ||
        res.data
      );
    },

    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};