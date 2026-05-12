'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function MerchantMenuPage() {
  const restaurants = trpc.merchant.myRestaurants.useQuery();
  const active = restaurants.data?.[0];
  const utils = trpc.useUtils();

  const menu = trpc.merchant.menu.list.useQuery(
    { restaurantId: active?.id ?? '' },
    { enabled: !!active?.id },
  );
  const createCat = trpc.merchant.menu.createCategory.useMutation({
    onSuccess: () => utils.merchant.menu.list.invalidate(),
  });
  const updateItem = trpc.merchant.menu.updateItem.useMutation({
    onSuccess: () => utils.merchant.menu.list.invalidate(),
  });
  const createItem = trpc.merchant.menu.createItem.useMutation({
    onSuccess: () => utils.merchant.menu.list.invalidate(),
  });
  const deleteItem = trpc.merchant.menu.deleteItem.useMutation({
    onSuccess: () => utils.merchant.menu.list.invalidate(),
  });

  const [newCategory, setNewCategory] = useState('');
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', priceCents: 0, description: '' });

  if (!active) return <p className="text-ink-muted p-8">Chargement…</p>;

  return (
    <div className="px-6 py-8 lg:px-10">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-ink text-3xl font-bold tracking-tight">Menu</h1>
          <p className="text-ink-muted mt-1 text-[14px]">
            {menu.data?.length ?? 0} catégorie{(menu.data?.length ?? 0) > 1 ? 's' : ''} ·{' '}
            {menu.data?.reduce((acc, c) => acc + c.items.length, 0) ?? 0} plats
          </p>
        </div>
      </header>

      <section className="mt-6 flex gap-2">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nouvelle catégorie (ex. Entrées, Pizzas…)"
          className="focus:border-brand focus:ring-brand/15 border-border h-11 flex-1 rounded-xl border px-4 text-[14px] outline-none focus:ring-2"
        />
        <button
          type="button"
          onClick={() => {
            if (!newCategory.trim() || !active.id) return;
            createCat.mutate({ restaurantId: active.id, name: newCategory.trim() });
            setNewCategory('');
          }}
          disabled={!newCategory.trim() || createCat.isPending}
          className="bg-brand h-11 rounded-xl px-5 text-[14px] font-medium text-white shadow-sm disabled:opacity-50"
        >
          + Catégorie
        </button>
      </section>

      <div className="mt-6 space-y-4">
        {menu.data?.map((cat) => (
          <section
            key={cat.id}
            className="border-border bg-bg-elevated shadow-xs rounded-2xl border p-5"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-ink text-xl font-semibold">{cat.name}</h2>
              <button
                type="button"
                onClick={() => setAddingTo((cur) => (cur === cat.id ? null : cat.id))}
                className="text-brand text-[13px] hover:underline"
              >
                + Ajouter un plat
              </button>
            </div>

            {addingTo === cat.id && (
              <div className="bg-bg-subtle mt-3 flex flex-wrap gap-2 rounded-lg p-3">
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Nom du plat"
                  className="border-border h-10 flex-1 rounded-lg border px-3 text-[14px]"
                />
                <input
                  type="number"
                  value={newItem.priceCents / 100 || ''}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      priceCents: Math.round(parseFloat(e.target.value || '0') * 100),
                    })
                  }
                  placeholder="Prix"
                  step="0.10"
                  min="0"
                  className="border-border h-10 w-24 rounded-lg border px-3 text-[14px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newItem.name.trim() || !active.id) return;
                    createItem.mutate({
                      restaurantId: active.id,
                      categoryId: cat.id,
                      name: newItem.name.trim(),
                      description: newItem.description || undefined,
                      priceCents: newItem.priceCents,
                    });
                    setNewItem({ name: '', priceCents: 0, description: '' });
                    setAddingTo(null);
                  }}
                  className="bg-brand h-10 rounded-lg px-4 text-[13px] font-medium text-white"
                >
                  Ajouter
                </button>
              </div>
            )}

            <ul className="divide-border mt-3 divide-y">
              {cat.items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-ink truncate text-[15px] font-medium">{it.name}</p>
                    {it.description && (
                      <p className="text-ink-muted line-clamp-1 text-[12px]">{it.description}</p>
                    )}
                    <p className="text-ink mt-0.5 text-[13px] font-semibold">
                      {(it.priceCents / 100).toFixed(2)} €
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-[12px]">
                    <input
                      type="checkbox"
                      checked={it.isAvailable}
                      onChange={(e) =>
                        updateItem.mutate({ id: it.id, patch: { isAvailable: e.target.checked } })
                      }
                      className="text-brand focus:ring-brand border-border-strong h-4 w-4 rounded"
                    />
                    <span className={it.isAvailable ? 'text-success' : 'text-ink-muted'}>
                      {it.isAvailable ? 'Dispo' : 'Sold out'}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Supprimer "${it.name}" ?`)) deleteItem.mutate({ id: it.id });
                    }}
                    className="text-danger text-[12px] hover:underline"
                  >
                    Supprimer
                  </button>
                </li>
              ))}
              {cat.items.length === 0 && (
                <li className="text-ink-muted py-3 text-center text-[13px]">
                  Aucun plat dans cette catégorie.
                </li>
              )}
            </ul>
          </section>
        ))}
        {menu.data?.length === 0 && (
          <p className="text-ink-muted border-border rounded-xl border border-dashed px-4 py-10 text-center text-[14px]">
            Commencez par créer une catégorie (Entrées, Plats, Desserts…).
          </p>
        )}
      </div>
    </div>
  );
}
