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
import { SiGooglepay } from 'react-icons/si';
import { calculateCartWithLatestPrices } from '@/utils/cartPricing';
import { PAYMENT_CONFIG } from '@/config/payment';
import { formatPaymentInfoForNotes, buildGooglePayDeepLink } from '@/utils/payment';
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
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [paymentAttempted, setPaymentAttempted] = useState(false);

  // Get the default payee - Google Pay UPI
  const payee = PAYMENT_CONFIG.payees.find(p => p.id === PAYMENT_CONFIG.defaultPayeeId) || PAYMENT_CONFIG.payees[0];
  const payeeName = PAYMENT_CONFIG.payeeName || 'ALIWARISKHAN WARSI';
  const displayPhone = PAYMENT_CONFIG.phoneNumber || '9494237076';

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

  const handlePayWithGooglePay = () => {
    if (!payee || !payeeName) {
      toast.error('Payment configuration is incomplete. Please contact support.');
      return;
    }

    const deepLinkResult = buildGooglePayDeepLink(
      payee,
      total,
      payeeName
    );

    if (deepLinkResult.error) {
      toast.error(deepLinkResult.error);
      setPaymentAttempted(true);
      return;
    }

    if (deepLinkResult.url) {
      // Try to open the Google Pay app
      try {
        window.location.href = deepLinkResult.url;
        setPaymentAttempted(true);
        toast.success('Opening Google Pay...');
      } catch (error) {
        toast.error('Unable to open Google Pay. Please use manual payment below.');
        setPaymentAttempted(true);
      }
    }
  };

  const handleCopyUpi = async () => {
    if (!payee) return;
    try {
      await navigator.clipboard.writeText(payee.value);
      setCopiedUpi(true);
      toast.success('UPI ID copied!');
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch (error) {
      toast.error('Failed to copy. Please try again.');
    }
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(displayPhone);
      setCopiedPhone(true);
      toast.success('Phone number copied!');
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

      // Format payment info and combine with user notes
      const paymentInfo = formatPaymentInfoForNotes('online', payee?.id, transactionRef);
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
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-primary/50 bg-primary/5">
                  <SiGooglepay className="h-5 w-5 text-primary" />
                  <AlertDescription>
                    <p className="font-semibold mb-1">Google Pay Payment</p>
                    <p className="text-sm">Pay to: <span className="font-medium">{payeeName}</span></p>
                    {payee && payee.type === 'upi' && (
                      <p className="text-sm">UPI ID: <span className="font-medium">{payee.value}</span></p>
                    )}
                    <p className="text-sm">Phone: <span className="font-medium">{displayPhone}</span></p>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={handlePayWithGooglePay}
                    className="w-full"
                    size="lg"
                  >
                    <SiGooglepay className="h-5 w-5 mr-2" />
                    Pay with Google Pay
                  </Button>

                  {paymentAttempted && (
                    <div className="space-y-3 pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        Or copy payment details manually:
                      </p>

                      {payee && payee.type === 'upi' && (
                        <div className="flex gap-2">
                          <Input
                            value={payee.value}
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleCopyUpi}
                          >
                            {copiedUpi ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Input
                          value={displayPhone}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleCopyPhone}
                        >
                          {copiedPhone ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          value={`₹${total}`}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleCopyAmount}
                        >
                          {copiedAmount ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="transactionRef">Transaction Reference (Optional)</Label>
                  <Input
                    id="transactionRef"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Enter UPI transaction ID after payment"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your transaction ID for faster order confirmation
                  </p>
                </div>
              </CardContent>
            </Card>
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
                      <span className="font-medium">₹{item.lineTotal}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <Button
                  type="submit"
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

                <p className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
