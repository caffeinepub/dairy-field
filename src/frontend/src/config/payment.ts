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
  phoneNumber?: string; // Display phone number (for reference)
  fallbackURL?: string; // Optional fallback URL if UPI not available
}

// Configure your payment details here - Google Pay with UPI ID
export const PAYMENT_CONFIG: PaymentConfig = {
  payees: [
    {
      id: 'gpay-upi',
      type: 'upi',
      label: 'Google Pay',
      value: 'aliwarsi@sbi',
    },
  ],
  defaultPayeeId: 'gpay-upi',
  payeeName: 'ALIWARISKHAN WARSI',
  phoneNumber: '9494237076', // Display phone for reference
};

export function isPaymentConfigured(): boolean {
  return !!(
    PAYMENT_CONFIG.payees.length > 0 &&
    PAYMENT_CONFIG.payeeName
  );
}

export function getDefaultPayee(): string | undefined {
  return PAYMENT_CONFIG.defaultPayeeId || PAYMENT_CONFIG.payees[0]?.id;
}
