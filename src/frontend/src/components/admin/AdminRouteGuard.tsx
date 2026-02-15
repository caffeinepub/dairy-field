import { ReactNode } from 'react';
import { useIsAdmin } from '@/hooks/useQueries';
import { Loader2 } from 'lucide-react';
import AdminAccessDenied from './AdminAccessDenied';

interface AdminRouteGuardProps {
  children: ReactNode;
  accessDeniedMessage?: string;
}

export default function AdminRouteGuard({ children, accessDeniedMessage }: AdminRouteGuardProps) {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminAccessDenied message={accessDeniedMessage} />;
  }

  return <>{children}</>;
}
