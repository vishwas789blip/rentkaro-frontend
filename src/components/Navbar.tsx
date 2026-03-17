import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Home, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Robust dashboard path logic
  const dashboardPath = (() => {
    const role = user?.role?.toLowerCase();
    if (role === "admin") return "/dashboard/admin";
    if (role === "pg_owner") return "/dashboard/owner";
    return "/dashboard/user";
  })();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e0f2ec] bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-extrabold text-[#1a332e] hover:opacity-90 transition-opacity"
        >
          <div className="rounded-xl bg-[#0fb478] p-2 shadow-sm">
            <Home className="h-5 w-5 text-white" />
          </div>
          RentKaroo
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/listings"
            className="text-sm font-bold text-[#4a635d] transition hover:text-[#0fb478]"
          >
            Browse PGs
          </Link>
          
          {/* This check ensures that if we are still 'loading' the auth state, 
              we don't show the wrong buttons (like Login/Signup) for a split second.
          */}
          {!loading && (
            <>
              {isAuthenticated && user ? (
                <div className="flex items-center gap-6 pl-4 border-l border-[#e0f2ec]">
                  {/* User Identity */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f9f6] border border-[#d1e9df] text-sm font-black text-[#0fb478] shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="hidden flex-col leading-tight lg:flex">
                      <span className="text-sm font-bold text-[#1a332e]">
                        {user.name || "User"}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#0fb478]">
                        {user.role?.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(dashboardPath)}
                      className="text-[#4a635d] font-bold hover:bg-[#f0f9f6] hover:text-[#0fb478] rounded-xl"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="border-[#e0f2ec] text-[#4a635d] font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-bold text-[#4a635d]"
                    onClick={() => navigate("/login")}
                  >
                    Log in
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#0fb478] hover:bg-[#0d9a66] font-bold shadow-lg shadow-[#0fb478]/20 rounded-xl"
                    onClick={() => navigate("/register")}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-[#1a332e]" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-[#e0f2ec] bg-white p-6 md:hidden animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-6 font-bold text-[#4a635d]">
            <Link to="/listings" onClick={() => setOpen(false)}>Browse PGs</Link>

            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  <div className="h-10 w-10 rounded-full bg-[#f0f9f6] flex items-center justify-center text-[#0fb478] font-black">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1a332e]">{user.name}</span>
                    <span className="text-[10px] text-[#0fb478] font-black uppercase">{user.role}</span>
                  </div>
                </div>
                <div className="h-[1px] bg-[#e0f2ec]" />
                <Link to={dashboardPath} onClick={() => setOpen(false)} className="text-[#0fb478]">
                  My Dashboard
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start border-red-100 text-red-600 hover:bg-red-50 rounded-xl"
                  onClick={() => { handleLogout(); setOpen(false); }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Button className="w-full bg-[#f0f9f6] text-[#0fb478] hover:bg-[#e0f2ec] rounded-xl font-bold" onClick={() => { navigate("/login"); setOpen(false); }}>
                  Log in
                </Button>
                <Button className="w-full bg-[#0fb478] hover:bg-[#0d9a66] rounded-xl font-bold shadow-md" onClick={() => { navigate("/register"); setOpen(false); }}>
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;