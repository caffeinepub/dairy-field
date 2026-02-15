import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin, useProducts, useUpdateProductPrice, useUpdateProductPrices } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Lock, Save, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { Product } from '../backend';

export default function AdminRatesPage() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useProducts();
  const updatePrice = useUpdateProductPrice();
  const updatePrices = useUpdateProductPrices();

  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await refetchProducts();
      setSuccessMessage('Product prices refreshed successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to refresh products:', error);
      setErrorMessage('Failed to refresh products. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePriceChange = (productName: string, value: string) => {
    setEditingPrices(prev => ({ ...prev, [productName]: value }));
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSavePrice = async (productName: string, currentPrice: bigint) => {
    const newPriceStr = editingPrices[productName];
    if (!newPriceStr) return;

    const newPriceNum = parseFloat(newPriceStr);
    if (isNaN(newPriceNum) || newPriceNum <= 0) {
      return;
    }

    try {
      setSuccessMessage(null);
      setErrorMessage(null);
      await updatePrice.mutateAsync({
        productName,
        newPrice: BigInt(Math.round(newPriceNum)),
      });
      setSuccessMessage(`Successfully updated price for ${productName}`);
      setEditingPrices(prev => {
        const updated = { ...prev };
        delete updated[productName];
        return updated;
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update price:', error);
      setErrorMessage(`Failed to update price for ${productName}. Please try again.`);
    }
  };

  const handleSaveAll = async () => {
    if (!products) return;

    const priceUpdates: Array<[string, bigint]> = [];

    for (const product of products) {
      const editingPrice = editingPrices[product.name];
      if (editingPrice !== undefined && editingPrice !== String(Number(product.price))) {
        const newPriceNum = parseFloat(editingPrice);
        if (!isNaN(newPriceNum) && newPriceNum > 0) {
          priceUpdates.push([product.name, BigInt(Math.round(newPriceNum))]);
        }
      }
    }

    if (priceUpdates.length === 0) return;

    try {
      setSuccessMessage(null);
      setErrorMessage(null);
      await updatePrices.mutateAsync(priceUpdates);
      setSuccessMessage(`Successfully updated ${priceUpdates.length} product price${priceUpdates.length > 1 ? 's' : ''}`);
      setEditingPrices({});
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update prices:', error);
      setErrorMessage('Failed to update prices. Please try again.');
    }
  };

  const getPendingChanges = () => {
    if (!products) return [];
    
    return products.filter(product => {
      const editingPrice = editingPrices[product.name];
      if (editingPrice === undefined) return false;
      const newPriceNum = parseFloat(editingPrice);
      return !isNaN(newPriceNum) && newPriceNum > 0 && editingPrice !== String(Number(product.price));
    });
  };

  const pendingChanges = getPendingChanges();
  const hasPendingChanges = pendingChanges.length > 0;

  // Filter out removed products and sort by category then name for consistent display
  const filteredProducts = products ? products.filter(p => p.name !== 'Fruit Ice Cream') : [];
  const sortedProducts = [...filteredProducts].sort((a: Product, b: Product) => {
    const categoryCompare = a.category.localeCompare(b.category);
    if (categoryCompare !== 0) return categoryCompare;
    return a.name.localeCompare(b.name);
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Please sign in with Internet Identity to access the admin panel.
            </p>
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAdminLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have admin permissions to access this page.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={handleLogout} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin - Update Product Rates</h1>
          <p className="text-muted-foreground mt-2">
            {sortedProducts.length} products available
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={isRefreshing || productsLoading}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Products
              </>
            )}
          </Button>
          <Button onClick={handleLogout} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {hasPendingChanges && (
        <div className="mb-6 p-4 bg-muted rounded-lg flex items-center justify-between">
          <div>
            <p className="font-medium">
              {pendingChanges.length} product{pendingChanges.length > 1 ? 's' : ''} with pending changes
            </p>
            <p className="text-sm text-muted-foreground">
              {pendingChanges.map(p => p.name).join(', ')}
            </p>
          </div>
          <Button
            onClick={handleSaveAll}
            disabled={updatePrices.isPending}
            size="lg"
          >
            {updatePrices.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving All...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      )}

      {productsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => {
            const editingPrice = editingPrices[product.name];
            const hasChanges = editingPrice !== undefined && editingPrice !== String(Number(product.price));

            return (
              <Card key={product.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                    <p className="text-2xl font-bold">₹{Number(product.price)}</p>
                    <p className="text-sm text-muted-foreground">per {product.unit}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`price-${product.name}`}>New Price (₹)</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`price-${product.name}`}
                        type="number"
                        min="0"
                        step="1"
                        placeholder={String(Number(product.price))}
                        value={editingPrice ?? ''}
                        onChange={(e) => handlePriceChange(product.name, e.target.value)}
                      />
                      <Button
                        onClick={() => handleSavePrice(product.name, product.price)}
                        disabled={!hasChanges || updatePrice.isPending}
                        size="icon"
                      >
                        {updatePrice.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
