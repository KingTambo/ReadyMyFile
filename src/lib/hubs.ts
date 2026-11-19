import {
  DESTINATIONS,
  SOURCES,
  type DestinationSchema,
  type SourceSchema,
} from '../data/schemas';
import { convertPath } from './convert-page';

export type HubKind = 'source' | 'destination';

export type HubDefinition = {
  slug: string;
  title: string;
  kind: HubKind;
  intro: string;
  matchSource?: (s: SourceSchema) => boolean;
  matchDestination?: (d: DestinationSchema) => boolean;
};

export const HUBS: HubDefinition[] = [
  {
    slug: 'us-banks',
    title: 'US Banks',
    kind: 'source',
    intro:
      'Convert exports from major US banks into accounting and CRM-ready files. Pick a bank below to open every available destination converter in one click.',
    matchSource: (s) => s.group === 'US Banks & Neobanks' && s.badge === 'US Bank',
  },
  {
    slug: 'us-neobanks',
    title: 'US Neobanks',
    kind: 'source',
    intro:
      'Remap Mercury, Brex, Ramp, and other US neobank exports for bookkeeping tools. Browse every neobank → destination pair from this hub.',
    matchSource: (s) => s.group === 'US Banks & Neobanks' && s.badge === 'US Neobank',
  },
  {
    slug: 'uk-banks',
    title: 'UK Banks',
    kind: 'source',
    intro:
      'Turn UK high-street bank CSV/XLSX exports into clean imports for accounting platforms. Explore all UK bank converters here.',
    matchSource: (s) => s.group === 'UK Banks & Neobanks' && s.badge === 'UK Bank',
  },
  {
    slug: 'uk-neobanks',
    title: 'UK Neobanks',
    kind: 'source',
    intro:
      'Convert Monzo, Starling, Tide, Revolut UK, and Wise Business UK exports without manual column cleanup.',
    matchSource: (s) => s.group === 'UK Banks & Neobanks' && s.badge === 'UK Neobank',
  },
  {
    slug: 'eu-banks',
    title: 'EU Banks',
    kind: 'source',
    intro:
      'Handle EU bank exports with semicolon delimiters and comma decimals. Jump into any EU bank → destination converter from this category.',
    matchSource: (s) =>
      s.group === 'EU Banks & Standard Formats' &&
      (s.badge === 'EU Bank' || s.badge === 'EU Standard'),
  },
  {
    slug: 'eu-neobanks',
    title: 'EU Neobanks',
    kind: 'source',
    intro:
      'Remap N26, Qonto, Bunq, Revolut EU, and Wise Business EU files for EU and global accounting tools.',
    matchSource: (s) => s.group === 'EU Banks & Standard Formats' && s.badge === 'EU Neobank',
  },
  {
    slug: 'payment-processors',
    title: 'Payment Processors & E-Commerce',
    kind: 'source',
    intro:
      'Convert Stripe, PayPal, Square, Shopify, and other payout/settlement exports into bookkeeping and CRM formats.',
    matchSource: (s) => s.group === 'Global Payment Processors & E-Commerce',
  },
  {
    slug: 'ads-and-forms',
    title: 'Ads, Forms & Lead Sources',
    kind: 'source',
    intro:
      'Map ad platform and form lead exports into CRM and marketing automation schemas with consistent field names.',
    matchSource: (s) => s.group === 'Ad Platforms, Forms & Lead Sources',
  },
  {
    slug: 'us-global-accounting',
    title: 'US & Global Accounting',
    kind: 'destination',
    intro:
      'Import-ready files for QuickBooks, Xero, Wave, NetSuite, and more. Browse every source that converts into these accounting tools.',
    matchDestination: (d) => d.group === 'Global & US Accounting / Bookkeeping',
  },
  {
    slug: 'uk-eu-accounting',
    title: 'UK & EU Accounting',
    kind: 'destination',
    intro:
      'Generate EU/UK-friendly formats for Exact Online, FreeAgent, Moneybird, DATEV, and related platforms.',
    matchDestination: (d) => d.group === 'UK & EU Accounting / Tax Software',
  },
  {
    slug: 'crms-and-marketing',
    title: 'CRMs & Marketing Automation',
    kind: 'destination',
    intro:
      'Send cleaned lead and customer data into HubSpot, Salesforce, Mailchimp, and other CRM/marketing tools.',
    matchDestination: (d) => d.group === 'CRMs & Marketing Automation',
  },
  {
    slug: 'bi-and-databases',
    title: 'BI, Databases & Developer Formats',
    kind: 'destination',
    intro:
      'Export remapped files as JSON, JSONL, OFX, QIF, and other formats for BI pipelines and developer workflows.',
    matchDestination: (d) => d.group === 'BI, Databases & Developer Formats',
  },
];

export type HubLink = {
  href: string;
  label: string;
  sourceLabel: string;
  destinationLabel: string;
};

export function getHubBySlug(slug: string) {
  return HUBS.find((h) => h.slug === slug);
}

export function getHubLinks(hub: HubDefinition): HubLink[] {
  if (hub.kind === 'source') {
    const sources = SOURCES.filter((s) => hub.matchSource?.(s));
    return sources.flatMap((source) =>
      DESTINATIONS.map((destination) => ({
        href: convertPath(source.id, destination.id),
        label: `Convert ${source.label} to ${destination.label}`,
        sourceLabel: source.label,
        destinationLabel: destination.label,
      }))
    );
  }

  const destinations = DESTINATIONS.filter((d) => hub.matchDestination?.(d));
  return destinations.flatMap((destination) =>
    SOURCES.map((source) => ({
      href: convertPath(source.id, destination.id),
      label: `Convert ${source.label} to ${destination.label}`,
      sourceLabel: source.label,
      destinationLabel: destination.label,
    }))
  );
}

/** Curated high-intent pairs for homepage discovery */
export const TOP_CONVERTERS: { sourceId: string; destinationId: string }[] = [
  { sourceId: 'chase', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'chase', destinationId: 'xero-csv' },
  { sourceId: 'bank-of-america', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'wells-fargo', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'stripe', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'stripe', destinationId: 'xero-csv' },
  { sourceId: 'paypal', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'paypal', destinationId: 'xero-csv' },
  { sourceId: 'square', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'ing', destinationId: 'exact-online' },
  { sourceId: 'ing', destinationId: 'xero-csv' },
  { sourceId: 'abn-amro', destinationId: 'exact-online' },
  { sourceId: 'deutsche-bank', destinationId: 'datev' },
  { sourceId: 'barclays', destinationId: 'xero-csv' },
  { sourceId: 'hsbc-uk', destinationId: 'xero-csv' },
  { sourceId: 'monzo-business', destinationId: 'xero-csv' },
  { sourceId: 'starling-bank', destinationId: 'freeagent' },
  { sourceId: 'revolut-uk', destinationId: 'xero-csv' },
  { sourceId: 'wise-business-uk', destinationId: 'xero-csv' },
  { sourceId: 'shopify-payouts', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'shopify-payouts', destinationId: 'xero-csv' },
  { sourceId: 'amazon-seller-central', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'adyen', destinationId: 'xero-csv' },
  { sourceId: 'mollie', destinationId: 'exact-online' },
  { sourceId: 'stripe', destinationId: 'netsuite' },
  { sourceId: 'chase', destinationId: 'wave-accounting' },
  { sourceId: 'capital-one', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'amex-business', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'mercury', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'brex', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'ramp', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'n26-business', destinationId: 'lexoffice' },
  { sourceId: 'qonto', destinationId: 'pennylane' },
  { sourceId: 'bunq', destinationId: 'moneybird' },
  { sourceId: 'rabobank', destinationId: 'exact-online' },
  { sourceId: 'bnp-paribas', destinationId: 'pennylane' },
  { sourceId: 'lloyds', destinationId: 'xero-csv' },
  { sourceId: 'natwest', destinationId: 'sage-50-uk' },
  { sourceId: 'tide', destinationId: 'xero-csv' },
  { sourceId: 'citibank', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'us-bank', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'pnc', destinationId: 'quickbooks-online-csv' },
  { sourceId: 'stripe', destinationId: 'freshbooks' },
  { sourceId: 'paypal', destinationId: 'freshbooks' },
  { sourceId: 'typeform', destinationId: 'hubspot-contacts-deals' },
  { sourceId: 'webflow-forms', destinationId: 'hubspot-contacts-deals' },
  { sourceId: 'google-ads', destinationId: 'airtable-csv' },
  { sourceId: 'meta-ads', destinationId: 'airtable-csv' },
  { sourceId: 'sepa-camt053-mt940', destinationId: 'exact-online' },
  { sourceId: 'commerzbank', destinationId: 'datev' },
];
