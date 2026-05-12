import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

export type CartLine = {
  lineId: string;
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  photoUrl?: string;
  options: Array<{ id: string; name: string; priceDeltaCents: number }>;
  notes?: string;
};

export type CartState = {
  restaurantId: string | null;
  restaurantSlug: string | null;
  restaurantName: string | null;
  lines: CartLine[];
  scheduledFor: string | null;
  tipCents: number;
  promoCode: string | null;
  customerNotes: string;
};

export type CartActions = {
  reset(): void;
  setRestaurant(input: { id: string; slug: string; name: string }): void;
  addItem(input: Omit<CartLine, 'lineId' | 'quantity'> & { quantity?: number }): {
    cleared: boolean;
  };
  setQuantity(lineId: string, quantity: number): void;
  removeLine(lineId: string): void;
  setScheduledFor(iso: string | null): void;
  setTipCents(cents: number): void;
  setPromoCode(code: string | null): void;
  setCustomerNotes(notes: string): void;
  subtotalCents(): number;
  itemCount(): number;
};

export type CartStore = CartState & CartActions;

const EMPTY: CartState = {
  restaurantId: null,
  restaurantSlug: null,
  restaurantName: null,
  lines: [],
  scheduledFor: null,
  tipCents: 0,
  promoCode: null,
  customerNotes: '',
};

const definition: StateCreator<CartStore> = (set, get) => ({
  ...EMPTY,
  reset: () => set({ ...EMPTY }),
  setRestaurant: ({ id, slug, name }) => {
    const current = get().restaurantId;
    if (current && current !== id) {
      set({ ...EMPTY, restaurantId: id, restaurantSlug: slug, restaurantName: name });
      return;
    }
    set({ restaurantId: id, restaurantSlug: slug, restaurantName: name });
  },
  addItem: (input) => {
    const { restaurantId, lines } = get();
    // If no restaurant set yet, fail loudly so caller pairs setRestaurant + addItem
    if (!restaurantId) {
      console.warn('[cart] addItem called without an active restaurant — set it first.');
      return { cleared: false };
    }
    const quantity = input.quantity ?? 1;
    const optionsKey = input.options
      .map((o) => o.id)
      .sort()
      .join(',');
    const existing = lines.find(
      (l) =>
        l.menuItemId === input.menuItemId &&
        l.options
          .map((o) => o.id)
          .sort()
          .join(',') === optionsKey,
    );
    if (existing) {
      set({
        lines: lines.map((l) =>
          l.lineId === existing.lineId ? { ...l, quantity: l.quantity + quantity } : l,
        ),
      });
      return { cleared: false };
    }
    set({
      lines: [
        ...lines,
        {
          lineId:
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          menuItemId: input.menuItemId,
          name: input.name,
          unitPriceCents: input.unitPriceCents,
          photoUrl: input.photoUrl,
          options: input.options,
          notes: input.notes,
          quantity,
        },
      ],
    });
    return { cleared: false };
  },
  setQuantity: (lineId, quantity) => {
    if (quantity <= 0) {
      set({ lines: get().lines.filter((l) => l.lineId !== lineId) });
      return;
    }
    set({
      lines: get().lines.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
    });
  },
  removeLine: (lineId) => set({ lines: get().lines.filter((l) => l.lineId !== lineId) }),
  setScheduledFor: (iso) => set({ scheduledFor: iso }),
  setTipCents: (cents) => set({ tipCents: Math.max(0, Math.round(cents)) }),
  setPromoCode: (code) => set({ promoCode: code }),
  setCustomerNotes: (notes) => set({ customerNotes: notes.slice(0, 1000) }),
  subtotalCents: () => {
    const lines = get().lines;
    return lines.reduce((sum, l) => {
      const optionsSum = l.options.reduce((acc, o) => acc + o.priceDeltaCents, 0);
      return sum + (l.unitPriceCents + optionsSum) * l.quantity;
    }, 0);
  },
  itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
});

/**
 * Build a cart store with a host-specific storage backend.
 * Pass `storage` = localStorage for web, an AsyncStorage-compatible adapter
 * for React Native. Pass `undefined` to skip persistence (SSR initial render).
 */
export function createCartStore(opts: { name: string; storage: StateStorage | undefined }) {
  if (!opts.storage) {
    return create<CartStore>()(definition);
  }
  return create<CartStore>()(
    persist(definition, {
      name: opts.name,
      storage: createJSONStorage(() => opts.storage as StateStorage),
      version: 1,
      partialize: (state) => ({
        restaurantId: state.restaurantId,
        restaurantSlug: state.restaurantSlug,
        restaurantName: state.restaurantName,
        lines: state.lines,
        scheduledFor: state.scheduledFor,
        tipCents: state.tipCents,
        promoCode: state.promoCode,
        customerNotes: state.customerNotes,
      }),
    }),
  );
}

export type CartStoreHook = ReturnType<typeof createCartStore>;

// --- Pure pricing helpers (shared client/server for parity check) ---

export type QuoteInput = {
  lines: Pick<CartLine, 'unitPriceCents' | 'quantity' | 'options'>[];
  deliveryFeeCents: number;
  promo?:
    | { kind: 'percent'; valuePercent: number }
    | { kind: 'amount'; valueCents: number }
    | { kind: 'free_delivery' }
    | null;
  tipCents?: number;
  foxCoinsAppliedCents?: number;
  serviceFeeRate?: number; // default 0.08 (8%)
  vatRate?: number; // default 0.10 (TVA restauration)
};

export type Quote = {
  subtotalCents: number;
  serviceFeeCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  tipCents: number;
  foxCoinsUsedCents: number;
  vatCents: number;
  totalCents: number;
};

const SERVICE_FEE_RATE_DEFAULT = 0.08;
const VAT_RATE_DEFAULT = 0.1;

export function quote(input: QuoteInput): Quote {
  const serviceRate = input.serviceFeeRate ?? SERVICE_FEE_RATE_DEFAULT;
  const vatRate = input.vatRate ?? VAT_RATE_DEFAULT;

  const subtotalCents = input.lines.reduce((sum, l) => {
    const optionsSum = l.options.reduce((acc, o) => acc + o.priceDeltaCents, 0);
    return sum + (l.unitPriceCents + optionsSum) * l.quantity;
  }, 0);

  const serviceFeeCents = Math.round(subtotalCents * serviceRate);
  let deliveryFeeCents = input.deliveryFeeCents;
  let discountCents = 0;
  if (input.promo) {
    switch (input.promo.kind) {
      case 'percent':
        discountCents = Math.round((subtotalCents * input.promo.valuePercent) / 100);
        break;
      case 'amount':
        discountCents = Math.min(input.promo.valueCents, subtotalCents);
        break;
      case 'free_delivery':
        deliveryFeeCents = 0;
        break;
    }
  }
  const tipCents = Math.max(0, input.tipCents ?? 0);
  const foxCoinsUsedCents = Math.max(0, Math.min(input.foxCoinsAppliedCents ?? 0, subtotalCents));
  const taxable = Math.max(0, subtotalCents - discountCents - foxCoinsUsedCents);
  const vatCents = Math.round((taxable * vatRate) / (1 + vatRate)); // TTC → on extrait la TVA
  const totalCents = Math.max(
    0,
    subtotalCents -
      discountCents -
      foxCoinsUsedCents +
      serviceFeeCents +
      deliveryFeeCents +
      tipCents,
  );
  return {
    subtotalCents,
    serviceFeeCents,
    deliveryFeeCents,
    discountCents,
    tipCents,
    foxCoinsUsedCents,
    vatCents,
    totalCents,
  };
}
