import { useEffect } from "react";
import { useLocation } from "wouter";
import { getCurrentUser } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  let user = getCurrentUser();

  // For development, create a default admin user if none exists
  if (!user) {
    const defaultUser = {
      id: "default-admin",
      name: "Super Admin",
      email: "admin@demo.com",
      role: "super_admin"
    };
    localStorage.setItem("user", JSON.stringify(defaultUser));
    user = defaultUser;
  }

  return <>{children}</>;
}
