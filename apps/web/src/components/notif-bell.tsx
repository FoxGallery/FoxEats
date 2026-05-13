'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Receipt,
  ChefHat,
  Truck,
  PartyPopper,
  XCircle,
  TicketPercent,
  Star,
  Info,
  Package,
  Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const KIND_ICON: Record<string, LucideIcon> = {
  order_placed: Receipt,
  order_accepted: Check,
  order_preparing: ChefHat,
  order_ready: Package,
  order_in_delivery: Truck,
  order_delivered: PartyPopper,
  order_cancelled: XCircle,
  order_refunded: TicketPercent,
  promo_available: TicketPercent,
  review_request: Star,
  system: Info,
};

export function NotifBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const count = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const list = trpc.notifications.list.useQuery(
    { limit: 12, unreadOnly: false },
    { enabled: open },
  );
  const markAllRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });
  const markOne = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const unread = count.data ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread > 0 ? ` (${unread} non-lues)` : ''}`}
        className="border-border bg-bg-elevated text-ink hover:bg-bg-subtle relative grid h-9 w-9 place-items-center rounded-full border"
      >
        <Bell size={16} strokeWidth={2.2} />
        {unread > 0 && (
          <span className="bg-brand ring-bg absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full px-1 text-[9px] font-bold text-white ring-2">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="border-border bg-bg-elevated absolute right-0 top-11 z-40 w-[340px] overflow-hidden rounded-2xl border shadow-xl">
          <header className="border-border flex items-center justify-between border-b px-4 py-3">
            <p className="font-display text-ink text-[14px] font-bold tracking-tight">
              Notifications
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className="text-brand text-[11px] font-semibold hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </header>

          <div className="max-h-[460px] overflow-y-auto">
            {list.isLoading && (
              <div className="space-y-2 p-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            )}
            {list.data?.length === 0 && (
              <div className="px-4 py-10 text-center">
                <span className="bg-bg-subtle text-ink-muted mx-auto grid h-12 w-12 place-items-center rounded-2xl">
                  <Bell size={20} strokeWidth={2} />
                </span>
                <p className="text-ink mt-3 text-[13px] font-semibold">Aucune notification</p>
                <p className="text-ink-muted mt-1 text-[12px]">
                  Vous serez notifié des nouveautés ici.
                </p>
              </div>
            )}
            <ul>
              {list.data?.map((n) => {
                const Icon = KIND_ICON[n.kind] ?? Info;
                const isUnread = !n.readAt;
                const body = (
                  <div
                    className={`border-border hover:bg-bg-subtle flex gap-3 border-b px-4 py-3 transition ${
                      isUnread ? 'bg-brand-soft/30' : ''
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                        isUnread ? 'bg-brand text-white' : 'bg-bg-subtle text-ink-muted'
                      }`}
                    >
                      <Icon size={16} strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-ink text-[13px] font-bold leading-tight">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-ink-muted mt-0.5 line-clamp-2 text-[12px] leading-snug">
                          {n.body}
                        </p>
                      )}
                      <p className="text-ink-subtle mt-1 text-[10px]">
                        {timeAgo(new Date(n.createdAt))}
                      </p>
                    </div>
                    {isUnread && (
                      <span className="bg-brand mt-1.5 h-2 w-2 shrink-0 rounded-full" aria-hidden />
                    )}
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link
                        href={n.href}
                        onClick={() => {
                          if (isUnread) markOne.mutate({ id: n.id });
                          setOpen(false);
                        }}
                      >
                        {body}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => isUnread && markOne.mutate({ id: n.id })}
                        className="w-full text-left"
                      >
                        {body}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <footer className="border-border bg-bg-subtle/50 border-t px-4 py-2 text-center">
            <Link
              href="/app/profile"
              onClick={() => setOpen(false)}
              className="text-ink-muted hover:text-ink text-[11px] font-semibold"
            >
              Gérer les préférences
            </Link>
          </footer>
        </div>
      )}
    </div>
  );
}

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86_400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 7 * 86_400) return `il y a ${Math.floor(s / 86_400)} j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
