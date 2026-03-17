import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  PlusCircle,
  List,
  LogOut,
  Loader2,
  ChevronRight,
  User as UserIcon,
  Headset,
  BarChart3,
  Menu
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ================= LINKS CONFIGURATION ================= */

const userLinks = [
  { to: "/dashboard/user", label: "Overview", icon: UserIcon },
  { to: "/dashboard/user/bookings", label: "My Bookings", icon: CalendarDays },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const ownerLinks = [
  { to: "/dashboard/owner", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/owner/listings", label: "My Listings", icon: List },
  { to: "/dashboard/owner/createlisting", label: "Add Listing", icon: PlusCircle },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminLinks = [
  { to: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/admin/support", label: "Support", icon: Headset },
  { to: "/dashboard/admin/listings", label: "All Listings", icon: List },
  { to: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

/* ================= COMPONENT START ================= */

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  // 1. SAFE LOADING STATE
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#0fb478]" />
          <p className="text-sm font-medium text-emerald-800 animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  // 2. SAFE ROLE RESOLUTION
  const userRole = user?.role?.toLowerCase() || "user";

  // 3. LOGIC FIX: Select links using a switch to avoid ternary errors
  const getLinks = () => {
    switch (userRole) {
      case "admin": return adminLinks;
      case "pg_owner": return ownerLinks;
      default: return userLinks;
    }
  };

  const links = getLinks();

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfdfc]">
      <Navbar />

      <div className="flex flex-1 container mx-auto px-4 lg:px-6 py-4 lg:py-8 gap-8">
        
        {/* SIDEBAR (Hidden on Mobile) */}
        <aside className="hidden lg:flex w-72 flex-col shrink-0 sticky top-24 h-[calc(100vh-8rem)] 
          bg-white border border-emerald-100/50 rounded-[2.5rem] p-6 shadow-2xl shadow-emerald-900/[0.04]">
          
          {/* Role Badge */}
          <div className="px-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                {userRole.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            {links.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${
                    active
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`h-5 w-5 transition-transform duration-300 ${
                      active ? "scale-110" : "group-hover:scale-110 text-emerald-500"
                    }`} />
                    {label}
                  </div>
                  {active && <ChevronRight className="h-4 w-4 text-emerald-100" />}
                </Link>
              );
            })}
          </nav>

          {/* Profile Card & Logout */}
          <div className="mt-auto pt-6 border-t border-emerald-50">

            <button 
              onClick={logout} 
              className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
            >
              <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-emerald-100/60 shadow-sm flex flex-col min-h-[75vh]">
          <div className="flex-1 p-6 lg:p-12">
            {/* Mobile Header (Only visible on small screens) */}
            <div className="flex lg:hidden items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-800 capitalize tracking-tight">
                {location.pathname.split('/').pop()?.replace("-", " ")}
              </h2>
              <button className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Menu size={20} />
              </button>
            </div>

            {/* Render Dashboard Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;