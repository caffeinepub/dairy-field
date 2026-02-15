import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '@/hooks/useQueries';
import { parsePaymentInfo } from '@/utils/payment';
import PaymentDetailsSection from '@/components/PaymentDetailsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Phone, AlertCircle, Package } from 'lucide-react';

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const { orderId: routeOrderId } = useParams({ strict: false });
  
  const [inputOrderId, setInputOrderId] = useState(routeOrderId || '');
  const [validationError, setValidationError] = useState('');
  const [submittedOrderId, setSubmittedOrderId] = useState<bigint | null>(
    routeOrderId ? BigInt(routeOrderId) : null
  );

  const shouldFetch = submittedOrderId !== null && submittedOrderId > 0n;
  const { data: order, isLoading, error } = useGetOrder(submittedOrderId || BigInt(0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate input
    if (!inputOrderId.trim()) {
      setValidationError('Please enter an Order ID');
      return;
    }

    const numericValue = Number(inputOrderId);
    if (isNaN(numericValue) || !Number.isInteger(numericValue)) {
      setValidationError('Order ID must be a valid number');
      return;
    }

    if (numericValue <= 0) {
      setValidationError('Order ID must be greater than 0');
      return;
    }

    // Valid input - fetch order
    const orderIdBigInt = BigInt(numericValue);
    setSubmittedOrderId(orderIdBigInt);
    
    // Update URL to include order ID
    navigate({ to: `/order/${numericValue}` });
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000); // Convert nanoseconds to milliseconds
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const paymentInfo = order ? parsePaymentInfo(order.notes) : null;
  const showPaymentDetails = paymentInfo && paymentInfo.method === 'Online Payment';
  
  // Extract user notes (everything before payment info block)
  const userNotes = order?.notes?.split('[PAYMENT_INFO]')[0].trim();

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">
            Enter your Order ID to view your order information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Lookup Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  type="text"
                  placeholder="Enter your order ID (e.g., 123)"
                  value={inputOrderId}
                  onChange={(e) => {
                    setInputOrderId(e.target.value);
                    setValidationError('');
                  }}
                  className={validationError ? 'border-destructive' : ''}
                />
                {validationError && (
                  <p className="text-sm text-destructive">{validationError}</p>
                )}
              </div>
              <Button type="submit" className="w-full gap-2">
                <Search className="h-4 w-4" />
                View Order Details
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && shouldFetch && (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        )}

        {error && shouldFetch && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load order details. The order may not exist or you may not have permission to view it.
              Please contact us at{' '}
              <a href="tel:9494237076" className="font-semibold underline">
                9494237076
              </a>{' '}
              with your order ID for assistance.
            </AlertDescription>
          </Alert>
        )}

        {order && !isLoading && (
          <>
            {/* Payment Details Section */}
            {showPaymentDetails && paymentInfo && (
              <PaymentDetailsSection paymentInfo={paymentInfo} />
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order #{Number(order.id)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Customer Name</p>
                    <p className="font-medium">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Phone Number</p>
                    <p className="font-medium">{order.phoneNumber}</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm mb-1">Delivery Address</p>
                  <p className="font-medium">{order.address}</p>
                </div>

                {userNotes && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Order Notes</p>
                    <p className="font-medium whitespace-pre-wrap">{userNotes}</p>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground text-sm mb-1">Order Date</p>
                  <p className="font-medium">{formatTimestamp(order.timestamp)}</p>
                </div>

                <Separator />

                <div>
                  <p className="font-semibold mb-3">Items Ordered</p>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm py-2 border-b last:border-0">
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-muted-foreground">Qty: {Number(item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{Number(order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Phone className="h-4 w-4" />
              <AlertDescription>
                For any questions about your order, please call us at{' '}
                <a href="tel:9494237076" className="font-semibold hover:text-primary transition-colors">
                  9494237076
                </a>
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </div>
  );
}
