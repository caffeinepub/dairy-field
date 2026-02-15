import type { Order } from '@/backend';

/**
 * Generates a formatted pickup note for Rapido delivery
 * Contains order ID, customer phone, address, and item list
 */
export function generateRapidoPickupNote(order: Order): string {
  const items = order.items
    .map((item) => `${item.productName} x ${Number(item.quantity)}`)
    .join(', ');

  return `DAIRY FIELD Order Pickup
Order ID: #${Number(order.id)}
Customer Phone: ${order.phoneNumber}
Delivery Address: ${order.address}
Items: ${items}`;
}
