import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, Link } from '@tanstack/react-router';
import { ShoppingCart, Phone, Package } from 'lucide-react';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ContactPage from './pages/ContactPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AdminRatesPage from './pages/AdminRatesPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminOrderDetailsPage from './pages/AdminOrderDetailsPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminRouteGuard from './components/admin/AdminRouteGuard';
import { CartProvider, useCart } from './state/cart/CartContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import AddToHomeScreen from './components/AddToHomeScreen';
import AdminOrderMessageBanner from './components/AdminOrderMessageBanner';
import { useIsAdmin } from './hooks/useQueries';
import { SiX, SiFacebook, SiInstagram } from 'react-icons/si';

const queryClient = new QueryClient();

function CustomerLayout() {
  const { items } = useCart();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  // Only show admin UI when we have a definitive positive result
  const showAdminUI = isAdmin === true && !isAdminLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
              DAIRY FIELD
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/products" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                Products
              </Link>
              <Link to="/contact" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                Contact
              </Link>
              {showAdminUI && (
                <Link to="/admin/orders" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                  Admin
                </Link>
              )}
              <Link to="/cart">
                <Button variant="outline" size="sm" className="relative">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Show admin banner at top of main content for admins */}
      {showAdminUI && (
        <div className="container mx-auto px-4 pt-4">
          <AdminOrderMessageBanner />
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/30 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary">DAIRY FIELD</h3>
              <p className="text-sm text-muted-foreground">
                Premium dairy products delivered fresh to your doorstep. Quality you can trust, taste you'll love.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>9494237076</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Fresh Daily Delivery</span>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <SiInstagram className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <SiX className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t">
            <AddToHomeScreen />
          </div>

          <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} DAIRY FIELD. Built with love using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'dairy-field')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

function AdminLayoutWrapper() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminOrderMessageBanner />
        <Outlet />
      </AdminLayout>
      <Toaster />
    </AdminRouteGuard>
  );
}

const rootRoute = createRootRoute({
  component: CustomerLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductsPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/confirmation/$orderId',
  component: OrderConfirmationPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

const orderDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-details',
  component: () => (
    <AdminRouteGuard accessDeniedMessage="Order tracking is available for admin only.">
      <OrderDetailsPage />
    </AdminRouteGuard>
  ),
});

// Admin routes under the same root but with different layout
const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/orders',
  component: () => (
    <AdminLayoutWrapper />
  ),
});

const adminOrderDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/orders/$orderId',
  component: () => (
    <AdminLayoutWrapper />
  ),
});

const adminRatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/rates',
  component: () => (
    <AdminLayoutWrapper />
  ),
});

const adminProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/products',
  component: () => (
    <AdminLayoutWrapper />
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  cartRoute,
  checkoutRoute,
  confirmationRoute,
  contactRoute,
  orderDetailsRoute,
  adminOrdersRoute,
  adminOrderDetailsRoute,
  adminRatesRoute,
  adminProductsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
