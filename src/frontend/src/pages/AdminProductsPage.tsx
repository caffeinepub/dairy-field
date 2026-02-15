import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin, useProducts, useCreateProduct, useUpsertProductsAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, CheckCircle2, Lock, Plus, Upload } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { parseProductUpload } from '../utils/productUpload';
import type { Product } from '../backend';

export default function AdminProductsPage() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: products, isLoading: productsLoading } = useProducts();
  const createProduct = useCreateProduct();
  const upsertProducts = useUpsertProductsAdmin();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    price: '',
    description: '',
  });

  const [bulkUploadText, setBulkUploadText] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Price must be a positive number');
      return;
    }

    if (!formData.name.trim() || !formData.category.trim() || !formData.unit.trim()) {
      setErrorMessage('Name, Category, and Unit are required fields');
      return;
    }

    try {
      const product: Product = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        unit: formData.unit.trim(),
        price: BigInt(Math.round(priceNum)),
        description: formData.description.trim() || undefined,
      };

      await createProduct.mutateAsync(product);
      setSuccessMessage(`Successfully created product: ${product.name}`);
      setFormData({
        name: '',
        category: '',
        unit: '',
        price: '',
        description: '',
      });
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Failed to create product:', error);
      const errorMsg = error?.message || 'Failed to create product';
      setErrorMessage(errorMsg);
    }
  };

  const handleBulkUpload = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!bulkUploadText.trim()) {
      setErrorMessage('Please paste product data to upload');
      return;
    }

    try {
      const parsedProducts = parseProductUpload(bulkUploadText);
      
      if (parsedProducts.length === 0) {
        setErrorMessage('No valid products found in the input');
        return;
      }

      await upsertProducts.mutateAsync(parsedProducts);
      setSuccessMessage(`Successfully uploaded ${parsedProducts.length} product(s)`);
      setBulkUploadText('');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Failed to bulk upload products:', error);
      const errorMsg = error?.message || 'Failed to upload products';
      setErrorMessage(errorMsg);
    }
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Please sign in to access the product management page.
            </p>
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full"
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

  // Loading admin status
  if (isAdminLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                You do not have admin permissions to access this page.
              </AlertDescription>
            </Alert>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Button onClick={handleLogout} variant="outline">
          Sign Out
        </Button>
      </div>

      {successMessage && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create">Add Product</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="e.g., Milk"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      placeholder="e.g., Dairy"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => handleFormChange('unit', e.target.value)}
                      placeholder="e.g., 1L, 500g"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price}
                      onChange={(e) => handleFormChange('price', e.target.value)}
                      placeholder="e.g., 100"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="e.g., Fresh cow milk"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createProduct.isPending}
                  className="w-full md:w-auto"
                >
                  {createProduct.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Product
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Upload Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulkUpload">Paste JSON or CSV Data</Label>
                <Textarea
                  id="bulkUpload"
                  value={bulkUploadText}
                  onChange={(e) => {
                    setBulkUploadText(e.target.value);
                    setSuccessMessage(null);
                    setErrorMessage(null);
                  }}
                  placeholder={`JSON format:
[
  {
    "name": "Milk",
    "category": "Dairy",
    "unit": "1L",
    "price": 100,
    "description": "Fresh cow milk"
  }
]

CSV format:
name,category,unit,price,description
Milk,Dairy,1L,100,Fresh cow milk`}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                <p className="font-semibold">Format Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>JSON: Array of product objects with name, category, unit, price (required), and description (optional)</li>
                  <li>CSV: Header row followed by data rows (description column is optional)</li>
                  <li>Price must be a positive number</li>
                  <li>Existing products with the same name will be updated</li>
                </ul>
              </div>

              <Button
                onClick={handleBulkUpload}
                disabled={upsertProducts.isPending || !bulkUploadText.trim()}
                className="w-full md:w-auto"
              >
                {upsertProducts.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Products
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product List */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Current Products ({products?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.name}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <h3 className="font-semibold">{product.name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Category: {product.category}</p>
                    <p>Unit: {product.unit}</p>
                    <p className="font-medium text-foreground">
                      Price: ₹{Number(product.price)}
                    </p>
                    {product.description && (
                      <p className="text-xs italic">{product.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No products found. Create your first product above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
