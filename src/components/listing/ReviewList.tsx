import { Star } from "lucide-react";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
  user?: {
    name: string;
    image?: string;
  };
}

interface Props {
  reviews: Review[];
}

export default function ReviewList({ reviews }: Props) {
  if (!reviews?.length) {
    return (
      <div className="py-12 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
        <p className="text-[#4a635d] font-medium italic">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
      {reviews.map((r) => (
        <div key={r._id} className="flex flex-col space-y-3">
          {/* User Header */}
          <div className="flex items-center gap-3">
            {r.user?.image ? (
              <img 
                src={r.user.image} 
                alt={r.user.name} 
                className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-50"
              />
            ) : (
              <div className="h-11 w-11 rounded-full bg-emerald-100 text-[#0fb478] flex items-center justify-center font-bold text-lg shadow-sm">
                {(r.user?.name || "U")[0].toUpperCase()}
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="font-bold text-[15px] text-[#1a332e] leading-tight">
                {r.user?.name || "Verified Guest"}
              </span>
              <span className="text-xs font-medium text-gray-400">
                {new Date(r.createdAt).toLocaleDateString('en-IN', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* Stars */}
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-transparent"} 
              />
            ))}
          </div>

          {/* Comment */}
          <p className="text-sm leading-relaxed text-[#4a635d] line-clamp-4 hover:line-clamp-none transition-all duration-300">
            {r.comment}
          </p>
        </div>
      ))}
    </div>
  );
}