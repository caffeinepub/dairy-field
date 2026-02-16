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
  paymentFlow?: string; // 'qr' or 'deeplink'
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
 * Builds a UPI payment URI for QR code generation
 * @param payee - The payee option (phone or UPI)
 * @param amount - Payment amount in rupees
 * @param payeeName - Name of the payee
 * @returns UPI URI string or error result
 */
export function buildUpiPaymentUri(
  payee: PayeeOption,
  amount: number,
  payeeName: string
): { uri?: string; error?: string } {
  // Validate payee
  const validation = validatePayee(payee);
  if (!validation.valid) {
    return { error: validation.error || 'Invalid payee configuration. Please contact support.' };
  }

  let upiAddress: string;

  if (payee.type === 'upi') {
    // Use UPI ID directly
    upiAddress = payee.value;
  } else if (payee.type === 'phone') {
    // Phone number - append @paytm for Google Pay compatibility
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(payee.value)) {
      return { error: 'Invalid phone number format. Please contact support.' };
    }
    upiAddress = `${payee.value}@paytm`;
  } else {
    return { error: 'Unsupported payee type. Please contact support.' };
  }

  // Build UPI payment URI
  // Format: upi://pay?pa=<upi_address>&pn=<name>&am=<amount>&cu=INR&tn=<note>
  const params = new URLSearchParams({
    pa: upiAddress,
    pn: payeeName,
    am: amount.toString(),
    cu: 'INR',
    tn: 'DAIRY FIELD Order',
  });

  return { uri: `upi://pay?${params.toString()}` };
}

/**
 * Formats payment information as structured data to be appended to order notes
 * @param paymentMethod - Selected payment method (only 'online' is supported now)
 * @param payeeId - Selected payee ID (for online payment)
 * @param transactionRef - Optional transaction reference/ID
 * @param paymentFlow - Payment flow type ('qr' or 'deeplink')
 * @returns Formatted payment note text with structured data
 */
export function formatPaymentInfoForNotes(
  paymentMethod: 'online',
  payeeId?: string,
  transactionRef?: string,
  paymentFlow: 'qr' | 'deeplink' = 'qr'
): string {
  // Default to the configured default payee if none provided
  const effectivePayeeId = payeeId || PAYMENT_CONFIG.defaultPayeeId || PAYMENT_CONFIG.payees[0]?.id;
  const selectedPayee = PAYMENT_CONFIG.payees.find(p => p.id === effectivePayeeId);

  let structuredInfo = `[PAYMENT_INFO]
Method: Google Pay
PaymentFlow: ${paymentFlow}`;

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
      case 'PaymentFlow':
        info.paymentFlow = value;
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

/**
 * Extracts user notes by removing the payment info block
 * @param notes - Full order notes including payment info
 * @returns User notes without payment info block
 */
export function extractUserNotes(notes?: string): string {
  if (!notes) return '';
  
  // Remove the payment info block and return the rest
  const cleaned = notes.replace(/\[PAYMENT_INFO\][\s\S]*?\[\/PAYMENT_INFO\]/g, '').trim();
  return cleaned;
}
