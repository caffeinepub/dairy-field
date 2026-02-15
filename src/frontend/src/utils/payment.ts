import { paymentConfig } from '@/config/payment';

/**
 * Builds a UPI payment deep link for online payment
 * @param amount - Payment amount in rupees
 * @param orderId - Order ID for reference
 * @returns UPI intent URL
 */
export function buildPaymentDeepLink(amount: number, orderId?: string): string {
  const { payeeVPA, payeeName } = paymentConfig;
  
  if (!payeeVPA || !payeeName) {
    // Fallback to generic UPI URL if not configured
    return 'upi://pay';
  }

  const params = new URLSearchParams({
    pa: payeeVPA, // Payee address (UPI ID)
    pn: payeeName, // Payee name
    am: amount.toString(), // Amount
    cu: 'INR', // Currency
    tn: orderId ? `Order #${orderId}` : 'DAIRY FIELD Order', // Transaction note
  });

  return `upi://pay?${params.toString()}`;
}

/**
 * Formats payment information to be appended to order notes
 * @param paymentMethod - Selected payment method
 * @param transactionRef - Optional transaction reference/ID
 * @param isConfigured - Whether payment is properly configured
 * @returns Formatted payment note text
 */
export function formatPaymentNote(
  paymentMethod: string,
  transactionRef?: string,
  isConfigured: boolean = true
): string {
  let note = `Payment Method: ${paymentMethod}`;
  
  if (paymentMethod === 'Online Payment') {
    if (!isConfigured) {
      note += ' (Payment configuration pending - please contact for payment details)';
    } else if (transactionRef && transactionRef.trim()) {
      note += ` | Transaction Ref: ${transactionRef.trim()}`;
    }
  }
  
  return note;
}
