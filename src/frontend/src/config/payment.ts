// Frontend-only configuration for online payment
// This enables the UI to detect missing configuration and present graceful messages

export interface PaymentConfig {
  payeeVPA?: string; // UPI ID (e.g., merchant@upi)
  payeeName?: string; // Merchant name
  fallbackURL?: string; // Optional fallback URL if UPI not available
}

// Configure your payment details here
export const paymentConfig: PaymentConfig = {
  // Example: payeeVPA: 'dairyfield@upi',
  // Example: payeeName: 'DAIRY FIELD',
  // Example: fallbackURL: 'https://example.com/payment',
};

export function isPaymentConfigured(): boolean {
  return !!(paymentConfig.payeeVPA && paymentConfig.payeeName);
}
