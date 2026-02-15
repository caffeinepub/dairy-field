# Specification

## Summary
**Goal:** Replace the broken UPI-ID payment option with a Google Pay-only payment flow to phone number 9494237076, making checkout simpler and preventing UPI-link errors.

**Planned changes:**
- Update `frontend/src/config/payment.ts` to remove all UPI-ID payees and keep only one payee for Google Pay by phone number `9494237076`, set as the default.
- Simplify `frontend/src/pages/CheckoutPage.tsx` payment UI to remove the payee selector and instead prominently display the Google Pay number with actions to copy the number and copy the exact total amount, including visible confirmation.
- Ensure the primary payment CTA no longer builds a UPI deep link/config that triggers phone-number UPI link errors.
- Keep structured payment details for the Google Pay phone option in order records (including optional transaction reference) and display them consistently on `OrderConfirmationPage` and `OrderDetailsPage`.

**User-visible outcome:** Customers see a Google Pay-only payment section on checkout with the Google Pay number (9494237076) and one-tap copy buttons for both the number and the amount, and orders continue to show Google Pay payment details on confirmation and order details screens.
