import { useProducts } from '@/hooks/useQueries';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingCart, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useCart } from '@/state/cart/CartContext';
import { toast } from 'sonner';
import { useState } from 'react';
import { sanitizeError } from '@/utils/errorDisplay';

export default function ProductsPage() {
  const { data: products, isLoading, error, refetch, isActorError } = useProducts();
  const { addItem } = useCart();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleAddToCart = (productName: string, price: bigint) => {
    addItem(productName, price);
    toast.success(`${productName} added to cart!`);
  };

  const handleRetry = async () => {
    console.log('[ProductsPage] User initiated retry');
    setIsRetrying(true);
    try {
      await refetch();
      console.log('[ProductsPage] Retry completed successfully');
    } catch (err) {
      console.error('[ProductsPage] Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Our Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = sanitizeError(error);
    const isConnectionError = isActorError || 
      errorMessage.toLowerCase().includes('backend connection') ||
      errorMessage.toLowerCase().includes('actor not') ||
      errorMessage.toLowerCase().includes('connection') ||
      errorMessage.toLowerCase().includes('network');
    
    console.error('[ProductsPage] Error state:', { 
      error, 
      isActorError, 
      isConnectionError,
      sanitizedMessage: errorMessage,
    });

    return (
      <div className="container py-12">
        <Alert variant="destructive">
          {isConnectionError ? (
            <WifiOff className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {isConnectionError ? 'Unable to Connect to Backend' : 'Unable to Load Products'}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            {isConnectionError ? (
              <p>
                We couldn't establish a connection to the backend service. Please check your internet connection and try again.
              </p>
            ) : (
              <p>
                We couldn't load the product catalog. This might be a temporary issue with the product listing service.
              </p>
            )}
            <div className="mt-2 p-3 bg-destructive/10 rounded-md">
              <p className="text-sm font-mono break-words">
                {errorMessage}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              disabled={isRetrying}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="container py-12">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No products available at the moment. Please check back later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter out removed products and normalize category strings
  const filteredProducts = products.filter(p => p.name !== 'Fruit Ice Cream');
  
  const dairyProducts = filteredProducts
    .filter(p => p.category.trim() === 'Dairy')
    .sort((a, b) => a.name.localeCompare(b.name));
  
  const frozenDesserts = filteredProducts
    .filter(p => p.category.trim() === 'Frozen Dessert')
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="container py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Our Products</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Fresh, pure dairy products and delicious ice cream with no artificial colour or essence.
        </p>
      </div>

      {dairyProducts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-semibold">Dairy Products</h2>
            <Badge variant="secondary">Pure & Natural</Badge>
            <Badge variant="outline">{dairyProducts.length} items</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dairyProducts.map((product) => (
              <Card key={product.name} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">₹{Number(product.price)}</span>
                    <span className="text-sm text-muted-foreground">/ {product.unit}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => handleAddToCart(product.name, product.price)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {frozenDesserts.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-semibold">Ice Cream</h2>
            <Badge variant="secondary">Natural Fruit Base, Cream Milk & Dry Fruits</Badge>
            <Badge variant="outline">{frozenDesserts.length} items</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frozenDesserts.map((product) => (
              <Card key={product.name} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">₹{Number(product.price)}</span>
                    <span className="text-sm text-muted-foreground">/ {product.unit}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => handleAddToCart(product.name, product.price)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
