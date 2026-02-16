import { useInternetIdentity } from './useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';

/**
 * Public actor hook for read-only operations that don't require admin initialization.
 * This hook creates an actor suitable for public calls like listProducts() without
 * attempting admin access-control initialization, making it resilient to admin token failures.
 */
export function usePublicActor() {
  const { identity } = useInternetIdentity();

  const actorQuery = useQuery<backendInterface>({
    queryKey: ['publicActor', identity?.getPrincipal().toString()],
    queryFn: async () => {
      console.log('[usePublicActor] Creating public actor', {
        isAuthenticated: !!identity,
      });

      const actorOptions = identity
        ? {
            agentOptions: {
              identity,
            },
          }
        : undefined;

      try {
        const actor = await createActorWithConfig(actorOptions);
        console.log('[usePublicActor] Public actor created successfully');
        return actor;
      } catch (error) {
        console.error('[usePublicActor] Failed to create actor', error);
        throw error;
      }
    },
    staleTime: Infinity,
    enabled: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    isError: actorQuery.isError,
    error: actorQuery.error,
  };
}
