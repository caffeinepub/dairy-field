import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, ShoppingBag, Check } from 'lucide-react';
import { useAdminOrdersPolling } from '@/hooks/useAdminOrdersPolling';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

export default function AdminOrderMessageBanner() {
  const { newOrderCount, isLoading, markAsSeen } = useAdminOrdersPolling();
  const navigate = useNavigate();

  const handleViewOrders = () => {
    navigate({ to: '/admin/orders' });
  };

  const handleMarkAsSeen = () => {
    markAsSeen();
    toast.success('All orders marked as seen');
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
