import { ThumbsUp, Trash2, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { reviewAPI } from "@/api";
import { useState } from "react";

interface ReviewProps {
  review: any;
  onDelete: (id: string) => void;
}

const ReviewCard = ({ review, onDelete }: ReviewProps) => {
  const { user } = useAuth();

  const isOwner =
    user?.id === (review.user?._id || review.user?.id);

  const [isLiked, setIsLiked] = useState(
    review.helpfulBy?.some(
      (id: string) => id === user?.id
    ) || false
  );

  const [likeCount, setLikeCount] = useState(
    review.helpfulCount || 0
  );

  const handleLike = async () => {
    if (!user) {
      return toast.error(
        "Please login to mark reviews as helpful"
      );
    }

    if (isOwner) {
      return toast.error(
        "You cannot mark your own review as helpful"
      );
    }

    const prevLiked = isLiked;
    const prevCount = likeCount;

    try {
      // Optimistic update
      setIsLiked(!prevLiked);
      setLikeCount(
        prevLiked ? prevCount - 1 : prevCount + 1
      );

      await reviewAPI.markHelpful(review._id);
    } catch (err: any) {
      // Revert on failure
      setIsLiked(prevLiked);
      setLikeCount(prevCount);

      toast.error(
        err?.response?.data?.message ||
        "Could not update helpful vote"
      );
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this review?"
      )
    ) {
      return;
    }

    try {
      await reviewAPI.delete(review._id);

      onDelete(review._id);

      toast.success("Review deleted successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        "Could not delete review"
      );
    }
  };

  return (
    <div className="py-8 border-b border-slate-50 last:border-0">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-[#1a332e]">
            {review.user?.name?.charAt(0) || "U"}
          </div>

          <div>
            <h5 className="font-black text-[#1a332e] text-sm uppercase tracking-tight">
              {review.user?.name || "Verified User"}
            </h5>

            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={
                    i < review.rating
                      ? "currentColor"
                      : "none"
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleLike}
            disabled={isOwner}
            title={
              isOwner
                ? "You cannot mark your own review as helpful"
                : "Mark review as helpful"
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${
              isLiked
                ? "bg-emerald-50 border-emerald-100 text-[#0fb478]"
                : "bg-white border-slate-100 text-slate-400"
            } ${
              isOwner
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105"
            }`}
          >
            <ThumbsUp
              size={14}
              className={
                isLiked
                  ? "fill-emerald-500"
                  : ""
              }
            />

            <span className="text-[10px] font-black">
              {likeCount}
            </span>
          </button>

          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <p className="text-slate-600 leading-relaxed text-sm font-medium">
        {review.comment}
      </p>
    </div>
  );
};

export default function ReviewList({ reviews, setReviews }: { reviews: any[], setReviews: any }) {
  const handleDeleteLocal = (id: string) => {
    setReviews((prev: any[]) => prev.filter(r => r._id !== id));
  };

  if (reviews.length === 0) return (
    <div className="bg-slate-50 rounded-[2rem] p-10 text-center">
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No reviews yet. Be the first!</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} onDelete={handleDeleteLocal} />
      ))}
    </div>
  );
}