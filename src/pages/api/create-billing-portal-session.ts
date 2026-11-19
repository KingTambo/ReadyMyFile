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

    const { data: premium, error: premiumError } = await supabaseAdmin
      .from('premium_users')
      .select('stripe_customer_id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (premiumError) {
      return json({ error: premiumError.message }, 500);
    }

    if (!premium?.stripe_customer_id) {
      return json({ error: 'No active Stripe subscription found for this account' }, 404);
    }

    const origin = new URL(request.url).origin;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: premium.stripe_customer_id,
      return_url: origin,
    });

    if (!portalSession.url) {
      return json({ error: 'Billing portal session missing URL' }, 500);
    }

    return json({ url: portalSession.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Billing portal failed';
    return json({ error: message }, 500);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
