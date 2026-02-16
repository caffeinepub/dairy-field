import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '@/state/cart/CartContext';
import { useProducts, useCreateOrder, useCreateGuestOrder, useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, ShoppingBag, CreditCard } from 'lucide-react';
import { calculateCartWithLatestPrices } from '@/utils/cartPricing';
import { PAYMENT_CONFIG } from '@/config/payment';
import { formatPaymentInfoForNotes, buildUpiPaymentUri } from '@/utils/payment';
import { toast } from 'sonner';
import GooglePayQrSection from '@/components/GooglePayQrSection';
import type { CartItem } from '../backend';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { identity } = useInternetIdentity();
  
  // Only load profile if user is authenticated
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile(!!identity);
  const saveProfile = useSaveCallerUserProfile();
  const createOrder = useCreateOrder();
  const createGuestOrder = useCreateGuestOrder();

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionRef, setTransactionRef] = useState('');

  // Get the default payee - Google Pay phone
  const payee = PAYMENT_CONFIG.payees.find(p => p.id === PAYMENT_CONFIG.defaultPayeeId) || PAYMENT_CONFIG.payees[0];
  const payeeName = PAYMENT_CONFIG.payeeName || 'Ali Waris Khan';

  // Prefill form from user profile only if authenticated
  useEffect(() => {
    if (identity && userProfile) {
      setCustomerName(userProfile.name);
      setPhoneNumber(userProfile.phoneNumber || '');
      setAddress(userProfile.address || '');
    }
  }, [userProfile, identity]);

  // Show loading only when products are loading or when authenticated user's profile is loading
  if (productsLoading || (identity && profileLoading)) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!products) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load product information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Add some products before checking out.
            </p>
            <Button onClick={() => navigate({ to: '/products' })}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { items: itemsWithPrices, total, hasMissingProducts } = calculateCartWithLatestPrices(items, products);

  if (hasMissingProducts) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-3">
            <p>Some products in your cart are no longer available. Please remove them from your cart before proceeding.</p>
            <Button variant="outline" onClick={() => navigate({ to: '/cart' })}>
              Go to Cart
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Build UPI URI for QR code
  const upiUriResult = payee && payeeName ? buildUpiPaymentUri(payee, total, payeeName) : { error: 'Payment not configured' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const orderItems: CartItem[] = itemsWithPrices.map(item => ({
        productName: item.productName,
        quantity: BigInt(item.quantity),
      }));

      // Format payment info with QR flow indicator and combine with user notes
      const paymentInfo = formatPaymentInfoForNotes('online', payee?.id, transactionRef, 'qr');
      // User notes come first, then payment info
      const orderNotes = notes.trim() 
        ? `${notes.trim()}\n\n${paymentInfo}` 
        : paymentInfo;

      let orderId: bigint;

      // Use guest order creation if not authenticated, otherwise use authenticated order creation
      if (!identity) {
        orderId = await createGuestOrder.mutateAsync({
          customerName,
          phoneNumber,
          address,
          notes: orderNotes || null,
          items: orderItems,
        });
      } else {
        orderId = await createOrder.mutateAsync({
          customerName,
          phoneNumber,
          address,
          notes: orderNotes || null,
          items: orderItems,
        });

        // Save profile only for authenticated users if profile doesn't exist
        if (!userProfile) {
          await saveProfile.mutateAsync({
            name: customerName,
            phoneNumber: phoneNumber || undefined,
            address: address || undefined,
          });
        }
      }

      clearCart();
      toast.success('Order placed successfully! Shop owner will be notified.');
      navigate({ to: '/confirmation/$orderId', params: { orderId: String(orderId) } });
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const isSubmitting = createOrder.isPending || createGuestOrder.isPending || saveProfile.isPending;

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      placeholder="Enter your complete delivery address"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions for your order"
                      rows={2}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Transaction Reference (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  After completing payment, enter your UPI transaction ID or reference number here:
                </p>
                <Input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g., 123456789012"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itemsWithPrices.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="font-medium">₹{item.lineTotal}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {upiUriResult.uri && payee ? (
              <GooglePayQrSection
                upiUri={upiUriResult.uri}
                payeeValue={payee.value}
                payeeName={payeeName}
                amount={total}
              />
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {upiUriResult.error || 'Payment configuration error. Please contact support.'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By placing this order, you confirm that you have completed or will complete the payment via the QR code above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
