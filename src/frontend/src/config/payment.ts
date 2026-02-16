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

// Configure your payment details here - Google Pay with phone number
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
  payeeName: 'Ali Waris Khan',
  phoneNumber: '9494237076',
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
