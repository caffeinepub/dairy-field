import { useGetAllOrders, useIsAdmin } from './useQueries';
import { countNewOrders, setLastSeenOrders } from '@/utils/adminLastSeenOrders';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useAdminOrdersPolling() {
  const { data: isAdmin } = useIsAdmin();
  const queryClient = useQueryClient();
  
  const { data: orders, isLoading, refetch } = useGetAllOrders();

  // Force refetch when component mounts to ensure fresh data
  useEffect(() => {
    if (isAdmin && orders) {
      refetch();
    }
  }, [isAdmin]);

  // Calculate new order count
  const newOrderCount = orders ? countNewOrders(orders) : 0;

  // Mark all orders as seen without page reload
  const markAsSeen = () => {
    if (orders && orders.length > 0) {
      const latestOrder = orders.reduce((latest, order) => 
        order.timestamp > latest.timestamp ? order : latest
      );
      setLastSeenOrders(Number(latestOrder.timestamp) / 1000000, latestOrder.id.toString());
      
      // Invalidate queries to trigger re-render with updated count
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  };

  return {
    orders: orders || [],
    newOrderCount,
    isLoading,
    refetch,
    markAsSeen,
  };
}
