const LAST_SEEN_KEY = 'admin_last_seen_orders';

interface LastSeenData {
  timestamp: number;
  lastOrderId: string;
}

export function getLastSeenOrders(): LastSeenData | null {
  try {
    const stored = localStorage.getItem(LAST_SEEN_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to read last seen orders:', error);
    return null;
  }
}

export function setLastSeenOrders(timestamp: number, lastOrderId: string): void {
  try {
    const data: LastSeenData = { timestamp, lastOrderId };
    localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save last seen orders:', error);
  }
}

export function clearLastSeenOrders(): void {
  try {
    localStorage.removeItem(LAST_SEEN_KEY);
  } catch (error) {
    console.error('Failed to clear last seen orders:', error);
  }
}

export function countNewOrders(orders: Array<{ id: bigint; timestamp: bigint }>): number {
  const lastSeen = getLastSeenOrders();
  if (!lastSeen) return orders.length;

  // Count orders created after the last seen timestamp
  return orders.filter(order => {
    const orderTimestamp = Number(order.timestamp) / 1000000; // Convert nanoseconds to milliseconds
    return orderTimestamp > lastSeen.timestamp;
  }).length;
}
