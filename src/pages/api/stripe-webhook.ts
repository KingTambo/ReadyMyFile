import type { APIRoute } from 'astro';
import type Stripe from 'stripe';
import { getStripe } from '../../lib/stripe-server';
import { getSupabaseAdmin } from '../../lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const stripe = getStripe();
    const supabaseAdmin = getSupabaseAdmin();
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return new Response('Webhook not configured', { status: 400 });
    }

    const rawBody = await request.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id || session.client_reference_id;

      if (userId && (session.payment_status === 'paid' || session.status === 'complete')) {
        const { error } = await supabaseAdmin.from('premium_users').upsert(
          {
            user_id: userId,
            email: session.customer_details?.email ?? session.metadata?.email ?? null,
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

        if (error) {
          return new Response(error.message, { status: 500 });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook failed';
    return new Response(message, { status: 400 });
  }
};
