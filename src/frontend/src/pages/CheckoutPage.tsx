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
import { Loader2, AlertCircle, ShoppingBag, CreditCard, Copy, Check } from 'lucide-react';
import { calculateCartWithLatestPrices } from '@/utils/cartPricing';
import { PAYMENT_CONFIG, getDefaultPayee } from '@/config/payment';
import { formatPaymentInfoForNotes } from '@/utils/payment';
import { toast } from 'sonner';
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
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  // Get the default (and only) payee
  const defaultPayeeId = getDefaultPayee() || '';
  const payee = PAYMENT_CONFIG.payees.find(p => p.id === defaultPayeeId);

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

  const handleCopyPhone = async () => {
    if (!payee) return;
    
    try {
      await navigator.clipboard.writeText(payee.value);
      setCopiedPhone(true);
      toast.success('Google Pay number copied!');
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch (error) {
      toast.error('Failed to copy. Please try again.');
    }
  };

  const handleCopyAmount = async () => {
    try {
      await navigator.clipboard.writeText(total.toString());
      setCopiedAmount(true);
      toast.success('Amount copied!');
      setTimeout(() => setCopiedAmount(false), 2000);
    } catch (error) {
      toast.error('Failed to copy. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const orderItems: CartItem[] = itemsWithPrices.map(item => ({
        productName: item.productName,
        quantity: BigInt(item.quantity),
      }));

      // Always format payment info for online payment with Google Pay
      const paymentInfo = formatPaymentInfoForNotes('online', defaultPayeeId, transactionRef);
      const orderNotes = paymentInfo + (notes ? `\n\n${notes}` : '');

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
      navigate({ to: '/confirmation/$orderId', params: { orderId: String(orderId) } });
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const isSubmitting = createOrder.isPending || createGuestOrder.isPending || saveProfile.isPending;

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment via Google Pay
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertDescription className="text-sm">
                      Pay using Google Pay to complete your order. Copy the details below and make the payment.
                    </AlertDescription>
                  </Alert>

                  {payee && (
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Pay to</p>
                          <p className="text-lg font-semibold">{payee.label}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-background rounded-md p-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                          <p className="text-xl font-bold font-mono">{payee.value}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCopyPhone}
                          className="gap-2"
                        >
                          {copiedPhone ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between bg-background rounded-md p-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Amount</p>
                          <p className="text-xl font-bold text-primary">₹{total}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCopyAmount}
                          className="gap-2"
                        >
                          {copiedAmount ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="transactionRef">Transaction Reference (Optional)</Label>
                    <Input
                      id="transactionRef"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Enter transaction ID after payment (optional)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You can leave this empty and share it with us later if needed.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
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
            </form>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {itemsWithPrices.map((item) => (
                    <div key={item.productName} className="flex justify-between text-sm">
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span>₹{Number(item.price) * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
