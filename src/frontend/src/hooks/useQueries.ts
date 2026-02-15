import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, Order, CartItem, UserProfile } from '../backend';

export function useProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      const products = await actor.listProducts();
      return products;
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Show loading while actor is being created OR while query is loading
  const isLoading = actorFetching || query.isLoading;
  
  return {
    ...query,
    isLoading,
  };
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

export function useCreateGuestOrder() {
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
      
      const orderId = await actor.createGuestOrder(
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

export function useGetCallerUserProfile(enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && enabled,
    retry: false,
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        // Use isCallerAdmin (correct method name from backend interface)
        return await actor.isCallerAdmin();
      } catch (error) {
        // If the call fails (e.g., user not authenticated), return false
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
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
