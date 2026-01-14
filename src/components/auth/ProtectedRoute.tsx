'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw } from 'lucide-react';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register'];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Skip protection for public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-imperva-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-imperva-blue" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For public routes, always render
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // For protected routes, only render if authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-imperva-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-imperva-blue" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
