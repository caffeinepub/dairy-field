import { useGetAllOrders, useIsAdmin } from './useQueries';
import { countNewOrders } from '@/utils/adminLastSeenOrders';
import { useEffect } from 'react';

export function useAdminOrdersPolling() {
  const { data: isAdmin } = useIsAdmin();
  
  const { data: orders, isLoading, refetch } = useGetAllOrders();

  // Force refetch when component mounts to ensure fresh data
  useEffect(() => {
    if (isAdmin && orders) {
      refetch();
    }
  }, [isAdmin]);

  // Calculate new order count
  const newOrderCount = orders ? countNewOrders(orders) : 0;

  return {
    orders: orders || [],
    newOrderCount,
    isLoading,
    refetch,
  };
}
