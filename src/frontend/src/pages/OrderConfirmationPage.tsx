import { useParams, Link } from '@tanstack/react-router';
import { useGetOrder } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Phone, ShoppingBag, AlertCircle, FileText } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ strict: false });
  const orderIdNum = orderId ? BigInt(orderId) : BigInt(0);
  const { data: order, isLoading, error } = useGetOrder(orderIdNum);

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
            Unable to load order details. Please contact us at 9000009707 with your order ID.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto space-y-6">
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
            
            {order.notes && (
              <div>
                <p className="text-muted-foreground text-sm mb-1">Order Notes</p>
                <p className="font-medium">{order.notes}</p>
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

        <Alert>
          <Phone className="h-4 w-4" />
          <AlertDescription>
            For any questions about your order, please call us at{' '}
            <a href="tel:9000009707" className="font-semibold hover:text-primary transition-colors">
              9000009707
            </a>
          </AlertDescription>
        </Alert>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/order/$orderId" params={{ orderId: orderId || '' }}>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              View Full Order Details
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
