import Stripe from 'stripe';

export function getStripe() {
  const secret = import.meta.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error('Missing STRIPE_SECRET_KEY in environment variables');
  }
  return new Stripe(secret);
}

export function getStripePriceId() {
  const priceId = import.meta.env.STRIPE_PRICE_ID as string | undefined;
  if (!priceId) {
    throw new Error('Missing STRIPE_PRICE_ID in environment variables');
  }
  return priceId;
}
