import { router } from './trpc';
import { healthRouter } from './routers/health';
import { meRouter } from './routers/me';
import { restaurantsRouter } from './routers/restaurants';
import { menuRouter } from './routers/menu';
import { cartRouter } from './routers/cart';
import { ordersRouter } from './routers/orders';
import { merchantOrdersRouter } from './routers/merchant-orders';
import { merchantRouter } from './routers/merchant';
import { paymentsRouter } from './routers/payments';
import { couriersRouter } from './routers/couriers';
import { reviewsRouter } from './routers/reviews';
import { promosRouter } from './routers/promos';
import { loyaltyRouter } from './routers/loyalty';
import { adminRouter } from './routers/admin';
import { notificationsRouter } from './routers/notifications';

export const appRouter = router({
  health: healthRouter,
  me: meRouter,
  restaurants: restaurantsRouter,
  menu: menuRouter,
  cart: cartRouter,
  orders: ordersRouter,
  merchantOrders: merchantOrdersRouter,
  merchant: merchantRouter,
  payments: paymentsRouter,
  couriers: couriersRouter,
  reviews: reviewsRouter,
  promos: promosRouter,
  loyalty: loyaltyRouter,
  admin: adminRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
