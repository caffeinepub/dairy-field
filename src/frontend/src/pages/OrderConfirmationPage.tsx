import { useParams } from '@tanstack/react-router';
import { useGetOrder } from '@/hooks/useQueries';
import { generateRapidoPickupNote } from '@/utils/rapidoPickupNote';
import { parsePaymentInfo } from '@/utils/payment';
import PaymentDetailsSection from '@/components/PaymentDetailsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Phone, AlertCircle, Bike, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ strict: false });
  const orderIdNum = orderId ? BigInt(orderId) : BigInt(0);
  const { data: order, isLoading, error } = useGetOrder(orderIdNum);

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000); // Convert nanoseconds to milliseconds
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const handleCopyPickupNote = () => {
    if (!order) return;
    
    const pickupNote = generateRapidoPickupNote(order);
    navigator.clipboard.writeText(pickupNote).then(() => {
      toast.success('Pickup details copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy. Please try again.');
    });
  };

  const handleBookRapido = () => {
    window.open('https://rapido.bike/', '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-12">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load order details. Please contact us at{' '}
            <a href="tel:9494237076" className="font-semibold underline">
              9494237076
            </a>
            {orderId && ` with order ID #${orderId}`} for assistance.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const paymentInfo = parsePaymentInfo(order.notes);
  const showPaymentDetails = paymentInfo && paymentInfo.method === 'Online Payment';

  // Extract user notes (everything before payment info block)
  const userNotes = order.notes?.split('[PAYMENT_INFO]')[0].trim();

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="text-center border-primary">
          <CardContent className="pt-12 pb-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We'll deliver your fresh dairy products soon.
            </p>
            <div className="inline-block bg-muted px-6 py-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Order ID</p>
              <p className="text-2xl font-bold">#{Number(order.id)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details Section */}
        {showPaymentDetails && paymentInfo && (
          <PaymentDetailsSection paymentInfo={paymentInfo} />
        )}

        {/* Full Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
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

            <div>
              <p className="text-muted-foreground text-sm mb-1">Order Date</p>
              <p className="font-medium">{formatTimestamp(order.timestamp)}</p>
            </div>
            
            {userNotes && (
              <div>
                <p className="text-muted-foreground text-sm mb-1">Order Notes</p>
                <p className="font-medium whitespace-pre-wrap">{userNotes}</p>
              </div>
            )}
            
            <Separator />
            
            <div>
              <p className="font-semibold mb-3">Items Ordered</p>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.productName} × {Number(item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span>₹{Number(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Rapido Pickup Helper */}
        <Card className="border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5" />
              Need Pickup Service?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Book a Rapido delivery partner to collect your order quickly and conveniently.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleBookRapido}
                className="flex-1 gap-2"
                variant="default"
              >
                <ExternalLink className="h-4 w-4" />
                Book Rapido Pickup
              </Button>
              
              <Button
                onClick={handleCopyPickupNote}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Pickup Details
              </Button>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                Click "Copy Pickup Details" to copy order information, then paste it when booking your Rapido ride.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Alert>
          <Phone className="h-4 w-4" />
          <AlertDescription>
            For any questions about your order, please call us at{' '}
            <a href="tel:9494237076" className="font-semibold hover:text-primary transition-colors">
              9494237076
            </a>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
