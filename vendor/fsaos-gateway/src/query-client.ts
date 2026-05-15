/**
 * @fsaos/gateway — Query Client
 *
 * Creates and exports the shared TanStack QueryClient instance used by all
 * VFS hooks. The default options are tuned for VFS data:
 *
 *   - staleTime: 2 minutes (VFS data doesn't change that often)
 *   - gcTime: 10 minutes (keep unused data around for a while)
 *   - refetchOnWindowFocus: false (we use Supabase Realtime instead)
 *   - retry: 1 (one retry on failure)
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,     // 2 minutes
      gcTime: 1000 * 60 * 10,       // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
