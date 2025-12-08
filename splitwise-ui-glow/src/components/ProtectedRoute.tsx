import { useAuth } from "@/contexts/AuthContexts";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You can replace this with a more sophisticated loading spinner
    return <div className="flex h-screen items-center justify-center">Loading session...</div>;
  }

  if (!user) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child route component
  return <Outlet />;
};

export default ProtectedRoute;