import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetOrderById, useIsAdmin } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, Package, User, Phone, MapPin, FileText, Search, ShieldAlert } from 'lucide-react';
import { parsePaymentInfo, extractUserNotes } from '@/utils/payment';
import PaymentDetailsSection from '@/components/PaymentDetailsSection';

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [searchedOrderId, setSearchedOrderId] = useState<bigint | null>(null);
  
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: order, isLoading, isError, error } = useGetOrderById(searchedOrderId);

  // Show access denied message for non-admin users
  if (!isAdminLoading && !isAdmin) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <CardTitle>Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Order tracking is available for admin only.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate({ to: '/' })} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(orderIdInput, 10);
    if (isNaN(id) || id <= 0) {
      return;
    }
    setSearchedOrderId(BigInt(id));
  };

  const paymentInfo = order ? parsePaymentInfo(order.notes || undefined) : null;
  const userNotes = order ? extractUserNotes(order.notes || undefined) : '';

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order Details</h1>
          <p className="text-muted-foreground">
            Enter your order ID to view order details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="orderId" className="sr-only">
                  Order ID
                </Label>
                <Input
                  id="orderId"
                  type="number"
                  placeholder="Enter order ID (e.g., 1)"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load order: {error?.message || 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && searchedOrderId !== null && order === null && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Order not found. Please check the order ID or you may not have permission to view this order.
            </AlertDescription>
          </Alert>
        )}

        {order && (
          <div className="space-y-6">
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-center">
                  Order #{order.id.toString()}
                </CardTitle>
                <p className="text-center text-sm text-muted-foreground">
                  Placed on {new Date(Number(order.timestamp) / 1000000).toLocaleString()}
                </p>
              </CardHeader>
            </Card>

            {paymentInfo && (paymentInfo.method === 'Google Pay' || paymentInfo.method === 'Online Payment') && (
              <PaymentDetailsSection paymentInfo={paymentInfo} />
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </p>
                  <p className="font-medium">{order.phoneNumber}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </p>
                  <p className="font-medium">{order.address}</p>
                </div>
                {userNotes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Order Notes
                      </p>
                      <p className="font-medium whitespace-pre-wrap">{userNotes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.productName} × {item.quantity.toString()}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>₹{Number(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertDescription>
                <p className="font-medium mb-2">Need help?</p>
                <p className="text-sm">
                  Contact us at <a href="tel:9494237076" className="font-medium underline">9494237076</a> for any questions about your order.
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button onClick={() => navigate({ to: '/' })} variant="outline" className="flex-1">
                Back to Home
              </Button>
              <Button onClick={() => navigate({ to: '/products' })} className="flex-1">
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
