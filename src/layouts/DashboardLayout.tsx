import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import {
  LayoutDashboard, CalendarDays, Settings, PlusCircle,
  List, LogOut, Loader2, ChevronRight, User as UserIcon,
  Headset, BarChart3, Menu, X
} from "lucide-react";
import { useState } from "react";

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
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

/* ================= SIDEBAR CONTENT (shared by desktop + mobile drawer) ================= */
const SidebarContent = ({
  links, userRole, logout, location, onNavClick
}: {
  links: typeof userLinks;
  userRole: string;
  logout: () => void;
  location: ReturnType<typeof useLocation>;
  onNavClick?: () => void;
}) => (
  <div className="flex flex-col h-full">
    {/* Role Badge */}
    <div className="px-4 mb-8">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
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
            onClick={onNavClick}
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

    {/* Logout */}
    <div className="mt-auto pt-6 border-t border-emerald-50">
      <button
        onClick={logout}
        className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
      >
        <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        Sign Out
      </button>
    </div>
  </div>
);

/* ================= MAIN LAYOUT ================= */
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#0fb478]" />
          <p className="text-sm font-medium text-emerald-800 animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  const userRole = user?.role?.toLowerCase() || "user";
  const getLinks = () => {
    switch (userRole) {
      case "admin": return adminLinks;
      case "pg_owner": return ownerLinks;
      default: return userLinks;
    }
  };
  const links = getLinks();

  // Current page label for mobile header
  const pageLabel = location.pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfdfc]">
      <Navbar />

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER PANEL ── */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl p-6
        transform transition-transform duration-300 ease-in-out lg:hidden
        ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Close Button */}
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-5 right-5 h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
        >
          <X size={18} />
        </button>

        {/* Logo / Brand */}
        <div className="mb-8 mt-1">
          <span className="text-lg font-black text-emerald-700 tracking-tight">RentKaroo</span>
        </div>

        <SidebarContent
          links={links}
          userRole={userRole}
          logout={logout}
          location={location}
          onNavClick={() => setDrawerOpen(false)}
        />
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex flex-1 container mx-auto px-4 lg:px-6 py-4 lg:py-8 gap-8">

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden lg:flex w-72 flex-col shrink-0 sticky top-24 h-[calc(100vh-8rem)]
          bg-white border border-emerald-100/50 rounded-[2.5rem] p-6 shadow-2xl shadow-emerald-900/[0.04]">
          <SidebarContent
            links={links}
            userRole={userRole}
            logout={logout}
            location={location}
          />
        </aside>

        {/* ── CONTENT AREA ── */}
        <main className="flex-1 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-emerald-100/60 shadow-sm flex flex-col min-h-[75vh]">
          <div className="flex-1 p-4 sm:p-6 lg:p-12">

            {/* ── MOBILE TOPBAR ── */}
            <div className="flex lg:hidden items-center justify-between mb-6">
              <button
                onClick={() => setDrawerOpen(true)}
                className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-all"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-base font-black text-slate-800 capitalize tracking-tight">
                {pageLabel}
              </h2>
              {/* Spacer to keep title centered */}
              <div className="w-10" />
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;