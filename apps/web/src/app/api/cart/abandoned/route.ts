import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@foxeats/auth';
import { db } from '@foxeats/db/client';
import { users } from '@foxeats/db/schema';
import { eq } from 'drizzle-orm';
import { inngest } from '@/lib/inngest';
import { z } from 'zod';

const schema = z.object({
  restaurantId: z.string().uuid(),
  restaurantSlug: z.string().min(1),
  restaurantName: z.string().min(1),
  subtotalCents: z.number().int().nonnegative(),
  itemsCount: z.number().int().positive(),
});

/**
 * Appelé par le client (cart Zustand) après timeout d'inactivité.
 * Émet l'event Inngest cart/abandoned qui déclenche la séquence relance.
 * Si user pas connecté → 401 silencieux (pas de relance possible sans email).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id;
    if (!userId)
      return NextResponse.json({ ok: false, reason: 'unauthenticated' }, { status: 200 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user?.email) return NextResponse.json({ ok: false, reason: 'no_email' }, { status: 200 });

    // Respect prefs : on n'envoie pas si l'utilisateur a opt-out marketing emails
    if (user.marketingConsent === false) {
      return NextResponse.json({ ok: false, reason: 'consent_off' }, { status: 200 });
    }

    await inngest.send({
      name: 'cart/abandoned',
      data: {
        userId,
        email: user.email,
        ...parsed.data,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.warn('[cart.abandoned] failed', err);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}

/** Le user a finalisé entre-temps — annule la séquence en cours */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ ok: false }, { status: 200 });
    await inngest.send({ name: 'cart/recovered', data: { userId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.warn('[cart.recovered] failed', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
