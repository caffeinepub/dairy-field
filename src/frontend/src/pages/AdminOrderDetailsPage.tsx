import { useNavigate, useSearch } from '@tanstack/react-router';
import { useGetOrderById } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, Package, User, Phone, MapPin, FileText, ArrowLeft, Copy, Check } from 'lucide-react';
import { parsePaymentInfo, extractUserNotes } from '@/utils/payment';
import { generateRapidoPickupNote } from '@/utils/rapidoPickupNote';
import PaymentDetailsSection from '@/components/PaymentDetailsSection';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function AdminOrderDetailsPage() {
  const navigate = useNavigate();
  
  // Extract orderId from the URL path
  const [orderIdFromPath, setOrderIdFromPath] = useState<string | null>(null);
  
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/admin\/orders\/(\d+)/);
    if (match && match[1]) {
      setOrderIdFromPath(match[1]);
    }
  }, []);
  
  const orderIdBigInt = orderIdFromPath && !isNaN(Number(orderIdFromPath)) ? BigInt(orderIdFromPath) : null;
  const { data: order, isLoading, isError, error } = useGetOrderById(orderIdBigInt);
  
  const [copiedRapido, setCopiedRapido] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orderIdBigInt) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid order ID format.
        </AlertDescription>
      </Alert>
    );
  }

  if (order === null) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Order not found.
        </AlertDescription>
      </Alert>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load order: {error?.message || 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!order) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to load order details.
        </AlertDescription>
      </Alert>
    );
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/admin/orders' })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Order #{order.id.toString()}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(Number(order.timestamp) / 1000000).toLocaleString()}
          </p>
        </div>
      </div>

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
    </div>
  );
}
