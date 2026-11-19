import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  ArrowLeftRight,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
} from 'lucide-react';
import PaywallModal from './PaywallModal';
import SearchableSelect from './SearchableSelect';
import { supabase } from '../lib/supabase';
import {
  DEST_GROUPS,
  DESTINATIONS,
  SOURCE_GROUPS,
  SOURCES,
  convertRows,
  detectDelimiter,
  getDestinationById,
  getSampleRows,
  getSourceById,
  serializeExport,
  type Delimiter,
  type DestinationSchema,
  type SourceSchema,
} from '../data/schemas';

type LoadedData = {
  rows: Record<string, unknown>[];
  fileName: string;
};

type ConverterDraft = {
  sourceId: string | null;
  destId: string | null;
  loaded: LoadedData | null;
};

const DRAFT_KEY = 'rmf-converter-draft';

function saveDraft(draft: ConverterDraft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadDraft(): ConverterDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConverterDraft;
  } catch {
    return null;
  }
}

function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

function parseDelimitedText(text: string, preferredDelimiter?: Delimiter): Record<string, unknown>[] {
  const delimiter = detectDelimiter(text, preferredDelimiter);

  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
    delimiter,
    dynamicTyping: false,
  });

  return result.data ?? [];
}

async function parseFile(
  file: File,
  preferredDelimiter?: Delimiter
): Promise<Record<string, unknown>[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
      raw: false,
    });
  }

  const text = await file.text();
  return parseDelimitedText(text, preferredDelimiter);
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function syncUrlParams(fromId: string | null, toId: string | null) {
  const params = new URLSearchParams(window.location.search);
  // Preserve unrelated params (e.g. checkout) except when syncing converter state
  if (params.has('checkout') || params.has('session_id')) return;

  if (fromId) params.set('from', fromId);
  else params.delete('from');
  if (toId) params.set('to', toId);
  else params.delete('to');

  const qs = params.toString();
  const next = qs ? `?${qs}` : window.location.pathname;
  window.history.replaceState({}, '', next);
}

export default function FileConverter() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [destId, setDestId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<LoadedData | null>(null);
  const [converted, setConverted] = useState<Record<string, string>[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const checkoutHandled = useRef(false);

  const source = useMemo(() => getSourceById(sourceId) ?? null, [sourceId]);
  const destination = useMemo(() => getDestinationById(destId) ?? null, [destId]);

  const refreshPremium = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('premium_users')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    setIsPremium(Boolean(data));
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser) {
        await refreshPremium(nextUser.id);
      } else {
        setIsPremium(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setAuthReady(true);
      if (!session) {
        setIsPremium(false);
        setSourceId(null);
        setDestId(null);
        setLoaded(null);
        setConverted(null);
        setPaywallOpen(false);
        return;
      }
      void refreshPremium(session.user.id);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshPremium]);

  // Restore draft + confirm Stripe checkout return
  useEffect(() => {
    if (!authReady || checkoutHandled.current) return;

    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    const sessionId = params.get('session_id');
    const from = params.get('from');
    const to = params.get('to');

    const restoreDraft = () => {
      const draft = loadDraft();
      if (!draft) return;
      if (draft.sourceId) setSourceId(draft.sourceId);
      if (draft.destId) setDestId(draft.destId);
      if (draft.loaded) setLoaded(draft.loaded);
      clearDraft();
    };

    if (checkout === 'success' && sessionId) {
      checkoutHandled.current = true;
      void (async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }

        const res = await fetch('/api/confirm-checkout', {
          method: 'POST',
          headers,
          body: JSON.stringify({ sessionId }),
        });
        const payload = (await res.json()) as {
          premium?: boolean;
          error?: string;
        };

        if (res.ok && payload.premium && session?.user) {
          setIsPremium(true);
          restoreDraft();
        }
        window.history.replaceState({}, '', '/');
      })();
      return;
    }

    if (checkout === 'cancel') {
      checkoutHandled.current = true;
      restoreDraft();
      window.history.replaceState({}, '', '/');
      return;
    }

    if (!user) return;

    if (from) {
      const s = getSourceById(from);
      if (s) setSourceId(s.id);
    }
    if (to) {
      const d = getDestinationById(to);
      if (d) setDestId(d.id);
    }
  }, [authReady, user]);

  // Keep ?from=&to= in sync when state changes from draft restore / URL hydrate
  useEffect(() => {
    if (!authReady || !user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.has('checkout') || params.has('session_id')) return;
    syncUrlParams(sourceId, destId);
  }, [authReady, user, sourceId, destId]);

  const requireAuth = useCallback(() => {
    if (!authReady) return false;
    if (user) return true;
    window.location.href = '/auth/login';
    return false;
  }, [authReady, user]);

  const canConvert = Boolean(source && destination && loaded && loaded.rows.length > 0);

  const clearResults = useCallback(() => {
    setConverted(null);
  }, []);

  const handleSourceChange = (id: string | null) => {
    if (!requireAuth()) return;
    setSourceId(id);
    setLoaded(null);
    clearResults();
    syncUrlParams(id, destId);
  };

  const handleDestChange = (id: string | null) => {
    if (!requireAuth()) return;
    setDestId(id);
    clearResults();
    syncUrlParams(sourceId, id);
  };

  const handleSwap = () => {
    if (!requireAuth()) return;
    const nextFrom = destId;
    const nextTo = sourceId;
    setSourceId(nextFrom);
    setDestId(nextTo);
    setLoaded(null);
    clearResults();
    syncUrlParams(nextFrom, nextTo);
  };

  const onFiles = async (files: FileList | File[] | null) => {
    if (!requireAuth()) return;
    if (!files || files.length === 0) return;
    const file = files[0];
    const allowed = /\.(csv|xlsx|xls|txt)$/i;
    if (!allowed.test(file.name)) return;
    setBusy(true);
    clearResults();
    try {
      const rows = await parseFile(file, source?.delimiter);
      if (!rows.length) {
        setLoaded(null);
        return;
      }
      setLoaded({ rows, fileName: file.name });
    } catch {
      setLoaded(null);
    } finally {
      setBusy(false);
    }
  };

  const runConvert = () => {
    if (!source || !destination || !loaded) return;
    if (!requireAuth()) return;

    if (!isPremium) {
      setPaywallOpen(true);
      return;
    }

    setBusy(true);
    try {
      const result = convertRows(loaded.rows, source, destination);
      if (!result.length) {
        setConverted(null);
        return;
      }
      setConverted(result);
    } catch {
      setConverted(null);
    } finally {
      setBusy(false);
    }
  };

  const startCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        window.location.href = '/auth/login';
        return;
      }

      saveDraft({ sourceId, destId, loaded });

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const payload = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !payload.url) {
        setCheckoutLoading(false);
        return;
      }
      window.location.href = payload.url;
    } catch {
      setCheckoutLoading(false);
    }
  };

  const handleDownload = () => {
    if (!converted || !destination || !source) return;
    const { content, filename, mime } = serializeExport(converted, destination);
    const stamped = filename.replace(
      `remap-${destination.id}`,
      `${source.id}-to-${destination.id}`
    );
    downloadBlob(stamped, content, mime);
  };

  const downloadLabel = useMemo(() => {
    if (!destination) return 'Download Converted File';
    const ext =
      destination.fileExtension ??
      (destination.exportFormat === 'csv' ? 'CSV' : destination.exportFormat.toUpperCase());
    return `Download Converted .${ext}`;
  }, [destination]);

  const previewRows = converted?.slice(0, 5) ?? [];
  const previewHeaders =
    destination?.columns.map((c) => c.header) ??
    (previewRows[0] ? Object.keys(previewRows[0]) : []);

  // Example result (updates with selected source/dest; defaults to Chase → QuickBooks)
  const example = useMemo(() => {
    const exampleSource = source ?? getSourceById('chase')!;
    const exampleDest = destination ?? getDestinationById('quickbooks-online-csv')!;
    const rows = convertRows(
      getSampleRows(exampleSource) as Record<string, unknown>[],
      exampleSource,
      exampleDest
    );
    return {
      source: exampleSource,
      destination: exampleDest,
      rows: rows.slice(0, 5),
      total: rows.length,
      headers: exampleDest.columns.map((c) => c.header),
      isDefault: !source || !destination,
    };
  }, [source, destination]);

  const showExample = !converted || converted.length === 0;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PaywallModal
        open={paywallOpen}
        loading={checkoutLoading}
        onClose={() => {
          if (checkoutLoading) return;
          setPaywallOpen(false);
        }}
        onGetStarted={() => {
          void startCheckout();
        }}
      />
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
        {/* Step 1 & 2 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <SearchableSelect
              label="Step 1 — Convert From (Source)"
              placeholder="Search banks, payments…"
              value={sourceId}
              options={SOURCES}
              groups={SOURCE_GROUPS}
              onChange={handleSourceChange}
              onBeforeOpen={requireAuth}
            />
          </div>

          <button
            type="button"
            onClick={handleSwap}
            title="Swap source and destination"
            aria-label="Swap source and destination"
            className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 sm:mb-0.5"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <SearchableSelect
              label="Step 2 — Convert To (Destination)"
              placeholder="Search accounting, CRM…"
              value={destId}
              options={DESTINATIONS}
              groups={DEST_GROUPS}
              onChange={handleDestChange}
              onBeforeOpen={requireAuth}
            />
          </div>
        </div>

        {/* Step 3 — Upload */}
        <div className="mt-6">
          <p className="mb-1.5 text-sm font-medium text-slate-700">
            Step 3 — Upload file
          </p>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!requireAuth()) return;
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!user) return;
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void onFiles(e.dataTransfer.files);
            }}
            onClick={() => {
              if (!requireAuth()) return;
              fileInputRef.current?.click();
            }}
            className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
              dragOver
                ? 'border-teal-400 bg-teal-50/60'
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => {
                void onFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              ) : (
                <Upload className="h-5 w-5 text-slate-500" />
              )}
            </div>
            <p className="text-sm font-medium text-slate-800">
              Drag & drop your export here, or click to browse
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Accepts .csv, .xlsx, .xls, and .txt — processed entirely in your browser
            </p>

            {loaded && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                <FileSpreadsheet className="h-3.5 w-3.5 text-teal-600" />
                {loaded.fileName}
                <span className="text-slate-400">·</span>
                {loaded.rows.length} rows
              </div>
            )}
          </div>
        </div>

        {/* Step 4 — Convert */}
        <div className="mt-6">
          <button
            type="button"
            disabled={!canConvert || busy}
            onClick={runConvert}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Converting…
              </>
            ) : (
              'Convert File'
            )}
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">
            Step 4 — Select source & destination, load a file, then convert
          </p>
        </div>
      </div>

      {/* Example result — shown until a real conversion runs */}
      {showExample && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/80 p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Example result
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                Preview only
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {example.isDefault ? (
                <>
                  Here&apos;s what a conversion looks like — e.g.{' '}
                  <span className="font-medium text-slate-700">
                    {example.source.label}
                  </span>
                  {' → '}
                  <span className="font-medium text-slate-700">
                    {example.destination.label}
                  </span>
                  .
                </>
              ) : (
                <>
                  Sample output for{' '}
                  <span className="font-medium text-slate-700">
                    {example.source.label}
                  </span>
                  {' → '}
                  <span className="font-medium text-slate-700">
                    {example.destination.label}
                  </span>
                  . Upload a file and convert to get your real data.
                </>
              )}
            </p>
          </div>

          <div className="mb-3">
            <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800 ring-1 ring-inset ring-teal-600/15">
              Showing {example.rows.length} of {example.total} example rows
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {example.headers.map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {example.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    {example.headers.map((h) => (
                      <td
                        key={h}
                        className="whitespace-nowrap px-3 py-2.5 text-slate-700"
                      >
                        {row[h] || (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live conversion preview */}
      {converted && converted.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Conversion preview
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800 ring-1 ring-inset ring-teal-600/15">
                  Showing {Math.min(5, converted.length)} of {converted.length}{' '}
                  converted rows
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
            >
              <Download className="h-4 w-4" />
              {downloadLabel}
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {previewHeaders.map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {previewRows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    {previewHeaders.map((h) => (
                      <td
                        key={h}
                        className="whitespace-nowrap px-3 py-2.5 text-slate-700"
                      >
                        {row[h] || (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Mapped from{' '}
            <span className="font-medium text-slate-600">{(source as SourceSchema).label}</span>
            {' → '}
            <span className="font-medium text-slate-600">
              {(destination as DestinationSchema).label}
            </span>
            . All processing stayed in your browser.
          </p>
        </div>
      )}
    </div>
  );
}
