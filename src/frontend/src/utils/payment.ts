import { PAYMENT_CONFIG, type PayeeOption } from '@/config/payment';

/**
 * Structured payment information for parsing
 */
export interface PaymentInfo {
  method: string;
  payeeType?: string;
  payeeLabel?: string;
  payeeValue?: string;
  transactionRef?: string;
}

/**
 * Validation result for payee
 */
export interface PayeeValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a payee value based on its type
 * @param payee - The payee option to validate
 * @returns Validation result with error message if invalid
 */
export function validatePayee(payee: PayeeOption): PayeeValidationResult {
  if (!payee.value || !payee.value.trim()) {
    return { valid: false, error: 'Payee value is empty' };
  }

  if (payee.type === 'upi') {
    // UPI ID must contain exactly one '@' symbol
    const atCount = (payee.value.match(/@/g) || []).length;
    if (atCount !== 1) {
      return { valid: false, error: 'Invalid UPI ID format. UPI ID must contain exactly one @ symbol.' };
    }
    
    // Basic UPI ID format validation: alphanumeric with dots/hyphens allowed, @ symbol, and domain
    const upiRegex = /^[a-zA-Z0-9.\-]{2,256}@[a-zA-Z][a-zA-Z0-9]{2,64}$/;
    if (!upiRegex.test(payee.value)) {
      return { valid: false, error: 'Invalid UPI ID format. Please check the UPI ID configuration.' };
    }
  } else if (payee.type === 'phone') {
    // Phone number should be digits only
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(payee.value)) {
      return { valid: false, error: 'Invalid phone number format. Phone number must be 10-15 digits.' };
    }
  }

  return { valid: true };
}

/**
 * Builds a UPI payment deep link for online payment
 * @param payeeId - Selected payee ID
 * @param amount - Payment amount in rupees
 * @returns UPI intent URL or error result
 */
export function buildUpiDeepLink(
  payeeId: string,
  amount: number
): { url?: string; error?: string } {
  const { payeeName } = PAYMENT_CONFIG;
  
  const selectedPayee = PAYMENT_CONFIG.payees.find(p => p.id === payeeId);
  
  if (!selectedPayee || !payeeName) {
    return { error: 'Payment configuration is incomplete. Please contact support.' };
  }

  // Only allow UPI type payees for UPI deep links
  if (selectedPayee.type !== 'upi') {
    return { error: 'Please select the UPI ID option to pay via UPI app. Phone numbers cannot be used for UPI payment links.' };
  }

  // Validate the payee before building the link
  const validation = validatePayee(selectedPayee);
  if (!validation.valid) {
    return { error: validation.error };
  }

  // Use the UPI ID directly as the payee address
  const payeeAddress = selectedPayee.value;

  const params = new URLSearchParams({
    pa: payeeAddress, // Payee address (UPI ID)
    pn: payeeName, // Payee name
    am: amount.toString(), // Amount
    cu: 'INR', // Currency
    tn: 'DAIRY FIELD Order', // Transaction note
  });

  return { url: `upi://pay?${params.toString()}` };
}

/**
 * Formats payment information as structured data to be appended to order notes
 * @param paymentMethod - Selected payment method (only 'online' is supported now)
 * @param payeeId - Selected payee ID (for online payment)
 * @param transactionRef - Optional transaction reference/ID
 * @returns Formatted payment note text with structured data
 */
export function formatPaymentInfoForNotes(
  paymentMethod: 'online',
  payeeId?: string,
  transactionRef?: string
): string {
  // Default to the configured default payee if none provided
  const effectivePayeeId = payeeId || PAYMENT_CONFIG.defaultPayeeId || PAYMENT_CONFIG.payees[0]?.id;
  const selectedPayee = PAYMENT_CONFIG.payees.find(p => p.id === effectivePayeeId);

  let structuredInfo = `[PAYMENT_INFO]
Method: Online Payment`;

  if (selectedPayee) {
    structuredInfo += `
PayeeType: ${selectedPayee.type}
PayeeLabel: ${selectedPayee.label}
PayeeValue: ${selectedPayee.value}`;
  }

  if (transactionRef && transactionRef.trim()) {
    structuredInfo += `
TransactionRef: ${transactionRef.trim()}`;
  }

  structuredInfo += '\n[/PAYMENT_INFO]';

  return structuredInfo;
}

/**
 * Parses structured payment information from order notes
 * @param notes - Order notes containing structured payment info
 * @returns Parsed payment information or null if not found
 */
export function parsePaymentInfo(notes?: string): PaymentInfo | null {
  if (!notes) return null;

  const paymentInfoMatch = notes.match(/\[PAYMENT_INFO\]([\s\S]*?)\[\/PAYMENT_INFO\]/);
  if (!paymentInfoMatch) return null;

  const paymentBlock = paymentInfoMatch[1];
  const lines = paymentBlock.split('\n').map(line => line.trim()).filter(Boolean);

  const info: PaymentInfo = {
    method: '',
  };

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();

    switch (key.trim()) {
      case 'Method':
        info.method = value;
        break;
      case 'PayeeType':
        info.payeeType = value;
        break;
      case 'PayeeLabel':
        info.payeeLabel = value;
        break;
      case 'PayeeValue':
        info.payeeValue = value;
        break;
      case 'TransactionRef':
        info.transactionRef = value;
        break;
    }
  }

  return info.method ? info : null;
}
