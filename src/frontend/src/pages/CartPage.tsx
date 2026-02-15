import { useCart } from '@/state/cart/CartContext';
import { useProducts } from '@/hooks/useQueries';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, ShoppingBag, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { calculateCartWithLatestPrices } from '@/utils/cartPricing';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const { data: products, isLoading: productsLoading } = useProducts();
  const navigate = useNavigate();

  if (productsLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!products) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load product information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Add some delicious dairy products to get started!
            </p>
            <Button onClick={() => navigate({ to: '/products' })}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { items: itemsWithPrices, total, hasMissingProducts } = calculateCartWithLatestPrices(items, products);

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        {hasMissingProducts && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Some products in your cart are no longer available. Please remove them before proceeding to checkout.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 mb-8">
          {itemsWithPrices.map((item) => (
            <Card key={item.productName}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {item.productName}
                    {item.isMissing && (
                      <span className="ml-2 text-sm text-destructive font-normal">
                        (No longer available)
                      </span>
                    )}
                  </h3>
                  <p className="text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                  {!item.isMissing && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        ₹{Number(item.latestPrice)} each
                      </p>
                      {item.latestPrice !== item.price && (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          Price updated from ₹{Number(item.price)}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {!item.isMissing && (
                    <div className="text-right">
                      <p className="text-xl font-bold">₹{item.lineTotal}</p>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.productName)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-lg mb-2">
              <span>Subtotal:</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold">
              <span>Total:</span>
              <span>₹{total}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate({ to: '/checkout' })}
              disabled={hasMissingProducts}
            >
              Proceed to Checkout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
