# Specification

## Summary
**Goal:** Improve the post-checkout experience by automatically showing the new order’s details, adding an online payment selection flow, and providing an optional Rapido pickup deep link with a copyable order summary.

**Planned changes:**
- Update the successful checkout flow to navigate directly to the newly created order’s full details screen (no manual lookup/click-through required).
- Add a required payment method selection in checkout (at minimum: Cash on Delivery, Online Payment).
- For Online Payment, add a “Pay Now” deep link action and an optional input for payment reference/transaction ID.
- Append the selected payment method and optional reference into the existing order notes sent to the createOrder API (no backend changes).
- Add a post-order “Book Rapido Pickup” option that opens Rapido (https://rapido.bike/) and provides a copy-to-clipboard pickup note including order ID, customer phone, delivery address, and item list/quantities.
- Add clear error handling if order details fail to load after checkout, including a call-to-action to contact the business by phone and the order ID if available.
- Handle missing online payment configuration gracefully by informing the user and still allowing order placement with an appropriate note.

**User-visible outcome:** After placing an order, users are taken straight to that order’s details; during checkout they can choose Cash on Delivery or Online Payment (with a pay deep link and optional transaction reference); and after booking they can optionally open Rapido and copy a formatted pickup message with key order info.
