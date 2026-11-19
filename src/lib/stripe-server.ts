import Stripe from 'stripe';

const secret = import.meta.env.STRIPE_SECRET_KEY;

if (!secret) {
  throw new Error('Missing STRIPE_SECRET_KEY in .env');
}

export const stripe = new Stripe(secret);

export const STRIPE_PRICE_ID = import.meta.env.STRIPE_PRICE_ID as string;
