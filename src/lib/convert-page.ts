import {
  DESTINATIONS,
  SOURCES,
  getDestinationById,
  getSourceById,
  type DestinationSchema,
  type SourceSchema,
} from '../data/schemas';

export type MappingRow = {
  sourceColumn: string;
  destinationColumn: string;
  rule: string;
};

export type ConvertFaq = {
  question: string;
  answer: string;
};

export type RelatedLink = {
  href: string;
  label: string;
};

export function convertPath(sourceId: string, destinationId: string) {
  return `/convert-${sourceId}-to-${destinationId}`;
}

function delimiterLabel(d?: string) {
  if (!d || d === ',') return 'Comma (,)';
  if (d === ';') return 'Semicolon (;)';
  if (d === '\t') return 'Tab';
  if (d === '|') return 'Pipe (|)';
  return d;
}

function decimalLabel(format: 'dot' | 'comma') {
  return format === 'comma' ? 'Comma (1.250,50)' : 'Dot (1,250.50)';
}

function findSourceHeader(source: SourceSchema, field: string | null): string {
  if (!field) return '— (static value)';
  const col = source.columns.find((c) => c.field === field);
  if (!col) return `Derived (${field})`;
  return col.aliases[0] ?? field;
}

function transformationRule(
  source: SourceSchema,
  destination: DestinationSchema,
  field: string | null
): string {
  if (!field) return 'Static / default value';
  if (field === 'date') {
    return `Normalize date → ${destination.dateFormat}`;
  }
  if (field === 'amount' || field === 'fee' || field === 'net') {
    const from =
      source.locale === 'eu' ? 'EU amount (comma decimals)' : 'Standard amount';
    return `${from} → ${decimalLabel(destination.numberFormat)}`;
  }
  if (field === 'description' || field === 'counterparty' || field === 'reference') {
    return 'Pass-through text';
  }
  return 'Mapped field';
}

export function buildMappingRows(
  source: SourceSchema,
  destination: DestinationSchema
): MappingRow[] {
  return destination.columns.map((col) => ({
    sourceColumn: findSourceHeader(source, col.from),
    destinationColumn: col.header,
    rule: transformationRule(source, destination, col.from),
  }));
}

export function buildValueProp(source: SourceSchema, destination: DestinationSchema) {
  return `Transform raw ${source.label} exports into clean, import-ready ${destination.label} files in seconds—100% locally in your browser.`;
}

export function buildTechSpecs(source: SourceSchema, destination: DestinationSchema) {
  return {
    inputDelimiter: delimiterLabel(source.delimiter),
    outputDelimiter: delimiterLabel(destination.delimiter),
    dateSchema: destination.dateFormat,
    decimalSeparator: decimalLabel(destination.numberFormat),
    fileTypes: '.csv, .xlsx, .xls, .txt',
  };
}

export function buildFaqs(source: SourceSchema, destination: DestinationSchema): ConvertFaq[] {
  const inDelim = delimiterLabel(source.delimiter);
  const outDelim = delimiterLabel(destination.delimiter);
  const decimals = decimalLabel(destination.numberFormat);

  return [
    {
      question: `Why does my ${destination.label} import reject the ${source.label} file?`,
      answer: `${destination.label} expects specific headers, date format (${destination.dateFormat}), and decimal style (${decimals}). ReadyMyFile remaps ${source.label} columns and reformats values before you download, so the import matches what ${destination.label} expects.`,
    },
    {
      question: `Do I need to change delimiters between ${source.label} and ${destination.label}?`,
      answer: `${source.label} exports often use ${inDelim}, while ${destination.label} typically expects ${outDelim}. The converter handles delimiter conversion automatically during remap.`,
    },
    {
      question: `Will dates and amounts from ${source.label} import correctly into ${destination.label}?`,
      answer: `Yes. Dates are normalized to ${destination.dateFormat}, and amounts are converted to ${decimals} so regional formats (like EU 1.250,50) do not break ${destination.label} imports.`,
    },
    {
      question: 'Does ReadyMyFile upload my bank or payment data to a server?',
      answer:
        'No. Conversion runs entirely in your browser. Your export file never leaves your device during remap and download.',
    },
  ];
}

export function buildHowToSteps(source: SourceSchema, destination: DestinationSchema) {
  return [
    {
      title: `Export from ${source.label}`,
      body: `Download your transactions or payouts from ${source.label} as CSV/XLSX. Keep the original headers—ReadyMyFile recognizes common ${source.label} column names.`,
    },
    {
      title: 'Remap in ReadyMyFile',
      body: `Confirm Source is ${source.label} and Destination is ${destination.label}, drop your file, then convert. Preview the mapped rows before downloading.`,
    },
    {
      title: `Import into ${destination.label}`,
      body: `Open ${destination.label}'s bank/transaction import tool and upload the converted file. Columns and formats are already aligned to reduce import errors.`,
    },
  ];
}

const POPULAR_DEST_IDS = [
  'quickbooks-online-csv',
  'xero-csv',
  'exact-online',
  'wave-accounting',
  'freshbooks',
  'moneybird',
  'netsuite',
  'zoho-books',
];

const POPULAR_SOURCE_IDS = [
  'chase',
  'bank-of-america',
  'stripe',
  'paypal',
  'ing',
  'barclays',
  'square',
  'revolut-uk',
];

export function buildRelatedLinks(
  source: SourceSchema,
  destination: DestinationSchema
): { forSource: RelatedLink[]; forDestination: RelatedLink[] } {
  const forSource = POPULAR_DEST_IDS
    .filter((id) => id !== destination.id)
    .slice(0, 4)
    .map((id) => {
      const d = getDestinationById(id)!;
      return {
        href: convertPath(source.id, d.id),
        label: `${source.label} → ${d.label}`,
      };
    });

  const forDestination = POPULAR_SOURCE_IDS
    .filter((id) => id !== source.id)
    .slice(0, 4)
    .map((id) => {
      const s = getSourceById(id)!;
      return {
        href: convertPath(s.id, destination.id),
        label: `${s.label} → ${destination.label}`,
      };
    });

  return { forSource, forDestination };
}

export function resolvePair(sourceId: string, destinationId: string) {
  const source = getSourceById(sourceId);
  const destination = getDestinationById(destinationId);
  if (!source || !destination) return null;
  return { source, destination };
}

export function assertKnownSchemas() {
  // Keep tree-shaking friendly references for static analysis / future full matrix
  return { sourceCount: SOURCES.length, destinationCount: DESTINATIONS.length };
}
