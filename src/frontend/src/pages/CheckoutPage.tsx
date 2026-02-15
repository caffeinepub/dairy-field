import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '@/state/cart/CartContext';
import { useCreateOrder, useProducts } from '@/hooks/useQueries';
import { calculateCartWithLatestPrices } from '@/utils/cartPricing';
import { isPaymentConfigured } from '@/config/payment';
import { buildPaymentDeepLink, formatPaymentNote } from '@/utils/payment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, AlertCircle, ExternalLink, CreditCard, Banknote } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { data: products, isLoading: productsLoading } = useProducts();
  const createOrder = useCreateOrder();
  
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    notes: '',
    paymentMethod: '', // Required field
    transactionRef: '', // Optional for online payment
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPaymentLink, setShowPaymentLink] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData({ ...formData, paymentMethod: value });
    setErrors({ ...errors, paymentMethod: '' });
    setShowPaymentLink(false);
  };

  const handlePayNow = () => {
    if (!products) return;
    
    const pricingResult = calculateCartWithLatestPrices(items, products);
    const paymentLink = buildPaymentDeepLink(pricingResult.total);
    
    // Open payment link
    window.open(paymentLink, '_blank');
    setShowPaymentLink(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Build payment note to append to order notes
      const paymentConfigured = isPaymentConfigured();
      const paymentNote = formatPaymentNote(
        formData.paymentMethod,
        formData.transactionRef,
        paymentConfigured
      );

      // Combine user notes with payment info
      const combinedNotes = [formData.notes, paymentNote]
        .filter(Boolean)
        .join('\n\n');

      const orderId = await createOrder.mutateAsync({
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        notes: combinedNotes || null,
        items: items.map(item => ({
          productName: item.productName,
          quantity: BigInt(item.quantity),
        })),
      });
      
      clearCart();
      navigate({ to: `/confirmation/${orderId}` });
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your cart is empty. Please add items before checking out.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (productsLoading || !products) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pricingResult = calculateCartWithLatestPrices(items, products);
  const { items: itemsWithPrices, total, hasMissingProducts } = pricingResult;
  const paymentConfigured = isPaymentConfigured();

  if (hasMissingProducts) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some products in your cart are no longer available. Please return to your cart and remove them before checking out.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate({ to: '/cart' })} variant="outline">
            Return to Cart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Enter your full name"
                    className={errors.customerName ? 'border-destructive' : ''}
                  />
                  {errors.customerName && (
                    <p className="text-sm text-destructive">{errors.customerName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Enter your phone number"
                    className={errors.phoneNumber ? 'border-destructive' : ''}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special instructions for your order"
                    rows={2}
                  />
                </div>

                <Separator />

                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Payment Method *</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose how you'd like to pay for your order
                    </p>
                  </div>

                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={handlePaymentMethodChange}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="Cash on Delivery" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Cash on Delivery</div>
                          <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="Online Payment" id="online" />
                      <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Online Payment</div>
                          <div className="text-sm text-muted-foreground">Pay now via UPI/Net Banking</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {errors.paymentMethod && (
                    <p className="text-sm text-destructive">{errors.paymentMethod}</p>
                  )}

                  {/* Online Payment Section */}
                  {formData.paymentMethod === 'Online Payment' && (
                    <div className="space-y-4 p-4 border rounded-lg bg-accent/20">
                      {!paymentConfigured && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Online payment is not fully configured. You can still place your order, and we'll contact you with payment details.
                          </AlertDescription>
                        </Alert>
                      )}

                      {paymentConfigured && (
                        <>
                          <div className="space-y-2">
                            <Button
                              type="button"
                              onClick={handlePayNow}
                              variant="outline"
                              className="w-full gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Pay Now (₹{total})
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                              Opens your payment app to complete the transaction
                            </p>
                          </div>

                          {showPaymentLink && (
                            <Alert>
                              <AlertDescription className="text-sm">
                                After completing payment, please enter your transaction reference below (optional but recommended).
                              </AlertDescription>
                            </Alert>
                          )}
                        </>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="transactionRef">
                          Transaction Reference / UPI ID (Optional)
                        </Label>
                        <Input
                          id="transactionRef"
                          value={formData.transactionRef}
                          onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                          placeholder="Enter transaction ID or reference number"
                        />
                        <p className="text-xs text-muted-foreground">
                          This helps us verify your payment faster
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {createOrder.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to place order. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {itemsWithPrices.map((item) => (
                  <div key={item.productName} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.productName} × {item.quantity}
                    </span>
                    <span>₹{item.lineTotal}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
