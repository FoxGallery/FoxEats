import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Session } from '@foxeats/auth';
import type { db } from '@foxeats/db';

export type Context = {
  session: Session | null;
  db: typeof db;
  ip?: string;
  userAgent?: string;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

const enforceRole = (role: 'customer' | 'courier' | 'merchant' | 'admin') =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    const userRole = (ctx.session.user as { role?: string }).role;
    if (userRole !== role && userRole !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    return next({ ctx: { ...ctx, session: ctx.session } });
  });

export const merchantProcedure = t.procedure.use(enforceRole('merchant'));
export const courierProcedure = t.procedure.use(enforceRole('courier'));
export const adminProcedure = t.procedure.use(enforceRole('admin'));
