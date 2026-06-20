interface GalleryImage {
  url: string;
}

interface EditorialGalleryProps {
  images: (string | GalleryImage)[];
}

export default function EditorialGallery({
  images = [],
}: EditorialGalleryProps) {
  const validImages =
    images?.map((img) =>
      typeof img === "string" ? img : img.url
    ) || [];

  if (validImages.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-4 h-auto sm:h-[600px] mb-8 sm:mb-12">
      {/* Featured Tall Image */}
      <div className="col-span-2 sm:col-span-4 h-[260px] sm:h-full rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden group relative">
        <img
          loading="lazy"
          src={validImages[0]}
          alt="Property"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="absolute bottom-5 left-5 sm:bottom-10 sm:left-10 text-white">
          <p className="text-[10px] sm:text-xs font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase opacity-70 mb-1 sm:mb-2">
            Main View
          </p>

          <h2 className="text-lg sm:text-2xl font-black">
            Property Exterior
          </h2>
        </div>
      </div>

      {/* Right Column */}
      <div className="col-span-1 sm:col-span-2 flex flex-row sm:flex-col gap-3 sm:gap-4">
        <div className="w-1/2 sm:w-auto h-[140px] sm:h-1/2 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-lg">
          {validImages[1] && (
            <img
              loading="lazy"
              src={validImages[1]}
              alt="Property"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="w-1/2 sm:w-auto h-[140px] sm:h-1/2 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden bg-emerald-600 relative group cursor-pointer">
          {validImages[2] && (
            <img
              loading="lazy"
              src={validImages[2]}
              alt="Property"
              className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
            />
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <span className="text-xl sm:text-3xl font-black">
              +{Math.max(validImages.length - 2, 0)}
            </span>

            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
              More Photos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}