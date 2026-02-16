import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrderById } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2, AlertCircle, Package, User, Phone, MapPin, FileText, Copy, Check } from 'lucide-react';
import { parsePaymentInfo, extractUserNotes } from '@/utils/payment';
import { generateRapidoPickupNote } from '@/utils/rapidoPickupNote';
import PaymentDetailsSection from '@/components/PaymentDetailsSection';
import { toast } from 'sonner';
import { useState } from 'react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/confirmation/$orderId' });
  const navigate = useNavigate();
  
  // Convert string orderId to bigint, or null if invalid
  const orderIdBigInt = orderId && !isNaN(Number(orderId)) ? BigInt(orderId) : null;
  
  const { data: order, isLoading, isError, error } = useGetOrderById(orderIdBigInt);
  const [copiedRapido, setCopiedRapido] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle invalid order ID format
  if (!orderIdBigInt) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid order ID format. Please check the URL and try again.
          </AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => navigate({ to: '/' })}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // Handle order not found (null response)
  if (order === null) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Order not found. You may not have permission to view this order.
          </AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => navigate({ to: '/' })}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // Handle fetch errors
  if (isError) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load order details: {error?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => navigate({ to: '/' })}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // Handle undefined order (shouldn't happen but TypeScript needs this)
  if (!order) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load order details. Please try again.
          </AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => navigate({ to: '/' })}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // At this point, order is guaranteed to be defined (not null, not undefined)
  const paymentInfo = parsePaymentInfo(order.notes || undefined);
  const userNotes = extractUserNotes(order.notes || undefined);
  const rapidoNote = generateRapidoPickupNote(order);

  const handleCopyRapidoNote = async () => {
    try {
      await navigator.clipboard.writeText(rapidoNote);
      setCopiedRapido(true);
      toast.success('Rapido pickup note copied!');
      setTimeout(() => setCopiedRapido(false), 2000);
    } catch (error) {
      toast.error('Failed to copy. Please try again.');
    }
  };

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order.id.toString());
      setCopiedOrderId(true);
      toast.success('Order ID copied!');
      setTimeout(() => setCopiedOrderId(false), 2000);
    } catch (error) {
      toast.error('Failed to copy. Please try again.');
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <p className="text-muted-foreground">
              Thank you for your order. We'll prepare it for delivery.
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-bold">#{order.id.toString()}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyOrderId}
                  className="h-8 w-8 p-0"
                >
                  {copiedOrderId ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Save this order ID for tracking your order
              </p>
            </div>
          </CardContent>
        </Card>

        {paymentInfo && paymentInfo.method === 'Google Pay' && (
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

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Rapido Pickup Helper</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Copy this note to quickly book a Rapido pickup for this order:
            </p>
            <div className="bg-white p-4 rounded-lg border">
              <pre className="text-sm whitespace-pre-wrap font-mono">{rapidoNote}</pre>
            </div>
            <Button
              onClick={handleCopyRapidoNote}
              variant="outline"
              className="w-full"
            >
              {copiedRapido ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Rapido Note
                </>
              )}
            </Button>
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
    </div>
  );
}
