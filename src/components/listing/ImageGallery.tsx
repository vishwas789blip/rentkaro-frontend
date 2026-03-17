import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useState } from "react";

export default function EditorialGallery({ images = [] }: { images: any[] }) {
  const validImages = images?.map(img => typeof img === 'string' ? img : img.url) || [];

  return (
    <div className="grid grid-cols-6 gap-4 h-[600px] mb-12">
      {/* Featured Tall Image */}
      <div className="col-span-4 h-full rounded-[2.5rem] overflow-hidden group relative">
        <img 
          src={validImages[0]} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white">
          <p className="text-xs font-black tracking-[0.3em] uppercase opacity-70 mb-2">Main View</p>
          <h2 className="text-2xl font-black">Property Exterior</h2>
        </div>
      </div>

      {/* Right Column Staggered */}
      <div className="col-span-2 flex flex-col gap-4">
        <div className="h-1/2 rounded-[2.5rem] overflow-hidden shadow-lg">
          <img src={validImages[1]} className="w-full h-full object-cover" />
        </div>
        <div className="h-1/2 rounded-[2.5rem] overflow-hidden bg-emerald-600 relative group cursor-pointer">
          <img src={validImages[2]} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <span className="text-3xl font-black">+{validImages.length - 2}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">More Photos</span>
          </div>
        </div>
      </div>
    </div>
  );
}