'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClientConfig } from '@/lib/trpc';

export function TrpcProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
      }),
  );
  const [trpcClient] = useState(() => trpc.createClient(trpcClientConfig()));

  // @tanstack/react-query embarque @types/react v18 transitif alors que web est
  // en React 19 → clash ReactNode purement nominal. Runtime identique, cast.
  const QCP = QueryClientProvider as unknown as React.FC<{
    client: QueryClient;
    children: ReactNode;
  }>;

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QCP client={queryClient}>{children}</QCP>
    </trpc.Provider>
  );
}
