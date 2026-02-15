import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, Link } from '@tanstack/react-router';
import { ShoppingCart, Phone, Shield, Package } from 'lucide-react';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import ContactPage from './pages/ContactPage';
import AdminRatesPage from './pages/AdminRatesPage';
import { CartProvider, useCart } from './state/cart/CartContext';
import { Button } from './components/ui/button';
import { useInternetIdentity } from './hooks/useInternetIdentity';

function Layout() {
  const { getCartCount } = useCart();
  const { identity } = useInternetIdentity();
  const cartCount = getCartCount();
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/assets/generated/dairy-field-logo.dim_512x512.png" 
              alt="DAIRY FIELD" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold tracking-tight">DAIRY FIELD</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link to="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Products
            </Link>
            <Link to="/order" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
              <Package className="h-4 w-4" />
              Track Order
            </Link>
            <Link to="/contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact
            </Link>
            {isAuthenticated && (
              <Link to="/admin" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            <Link to="/cart">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/30 py-8 mt-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3">DAIRY FIELD</h3>
              <p className="text-sm text-muted-foreground">
                Pure dairy products and frozen desserts with no artificial colour or essence.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Contact</h3>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <a href="tel:9494237076" className="hover:text-primary transition-colors">
                  9494237076
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/products" className="hover:text-primary transition-colors">
                  Shop Products
                </Link>
                <Link to="/order" className="hover:text-primary transition-colors">
                  Track Order
                </Link>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} DAIRY FIELD. Built with ❤️ using{' '}
              <a 
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
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

const orderLookupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order',
  component: OrderDetailsPage,
});

const orderDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order/$orderId',
  component: OrderDetailsPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminRatesPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  cartRoute,
  checkoutRoute,
  confirmationRoute,
  orderLookupRoute,
  orderDetailsRoute,
  contactRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}
