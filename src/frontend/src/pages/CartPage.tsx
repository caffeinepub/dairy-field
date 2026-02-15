import { Link } from '@tanstack/react-router';
import { useCart } from '@/state/cart/CartContext';
import { useProducts } from '@/hooks/useQueries';
import { calculateCartWithLatestPrices } from '@/utils/cartPricing';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Minus, Plus, Trash2, ShoppingBag, AlertCircle, Loader2 } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getCartCount } = useCart();
  const { data: products, isLoading: productsLoading } = useProducts();

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-12 pb-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground">
              Add some delicious dairy products to get started!
            </p>
            <Link to="/products">
              <Button size="lg" className="mt-4">
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (productsLoading || !products) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pricingResult = calculateCartWithLatestPrices(items, products);
  const { items: itemsWithPrices, total, hasMissingProducts } = pricingResult;

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {hasMissingProducts && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some products in your cart are no longer available. Please remove them to continue.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {itemsWithPrices.map((item) => (
            <Card key={item.productName} className={item.isMissing ? 'border-destructive' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {item.productName}
                      {item.isMissing && (
                        <span className="ml-2 text-sm text-destructive">(No longer available)</span>
                      )}
                    </h3>
                    {!item.isMissing && item.latestPrice && (
                      <p className="text-sm text-muted-foreground">
                        ₹{Number(item.latestPrice)} each
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {!item.isMissing && (
                      <>
                        <div className="flex items-center gap-2 border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productName, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productName, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="w-24 text-right font-semibold">
                          ₹{item.lineTotal}
                        </div>
                      </>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.productName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {itemsWithPrices.filter(item => !item.isMissing).map((item) => (
                  <div key={item.productName} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.productName} × {item.quantity}
                    </span>
                    <span>₹{item.lineTotal}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link to="/checkout" className="w-full">
                <Button size="lg" className="w-full" disabled={hasMissingProducts}>
                  Proceed to Checkout
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
