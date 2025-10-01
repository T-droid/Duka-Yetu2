"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuthNext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackUrl?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackUrl = "/login" 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackUrl);
        return;
      }
      
      if (requiredRole && !hasRole(requiredRole)) {
        router.push("/");
        return;
      }
    }
  }, [isAuthenticated, isLoading, hasRole, requiredRole, router, fallbackUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
