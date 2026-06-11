import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface Props {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: Props) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/dashboard/admin" replace />;

      case "pg_owner":
        return <Navigate to="/dashboard/owner" replace />;

      default:
        return <Navigate to="/dashboard/user" replace />;
    }
  }

  return <>{children}</>;
};

export default PublicRoute;