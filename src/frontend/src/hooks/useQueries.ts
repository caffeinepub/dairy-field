import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, Order, CartItem } from '../backend';

export function useProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      customerName: string;
      phoneNumber: string;
      address: string;
      notes: string | null;
      items: CartItem[];
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      const orderId = await actor.createOrder(
        orderData.customerName,
        orderData.phoneNumber,
        orderData.address,
        orderData.notes,
        orderData.items
      );
      
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useGetOrder(orderId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Order>({
    queryKey: ['order', orderId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && orderId > 0n,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateProductPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productName, newPrice }: { productName: string; newPrice: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateProductPrice(productName, newPrice);
    },
    onSuccess: async () => {
      // Force an immediate refetch from the backend
      await queryClient.refetchQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductPrices() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (priceUpdates: Array<[string, bigint]>) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateProductPrices(priceUpdates);
    },
    onSuccess: async () => {
      // Force an immediate refetch from the backend
      await queryClient.refetchQueries({ queryKey: ['products'] });
    },
  });
}
