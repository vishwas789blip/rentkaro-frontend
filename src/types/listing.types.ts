export interface Listing {
  _id: string;
  title: string;
  description: string;
  pricePerMonth: number;

  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  rooms: {
    availableRooms: number;
    roomType:
      | "single"
      | "double"
      | "triple"
      | "quad";
  };

  images: {
    url: string;
    publicId: string;
  }[];

  amenities: string[];
}

export interface ListingFilters {
  search?: string;
  city?: string;
  location?: string;
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string | string[];
  sort?: string;
  page?: number;
  limit?: number;
}