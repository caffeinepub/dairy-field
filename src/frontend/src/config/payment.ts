// Frontend-only configuration for online payment
// This enables the UI to detect missing configuration and present graceful messages

export interface PayeeOption {
  id: string;
  type: 'phone' | 'upi';
  label: string;
  value: string; // Phone number or UPI ID
}

export interface PaymentConfig {
  payees: PayeeOption[];
  defaultPayeeId?: string;
  payeeName?: string; // Merchant name
  fallbackURL?: string; // Optional fallback URL if UPI not available
}

// Configure your payment details here
export const PAYMENT_CONFIG: PaymentConfig = {
  payees: [
    {
      id: 'gpay-phone',
      type: 'phone',
      label: 'Google Pay',
      value: '9494237076',
    },
  ],
  defaultPayeeId: 'gpay-phone',
  payeeName: 'DAIRY FIELD',
};

export function isPaymentConfigured(): boolean {
  return !!(
    PAYMENT_CONFIG.payees.length > 0 &&
    PAYMENT_CONFIG.payeeName
  );
}

export function getDefaultPayee(): string | undefined {
  if (!PAYMENT_CONFIG.payees.length) return undefined;
  
  if (PAYMENT_CONFIG.defaultPayeeId) {
    const defaultPayee = PAYMENT_CONFIG.payees.find(
      (p) => p.id === PAYMENT_CONFIG.defaultPayeeId
    );
    if (defaultPayee) return defaultPayee.id;
  }
  
  return PAYMENT_CONFIG.payees[0].id;
}
