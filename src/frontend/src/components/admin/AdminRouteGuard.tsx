import { ReactNode } from 'react';
import { useIsAdmin } from '@/hooks/useQueries';
import { Loader2 } from 'lucide-react';
import AdminAccessDenied from './AdminAccessDenied';

interface AdminRouteGuardProps {
  children: ReactNode;
  accessDeniedMessage?: string;
}

/**
 * Admin route guard that ensures only confirmed admins can access protected routes.
 * Fails closed: if admin status cannot be confirmed, access is denied.
 */
export default function AdminRouteGuard({ children, accessDeniedMessage }: AdminRouteGuardProps) {
  const { data: isAdmin, isLoading, isError } = useIsAdmin();

  // Show loading state while checking admin status
  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fail closed: deny access if admin check failed or user is not admin
  // This ensures that admin initialization failures don't accidentally grant access
  if (isError || !isAdmin) {
    return <AdminAccessDenied message={accessDeniedMessage} />;
  }

  return <>{children}</>;
}
