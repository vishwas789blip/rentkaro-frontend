import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ================================
   React Query Client
================================ */

const queryClient = new QueryClient();

/* ================================
   Leaflet Marker Fix
================================ */

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

/* ================================
   Lazy Loaded Pages
================================ */

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
import VerifyEmail from "./pages/VerifyEmail"; 
import ForgotPassword  from "./pages/ForgotPassward";
const Listings = lazy(() => import("./pages/Listings"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));

const UserDashboard = lazy(() => import("./pages/users/Profile"));
const OwnerDashboard = lazy(() => import("./pages/pg_Owner/OwnerDashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

const CreateListing = lazy(() => import("./pages/CreateListing"));
const BookingPage = lazy(() => import("./pages/BookingPage"));

const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// ... other imports
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

// ✅ Change this line to point to your new help.tsx file
const Help = lazy(() => import("./pages/Help")); 

// Ensure Admin Support still points to the admin version
const AdminSupport = lazy(() => import("./pages/admin/Support"));

const AllListings = lazy(() => import("./pages/admin/AllListings"));

const UserSettings = lazy(() => import("./pages/users/UserSettings"));
const MyBookings = lazy(() => import("./pages/users/MyBookings"));

const NotFound = lazy(() => import("./pages/NotFound"));
const EditListing = lazy(() => import("./pages/pg_Owner/EditListing"));
const OwnerListings = lazy(() => import("./pages/pg_Owner/OwnerListings")); // Adjust path if needed

/* ================================
   Loading Component
================================ */

const Loader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

/* ================================
   App Component
================================ */

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />

            <BrowserRouter>
              <ScrollToTop />

              <Suspense fallback={<Loader />}>
                <Routes>

                  {/* ================= PUBLIC ROUTES ================= */}

                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />

                  <Route path="/listings" element={<Listings />} />
                  <Route path="/listings/:id" element={<ListingDetail />} />

                  {/* ================= AUTH ROUTES ================= */}

                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* ================= BOOKING ================= */}

                  <Route
                    path="/booking/:id"
                    element={
                      <ProtectedRoute allowedRoles={["user"]}>
                        <BookingPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ================= USER DASHBOARD ================= */}

                  <Route
                    path="/dashboard/user"
                    element={
                      <ProtectedRoute allowedRoles={["user"]}>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dashboard/user/bookings"
                    element={
                      <ProtectedRoute allowedRoles={["user"]}>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dashboard/user/settings"
                    element={
                      <ProtectedRoute allowedRoles={["user"]}>
                        <UserSettings />
                      </ProtectedRoute>
                    }
                  />

                  {/* ================= OWNER DASHBOARD ================= */}

                  <Route
                    path="/dashboard/owner"
                    element={
                      <ProtectedRoute allowedRoles={["pg_owner", ]}>
                        <OwnerDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dashboard/owner/createListing"
                    element={
                      <ProtectedRoute allowedRoles={["pg_owner", "admin"]}>
                        <CreateListing />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dashboard/owner/edit-listing/:id"
                    element={
                    <ProtectedRoute allowedRoles={["pg_owner", "admin"]}>
                      <EditListing />
                    </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/owner/listings"
                    element={
                    <ProtectedRoute allowedRoles={["pg_owner"]}>
                      <OwnerListings />
                    </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/forgotPassword"
                    element={<ForgotPassword />}
                  />
                  {/* ================= ADMIN DASHBOARD ================= */}

                  <Route
                    path="/dashboard/admin"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dashboard/admin/listings"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AllListings />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dashboard/admin/support"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminSupport />
                      </ProtectedRoute>
                    }
                  />

                  {/* ================= STATIC PAGES ================= */}

                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/help" element={<Help />} />


                  {/* ================= FALLBACK ================= */}

                  <Route path="*" element={<NotFound />} />

                </Routes>
              </Suspense>
            </BrowserRouter>

          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;