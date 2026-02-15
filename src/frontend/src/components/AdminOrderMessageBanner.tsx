import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, ShoppingBag, Check } from 'lucide-react';
import { useAdminOrdersPolling } from '@/hooks/useAdminOrdersPolling';
import { setLastSeenOrders } from '@/utils/adminLastSeenOrders';
import { toast } from 'sonner';

export default function AdminOrderMessageBanner() {
  const { orders, newOrderCount, isLoading } = useAdminOrdersPolling();

  const handleViewOrders = () => {
    window.location.href = '/admin/orders';
  };

  const handleMarkAsSeen = () => {
    if (orders.length > 0) {
      const latestOrder = orders.reduce((latest, order) => 
        order.timestamp > latest.timestamp ? order : latest
      );
      setLastSeenOrders(Number(latestOrder.timestamp) / 1000000, latestOrder.id.toString());
      toast.success('All orders marked as seen');
      // Force a small delay to allow state to update
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  // Don't show banner while loading or if no new orders
  if (isLoading || newOrderCount === 0) {
    return null;
  }

  return (
    <Alert className="mb-4 border-primary/50 bg-primary/5">
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="text-sm">
          <strong>New {newOrderCount === 1 ? 'Order' : 'Orders'}:</strong> You have {newOrderCount} new {newOrderCount === 1 ? 'order' : 'orders'} to review.
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAsSeen}
          >
            <Check className="h-4 w-4 mr-1" />
            Mark as Seen
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleViewOrders}
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            View Orders
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
