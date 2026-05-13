'use client';

import { useState } from 'react';
import { MessageCircle, Send, CheckCircle2, XCircle, Inbox, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';

type StatusFilter = 'open' | 'pending' | 'resolved' | 'closed' | 'all';

export default function AdminSupportPage() {
  const [status, setStatus] = useState<StatusFilter>('open');
  const [activeId, setActiveId] = useState<string | null>(null);

  const stats = trpc.support.adminStats.useQuery(undefined, { refetchInterval: 30_000 });
  const list = trpc.support.adminList.useQuery({ status, limit: 100 });

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6">
        <p className="text-brand text-[11px] font-bold uppercase tracking-widest">Support</p>
        <h1 className="font-display text-ink mt-1 text-[28px] font-extrabold tracking-tight">
          Conversations clients
        </h1>
        <p className="text-ink-muted mt-1 text-[13px]">
          Répondez aux demandes clients. Statut auto basé sur qui a écrit en dernier.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Ouverts"
          value={stats.data?.open ?? 0}
          tone="brand"
          icon={<Inbox size={16} strokeWidth={2.2} />}
        />
        <StatCard
          label="En attente"
          value={stats.data?.pending ?? 0}
          tone="warning"
          icon={<MessageCircle size={16} strokeWidth={2.2} />}
        />
        <StatCard
          label="Résolus"
          value={stats.data?.resolved ?? 0}
          tone="success"
          icon={<CheckCircle2 size={16} strokeWidth={2.2} />}
        />
        <StatCard
          label="Total visible"
          value={list.data?.length ?? 0}
          tone="ink"
          icon={<MessageCircle size={16} strokeWidth={2.2} />}
        />
      </div>

      {/* Filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(['open', 'pending', 'resolved', 'closed', 'all'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`h-9 rounded-full border px-4 text-[12px] font-semibold capitalize transition ${
              status === s
                ? 'border-ink bg-ink text-ink-inverse'
                : 'border-border bg-bg-elevated text-ink hover:border-brand/30 hover:text-brand'
            }`}
          >
            {s === 'all' ? 'Tout' : s}
          </button>
        ))}
      </div>

      {activeId ? (
        <ThreadDetail
          id={activeId}
          onBack={() => setActiveId(null)}
          onActionDone={() => {
            list.refetch();
            stats.refetch();
          }}
        />
      ) : (
        <ThreadsTable
          rows={list.data ?? []}
          loading={list.isLoading}
          onOpen={(id) => setActiveId(id)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: 'brand' | 'warning' | 'success' | 'ink';
  icon: React.ReactNode;
}) {
  const map = {
    brand: 'bg-brand-soft text-brand',
    warning: 'bg-warning-soft text-warning',
    success: 'bg-success-soft text-success',
    ink: 'bg-bg-subtle text-ink',
  };
  return (
    <div className="border-border bg-bg-elevated shadow-xs rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <p className="text-ink-subtle text-[11px] font-bold uppercase tracking-widest">{label}</p>
        <span className={`grid h-8 w-8 place-items-center rounded-xl ${map[tone]}`}>
          {icon as any}
        </span>
      </div>
      <p className="font-display text-ink mt-2 text-[28px] font-extrabold tracking-tight">
        {value}
      </p>
    </div>
  );
}

type ThreadRow = {
  id: string;
  subject: string;
  status: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  lastMessageAt: Date;
  orderId: string | null;
};

function ThreadsTable({
  rows,
  loading,
  onOpen,
}: {
  rows: ThreadRow[];
  loading: boolean;
  onOpen: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="mt-6 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="border-border bg-bg-elevated mt-6 rounded-3xl border border-dashed p-12 text-center">
        <span className="bg-bg-subtle text-ink-muted mx-auto grid h-12 w-12 place-items-center rounded-2xl">
          <Inbox size={20} strokeWidth={2} />
        </span>
        <p className="font-display text-ink mt-3 text-[14px] font-bold">Aucun thread</p>
        <p className="text-ink-muted mt-1 text-[12px]">Aucune conversation dans ce filtre.</p>
      </div>
    );
  }
  return (
    <div className="border-border bg-bg-elevated mt-6 overflow-hidden rounded-2xl border">
      <table className="w-full text-[13px]">
        <thead className="bg-bg-subtle">
          <tr className="text-ink-subtle text-left text-[10px] font-bold uppercase tracking-widest">
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Sujet</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3 text-right">Dernier msg</th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {rows.map((t) => (
            <tr
              key={t.id}
              onClick={() => onOpen(t.id)}
              className="hover:bg-bg-subtle cursor-pointer transition"
            >
              <td className="px-4 py-3">
                <p className="text-ink font-semibold">{t.userName ?? '—'}</p>
                <p className="text-ink-muted text-[11px]">{t.userEmail}</p>
              </td>
              <td className="text-ink px-4 py-3">
                {t.subject}
                {t.orderId && (
                  <span className="bg-accent-soft text-accent ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                    Commande
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={t.status} />
              </td>
              <td className="text-ink-muted px-4 py-3 text-right text-[12px]">
                {new Date(t.lastMessageAt).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    open: { label: 'Ouvert', cls: 'bg-brand-soft text-brand' },
    pending: { label: 'En attente', cls: 'bg-warning-soft text-warning' },
    resolved: { label: 'Résolu', cls: 'bg-success-soft text-success' },
    closed: { label: 'Fermé', cls: 'bg-bg-subtle text-ink-muted' },
  };
  const s = map[status] ?? map.open!;
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function ThreadDetail({
  id,
  onBack,
  onActionDone,
}: {
  id: string;
  onBack: () => void;
  onActionDone: () => void;
}) {
  const [body, setBody] = useState('');
  const utils = trpc.useUtils();
  const q = trpc.support.thread.useQuery({ id }, { refetchInterval: 15_000 });
  const reply = trpc.support.reply.useMutation({
    onSuccess: () => {
      setBody('');
      utils.support.thread.invalidate({ id });
    },
  });
  const setStatus = trpc.support.setStatus.useMutation({
    onSuccess: () => {
      utils.support.thread.invalidate({ id });
      onActionDone();
    },
  });

  if (!q.data) return <div className="skeleton mt-6 h-96 rounded-3xl" />;
  const { thread, messages } = q.data;

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="border-border bg-bg-elevated shadow-xs overflow-hidden rounded-3xl border">
        <header className="border-border bg-bg-subtle flex items-center justify-between border-b px-5 py-4">
          <button
            type="button"
            onClick={onBack}
            className="text-ink-muted hover:text-ink flex items-center gap-2 text-[13px] font-semibold"
          >
            <ArrowLeft size={14} strokeWidth={2.4} />
            Retour
          </button>
          <StatusBadge status={thread.status} />
        </header>
        <div className="bg-bg-subtle/40 space-y-2 p-5">
          <h2 className="font-display text-ink text-[20px] font-bold tracking-tight">
            {thread.subject}
          </h2>
          <div className="space-y-2">
            {messages.map((m) => {
              const isAgent = m.senderType === 'agent';
              return (
                <div key={m.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                      isAgent
                        ? 'bg-accent text-white'
                        : m.senderType === 'system'
                          ? 'border-border bg-bg-subtle text-ink-muted border border-dashed'
                          : 'border-border bg-bg-elevated text-ink border'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p
                      className={`mt-1 text-[10px] ${isAgent ? 'text-white/75' : 'text-ink-subtle'}`}
                    >
                      {new Date(m.createdAt).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!body.trim()) return;
            reply.mutate({ threadId: id, body });
          }}
          className="border-border bg-bg-elevated flex gap-2 border-t p-3"
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Votre réponse…"
            rows={2}
            maxLength={4000}
            className="border-border bg-bg text-ink focus:border-brand focus:ring-brand/15 flex-1 resize-none rounded-xl border px-3 py-2 text-[14px] outline-none focus:ring-4"
          />
          <button
            type="submit"
            disabled={reply.isPending || !body.trim()}
            aria-label="Envoyer"
            className="bg-brand hover:bg-brand-hover grid h-11 w-11 shrink-0 place-items-center self-end rounded-xl text-white disabled:opacity-50"
          >
            <Send size={16} strokeWidth={2.6} />
          </button>
        </form>
      </div>

      {/* Sidebar actions */}
      <aside className="space-y-3">
        <div className="border-border bg-bg-elevated shadow-xs rounded-2xl border p-4">
          <p className="text-ink-subtle text-[11px] font-bold uppercase tracking-widest">Actions</p>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => setStatus.mutate({ id, status: 'resolved' })}
              disabled={setStatus.isPending || thread.status === 'resolved'}
              className="bg-success flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              <CheckCircle2 size={14} strokeWidth={2.4} />
              Marquer résolu
            </button>
            <button
              type="button"
              onClick={() => setStatus.mutate({ id, status: 'closed' })}
              disabled={setStatus.isPending || thread.status === 'closed'}
              className="border-border bg-bg-elevated text-ink hover:bg-bg-subtle flex h-10 w-full items-center justify-center gap-2 rounded-xl border text-[13px] font-semibold disabled:opacity-50"
            >
              <XCircle size={14} strokeWidth={2.4} />
              Fermer le thread
            </button>
            <button
              type="button"
              onClick={() => setStatus.mutate({ id, status: 'open' })}
              disabled={setStatus.isPending || thread.status === 'open'}
              className="border-border bg-bg-elevated text-ink hover:bg-bg-subtle flex h-10 w-full items-center justify-center gap-2 rounded-xl border text-[13px] font-semibold disabled:opacity-50"
            >
              Rouvrir
            </button>
          </div>
        </div>
        {thread.orderId && (
          <a
            href={`/admin/disputes?orderId=${thread.orderId}`}
            className="border-border bg-bg-elevated text-ink-muted shadow-xs hover:bg-bg-subtle block rounded-2xl border p-4 text-[12px]"
          >
            <p className="text-ink-subtle text-[11px] font-bold uppercase tracking-widest">
              Commande liée
            </p>
            <p className="text-ink mt-1 font-mono text-[11px]">{thread.orderId.slice(0, 8)}…</p>
            <p className="text-brand mt-2 text-[11px]">Voir le détail →</p>
          </a>
        )}
      </aside>
    </div>
  );
}
