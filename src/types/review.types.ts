export interface Review {
  id: string;
  listingId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewData {
  listingId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating: number;
  comment: string;
}