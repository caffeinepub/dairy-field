import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { usePublicActor } from './usePublicActor';
import type { Product, Order, OrderResponse, CartItem, UserProfile } from '../backend';

/**
 * Public product listing hook - uses public actor to avoid admin initialization failures
 */
export function useProducts() {
  const { actor, isFetching: actorFetching, isError: actorError, error: actorErrorObj } = usePublicActor();

  const query = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('[useProducts] Starting product fetch');
      
      if (!actor) {
        console.error('[useProducts] Actor not available');
        throw new Error('Backend connection not available');
      }

      try {
        console.log('[useProducts] Calling listProducts()');
        const products = await actor.listProducts();
        console.log(`[useProducts] Successfully loaded ${products.length} products`);
        return products;
      } catch (error) {
        console.error('[useProducts] listProducts() execution failed:', error);
        throw error;
      }
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
  
  // Determine if this is an actor initialization error vs a listProducts() error
  const isActorError = actorError || (!actor && !actorFetching && !!query.error);
  
  // Provide detailed error context
  const errorContext = query.error || actorErrorObj;
  
  console.log('[useProducts] State:', {
    isLoading,
    isActorError,
    hasActor: !!actor,
    actorFetching,
    queryError: !!query.error,
    actorErrorObj: !!actorErrorObj,
  });

  return {
    ...query,
    isLoading,
    isActorError,
    error: errorContext,
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

// Public order lookup - no authentication required
// Normalizes backend OrderResponse | null to Order | null
export function useGetOrderById(orderId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ['order', orderId?.toString()],
    queryFn: async () => {
      if (!actor || !orderId || orderId <= 0n) return null;
      
      try {
        const result = await actor.getOrderById(orderId);
        
        // Handle Motoko optional return - normalize to Order | null
        if (!result) return null;
        
        // Backend returns OrderResponse which is compatible with Order
        return result as Order;
      } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!orderId && orderId > 0n,
    retry: false,
  });
}

// Restricted order lookup - requires authentication
export function useGetOrder(orderId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order>({
    queryKey: ['order', orderId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !actorFetching && orderId > 0n,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isAdmin } = useIsAdmin();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getAllOrders();
    },
    enabled: !!actor && !actorFetching && isAdmin === true,
    refetchInterval: 10000, // Poll every 10 seconds for more responsive admin updates
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
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
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('[useIsAdmin] Failed to check admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('[useIsCallerAdmin] Failed to check admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.createProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
  });
}

export function useGetProductsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getProductsAdmin();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useUpsertProductsAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (products: Product[]) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.upsertProductsAdmin(products);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
  });
}

export function useUpdateProductPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productName, newPrice }: { productName: string; newPrice: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateProductPrices([[productName, newPrice]]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
  });
}

export function useUpdateProductPrices() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (priceUpdates: [string, bigint][]) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateProductPrices(priceUpdates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
  });
}
