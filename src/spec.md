# Specification

## Summary
**Goal:** Add an Order Details page to look up and view a specific order by Order ID using the existing `getOrder(orderId)` API.

**Planned changes:**
- Create a new Order Details page with an Order ID (numeric) input, inline validation, and a submit action to fetch order data via the existing React Query hook pattern (`useGetOrder`).
- Display fetched order information: Order ID, customer name, phone number, delivery address, optional notes, items with quantities, total amount, and a formatted timestamp.
- Add routing and navigation for the Order Details page, including an optional Order ID in the URL for direct linking (e.g., visiting a URL with `/.../123` loads Order ID 123).
- Add a link/button on the Order Confirmation page to open the Order Details page for the confirmed order.
- Show loading and user-friendly English error states (including contact phone number `9000009707`) without impacting existing routes.

**User-visible outcome:** Users can open an Order Details page, enter (or deep-link with) an Order ID to view the full order details, with validation, loading feedback, and clear error messaging.
