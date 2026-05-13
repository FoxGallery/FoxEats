import { Inngest } from 'inngest';

/** Events que notre app peut émettre (typage strict) */
export type InngestEvents = {
  'cart/abandoned': {
    data: {
      userId: string;
      email: string;
      restaurantId: string;
      restaurantName: string;
      restaurantSlug: string;
      subtotalCents: number;
      itemsCount: number;
    };
  };
  'cart/recovered': {
    data: { userId: string };
  };
};

export const inngest = new Inngest({
  id: 'foxeats',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
