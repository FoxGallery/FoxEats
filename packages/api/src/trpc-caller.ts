import { initTRPC } from '@trpc/server';
import type { Context } from './trpc';

const t = initTRPC.context<Context>().create();
export const createCallerFactory = t.createCallerFactory;
