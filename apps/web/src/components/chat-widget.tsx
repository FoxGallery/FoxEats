'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, ArrowLeft, Headphones } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useSession } from '@foxeats/auth/client';

type View = 'list' | 'new' | 'thread';

/**
 * Widget chat support flottant — bouton bottom-right, drawer 380×560 quand ouvert.
 * Affiche : liste threads de l'utilisateur, "nouvelle conversation", détail + reply.
 */
export function ChatWidget() {
  const session = useSession();
  const isAuthed = !!session.data?.user;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('list');
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!isAuthed) return null;

  return (
    <>
      {/* FAB bottom-right */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fermer le support' : 'Ouvrir le support'}
        className="bg-brand ring-brand/15 hover:bg-brand-hover group fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full text-white shadow-xl ring-4 transition hover:scale-105"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {open ? <X size={22} strokeWidth={2.4} /> : <MessageCircle size={22} strokeWidth={2.2} />}
        <UnreadBadge />
      </button>

      {open && (
        <div className="border-border bg-bg-elevated fixed bottom-24 right-6 z-40 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border shadow-2xl">
          <ChatHeader
            view={view}
            onClose={() => setOpen(false)}
            onBack={() => {
              setView('list');
              setActiveId(null);
            }}
          />
          <div className="flex-1 overflow-hidden">
            {view === 'list' && (
              <ThreadsList
                onOpen={(id) => {
                  setActiveId(id);
                  setView('thread');
                }}
                onNew={() => setView('new')}
              />
            )}
            {view === 'new' && (
              <NewThread
                onCreated={(id) => {
                  setActiveId(id);
                  setView('thread');
                }}
              />
            )}
            {view === 'thread' && activeId && <ThreadView id={activeId} />}
          </div>
        </div>
      )}
    </>
  );
}

function UnreadBadge() {
  const q = trpc.support.unreadCount.useQuery(undefined, { refetchInterval: 60_000 });
  const n = q.data ?? 0;
  if (n === 0) return null;
  return (
    <span className="bg-ink text-ink-inverse ring-bg absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[10px] font-bold ring-2">
      {n > 9 ? '9+' : n}
    </span>
  );
}

function ChatHeader({
  view,
  onClose,
  onBack,
}: {
  view: View;
  onClose: () => void;
  onBack: () => void;
}) {
  return (
    <header className="border-border from-brand to-accent flex items-center justify-between gap-3 border-b bg-gradient-to-br via-[#E84838] px-4 py-3 text-white">
      <div className="flex items-center gap-2">
        {view !== 'list' ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Retour"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/15 hover:bg-white/25"
          >
            <ArrowLeft size={14} strokeWidth={2.6} />
          </button>
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15">
            <Headphones size={14} strokeWidth={2.4} />
          </span>
        )}
        <div>
          <p className="font-display text-[14px] font-bold leading-none tracking-tight">
            Support FoxEats
          </p>
          <p className="mt-0.5 text-[10px] text-white/85">
            {view === 'thread'
              ? 'Conversation'
              : view === 'new'
                ? 'Nouveau message'
                : 'Réponse sous 2 h en heures ouvrées'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="grid h-8 w-8 place-items-center rounded-full bg-white/15 hover:bg-white/25"
      >
        <X size={14} strokeWidth={2.6} />
      </button>
    </header>
  );
}

function ThreadsList({ onOpen, onNew }: { onOpen: (id: string) => void; onNew: () => void }) {
  const q = trpc.support.myThreads.useQuery();
  return (
    <div className="flex h-full flex-col">
      <div className="border-border bg-bg-subtle border-b px-4 py-3">
        <button
          type="button"
          onClick={onNew}
          className="bg-brand hover:bg-brand-hover flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-semibold text-white"
        >
          <MessageCircle size={14} strokeWidth={2.4} />
          Nouvelle conversation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {q.isLoading && (
          <div className="space-y-2 p-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        )}
        {q.data?.length === 0 && (
          <div className="px-4 py-10 text-center">
            <p className="font-display text-ink text-[14px] font-bold">Aucune conversation</p>
            <p className="text-ink-muted mt-1 text-[12px]">
              Ouvrez une conversation pour échanger avec notre support.
            </p>
          </div>
        )}
        <ul>
          {q.data?.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onOpen(t.id)}
                className="border-border hover:bg-bg-subtle block w-full border-b px-4 py-3 text-left transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-ink truncate text-[13px] font-bold">
                    {t.subject}
                  </p>
                  <StatusPill status={t.status} />
                </div>
                <p className="text-ink-subtle mt-0.5 text-[11px]">
                  {new Date(t.lastMessageAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    open: { label: 'Ouvert', cls: 'bg-brand-soft text-brand' },
    pending: { label: 'En attente', cls: 'bg-warning-soft text-warning' },
    resolved: { label: 'Résolu', cls: 'bg-success-soft text-success' },
    closed: { label: 'Fermé', cls: 'bg-bg-subtle text-ink-muted' },
  };
  const s = map[status] ?? map.open!;
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function NewThread({ onCreated }: { onCreated: (id: string) => void }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const utils = trpc.useUtils();
  const open = trpc.support.open.useMutation({
    onSuccess: (t) => {
      utils.support.myThreads.invalidate();
      onCreated(t.id);
    },
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (subject.length < 3 || !message) return;
        open.mutate({ subject, message });
      }}
      className="flex h-full flex-col"
    >
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <label className="block">
          <span className="text-ink-subtle mb-1.5 block text-[11px] font-bold uppercase tracking-widest">
            Sujet
          </span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex : Commande non reçue"
            required
            minLength={3}
            maxLength={160}
            className="border-border bg-bg text-ink focus:border-brand focus:ring-brand/15 h-11 w-full rounded-xl border px-3 text-[14px] outline-none focus:ring-4"
          />
        </label>
        <label className="block">
          <span className="text-ink-subtle mb-1.5 block text-[11px] font-bold uppercase tracking-widest">
            Votre message
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            required
            maxLength={4000}
            placeholder="Décrivez votre demande…"
            className="border-border bg-bg text-ink focus:border-brand focus:ring-brand/15 w-full resize-none rounded-xl border p-3 text-[14px] outline-none focus:ring-4"
          />
        </label>
        {open.error && (
          <p className="bg-danger/10 text-danger rounded-lg px-3 py-2 text-[12px]">
            {open.error.message}
          </p>
        )}
      </div>
      <div className="border-border bg-bg-subtle border-t p-3">
        <button
          type="submit"
          disabled={open.isPending || subject.length < 3 || !message}
          className="bg-brand hover:bg-brand-hover flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white shadow-md disabled:opacity-50"
        >
          <Send size={14} strokeWidth={2.6} />
          {open.isPending ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>
    </form>
  );
}

function ThreadView({ id }: { id: string }) {
  const [body, setBody] = useState('');
  const utils = trpc.useUtils();
  const scrollRef = useRef<HTMLDivElement>(null);
  const q = trpc.support.thread.useQuery({ id }, { refetchInterval: 15_000 });
  const reply = trpc.support.reply.useMutation({
    onSuccess: () => {
      setBody('');
      utils.support.thread.invalidate({ id });
      utils.support.unreadCount.invalidate();
    },
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [q.data?.messages.length]);

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="bg-bg-subtle/40 flex-1 space-y-2 overflow-y-auto p-3">
        {q.data?.messages.map((m) => {
          const isCustomer = m.senderType === 'customer';
          return (
            <div key={m.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug ${
                  isCustomer
                    ? 'bg-brand text-white'
                    : 'border-border bg-bg-elevated text-ink border'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p
                  className={`mt-1 text-[10px] ${isCustomer ? 'text-white/75' : 'text-ink-subtle'}`}
                >
                  {new Date(m.createdAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          reply.mutate({ threadId: id, body });
        }}
        className="border-border bg-bg-elevated flex items-center gap-2 border-t p-2"
      >
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Votre message…"
          maxLength={4000}
          className="border-border bg-bg text-ink focus:border-brand focus:ring-brand/15 h-10 flex-1 rounded-xl border px-3 text-[13px] outline-none focus:ring-4"
        />
        <button
          type="submit"
          disabled={reply.isPending || !body.trim()}
          aria-label="Envoyer"
          className="bg-brand hover:bg-brand-hover grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white disabled:opacity-50"
        >
          <Send size={14} strokeWidth={2.6} />
        </button>
      </form>
    </div>
  );
}
