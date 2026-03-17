import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, ShieldCheck } from "lucide-react";

interface Props {
  price: number;
  rating: string | number;
  gender: string;
  onBook: () => void;
}

export default function BookingCard({ price, rating, gender, onBook }: Props) {
  // Assuming a standard security deposit of 1 month for realism
  const securityDeposit = price; 
  const totalInitialPayment = price + securityDeposit;

  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-28 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 space-y-6">
        
        {/* Header: Price & Rating */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-black text-[#1a332e]">
              ₹{price?.toLocaleString()}
            </span>
            <span className="text-[#4a635d] font-bold text-sm"> /mo</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-sm font-black text-[#0fb478]">
            <Star size={14} className="fill-[#0fb478]" />
            {Number(rating).toFixed(1)}
          </div>
        </div>

        {/* Info Box */}
        <div className="border border-emerald-100/50 rounded-2xl p-4 bg-[#f9fbfb]">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#0fb478] mb-1">
            Allowed For
          </p>
          <p className="text-sm font-bold text-[#4a635d] capitalize">
            {gender || "Any Gender"}
          </p>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={onBook} 
          className="w-full h-14 text-lg font-bold bg-[#0fb478] hover:bg-[#0d9a66] rounded-2xl shadow-lg shadow-emerald-200/50 transition-all active:scale-[0.98]"
        >
          Book Now
        </Button>
        
        {/* Price Breakdown */}
        <div className="pt-2 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium text-[#4a635d]">
              <span className="underline decoration-slate-200 underline-offset-4">Monthly Rent</span>
              <span>₹{price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-[#4a635d]">
              <span className="underline decoration-slate-200 underline-offset-4">Security Deposit</span>
              <span>₹{securityDeposit?.toLocaleString()}</span>
            </div>
          </div>

          <Separator className="bg-slate-100" />
          
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-lg font-black text-[#1a332e]">Total</span>
              <span className="text-[10px] text-[#4a635d] font-bold uppercase">Due today</span>
            </div>
            <span className="text-2xl font-black text-[#1a332e]">
              ₹{totalInitialPayment?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#4a635d]/70 uppercase tracking-tight">
          <ShieldCheck size={14} />
          Secure payment & verified listing
        </div>
      </div>
    </aside>
  );
}