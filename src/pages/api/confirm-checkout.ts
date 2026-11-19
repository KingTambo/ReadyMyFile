import type { APIRoute } from 'astro';
import { getStripe } from '../../lib/stripe-server';
import { getSupabaseAdmin } from '../../lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const stripe = getStripe();
    const supabaseAdmin = getSupabaseAdmin();

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return json({ error: 'Not authenticated' }, 401);
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return json({ error: 'Invalid session' }, 401);
    }

    const body = (await request.json()) as { sessionId?: string };
    if (!body.sessionId) {
      return json({ error: 'Missing sessionId' }, 400);
    }

    const session = await stripe.checkout.sessions.retrieve(body.sessionId);

    const paid =
      session.payment_status === 'paid' || session.status === 'complete';

    if (!paid) {
      return json({ error: 'Payment not completed' }, 400);
    }

    const paidUserId =
      session.metadata?.user_id || session.client_reference_id || null;

    if (!paidUserId || paidUserId !== user.id) {
      return json({ error: 'Checkout does not belong to this user' }, 403);
    }

    const { error: upsertError } = await supabaseAdmin.from('premium_users').upsert(
      {
        user_id: user.id,
        email: user.email ?? session.customer_details?.email ?? null,
        stripe_customer_id:
          typeof session.customer === 'string' ? session.customer : null,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.subscription === 'string'
            ? session.subscription
            : typeof session.payment_intent === 'string'
              ? session.payment_intent
              : null,
        status: 'active',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (upsertError) {
      return json({ error: upsertError.message }, 500);
    }

    return json({ premium: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Confirm failed';
    return json({ error: message }, 500);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
