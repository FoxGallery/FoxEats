import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@foxeats/api';
import Constants from 'expo-constants';

export const trpc = createTRPCReact<AppRouter>();

export const useTrpc = () => trpc;

export function trpcClientConfig(baseUrl?: string) {
  const url =
    baseUrl ??
    process.env.EXPO_PUBLIC_API_URL ??
    Constants.expoConfig?.extra?.apiUrl ??
    'https://foxeats.vercel.app/api/trpc';
  return {
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpBatchLink({
        url,
        transformer: superjson,
        async fetch(input, init) {
          return fetch(input, { ...init, credentials: 'include' });
        },
      }),
    ],
  };
}
