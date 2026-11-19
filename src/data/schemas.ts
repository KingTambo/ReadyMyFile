/** RemapMyFile — full 65×62 source/destination catalog, samples, and mapping */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SourceGroup =
  | 'US Banks & Neobanks'
  | 'UK Banks & Neobanks'
  | 'EU Banks & Standard Formats'
  | 'Global Payment Processors & E-Commerce'
  | 'Ad Platforms, Forms & Lead Sources';

export type DestGroup =
  | 'Global & US Accounting / Bookkeeping'
  | 'UK & EU Accounting / Tax Software'
  | 'CRMs & Marketing Automation'
  | 'BI, Databases & Developer Formats';

export type SourceCategory = 'banking' | 'payments_ecommerce' | 'ads_leads';

export type CanonicalField =
  | 'date'
  | 'description'
  | 'amount'
  | 'fee'
  | 'net'
  | 'currency'
  | 'reference'
  | 'counterparty'
  | 'category'
  | 'type'
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'company'
  | 'phone'
  | 'lead_source';

export type FieldTransform = 'date' | 'amount' | 'text';
export type NumberFormat = 'dot' | 'comma';
export type DateFormat =
  | 'YYYY-MM-DD'
  | 'MM/DD/YYYY'
  | 'DD/MM/YYYY'
  | 'DD.MM.YYYY'
  | 'YYYYMMDD'
  | 'DD-MM-YYYY';
export type ExportFormat =
  | 'csv'
  | 'json'
  | 'jsonl'
  | 'iif'
  | 'txt'
  | 'ofx'
  | 'qif'
  | 'qbo';
export type Delimiter = ',' | ';' | '\t' | '|';

export interface SchemaOption {
  id: string;
  label: string;
  group: string;
  badge?: string;
  searchAliases?: string[];
}

export interface SourceColumnMap {
  /** Possible header names in the source file (case-insensitive) */
  aliases: string[];
  field: CanonicalField;
  transform?: FieldTransform;
}

export interface DestinationColumn {
  header: string;
  from: CanonicalField | null;
  /** Static value when `from` is null */
  value?: string;
}

export interface SourceSchema {
  id: string;
  label: string;
  group: SourceGroup;
  badge: string;
  category: SourceCategory;
  /** Prefer semicolon for many EU bank exports */
  delimiter?: Delimiter;
  locale?: 'us' | 'uk' | 'eu';
  /** Primary export headers used for sample generation */
  headers: string[];
  columns: SourceColumnMap[];
  searchAliases?: string[];
}

export interface DestinationSchema {
  id: string;
  label: string;
  group: DestGroup;
  badge: string;
  columns: DestinationColumn[];
  exportFormat: ExportFormat;
  delimiter?: Delimiter;
  numberFormat: NumberFormat;
  dateFormat: DateFormat;
  searchAliases?: string[];
  fileExtension?: string;
}

export type CanonicalRow = Partial<Record<CanonicalField, string>>;

/* -------------------------------------------------------------------------- */
/* Group lists                                                                */
/* -------------------------------------------------------------------------- */

export const SOURCE_GROUPS: SourceGroup[] = [
  'US Banks & Neobanks',
  'UK Banks & Neobanks',
  'EU Banks & Standard Formats',
  'Global Payment Processors & E-Commerce',
  'Ad Platforms, Forms & Lead Sources',
];

export const DEST_GROUPS: DestGroup[] = [
  'Global & US Accounting / Bookkeeping',
  'UK & EU Accounting / Tax Software',
  'CRMs & Marketing Automation',
  'BI, Databases & Developer Formats',
];

/* -------------------------------------------------------------------------- */
/* Column templates                                                           */
/* -------------------------------------------------------------------------- */

const US_BANK_COLS: SourceColumnMap[] = [
  { aliases: ['Posting Date', 'Date', 'Transaction Date', 'Posted Date'], field: 'date', transform: 'date' },
  { aliases: ['Description', 'Memo', 'Payee', 'Merchant', 'Merchant Name'], field: 'description' },
  { aliases: ['Amount', 'Credit Amount', 'Debit Amount', 'Transaction Amount'], field: 'amount', transform: 'amount' },
  { aliases: ['Type', 'Transaction Type', 'Status'], field: 'type' },
  { aliases: ['Check or Slip #', 'Check Number', 'Reference', 'Ref', 'Running Bal.', 'Balance'], field: 'reference' },
  { aliases: ['Category'], field: 'category' },
  { aliases: ['Cardholder', 'User'], field: 'counterparty' },
];

const UK_BANK_COLS: SourceColumnMap[] = [
  { aliases: ['Date', 'Transaction Date', 'Created', 'Date started (UTC)', 'Date completed (UTC)'], field: 'date', transform: 'date' },
  { aliases: ['Description', 'Memo', 'Name', 'Narrative', 'Counter Party', 'Counterparty', 'Notes', 'Product'], field: 'description' },
  { aliases: ['Amount', 'Amount (GBP)', 'Paid In', 'Paid Out', 'Payment amount'], field: 'amount', transform: 'amount' },
  { aliases: ['Type', 'Category'], field: 'type' },
  { aliases: ['Reference', 'Balance'], field: 'reference' },
  { aliases: ['Currency', 'Payment currency'], field: 'currency' },
  { aliases: ['Category'], field: 'category' },
];

const EU_BANK_COLS: SourceColumnMap[] = [
  { aliases: ['Datum', 'Date', 'Book Date', 'transactiondate', 'bookingDate', 'Buchungstag', 'Valutadatum', 'Date operation', 'Date comptable', 'Operation date', 'Booking Date'], field: 'date', transform: 'date' },
  { aliases: ['Naam / Omschrijving', 'Description', 'Name', 'description', 'Buchungstext', 'Verwendungszweck', 'Libelle', 'Libellé', 'Label', 'Counterparty name', 'Payee', 'Payment Reference'], field: 'description' },
  { aliases: ['Bedrag (EUR)', 'Amount', 'Bedrag', 'amount', 'Betrag', 'Montant', 'Total amount (incl. VAT)', 'Amount (EUR)'], field: 'amount', transform: 'amount' },
  { aliases: ['Af Bij', 'Transaction type', 'Type', 'Debit/Credit'], field: 'type' },
  { aliases: ['Mededelingen', 'Reference', 'accountNumber', 'Local Reference'], field: 'reference' },
  { aliases: ['Währung', 'Currency', 'Devise'], field: 'currency' },
];

const PAYMENTS_COLS: SourceColumnMap[] = [
  { aliases: ['Created (UTC)', 'Created', 'Date', 'Transaction Date', 'Payout Date', 'Payment Date', 'settlement-start-date', 'deposit-date'], field: 'date', transform: 'date' },
  { aliases: ['Description', 'Customer Description', 'Name', 'Subject', 'Status', 'Item Name', 'Customer Name', 'transaction-type', 'settlement-id'], field: 'description' },
  { aliases: ['Amount', 'Gross', 'Total', 'Net', 'Total Collected', 'Net Total', 'total-amount', 'amount'], field: 'amount', transform: 'amount' },
  { aliases: ['Fee', 'Fees'], field: 'fee', transform: 'amount' },
  { aliases: ['Net', 'Net Amount'], field: 'net', transform: 'amount' },
  { aliases: ['Currency', 'currency'], field: 'currency' },
  { aliases: ['id', 'Id', 'Payment Intent ID', 'Transaction ID', 'Payout ID', 'Payment ID', 'settlement-id', 'Order ID'], field: 'reference' },
  { aliases: ['Customer Email', 'Customer Name', 'Buyer Email', 'Email'], field: 'counterparty' },
  { aliases: ['Type', 'Reporting Category', 'transaction-type'], field: 'type' },
];

const LEADS_COLS: SourceColumnMap[] = [
  { aliases: ['Submitted At', 'Created At', 'Date', 'Event Start Time', 'Timestamp'], field: 'date', transform: 'date' },
  { aliases: ['First Name', 'first_name', 'First name'], field: 'first_name' },
  { aliases: ['Last Name', 'last_name', 'Last name'], field: 'last_name' },
  { aliases: ['Email', 'email', 'Email Address'], field: 'email' },
  { aliases: ['Company', 'company', 'Organization', 'Account Name'], field: 'company' },
  { aliases: ['Phone', 'phone', 'Phone Number'], field: 'phone' },
  { aliases: ['Lead Source', 'Source', 'Form Name', 'Campaign', 'UTM Source'], field: 'lead_source' },
  { aliases: ['Message', 'Notes', 'Description', 'Event Name', 'Campaign Name'], field: 'description' },
  { aliases: ['Amount', 'Deal Amount', 'Spend', 'Cost'], field: 'amount', transform: 'amount' },
];

/* -------------------------------------------------------------------------- */
/* Sample data engine                                                         */
/* -------------------------------------------------------------------------- */

const BANK_TXNS = [
  { desc: 'ACME CORP PAYROLL', amount: 4500, type: 'ACH_CREDIT', cat: 'Income' },
  { desc: 'AWS MONTHLY', amount: -342.18, type: 'ACH_DEBIT', cat: 'Software' },
  { desc: 'OFFICE SUPPLIES', amount: -89.5, type: 'CARD', cat: 'Office' },
  { desc: 'CLIENT INVOICE 1092', amount: 1200, type: 'ACH_CREDIT', cat: 'Income' },
  { desc: 'STRIPE TRANSFER', amount: 876.44, type: 'ACH_CREDIT', cat: 'Income' },
  { desc: 'RENT PAYMENT', amount: -2400, type: 'TRANSFER', cat: 'Rent' },
];

const PAYMENT_TXNS = [
  { desc: 'Subscription update', amount: 49, fee: 1.72, type: 'charge', email: 'ada@example.com' },
  { desc: 'Payment for Invoice', amount: 220, fee: 6.68, type: 'charge', email: 'bob@acme.com' },
  { desc: 'Refund', amount: -49, fee: 0, type: 'refund', email: 'ada@example.com' },
  { desc: 'Checkout', amount: 89, fee: 2.88, type: 'charge', email: 'cara@shop.io' },
  { desc: 'Annual plan', amount: 480, fee: 14.12, type: 'charge', email: 'dan@co.com' },
  { desc: 'Payout', amount: -280.45, fee: 0, type: 'payout', email: '' },
];

const LEAD_ROWS = [
  { first: 'Ada', last: 'Lovelace', email: 'ada@analytical.engine', company: 'Analytical Engines', phone: '+1-415-555-0101', source: 'Website', msg: 'Interested in demo' },
  { first: 'Grace', last: 'Hopper', email: 'grace@cobol.dev', company: 'Navy Systems', phone: '+1-212-555-0142', source: 'Webinar', msg: 'Asked about pricing' },
  { first: 'Alan', last: 'Turing', email: 'alan@bletchley.uk', company: 'Bletchley Labs', phone: '+44-20-7946-0958', source: 'Ads', msg: 'Booked a call' },
  { first: 'Katherine', last: 'Johnson', email: 'kj@nasa.gov', company: 'Spaceflight Co', phone: '+1-757-555-0199', source: 'Referral', msg: 'Needs enterprise plan' },
  { first: 'Tim', last: 'Berners-Lee', email: 'tim@w3.org', company: 'Web Standards Inc', phone: '+44-1865-555-011', source: 'Form', msg: 'API integration question' },
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function sampleDate(i: number, locale: 'us' | 'uk' | 'eu', style: 'slash' | 'dash' | 'dot' | 'iso' | 'compact' = 'iso'): string {
  const day = 5 + i;
  const month = 1;
  const year = 2025;
  if (style === 'iso') return `${year}-${pad2(month)}-${pad2(day)}`;
  if (style === 'compact') return `${year}${pad2(month)}${pad2(day)}`;
  if (style === 'dot') return `${pad2(day)}.${pad2(month)}.${year}`;
  if (locale === 'us') return `${pad2(month)}/${pad2(day)}/${year}`;
  if (style === 'dash') return `${pad2(day)}-${pad2(month)}-${year}`;
  return `${pad2(day)}/${pad2(month)}/${year}`;
}

function formatSampleAmount(n: number, locale: 'us' | 'uk' | 'eu'): string {
  const abs = Math.abs(n);
  const fixed = abs.toFixed(2);
  const sign = n < 0 ? '-' : '';
  if (locale === 'eu') {
    const [int, dec] = fixed.split('.');
    const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${sign}${withDots},${dec}`;
  }
  return `${sign}${fixed}`;
}

function pickHeaderValue(
  headers: string[],
  row: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const h of headers) {
    out[h] = row[h] ?? '';
  }
  return out;
}

function generateBankingSamples(source: SourceSchema): Record<string, string>[] {
  const locale = source.locale ?? 'us';
  const id = source.id;
  const dateStyle =
    id === 'abn-amro' ? 'compact'
    : locale === 'eu' && (id.includes('deutsche') || id.includes('commer') || id === 'datev') ? 'dot'
    : locale === 'eu' ? 'dash'
    : locale === 'uk' ? 'slash'
    : id === 'chase' || id === 'bank-of-america' || id === 'amex-business' ? 'slash'
    : 'iso';

  return BANK_TXNS.map((txn, i) => {
    const amount = formatSampleAmount(txn.amount, locale);
    const date = sampleDate(i, locale, dateStyle as 'slash' | 'dash' | 'dot' | 'iso' | 'compact');
    const afBij = txn.amount < 0 ? 'Af' : 'Bij';

    const candidates: Record<string, string> = {
      'Posting Date': date,
      Date: date,
      'Transaction Date': date,
      'Posted Date': date,
      Datum: date,
      transactiondate: date,
      bookingDate: date,
      Buchungstag: date,
      Valutadatum: date,
      'Date operation': date,
      'Date comptable': date,
      'Operation date': date,
      'Booking Date': date,
      'Date started (UTC)': `${date}T10:00:00Z`,
      'Date completed (UTC)': `${date}T10:05:00Z`,
      Created: date,
      Description: txn.desc,
      Memo: txn.desc,
      Payee: txn.desc,
      Merchant: txn.desc,
      'Merchant Name': txn.desc,
      Narrative: txn.desc,
      Name: txn.desc,
      Notes: txn.desc,
      Product: txn.desc,
      'Counter Party': txn.desc,
      Counterparty: txn.desc,
      'Naam / Omschrijving': txn.desc,
      description: txn.desc,
      Buchungstext: txn.desc,
      Verwendungszweck: txn.desc,
      Libelle: txn.desc,
      'Libellé': txn.desc,
      Label: txn.desc,
      'Counterparty name': txn.desc,
      'Payment Reference': txn.desc,
      Amount: amount,
      'Amount (GBP)': amount,
      'Amount (EUR)': amount,
      'Bedrag (EUR)': amount,
      Bedrag: amount,
      amount: amount,
      Betrag: amount,
      Montant: amount,
      'Total amount (incl. VAT)': amount,
      'Payment amount': amount,
      'Credit Amount': txn.amount > 0 ? amount : '',
      'Debit Amount': txn.amount < 0 ? amount.replace('-', '') : '',
      'Paid In': txn.amount > 0 ? amount : '',
      'Paid Out': txn.amount < 0 ? amount.replace('-', '') : '',
      Type: txn.type,
      'Transaction Type': txn.type,
      Status: 'completed',
      'Transaction type': txn.type,
      Category: txn.cat,
      Reference: `REF-${1000 + i}`,
      Ref: `REF-${1000 + i}`,
      'Check or Slip #': txn.type === 'CHECK' ? String(1040 + i) : '',
      'Check Number': '',
      'Running Bal.': formatSampleAmount(40000 + txn.amount * (i + 1), locale),
      Balance: formatSampleAmount(18000 + txn.amount, locale),
      Mededelingen: `Factuur ${1001 + i}`,
      accountNumber: 'NL91ABNA0417164300',
      'Local Reference': `LR-${i + 1}`,
      'Af Bij': afBij,
      'Debit/Credit': afBij,
      Currency: locale === 'us' ? 'USD' : locale === 'uk' ? 'GBP' : 'EUR',
      'Payment currency': locale === 'uk' ? 'GBP' : 'EUR',
      Währung: 'EUR',
      Devise: 'EUR',
      Cardholder: 'Alex Rivera',
      User: 'Alex Rivera',
      'Bank Description': txn.desc,
      'Extended Details': txn.cat,
    };

    return pickHeaderValue(source.headers, candidates);
  });
}

function generatePaymentsSamples(source: SourceSchema): Record<string, string>[] {
  const locale = source.locale ?? 'us';
  return PAYMENT_TXNS.map((txn, i) => {
    const date = sampleDate(i, locale, 'iso');
    const amount = formatSampleAmount(txn.amount, locale);
    const fee = formatSampleAmount(txn.fee, locale);
    const net = formatSampleAmount(txn.amount - txn.fee, locale);
    const candidates: Record<string, string> = {
      'Created (UTC)': `${date} ${10 + i}:22:01`,
      Created: date,
      Date: date,
      'Transaction Date': date,
      'Payout Date': date,
      'Payment Date': date,
      'settlement-start-date': date,
      'deposit-date': date,
      Description: txn.desc,
      'Customer Description': txn.desc,
      Name: txn.email ? txn.email.split('@')[0] : 'Transfer',
      Subject: txn.desc,
      Status: 'paid',
      'Item Name': txn.desc,
      'Customer Name': txn.email.split('@')[0] || 'Customer',
      'transaction-type': txn.type,
      'settlement-id': `SET-${5000 + i}`,
      Amount: amount,
      Gross: amount,
      Total: amount,
      Net: net,
      'Total Collected': amount,
      'Net Total': net,
      'total-amount': amount,
      amount: amount,
      Fee: fee,
      Fees: fee,
      'Net Amount': net,
      Currency: locale === 'eu' ? 'EUR' : locale === 'uk' ? 'GBP' : 'USD',
      currency: locale === 'eu' ? 'EUR' : 'USD',
      id: `pi_sample_${i + 1}`,
      Id: `txn_${i + 1}`,
      'Payment Intent ID': `pi_sample_${i + 1}`,
      'Transaction ID': `TXN-${1000 + i}`,
      'Payout ID': `po_sample_${i + 1}`,
      'Payment ID': `pay_${i + 1}`,
      'Order ID': `ORD-${8000 + i}`,
      'Customer Email': txn.email,
      'Buyer Email': txn.email,
      Email: txn.email,
      Type: txn.type,
      'Reporting Category': txn.type,
    };
    return pickHeaderValue(source.headers, candidates);
  });
}

function generateLeadsSamples(source: SourceSchema): Record<string, string>[] {
  return LEAD_ROWS.map((lead, i) => {
    const date = sampleDate(i, 'us', 'iso');
    const candidates: Record<string, string> = {
      'Submitted At': `${date}T14:${pad2(10 + i)}:00Z`,
      'Created At': date,
      Date: date,
      'Event Start Time': `${date}T15:00:00Z`,
      Timestamp: date,
      'First Name': lead.first,
      first_name: lead.first,
      'First name': lead.first,
      'Last Name': lead.last,
      last_name: lead.last,
      'Last name': lead.last,
      Email: lead.email,
      email: lead.email,
      'Email Address': lead.email,
      Company: lead.company,
      company: lead.company,
      Organization: lead.company,
      'Account Name': lead.company,
      Phone: lead.phone,
      phone: lead.phone,
      'Phone Number': lead.phone,
      'Lead Source': lead.source,
      Source: lead.source,
      'Form Name': `${source.label} Form`,
      Campaign: `${source.label} Q1`,
      'UTM Source': lead.source.toLowerCase(),
      Message: lead.msg,
      Notes: lead.msg,
      Description: lead.msg,
      'Event Name': 'Intro Call',
      'Campaign Name': `${source.label} Campaign`,
      Amount: i % 2 === 0 ? '1200.00' : '',
      'Deal Amount': i % 2 === 0 ? '1200.00' : '',
      Spend: String((50 + i * 12.5).toFixed(2)),
      Cost: String((50 + i * 12.5).toFixed(2)),
    };
    return pickHeaderValue(source.headers, candidates);
  });
}

/** Category-based realistic sample rows for any source */
export function getSampleRows(source: SourceSchema): Record<string, string>[] {
  if (source.category === 'ads_leads') return generateLeadsSamples(source);
  if (source.category === 'payments_ecommerce') return generatePaymentsSamples(source);
  return generateBankingSamples(source);
}

/* -------------------------------------------------------------------------- */
/* Source factory                                                             */
/* -------------------------------------------------------------------------- */

function src(
  id: string,
  label: string,
  group: SourceGroup,
  badge: string,
  category: SourceCategory,
  headers: string[],
  columns: SourceColumnMap[],
  extras?: Partial<Pick<SourceSchema, 'delimiter' | 'locale' | 'searchAliases'>>
): SourceSchema {
  return {
    id,
    label,
    group,
    badge,
    category,
    headers,
    columns,
    locale: extras?.locale ?? (group.startsWith('EU') ? 'eu' : group.startsWith('UK') ? 'uk' : 'us'),
    delimiter: extras?.delimiter,
    searchAliases: extras?.searchAliases,
  };
}

/* -------------------------------------------------------------------------- */
/* Sources (65)                                                               */
/* -------------------------------------------------------------------------- */

export const SOURCES: SourceSchema[] = [
  // —— US Banks & Neobanks (15) ——
  src('chase', 'Chase', 'US Banks & Neobanks', 'US Bank', 'banking',
    ['Posting Date', 'Description', 'Amount', 'Type', 'Check or Slip #'], US_BANK_COLS, { locale: 'us', searchAliases: ['chase bank', 'jpmorgan'] }),
  src('bank-of-america', 'Bank of America', 'US Banks & Neobanks', 'US Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Running Bal.'], US_BANK_COLS, { locale: 'us', searchAliases: ['boa', 'bofa'] }),
  src('wells-fargo', 'Wells Fargo', 'US Banks & Neobanks', 'US Bank', 'banking',
    ['Date', 'Description', 'Amount'], US_BANK_COLS, { locale: 'us', searchAliases: ['wells'] }),
  src('citibank', 'Citibank', 'US Banks & Neobanks', 'US Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Type'], US_BANK_COLS, { locale: 'us', searchAliases: ['citi'] }),
  src('capital-one', 'Capital One', 'US Banks & Neobanks', 'US Bank', 'banking',
    ['Transaction Date', 'Description', 'Amount', 'Category'], US_BANK_COLS, { locale: 'us', searchAliases: ['capone', 'c1'] }),
  src('amex-business', 'Amex Business', 'US Banks & Neobanks', 'US Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Extended Details'], [
      ...US_BANK_COLS,
      { aliases: ['Extended Details', 'Category'], field: 'category' },
    ], { locale: 'us', searchAliases: ['amex', 'american express'] }),
  src('mercury', 'Mercury', 'US Banks & Neobanks', 'US Neobank', 'banking',
    ['Date', 'Description', 'Amount', 'Status', 'Reference'], US_BANK_COLS, { locale: 'us' }),
  src('brex', 'Brex', 'US Banks & Neobanks', 'US Neobank', 'banking',
    ['Date', 'Merchant', 'Amount', 'Category', 'User'], US_BANK_COLS, { locale: 'us' }),
  src('ramp', 'Ramp', 'US Banks & Neobanks', 'US Neobank', 'banking',
    ['Date', 'Merchant Name', 'Amount', 'Category', 'Cardholder'], US_BANK_COLS, { locale: 'us' }),
  src('relay', 'Relay', 'US Banks & Neobanks', 'US Neobank', 'banking',
    ['Date', 'Description', 'Amount', 'Type', 'Reference'], US_BANK_COLS, { locale: 'us' }),
  src('silicon-valley-bank', 'Silicon Valley Bank', 'US Banks & Neobanks', 'US Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Type'], US_BANK_COLS, { locale: 'us', searchAliases: ['svb'] }),
  src('us-bank', 'US Bank', 'US Banks & Neobanks', 'US Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Balance'], US_BANK_COLS, { locale: 'us' }),
  src('pnc', 'PNC', 'US Banks & Neobanks', 'US Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Type'], US_BANK_COLS, { locale: 'us' }),
  src('truist', 'Truist', 'US Banks & Neobanks', 'US Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Type'], US_BANK_COLS, { locale: 'us' }),
  src('td-bank-us', 'TD Bank US', 'US Banks & Neobanks', 'US Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Type'], US_BANK_COLS, { locale: 'us', searchAliases: ['td bank'] }),

  // —— UK Banks & Neobanks (12) ——
  src('barclays', 'Barclays', 'UK Banks & Neobanks', 'UK Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Balance'], UK_BANK_COLS, { locale: 'uk' }),
  src('hsbc-uk', 'HSBC UK', 'UK Banks & Neobanks', 'UK Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Type'], UK_BANK_COLS, { locale: 'uk', searchAliases: ['hsbc'] }),
  src('lloyds', 'Lloyds', 'UK Banks & Neobanks', 'UK Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Type'], UK_BANK_COLS, { locale: 'uk', searchAliases: ['lloyds bank'] }),
  src('natwest', 'NatWest', 'UK Banks & Neobanks', 'UK Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Type'], UK_BANK_COLS, { locale: 'uk' }),
  src('santander-uk', 'Santander UK', 'UK Banks & Neobanks', 'UK Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Type'], UK_BANK_COLS, { locale: 'uk', searchAliases: ['santander'] }),
  src('monzo-business', 'Monzo Business', 'UK Banks & Neobanks', 'UK Neobank', 'banking',
    ['Date', 'Name', 'Amount', 'Category', 'Currency'], UK_BANK_COLS, { locale: 'uk', searchAliases: ['monzo'] }),
  src('starling-bank', 'Starling Bank', 'UK Banks & Neobanks', 'UK Neobank', 'banking',
    ['Date', 'Counter Party', 'Amount (GBP)', 'Type', 'Reference'], UK_BANK_COLS, { locale: 'uk', searchAliases: ['starling'] }),
  src('tide', 'Tide', 'UK Banks & Neobanks', 'UK Neobank', 'banking',
    ['Date', 'Description', 'Amount', 'Category'], UK_BANK_COLS, { locale: 'uk' }),
  src('revolut-uk', 'Revolut UK', 'UK Banks & Neobanks', 'UK Neobank', 'banking',
    ['Date started (UTC)', 'Description', 'Amount', 'Payment currency', 'Reference'], UK_BANK_COLS, { locale: 'uk', searchAliases: ['revolut'] }),
  src('wise-business-uk', 'Wise Business UK', 'UK Banks & Neobanks', 'UK Neobank', 'banking',
    ['Date', 'Description', 'Amount', 'Currency', 'Reference'], UK_BANK_COLS, { locale: 'uk', searchAliases: ['wise', 'transferwise'] }),
  src('metro-bank', 'Metro Bank', 'UK Banks & Neobanks', 'UK Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Type'], UK_BANK_COLS, { locale: 'uk' }),
  src('virgin-money', 'Virgin Money', 'UK Banks & Neobanks', 'UK Bank', 'banking',
    ['Date', 'Description', 'Amount', 'Type'], UK_BANK_COLS, { locale: 'uk' }),

  // —— EU Banks & Standard Formats (13) ——
  src('ing', 'ING', 'EU Banks & Standard Formats', 'EU Bank', 'banking',
    ['Datum', 'Naam / Omschrijving', 'Bedrag (EUR)', 'Af Bij', 'Mededelingen'], EU_BANK_COLS, { locale: 'eu', delimiter: ';', searchAliases: ['ing bank', 'ing nl'] }),
  src('abn-amro', 'ABN AMRO', 'EU Banks & Standard Formats', 'EU Bank', 'banking',
    ['transactiondate', 'description', 'amount', 'accountNumber'], EU_BANK_COLS, { locale: 'eu', delimiter: ';', searchAliases: ['abn'] }),
  src('rabobank', 'Rabobank', 'EU Banks & Standard Formats', 'EU Bank', 'banking',
    ['Datum', 'Naam / Omschrijving', 'Bedrag', 'Af Bij', 'Mededelingen'], EU_BANK_COLS, { locale: 'eu', delimiter: ';', searchAliases: ['rabo'] }),
  src('deutsche-bank', 'Deutsche Bank', 'EU Banks & Standard Formats', 'EU Bank', 'banking',
    ['Buchungstag', 'Buchungstext', 'Betrag', 'Währung'], EU_BANK_COLS, { locale: 'eu', delimiter: ';', searchAliases: ['db', 'deutsche'] }),
  src('commerzbank', 'Commerzbank', 'EU Banks & Standard Formats', 'EU Bank', 'banking',
    ['Buchungstag', 'Buchungstext', 'Betrag', 'Währung'], EU_BANK_COLS, { locale: 'eu', delimiter: ';' }),
  src('bnp-paribas', 'BNP Paribas', 'EU Banks & Standard Formats', 'EU Bank', 'banking',
    ['Date operation', 'Libelle', 'Montant', 'Devise'], EU_BANK_COLS, { locale: 'eu', delimiter: ';', searchAliases: ['bnp'] }),
  src('societe-generale', 'Société Générale', 'EU Banks & Standard Formats', 'EU Bank', 'banking',
    ['Date operation', 'Libelle', 'Montant', 'Devise'], EU_BANK_COLS, { locale: 'eu', delimiter: ';', searchAliases: ['socgen', 'sg'] }),
  src('n26-business', 'N26 Business', 'EU Banks & Standard Formats', 'EU Neobank', 'banking',
    ['Date', 'Payee', 'Amount (EUR)', 'Transaction type'], EU_BANK_COLS, { locale: 'eu', delimiter: ';', searchAliases: ['n26'] }),
  src('qonto', 'Qonto', 'EU Banks & Standard Formats', 'EU Neobank', 'banking',
    ['Date', 'Label', 'Amount', 'Currency', 'Reference'], EU_BANK_COLS, { locale: 'eu', delimiter: ';' }),
  src('bunq', 'Bunq', 'EU Banks & Standard Formats', 'EU Neobank', 'banking',
    ['Date', 'Description', 'Amount', 'Currency'], EU_BANK_COLS, { locale: 'eu', delimiter: ';' }),
  src('revolut-eu', 'Revolut EU', 'EU Banks & Standard Formats', 'EU Neobank', 'banking',
    ['Date started (UTC)', 'Description', 'Amount', 'Payment currency', 'Reference'], EU_BANK_COLS, { locale: 'eu', delimiter: ';' }),
  src('wise-business-eu', 'Wise Business EU', 'EU Banks & Standard Formats', 'EU Neobank', 'banking',
    ['Date', 'Description', 'Amount', 'Currency', 'Reference'], EU_BANK_COLS, { locale: 'eu', delimiter: ';' }),
  src('sepa-camt053-mt940', 'SEPA CAMT.053 / MT940', 'EU Banks & Standard Formats', 'EU Standard', 'banking',
    ['Date', 'Description', 'Amount', 'Currency', 'Reference', 'Debit/Credit'], EU_BANK_COLS, { locale: 'eu', delimiter: ';', searchAliases: ['sepa', 'camt', 'mt940', 'camt.053'] }),

  // —— Global Payment Processors & E-Commerce (15) ——
  src('stripe', 'Stripe', 'Global Payment Processors & E-Commerce', 'Payments', 'payments_ecommerce',
    ['id', 'Created (UTC)', 'Description', 'Amount', 'Fee', 'Net', 'Currency', 'Customer Email', 'Type'], PAYMENTS_COLS, { searchAliases: ['stripe payouts'] }),
  src('paypal', 'PayPal', 'Global Payment Processors & E-Commerce', 'Payments', 'payments_ecommerce',
    ['Date', 'Name', 'Gross', 'Fee', 'Net', 'Currency', 'Transaction ID', 'Type'], PAYMENTS_COLS),
  src('square', 'Square', 'Global Payment Processors & E-Commerce', 'Payments', 'payments_ecommerce',
    ['Date', 'Description', 'Amount', 'Currency', 'Payment ID'], PAYMENTS_COLS),
  src('adyen', 'Adyen', 'Global Payment Processors & E-Commerce', 'Payments', 'payments_ecommerce',
    ['Date', 'Description', 'Amount', 'Fee', 'Net', 'Currency', 'Payment ID', 'Type'], PAYMENTS_COLS),
  src('mollie', 'Mollie', 'Global Payment Processors & E-Commerce', 'Payments', 'payments_ecommerce',
    ['Date', 'Description', 'Amount', 'Currency', 'id', 'Type'], PAYMENTS_COLS, { locale: 'eu' }),
  src('klarna', 'Klarna', 'Global Payment Processors & E-Commerce', 'Payments', 'payments_ecommerce',
    ['Date', 'Description', 'Amount', 'Currency', 'Order ID', 'Type'], PAYMENTS_COLS, { locale: 'eu' }),
  src('shopify-payouts', 'Shopify Payouts', 'Global Payment Processors & E-Commerce', 'E-Commerce', 'payments_ecommerce',
    ['Payout Date', 'Status', 'Total', 'Currency', 'Payout ID'], PAYMENTS_COLS, { searchAliases: ['shopify'] }),
  src('amazon-seller-central', 'Amazon Seller Central', 'Global Payment Processors & E-Commerce', 'E-Commerce', 'payments_ecommerce',
    ['settlement-start-date', 'settlement-id', 'total-amount', 'currency', 'transaction-type'], PAYMENTS_COLS, { searchAliases: ['amazon', 'amz'] }),
  src('etsy', 'Etsy', 'Global Payment Processors & E-Commerce', 'E-Commerce', 'payments_ecommerce',
    ['Date', 'Description', 'Amount', 'Fees', 'Net', 'Currency', 'Order ID'], PAYMENTS_COLS),
  src('ebay', 'eBay', 'Global Payment Processors & E-Commerce', 'E-Commerce', 'payments_ecommerce',
    ['Date', 'Description', 'Amount', 'Fee', 'Net', 'Currency', 'Transaction ID'], PAYMENTS_COLS),
  src('woocommerce', 'WooCommerce', 'Global Payment Processors & E-Commerce', 'E-Commerce', 'payments_ecommerce',
    ['Date', 'Description', 'Amount', 'Currency', 'Order ID', 'Customer Email', 'Type'], PAYMENTS_COLS, { searchAliases: ['woo'] }),
  src('gumroad', 'Gumroad', 'Global Payment Processors & E-Commerce', 'E-Commerce', 'payments_ecommerce',
    ['Date', 'Description', 'Amount', 'Fee', 'Net', 'Currency', 'Customer Email'], PAYMENTS_COLS),
  src('lemon-squeezy', 'Lemon Squeezy', 'Global Payment Processors & E-Commerce', 'E-Commerce', 'payments_ecommerce',
    ['Created (UTC)', 'Description', 'Amount', 'Fee', 'Net', 'Currency', 'Customer Email', 'id'], PAYMENTS_COLS, { searchAliases: ['lemonsqueezy', 'ls'] }),
  src('paddle', 'Paddle', 'Global Payment Processors & E-Commerce', 'E-Commerce', 'payments_ecommerce',
    ['Date', 'Description', 'Amount', 'Fee', 'Net', 'Currency', 'Customer Email', 'id'], PAYMENTS_COLS),
  src('braintree', 'Braintree', 'Global Payment Processors & E-Commerce', 'Payments', 'payments_ecommerce',
    ['Date', 'Description', 'Amount', 'Fee', 'Net', 'Currency', 'Transaction ID', 'Type'], PAYMENTS_COLS),

  // —— Ad Platforms, Forms & Lead Sources (10) ——
  src('meta-ads', 'Meta Ads', 'Ad Platforms, Forms & Lead Sources', 'Ads', 'ads_leads',
    ['Date', 'Campaign Name', 'Amount', 'Lead Source', 'First Name', 'Last Name', 'Email', 'Company'], LEADS_COLS, { searchAliases: ['facebook', 'fb ads', 'instagram'] }),
  src('google-ads', 'Google Ads', 'Ad Platforms, Forms & Lead Sources', 'Ads', 'ads_leads',
    ['Date', 'Campaign Name', 'Spend', 'Lead Source', 'First Name', 'Last Name', 'Email', 'Company'], LEADS_COLS, { searchAliases: ['adwords', 'gads'] }),
  src('linkedin-ads', 'LinkedIn Ads', 'Ad Platforms, Forms & Lead Sources', 'Ads', 'ads_leads',
    ['Date', 'Campaign Name', 'Spend', 'First Name', 'Last Name', 'Email', 'Company', 'Lead Source'], LEADS_COLS),
  src('tiktok-ads', 'TikTok Ads', 'Ad Platforms, Forms & Lead Sources', 'Ads', 'ads_leads',
    ['Date', 'Campaign Name', 'Spend', 'First Name', 'Last Name', 'Email', 'Lead Source'], LEADS_COLS),
  src('typeform', 'Typeform', 'Ad Platforms, Forms & Lead Sources', 'Forms', 'ads_leads',
    ['Submitted At', 'First Name', 'Last Name', 'Email', 'Company', 'Lead Source', 'Message'], LEADS_COLS),
  src('jotform', 'Jotform', 'Ad Platforms, Forms & Lead Sources', 'Forms', 'ads_leads',
    ['Submitted At', 'First Name', 'Last Name', 'Email', 'Company', 'Phone', 'Lead Source'], LEADS_COLS),
  src('calendly', 'Calendly', 'Ad Platforms, Forms & Lead Sources', 'Forms', 'ads_leads',
    ['Event Start Time', 'First Name', 'Last Name', 'Email', 'Event Name', 'Lead Source'], LEADS_COLS),
  src('webflow-forms', 'Webflow Forms', 'Ad Platforms, Forms & Lead Sources', 'Forms', 'ads_leads',
    ['Submitted At', 'First Name', 'Last Name', 'Email', 'Company', 'Message', 'Lead Source'], LEADS_COLS, { searchAliases: ['webflow'] }),
  src('gravity-forms', 'Gravity Forms', 'Ad Platforms, Forms & Lead Sources', 'Forms', 'ads_leads',
    ['Date', 'First Name', 'Last Name', 'Email', 'Company', 'Phone', 'Lead Source', 'Message'], LEADS_COLS, { searchAliases: ['gravity'] }),
  src('intercom', 'Intercom', 'Ad Platforms, Forms & Lead Sources', 'Leads', 'ads_leads',
    ['Created At', 'First Name', 'Last Name', 'Email', 'Company', 'Lead Source', 'Message'], LEADS_COLS),
];

/* -------------------------------------------------------------------------- */
/* Destination factories                                                      */
/* -------------------------------------------------------------------------- */

const ACC_TXN_COLS: DestinationColumn[] = [
  { header: 'Date', from: 'date' },
  { header: 'Description', from: 'description' },
  { header: 'Amount', from: 'amount' },
  { header: 'Payee', from: 'counterparty' },
  { header: 'Reference', from: 'reference' },
  { header: 'Category', from: 'category' },
];

const CRM_CONTACT_COLS: DestinationColumn[] = [
  { header: 'First Name', from: 'first_name' },
  { header: 'Last Name', from: 'last_name' },
  { header: 'Email', from: 'email' },
  { header: 'Company', from: 'company' },
  { header: 'Phone', from: 'phone' },
  { header: 'Lead Source', from: 'lead_source' },
  { header: 'Notes', from: 'description' },
  { header: 'Amount', from: 'amount' },
  { header: 'Date', from: 'date' },
];

function dest(
  id: string,
  label: string,
  group: DestGroup,
  badge: string,
  columns: DestinationColumn[],
  extras?: Partial<Pick<DestinationSchema, 'exportFormat' | 'delimiter' | 'numberFormat' | 'dateFormat' | 'searchAliases' | 'fileExtension'>>
): DestinationSchema {
  const isEu =
    group.startsWith('UK & EU') &&
    ['exact-online', 'moneybird', 'twinfield', 'afas', 'datev', 'lexoffice', 'sevdesk', 'pennylane', 'indy', 'holded', 'fortnox', 'bokio', 'visma-eaccounting'].includes(id);
  return {
    id,
    label,
    group,
    badge,
    columns,
    exportFormat: extras?.exportFormat ?? 'csv',
    delimiter: extras?.delimiter ?? ',',
    numberFormat: extras?.numberFormat ?? (isEu ? 'comma' : 'dot'),
    dateFormat:
      extras?.dateFormat ??
      (isEu
        ? id === 'datev' || id === 'lexoffice' || id === 'sevdesk'
          ? 'DD.MM.YYYY'
          : 'DD-MM-YYYY'
        : group.startsWith('UK')
          ? 'DD/MM/YYYY'
          : 'MM/DD/YYYY'),
    searchAliases: extras?.searchAliases,
    fileExtension: extras?.fileExtension,
  };
}

/* -------------------------------------------------------------------------- */
/* Destinations (62)                                                          */
/* -------------------------------------------------------------------------- */

export const DESTINATIONS: DestinationSchema[] = [
  // —— Global & US Accounting / Bookkeeping (15) ——
  dest('quickbooks-online-csv', 'QuickBooks Online CSV', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Description', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Payee', from: 'counterparty' },
      { header: 'Reference', from: 'reference' },
    ],
    { dateFormat: 'MM/DD/YYYY', numberFormat: 'dot', searchAliases: ['qb', 'qbo', 'quickbooks'] }),
  dest('quickbooks-desktop-iif', 'QuickBooks Desktop IIF', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    [
      { header: 'TRNSTYPE', from: null, value: 'GENERAL JOURNAL' },
      { header: 'DATE', from: 'date' },
      { header: 'ACCNT', from: null, value: 'Checking' },
      { header: 'NAME', from: 'counterparty' },
      { header: 'AMOUNT', from: 'amount' },
      { header: 'MEMO', from: 'description' },
      { header: 'DOCNUM', from: 'reference' },
    ],
    { exportFormat: 'iif', dateFormat: 'MM/DD/YYYY', numberFormat: 'dot', fileExtension: 'iif', searchAliases: ['qb', 'iif', 'quickbooks desktop', 'quickbooks-iif'] }),
  dest('xero-csv', 'Xero CSV', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Amount', from: 'amount' },
      { header: 'Payee', from: 'counterparty' },
      { header: 'Description', from: 'description' },
      { header: 'Reference', from: 'reference' },
      { header: 'Account Code', from: 'category' },
    ],
    { dateFormat: 'DD/MM/YYYY', numberFormat: 'dot', searchAliases: ['xero'] }),
  dest('wave-accounting', 'Wave Accounting', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Description', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Account', from: null, value: 'Business Checking' },
      { header: 'Category', from: 'category' },
    ],
    { dateFormat: 'MM/DD/YYYY', searchAliases: ['wave'] }),
  dest('freshbooks', 'FreshBooks', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    ACC_TXN_COLS, { dateFormat: 'YYYY-MM-DD', searchAliases: ['fresh'] }),
  dest('zoho-books', 'Zoho Books', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Description', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Contact Name', from: 'counterparty' },
      { header: 'Reference Number', from: 'reference' },
      { header: 'Account', from: 'category' },
    ],
    { dateFormat: 'YYYY-MM-DD', searchAliases: ['zoho'] }),
  dest('netsuite', 'NetSuite', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Memo', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'External ID', from: 'reference' },
      { header: 'Entity', from: 'counterparty' },
      { header: 'Currency', from: 'currency' },
    ],
    { dateFormat: 'MM/DD/YYYY' }),
  dest('sage-intacct', 'Sage Intacct', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    [
      { header: 'POSTINGDATE', from: 'date' },
      { header: 'DESCRIPTION', from: 'description' },
      { header: 'AMOUNT', from: 'amount' },
      { header: 'VENDORNAME', from: 'counterparty' },
      { header: 'DOCNUMBER', from: 'reference' },
    ],
    { dateFormat: 'MM/DD/YYYY', searchAliases: ['intacct'] }),
  dest('sage-50-us', 'Sage 50 US', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Description', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Account ID', from: 'category' },
      { header: 'Reference', from: 'reference' },
    ],
    { dateFormat: 'MM/DD/YYYY', searchAliases: ['sage 50', 'peachtree'] }),
  dest('gusto', 'Gusto', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Employee / Description', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Type', from: 'type' },
      { header: 'Reference', from: 'reference' },
    ],
    { dateFormat: 'YYYY-MM-DD' }),
  dest('rippling', 'Rippling', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Description', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Category', from: 'category' },
      { header: 'Reference', from: 'reference' },
    ],
    { dateFormat: 'YYYY-MM-DD' }),
  dest('expensify', 'Expensify', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Merchant', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Category', from: 'category' },
      { header: 'Comment', from: 'reference' },
    ],
    { dateFormat: 'YYYY-MM-DD' }),
  dest('ramp-accounting', 'Ramp Accounting', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Merchant', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Category', from: 'category' },
      { header: 'Cardholder', from: 'counterparty' },
    ],
    { dateFormat: 'YYYY-MM-DD', searchAliases: ['ramp'] }),
  dest('airbase', 'Airbase', 'Global & US Accounting / Bookkeeping', 'US Accounting',
    ACC_TXN_COLS, { dateFormat: 'YYYY-MM-DD' }),
  dest('clean-standard-csv', 'Clean Standard CSV', 'Global & US Accounting / Bookkeeping', 'Standard',
    [
      { header: 'date', from: 'date' },
      { header: 'description', from: 'description' },
      { header: 'amount', from: 'amount' },
      { header: 'currency', from: 'currency' },
      { header: 'counterparty', from: 'counterparty' },
      { header: 'category', from: 'category' },
      { header: 'reference', from: 'reference' },
      { header: 'type', from: 'type' },
      { header: 'first_name', from: 'first_name' },
      { header: 'last_name', from: 'last_name' },
      { header: 'email', from: 'email' },
      { header: 'company', from: 'company' },
    ],
    { dateFormat: 'YYYY-MM-DD', numberFormat: 'dot', searchAliases: ['clean', 'standard', 'generic'] }),

  // —— UK & EU Accounting / Tax Software (17) ——
  dest('sage-50-uk', 'Sage 50 UK', 'UK & EU Accounting / Tax Software', 'UK Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Type', from: 'type' },
      { header: 'Account Reference', from: 'reference' },
      { header: 'Nominal A/C Ref', from: 'category' },
      { header: 'Details', from: 'description' },
      { header: 'Net Amount', from: 'amount' },
      { header: 'Tax Amount', from: null, value: '0.00' },
    ],
    { dateFormat: 'DD/MM/YYYY', numberFormat: 'dot', searchAliases: ['sage uk'] }),
  dest('freeagent', 'FreeAgent', 'UK & EU Accounting / Tax Software', 'UK Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Amount', from: 'amount' },
      { header: 'Description', from: 'description' },
      { header: 'Category', from: 'category' },
    ],
    { dateFormat: 'DD/MM/YYYY', numberFormat: 'dot' }),
  dest('kashflow', 'KashFlow', 'UK & EU Accounting / Tax Software', 'UK Accounting',
    ACC_TXN_COLS, { dateFormat: 'DD/MM/YYYY', numberFormat: 'dot' }),
  dest('clear-books', 'Clear Books', 'UK & EU Accounting / Tax Software', 'UK Accounting',
    ACC_TXN_COLS, { dateFormat: 'DD/MM/YYYY', numberFormat: 'dot' }),
  dest('exact-online', 'Exact Online', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    [
      { header: 'EntryDate', from: 'date' },
      { header: 'Description', from: 'description' },
      { header: 'AmountFC', from: 'amount' },
      { header: 'Currency', from: 'currency' },
      { header: 'YourRef', from: 'reference' },
      { header: 'AccountName', from: 'counterparty' },
    ],
    { dateFormat: 'DD-MM-YYYY', numberFormat: 'comma', delimiter: ';', searchAliases: ['exact'] }),
  dest('moneybird', 'Moneybird', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    [
      { header: 'date', from: 'date' },
      { header: 'message', from: 'description' },
      { header: 'amount', from: 'amount' },
      { header: 'contact', from: 'counterparty' },
      { header: 'reference', from: 'reference' },
    ],
    { dateFormat: 'DD-MM-YYYY', numberFormat: 'comma', delimiter: ';' }),
  dest('twinfield', 'Twinfield', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Description', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Currency', from: 'currency' },
      { header: 'Reference', from: 'reference' },
    ],
    { dateFormat: 'DD-MM-YYYY', numberFormat: 'comma', delimiter: ';' }),
  dest('afas', 'AFAS', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    [
      { header: 'Boekstukdatum', from: 'date' },
      { header: 'Omschrijving', from: 'description' },
      { header: 'Bedrag', from: 'amount' },
      { header: 'Referentie', from: 'reference' },
    ],
    { dateFormat: 'DD-MM-YYYY', numberFormat: 'comma', delimiter: ';' }),
  dest('datev', 'DATEV', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    [
      { header: 'Umsatz (ohne Soll/Haben-Kz)', from: 'amount' },
      { header: 'Soll/Haben-Kennzeichen', from: 'type' },
      { header: 'WKZ Umsatz', from: 'currency' },
      { header: 'Belegdatum', from: 'date' },
      { header: 'Buchungstext', from: 'description' },
      { header: 'Belegfeld 1', from: 'reference' },
    ],
    { dateFormat: 'DD.MM.YYYY', numberFormat: 'comma', delimiter: ';', searchAliases: ['datev'] }),
  dest('lexoffice', 'Lexoffice', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    [
      { header: 'Datum', from: 'date' },
      { header: 'Beschreibung', from: 'description' },
      { header: 'Betrag', from: 'amount' },
      { header: 'Währung', from: 'currency' },
      { header: 'Belegnummer', from: 'reference' },
    ],
    { dateFormat: 'DD.MM.YYYY', numberFormat: 'comma', delimiter: ';' }),
  dest('sevdesk', 'SevDesk', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    [
      { header: 'Datum', from: 'date' },
      { header: 'Beschreibung', from: 'description' },
      { header: 'Betrag', from: 'amount' },
      { header: 'Währung', from: 'currency' },
      { header: 'Belegnummer', from: 'reference' },
    ],
    { dateFormat: 'DD.MM.YYYY', numberFormat: 'comma', delimiter: ';' }),
  dest('pennylane', 'Pennylane', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    [
      { header: 'date', from: 'date' },
      { header: 'label', from: 'description' },
      { header: 'amount', from: 'amount' },
      { header: 'currency', from: 'currency' },
      { header: 'reference', from: 'reference' },
      { header: 'thirdparty', from: 'counterparty' },
    ],
    { dateFormat: 'DD/MM/YYYY', numberFormat: 'comma', delimiter: ';' }),
  dest('indy', 'Indy', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Libellé', from: 'description' },
      { header: 'Montant', from: 'amount' },
      { header: 'Référence', from: 'reference' },
    ],
    { dateFormat: 'DD/MM/YYYY', numberFormat: 'comma', delimiter: ';' }),
  dest('holded', 'Holded', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    ACC_TXN_COLS, { dateFormat: 'DD/MM/YYYY', numberFormat: 'comma', delimiter: ';' }),
  dest('fortnox', 'Fortnox', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    [
      { header: 'Datum', from: 'date' },
      { header: 'Beskrivning', from: 'description' },
      { header: 'Belopp', from: 'amount' },
      { header: 'Referens', from: 'reference' },
    ],
    { dateFormat: 'YYYY-MM-DD', numberFormat: 'comma', delimiter: ';' }),
  dest('bokio', 'Bokio', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    [
      { header: 'Datum', from: 'date' },
      { header: 'Beskrivning', from: 'description' },
      { header: 'Belopp', from: 'amount' },
      { header: 'Referens', from: 'reference' },
    ],
    { dateFormat: 'YYYY-MM-DD', numberFormat: 'comma', delimiter: ';' }),
  dest('visma-eaccounting', 'Visma eAccounting', 'UK & EU Accounting / Tax Software', 'EU Accounting',
    [
      { header: 'Date', from: 'date' },
      { header: 'Description', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Currency', from: 'currency' },
      { header: 'Reference', from: 'reference' },
    ],
    { dateFormat: 'YYYY-MM-DD', numberFormat: 'comma', delimiter: ';', searchAliases: ['visma'] }),

  // —— CRMs & Marketing Automation (15) ——
  dest('hubspot-contacts-deals', 'HubSpot Contacts/Deals', 'CRMs & Marketing Automation', 'CRM',
    [
      { header: 'First Name', from: 'first_name' },
      { header: 'Last Name', from: 'last_name' },
      { header: 'Email', from: 'email' },
      { header: 'Company', from: 'company' },
      { header: 'Phone', from: 'phone' },
      { header: 'Lead Source', from: 'lead_source' },
      { header: 'Deal Name', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Close Date', from: 'date' },
    ],
    { dateFormat: 'YYYY-MM-DD', searchAliases: ['hubspot', 'hs', 'hubspot-csv'] }),
  dest('salesforce-leads', 'Salesforce Leads', 'CRMs & Marketing Automation', 'CRM',
    [
      { header: 'FirstName', from: 'first_name' },
      { header: 'LastName', from: 'last_name' },
      { header: 'Email', from: 'email' },
      { header: 'Company', from: 'company' },
      { header: 'Phone', from: 'phone' },
      { header: 'LeadSource', from: 'lead_source' },
      { header: 'Description', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'CloseDate', from: 'date' },
    ],
    { dateFormat: 'YYYY-MM-DD', searchAliases: ['salesforce', 'sfdc', 'sf', 'salesforce-csv'] }),
  dest('pipedrive', 'Pipedrive', 'CRMs & Marketing Automation', 'CRM', CRM_CONTACT_COLS, { searchAliases: ['pipedrive'] }),
  dest('zoho-crm', 'Zoho CRM', 'CRMs & Marketing Automation', 'CRM', CRM_CONTACT_COLS, { searchAliases: ['zoho'] }),
  dest('close-crm', 'Close CRM', 'CRMs & Marketing Automation', 'CRM', CRM_CONTACT_COLS, { searchAliases: ['close'] }),
  dest('monday-sales-crm', 'Monday Sales CRM', 'CRMs & Marketing Automation', 'CRM', CRM_CONTACT_COLS, { searchAliases: ['monday'] }),
  dest('attio', 'Attio', 'CRMs & Marketing Automation', 'CRM', CRM_CONTACT_COLS),
  dest('copper', 'Copper', 'CRMs & Marketing Automation', 'CRM', CRM_CONTACT_COLS),
  dest('activecampaign', 'ActiveCampaign', 'CRMs & Marketing Automation', 'CRM',
    [
      { header: 'Email', from: 'email' },
      { header: 'First Name', from: 'first_name' },
      { header: 'Last Name', from: 'last_name' },
      { header: 'Phone', from: 'phone' },
      { header: 'Organization', from: 'company' },
      { header: 'Tags', from: 'lead_source' },
    ],
    { searchAliases: ['ac'] }),
  dest('klaviyo', 'Klaviyo', 'CRMs & Marketing Automation', 'CRM',
    [
      { header: 'Email', from: 'email' },
      { header: 'First Name', from: 'first_name' },
      { header: 'Last Name', from: 'last_name' },
      { header: 'Phone Number', from: 'phone' },
      { header: 'Organization', from: 'company' },
      { header: 'Source', from: 'lead_source' },
    ]),
  dest('mailchimp', 'Mailchimp', 'CRMs & Marketing Automation', 'CRM',
    [
      { header: 'Email Address', from: 'email' },
      { header: 'First Name', from: 'first_name' },
      { header: 'Last Name', from: 'last_name' },
      { header: 'Phone', from: 'phone' },
      { header: 'Company', from: 'company' },
      { header: 'Tags', from: 'lead_source' },
    ]),
  dest('brevo', 'Brevo', 'CRMs & Marketing Automation', 'CRM',
    [
      { header: 'EMAIL', from: 'email' },
      { header: 'FIRSTNAME', from: 'first_name' },
      { header: 'LASTNAME', from: 'last_name' },
      { header: 'SMS', from: 'phone' },
      { header: 'COMPANY', from: 'company' },
    ],
    { searchAliases: ['sendinblue'] }),
  dest('convertkit', 'ConvertKit', 'CRMs & Marketing Automation', 'CRM',
    [
      { header: 'Email Address', from: 'email' },
      { header: 'First Name', from: 'first_name' },
      { header: 'Last Name', from: 'last_name' },
      { header: 'Tag', from: 'lead_source' },
    ],
    { searchAliases: ['kit'] }),
  dest('gohighlevel', 'GoHighLevel', 'CRMs & Marketing Automation', 'CRM', CRM_CONTACT_COLS, { searchAliases: ['ghl', 'highlevel'] }),
  dest('zendesk', 'Zendesk', 'CRMs & Marketing Automation', 'CRM',
    [
      { header: 'Name', from: 'description' },
      { header: 'Email', from: 'email' },
      { header: 'Phone', from: 'phone' },
      { header: 'Organization', from: 'company' },
      { header: 'Tags', from: 'lead_source' },
      { header: 'Notes', from: 'description' },
    ]),

  // —— BI, Databases & Developer Formats (15) ——
  dest('airtable-csv', 'Airtable CSV', 'BI, Databases & Developer Formats', 'BI',
    [
      { header: 'Date', from: 'date' },
      { header: 'Description', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Currency', from: 'currency' },
      { header: 'Counterparty', from: 'counterparty' },
      { header: 'Category', from: 'category' },
      { header: 'Reference', from: 'reference' },
      { header: 'Email', from: 'email' },
      { header: 'Company', from: 'company' },
    ],
    { dateFormat: 'YYYY-MM-DD', searchAliases: ['airtable'] }),
  dest('notion-database-csv', 'Notion Database CSV', 'BI, Databases & Developer Formats', 'BI',
    [
      { header: 'Name', from: 'description' },
      { header: 'Date', from: 'date' },
      { header: 'Amount', from: 'amount' },
      { header: 'Email', from: 'email' },
      { header: 'Company', from: 'company' },
      { header: 'Source', from: 'lead_source' },
      { header: 'Reference', from: 'reference' },
    ],
    { dateFormat: 'YYYY-MM-DD', searchAliases: ['notion'] }),
  dest('looker-studio', 'Looker Studio', 'BI, Databases & Developer Formats', 'BI',
    [
      { header: 'date', from: 'date' },
      { header: 'dimension', from: 'description' },
      { header: 'metric', from: 'amount' },
      { header: 'currency', from: 'currency' },
      { header: 'source', from: 'lead_source' },
    ],
    { dateFormat: 'YYYY-MM-DD', searchAliases: ['looker', 'data studio'] }),
  dest('power-bi', 'Power BI', 'BI, Databases & Developer Formats', 'BI',
    [
      { header: 'Date', from: 'date' },
      { header: 'Description', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Currency', from: 'currency' },
      { header: 'Category', from: 'category' },
    ],
    { dateFormat: 'YYYY-MM-DD', searchAliases: ['powerbi', 'pbi'] }),
  dest('tableau', 'Tableau', 'BI, Databases & Developer Formats', 'BI',
    [
      { header: 'Date', from: 'date' },
      { header: 'Description', from: 'description' },
      { header: 'Amount', from: 'amount' },
      { header: 'Currency', from: 'currency' },
      { header: 'Category', from: 'category' },
    ],
    { dateFormat: 'YYYY-MM-DD' }),
  dest('postgresql-copy-csv', 'PostgreSQL COPY CSV', 'BI, Databases & Developer Formats', 'Database',
    [
      { header: 'txn_date', from: 'date' },
      { header: 'description', from: 'description' },
      { header: 'amount', from: 'amount' },
      { header: 'currency', from: 'currency' },
      { header: 'reference', from: 'reference' },
      { header: 'email', from: 'email' },
      { header: 'company', from: 'company' },
    ],
    { dateFormat: 'YYYY-MM-DD', numberFormat: 'dot', searchAliases: ['postgres', 'pg', 'postgresql'] }),
  dest('mysql-import-csv', 'MySQL Import CSV', 'BI, Databases & Developer Formats', 'Database',
    [
      { header: 'txn_date', from: 'date' },
      { header: 'description', from: 'description' },
      { header: 'amount', from: 'amount' },
      { header: 'currency', from: 'currency' },
      { header: 'reference', from: 'reference' },
      { header: 'email', from: 'email' },
      { header: 'company', from: 'company' },
    ],
    { dateFormat: 'YYYY-MM-DD', numberFormat: 'dot', searchAliases: ['mysql'] }),
  dest('supabase-csv', 'Supabase CSV', 'BI, Databases & Developer Formats', 'Database',
    [
      { header: 'created_at', from: 'date' },
      { header: 'description', from: 'description' },
      { header: 'amount', from: 'amount' },
      { header: 'currency', from: 'currency' },
      { header: 'reference', from: 'reference' },
      { header: 'email', from: 'email' },
      { header: 'company', from: 'company' },
    ],
    { dateFormat: 'YYYY-MM-DD', searchAliases: ['supabase'] }),
  dest('firebase-json', 'Firebase JSON', 'BI, Databases & Developer Formats', 'Developer',
    [
      { header: 'date', from: 'date' },
      { header: 'description', from: 'description' },
      { header: 'amount', from: 'amount' },
      { header: 'currency', from: 'currency' },
      { header: 'reference', from: 'reference' },
      { header: 'email', from: 'email' },
      { header: 'company', from: 'company' },
      { header: 'first_name', from: 'first_name' },
      { header: 'last_name', from: 'last_name' },
    ],
    { exportFormat: 'json', dateFormat: 'YYYY-MM-DD', fileExtension: 'json', searchAliases: ['firebase', 'firestore'] }),
  dest('snowflake-csv', 'Snowflake CSV', 'BI, Databases & Developer Formats', 'Database',
    [
      { header: 'TXN_DATE', from: 'date' },
      { header: 'DESCRIPTION', from: 'description' },
      { header: 'AMOUNT', from: 'amount' },
      { header: 'CURRENCY', from: 'currency' },
      { header: 'REFERENCE', from: 'reference' },
    ],
    { dateFormat: 'YYYY-MM-DD', searchAliases: ['snowflake'] }),
  dest('bigquery-jsonl', 'BigQuery JSONL', 'BI, Databases & Developer Formats', 'Developer',
    [
      { header: 'date', from: 'date' },
      { header: 'description', from: 'description' },
      { header: 'amount', from: 'amount' },
      { header: 'currency', from: 'currency' },
      { header: 'reference', from: 'reference' },
      { header: 'email', from: 'email' },
      { header: 'company', from: 'company' },
    ],
    { exportFormat: 'jsonl', dateFormat: 'YYYY-MM-DD', fileExtension: 'jsonl', searchAliases: ['bq', 'bigquery', 'jsonl'] }),
  dest('ofx-format', 'OFX Format', 'BI, Databases & Developer Formats', 'Banking File',
    [
      { header: 'DTPOSTED', from: 'date' },
      { header: 'TRNAMT', from: 'amount' },
      { header: 'FITID', from: 'reference' },
      { header: 'NAME', from: 'description' },
      { header: 'MEMO', from: 'description' },
    ],
    { exportFormat: 'ofx', dateFormat: 'YYYYMMDD', numberFormat: 'dot', fileExtension: 'ofx', searchAliases: ['ofx'] }),
  dest('qif-format', 'QIF Format', 'BI, Databases & Developer Formats', 'Banking File',
    [
      { header: 'D', from: 'date' },
      { header: 'T', from: 'amount' },
      { header: 'P', from: 'description' },
      { header: 'N', from: 'reference' },
      { header: 'M', from: 'description' },
    ],
    { exportFormat: 'qif', dateFormat: 'MM/DD/YYYY', numberFormat: 'dot', fileExtension: 'qif', searchAliases: ['qif'] }),
  dest('qbo-web-connect', 'QBO Web Connect', 'BI, Databases & Developer Formats', 'Banking File',
    [
      { header: 'DTPOSTED', from: 'date' },
      { header: 'TRNAMT', from: 'amount' },
      { header: 'FITID', from: 'reference' },
      { header: 'NAME', from: 'description' },
      { header: 'MEMO', from: 'description' },
    ],
    { exportFormat: 'qbo', dateFormat: 'YYYYMMDD', numberFormat: 'dot', fileExtension: 'qbo', searchAliases: ['qbo', 'web connect'] }),
  dest('clean-utf8-pipe-txt', 'Clean UTF-8 Pipe TXT', 'BI, Databases & Developer Formats', 'Developer',
    [
      { header: 'date', from: 'date' },
      { header: 'description', from: 'description' },
      { header: 'amount', from: 'amount' },
      { header: 'currency', from: 'currency' },
      { header: 'counterparty', from: 'counterparty' },
      { header: 'reference', from: 'reference' },
      { header: 'email', from: 'email' },
      { header: 'company', from: 'company' },
    ],
    { exportFormat: 'txt', delimiter: '|', dateFormat: 'YYYY-MM-DD', numberFormat: 'dot', fileExtension: 'txt', searchAliases: ['pipe', 'txt', 'utf8'] }),
];

/* -------------------------------------------------------------------------- */
/* Lookups                                                                    */
/* -------------------------------------------------------------------------- */

export function getSourceById(id: string | null | undefined): SourceSchema | undefined {
  if (!id) return undefined;
  const needle = id.toLowerCase().trim();
  return (
    SOURCES.find((s) => s.id === needle) ||
    SOURCES.find((s) => s.searchAliases?.some((a) => a === needle)) ||
    SOURCES.find((s) => s.id.replace(/-/g, '') === needle.replace(/-/g, ''))
  );
}

export function getDestinationById(id: string | null | undefined): DestinationSchema | undefined {
  if (!id) return undefined;
  const needle = id.toLowerCase().trim();
  const exact =
    DESTINATIONS.find((d) => d.id === needle) ||
    DESTINATIONS.find((d) => d.searchAliases?.some((a) => a === needle));
  if (exact) return exact;

  const compact = needle.replace(/-/g, '');
  const byCompact = DESTINATIONS.find((d) => d.id.replace(/-/g, '') === compact);
  if (byCompact) return byCompact;

  // Prefer longest id that starts with / includes the needle (e.g. ?to=quickbooks)
  const partial = DESTINATIONS
    .filter((d) => d.id.startsWith(needle) || d.id.includes(needle) || d.searchAliases?.some((a) => a.includes(needle)))
    .sort((a, b) => a.id.length - b.id.length);
  return partial[0];
}

/* -------------------------------------------------------------------------- */
/* Normalization helpers                                                      */
/* -------------------------------------------------------------------------- */

export function detectDelimiter(text: string, preferred?: Delimiter): Delimiter {
  if (preferred) return preferred;
  const firstLine = text.split(/\r?\n/).find((l) => l.trim()) ?? '';
  const counts: { d: Delimiter; n: number }[] = [
    { d: ';', n: (firstLine.match(/;/g) || []).length },
    { d: '\t', n: (firstLine.match(/\t/g) || []).length },
    { d: '|', n: (firstLine.match(/\|/g) || []).length },
    { d: ',', n: (firstLine.match(/,/g) || []).length },
  ];
  counts.sort((a, b) => b.n - a.n);
  return counts[0].n > 0 ? counts[0].d : ',';
}

/** Normalize any regional amount into a clean JS number string with dot decimals */
export function normalizeAmount(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined || raw === '') return '';
  let s = String(raw).trim();
  if (!s) return '';

  s = s.replace(/[€$£¥\s]/g, '');

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma && hasDot) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma && !hasDot) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      s = parts[0].replace(/\./g, '') + '.' + parts[1];
    } else {
      s = s.replace(/,/g, '');
    }
  }

  const n = Number(s);
  if (Number.isNaN(n)) return String(raw).trim();
  return n.toFixed(2);
}

/** Format a normalized (dot-decimal) amount for a destination */
export function formatAmountForDestination(
  normalized: string,
  numberFormat: NumberFormat
): string {
  if (!normalized) return '';
  const n = Number(normalized);
  if (Number.isNaN(n)) return normalized;
  const fixed = n.toFixed(2);
  if (numberFormat === 'comma') {
    return fixed.replace('.', ',');
  }
  return fixed;
}

/** Parse many date formats into ISO YYYY-MM-DD */
export function normalizeDate(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined || raw === '') return '';
  const s = String(raw).trim();
  if (!s) return '';

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  if (/^\d{8}$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }

  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;

  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a > 12) {
      return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    if (b > 12) {
      return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
    }
    if (s.includes('-')) {
      return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return s;
}

/** Format ISO date for a destination schema */
export function formatDateForDestination(iso: string, dateFormat: DateFormat): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const [, y, mo, d] = m;
  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return `${mo}/${d}/${y}`;
    case 'DD/MM/YYYY':
      return `${d}/${mo}/${y}`;
    case 'DD-MM-YYYY':
      return `${d}-${mo}-${y}`;
    case 'DD.MM.YYYY':
      return `${d}.${mo}.${y}`;
    case 'YYYYMMDD':
      return `${y}${mo}${d}`;
    case 'YYYY-MM-DD':
    default:
      return `${y}-${mo}-${d}`;
  }
}

function findHeader(headers: string[], aliases: string[]): string | undefined {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const alias of aliases) {
    const idx = lower.indexOf(alias.toLowerCase().trim());
    if (idx !== -1) return headers[idx];
  }
  for (const alias of aliases) {
    const a = alias.toLowerCase();
    const idx = lower.findIndex((h) => h.includes(a) || a.includes(h));
    if (idx !== -1) return headers[idx];
  }
  return undefined;
}

export function mapRowToCanonical(
  row: Record<string, unknown>,
  source: SourceSchema
): CanonicalRow {
  const headers = Object.keys(row);
  const out: CanonicalRow = {};
  const usedFields = new Set<CanonicalField>();

  for (const col of source.columns) {
    if (usedFields.has(col.field) && out[col.field]) continue;
    const header = findHeader(headers, col.aliases);
    if (!header) continue;
    const raw = row[header];
    const str = raw === null || raw === undefined ? '' : String(raw).trim();
    if (!str) continue;

    let value = str;
    if (col.transform === 'amount') value = normalizeAmount(str);
    else if (col.transform === 'date') value = normalizeDate(str);

    out[col.field] = value;
    usedFields.add(col.field);
  }

  // Derive helpful defaults when source exports omit optional columns
  if (!out.description && (out.first_name || out.last_name)) {
    out.description = [out.first_name, out.last_name].filter(Boolean).join(' ');
  }
  if (!out.counterparty && out.email) {
    out.counterparty = out.email;
  }
  if (!out.lead_source && out.type) {
    out.lead_source = out.type;
  }
  if (!out.currency) {
    out.currency =
      source.locale === 'uk' ? 'GBP' : source.locale === 'eu' ? 'EUR' : 'USD';
  }
  // ING-style Af/Bij → type when amount sign is ambiguous downstream
  if (!out.type) {
    const afBijHeader = findHeader(headers, ['Af Bij', 'Debit/Credit']);
    if (afBijHeader) {
      const v = String(row[afBijHeader] ?? '').trim().toLowerCase();
      if (v === 'af' || v === 'debit') out.type = 'debit';
      else if (v === 'bij' || v === 'credit') out.type = 'credit';
    }
  }

  return out;
}

export function mapCanonicalToDestination(
  canonical: CanonicalRow,
  destination: DestinationSchema
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const col of destination.columns) {
    if (col.from === null) {
      out[col.header] = col.value ?? '';
      continue;
    }
    let value = canonical[col.from] ?? '';

    if (col.from === 'amount' || col.from === 'fee' || col.from === 'net') {
      value = formatAmountForDestination(value, destination.numberFormat);
    } else if (col.from === 'date') {
      value = formatDateForDestination(value, destination.dateFormat);
    }

    out[col.header] = value;
  }

  // DATEV: derive Soll/Haben from amount sign when type empty
  if (destination.id === 'datev') {
    const rawAmt = canonical.amount ?? '';
    const amt = Number(rawAmt);
    if (!out['Soll/Haben-Kennzeichen'] || !/^[SH]$/i.test(out['Soll/Haben-Kennzeichen'])) {
      out['Soll/Haben-Kennzeichen'] = !Number.isNaN(amt) && amt < 0 ? 'S' : 'H';
    }
    if (!Number.isNaN(amt)) {
      out['Umsatz (ohne Soll/Haben-Kz)'] = formatAmountForDestination(
        Math.abs(amt).toFixed(2),
        destination.numberFormat
      );
    }
    if (!out['WKZ Umsatz']) out['WKZ Umsatz'] = 'EUR';
  }

  // CRM fallback: if no first/last name, put description into Last Name / Name fields
  if (destination.group === 'CRMs & Marketing Automation') {
    if (!out['Last Name'] && !out['LastName'] && canonical.description) {
      if ('Last Name' in out) out['Last Name'] = canonical.description;
      if ('LastName' in out) out['LastName'] = canonical.description;
      if ('Name' in out && !out['Name']) out['Name'] = canonical.description;
    }
    if (!out['Company'] && !out['Organization'] && canonical.counterparty) {
      if ('Company' in out) out['Company'] = canonical.counterparty;
      if ('Organization' in out) out['Organization'] = canonical.counterparty;
      if ('AccountName' in out) out['AccountName'] = canonical.counterparty;
    }
    if (!out['Email'] && canonical.counterparty?.includes('@')) {
      if ('Email' in out) out['Email'] = canonical.counterparty;
      if ('Email Address' in out) out['Email Address'] = canonical.counterparty;
    }
  }

  return out;
}

export function convertRows(
  rows: Record<string, unknown>[],
  source: SourceSchema,
  destination: DestinationSchema
): Record<string, string>[] {
  return rows
    .filter((row) =>
      Object.values(row).some((v) => v !== null && v !== undefined && String(v).trim() !== '')
    )
    .map((row) => mapCanonicalToDestination(mapRowToCanonical(row, source), destination));
}

/* -------------------------------------------------------------------------- */
/* Export serializers                                                         */
/* -------------------------------------------------------------------------- */

function escapeDelimited(v: string, delimiter: string): string {
  if (new RegExp(`[${delimiter === '|' ? '\\|' : delimiter}"\\n\\r]`).test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function rowsToCsv(
  rows: Record<string, string>[],
  headers?: string[],
  delimiter: Delimiter = ','
): string {
  if (rows.length === 0) return '';
  const cols = headers ?? Object.keys(rows[0]);
  const lines = [
    cols.map((c) => escapeDelimited(c, delimiter)).join(delimiter),
    ...rows.map((r) => cols.map((c) => escapeDelimited(r[c] ?? '', delimiter)).join(delimiter)),
  ];
  return lines.join('\n');
}

export function rowsToJson(rows: Record<string, string>[]): string {
  return JSON.stringify(rows, null, 2);
}

export function rowsToJsonl(rows: Record<string, string>[]): string {
  return rows.map((r) => JSON.stringify(r)).join('\n');
}

export function rowsToIif(rows: Record<string, string>[]): string {
  const headers = ['TRNSTYPE', 'DATE', 'ACCNT', 'NAME', 'AMOUNT', 'MEMO', 'DOCNUM'];
  const lines = [
    '!TRNS\t' + headers.join('\t'),
    '!ENDTRNS',
    ...rows.map((r) => {
      const vals = headers.map((h) => (r[h] ?? '').replace(/\t/g, ' '));
      return 'TRNS\t' + vals.join('\t') + '\nENDTRNS';
    }),
  ];
  return lines.join('\n');
}

export function rowsToOfx(rows: Record<string, string>[], asQbo = false): string {
  const now = new Date();
  const dtserver = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
  const bankId = asQbo ? '123456789' : '000000000';
  const acctId = '000000000000';
  const txns = rows
    .map((r, i) => {
      const amt = r.TRNAMT || r.amount || '0.00';
      const dt = (r.DTPOSTED || '').replace(/-/g, '') || dtserver;
      const fitid = r.FITID || `RMF${dtserver}${i}`;
      const name = (r.NAME || r.MEMO || 'Transaction').slice(0, 32);
      const memo = r.MEMO || name;
      return `
    <STMTTRN>
      <TRNTYPE>${Number(amt) < 0 ? 'DEBIT' : 'CREDIT'}
      <DTPOSTED>${dt}
      <TRNAMT>${amt}
      <FITID>${fitid}
      <NAME>${name}
      <MEMO>${memo}
    </STMTTRN>`;
    })
    .join('');

  return `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
  <SIGNONMSGSRSV1>
    <SONRS>
      <STATUS><CODE>0<SEVERITY>INFO</STATUS>
      <DTSERVER>${dtserver}
      <LANGUAGE>ENG
    </SONRS>
  </SIGNONMSGSRSV1>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <TRNUID>1
      <STATUS><CODE>0<SEVERITY>INFO</STATUS>
      <STMTRS>
        <CURDEF>USD
        <BANKACCTFROM>
          <BANKID>${bankId}
          <ACCTID>${acctId}
          <ACCTTYPE>CHECKING
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>${dtserver}
          <DTEND>${dtserver}${txns}
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>
`;
}

export function rowsToQif(rows: Record<string, string>[]): string {
  const lines = ['!Type:Bank'];
  for (const r of rows) {
    if (r.D) lines.push(`D${r.D}`);
    if (r.T) lines.push(`T${r.T}`);
    if (r.P) lines.push(`P${r.P}`);
    if (r.N) lines.push(`N${r.N}`);
    if (r.M) lines.push(`M${r.M}`);
    lines.push('^');
  }
  return lines.join('\n');
}

export function serializeExport(
  rows: Record<string, string>[],
  destination: DestinationSchema
): { content: string; filename: string; mime: string } {
  const headers = destination.columns.map((c) => c.header);
  const stamp = new Date().toISOString().slice(0, 10);
  const ext =
    destination.fileExtension ??
    (destination.exportFormat === 'csv' ? 'csv' : destination.exportFormat);
  const base = `remap-${destination.id}-${stamp}.${ext}`;

  switch (destination.exportFormat) {
    case 'json':
      return { content: rowsToJson(rows), filename: base, mime: 'application/json' };
    case 'jsonl':
      return { content: rowsToJsonl(rows), filename: base, mime: 'application/x-ndjson' };
    case 'iif':
      return { content: rowsToIif(rows), filename: base, mime: 'text/plain' };
    case 'txt':
      return {
        content: rowsToCsv(rows, headers, destination.delimiter ?? '|'),
        filename: base,
        mime: 'text/plain',
      };
    case 'ofx':
      return { content: rowsToOfx(rows, false), filename: base, mime: 'application/x-ofx' };
    case 'qbo':
      return { content: rowsToOfx(rows, true), filename: base, mime: 'application/vnd.intu.qbo' };
    case 'qif':
      return { content: rowsToQif(rows), filename: base, mime: 'application/qif' };
    case 'csv':
    default:
      return {
        content: rowsToCsv(rows, headers, destination.delimiter ?? ','),
        filename: base,
        mime: 'text/csv;charset=utf-8;',
      };
  }
}

/** Back-compat helper used by older UI code */
export function getSampleRowsAsUnknown(source: SourceSchema): Record<string, unknown>[] {
  return getSampleRows(source) as Record<string, unknown>[];
}
