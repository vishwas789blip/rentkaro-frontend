import { 
  Wifi, Wind, UtensilsCrossed, Car, 
  Dumbbell, Zap, WashingMachine, ShieldCheck, 
  Coffee, Tv, Thermometer, LucideIcon 
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  wifi: Wifi,
  ac: Wind,
  kitchen: UtensilsCrossed,
  parking: Car,
  gym: Dumbbell,
  security: ShieldCheck, 
  laundry: WashingMachine,
  powerbackup: Zap,
  coffee: Coffee,
  tv: Tv,
  heater: Thermometer
};

const labelMap: Record<string, string> = {
  wifi: "High-speed Wi-Fi",
  ac: "Air Conditioning",
  kitchen: "Modular Kitchen",
  parking: "Reserved Parking",
  gym: "Fitness Center",
  security: "24/7 Surveillance",
  laundry: "Laundry Room",
  powerbackup: "Power Backup",
};

interface AmenitiesGridProps {
  amenities: string[];
}

export default function AmenitiesGrid({ amenities }: AmenitiesGridProps) {
  if (!amenities?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {amenities.map((item, index) => {
        const key = item.toLowerCase().replace(/\s+/g, ''); // Handles "Power Backup" -> "powerbackup"
        const Icon = iconMap[key] || Zap;
        const label = labelMap[key] || item;

        return (
          <div
  key={item}
  className="
    group
    flex
    items-center
    gap-4
    p-4
    rounded-[1.5rem]
    bg-white
    border
    border-slate-100
    shadow-sm
    hover:shadow-md
    hover:border-emerald-100
    hover:bg-emerald-50/30
    hover:-translate-y-1
    hover:scale-[1.02]
    transition-all
    duration-300
  "
>
            {/* Icon Container with subtle glow on group hover */}
            <div className="relative flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-50 group-hover:bg-white group-hover:shadow-inner transition-colors">
              <Icon className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              
              {/* Decorative background circle visible on hover */}
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-all scale-50 group-hover:scale-100" />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-emerald-500 transition-colors">
                Available
              </span>
              <span className="font-bold text-slate-700 text-sm tracking-tight leading-tight">
                {label}
              </span>
            </div>
          </div>);
      })}
    </div>
  );
}