import { ReactNode } from 'react';
import { Link, Outlet, useMatches } from '@tanstack/react-router';
import { Shield, Package, DollarSign, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminOrdersPage from '@/pages/AdminOrdersPage';
import AdminOrderDetailsPage from '@/pages/AdminOrderDetailsPage';
import AdminRatesPage from '@/pages/AdminRatesPage';
import AdminProductsPage from '@/pages/AdminProductsPage';

interface AdminLayoutProps {
  children?: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname || '';

  // Determine which admin page to render based on the current path
  let pageContent: ReactNode = null;
  if (currentPath === '/admin/orders') {
    pageContent = <AdminOrdersPage />;
  } else if (currentPath.startsWith('/admin/orders/')) {
    pageContent = <AdminOrderDetailsPage />;
  } else if (currentPath === '/admin/rates') {
    pageContent = <AdminRatesPage />;
  } else if (currentPath === '/admin/products') {
    pageContent = <AdminProductsPage />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                Back to Store
              </Button>
            </Link>
          </div>
          <nav className="flex items-center gap-4 mt-4">
            <Link to="/admin/orders" className="text-foreground/80 hover:text-foreground transition-colors font-medium flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Orders
            </Link>
            <Link to="/admin/rates" className="text-foreground/80 hover:text-foreground transition-colors font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Rates
            </Link>
            <Link to="/admin/products" className="text-foreground/80 hover:text-foreground transition-colors font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children || pageContent || <Outlet />}
      </main>
    </div>
  );
}
