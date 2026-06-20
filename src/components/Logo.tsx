import { Home } from "lucide-react";

type LogoProps = {
  size?: number;
};

export default function Logo({ size = 36 }: LogoProps) {
  return (
    <div
      className="rounded-xl bg-[#0fb478] shadow-sm flex items-center justify-center"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <Home className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} />
    </div>
  );
}