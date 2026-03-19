import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onSubmit: (data: { rating: number; comment: string }) => Promise<void> | void;
  submitting: boolean;
}

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function ReviewForm({ onSubmit, submitting }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload
    if (rating === 0 || comment.length < 5) return;

    try {
      await onSubmit({ rating, comment });
      // Reset form ONLY on success
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Submission failed:", error);
      // Optionally handle error UI here
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="mb-10 p-8 bg-emerald-50/20 rounded-[2rem] border border-emerald-100/50 shadow-sm"
    >
      <h4 className="font-bold text-xl text-[#1a332e] mb-1">Leave a Review</h4>
      <p className="text-sm text-[#4a635d] mb-6">Share your experience with the community.</p>
      
      {/* Star Rating Logic */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} out of 5 stars`}
            className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              size={28}
              className={`transition-colors duration-200 ${
                (hover || rating) >= star 
                  ? "fill-amber-400 text-amber-400" 
                  : "text-gray-300 fill-transparent"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-xs font-bold text-amber-600 uppercase tracking-wider animate-in fade-in slide-in-from-left-1">
            {RATING_LABELS[rating - 1]}
          </span>
        )}
      </div>

      <textarea
        className="w-full p-5 rounded-2xl border-none ring-1 ring-emerald-100 focus:ring-2 focus:ring-[#0fb478] outline-none min-h-[120px] mb-4 bg-white shadow-inner text-[#4a635d] placeholder:text-gray-300 transition-all disabled:opacity-50"
        placeholder="What did you love about this place? How was the host?"
        value={comment}
        required
        disabled={submitting}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase italic">
          Your review will be public
        </p>
        <Button 
          type="submit" 
          disabled={submitting || !rating || comment.length < 5}
          className="bg-[#1a332e] hover:bg-[#0fb478] text-white px-8 h-12 rounded-xl shadow-lg transition-all disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Posting...
            </span>
          ) : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}