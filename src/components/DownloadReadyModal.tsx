import { Download, X } from 'lucide-react';

type DownloadReadyModalProps = {
  open: boolean;
  fileLabel: string;
  fromLabel: string;
  toLabel: string;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  onClose: () => void;
  onDownload: () => void;
};

export default function DownloadReadyModal({
  open,
  fileLabel,
  fromLabel,
  toLabel,
  headers,
  rows,
  totalRows,
  onClose,
  onDownload,
}: DownloadReadyModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-ready-title"
        className="relative flex max-h-[min(90vh,860px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="download-ready-title"
              className="font-display text-2xl tracking-tight text-slate-900 sm:text-3xl"
            >
              Conversion ready
            </h2>
            <p className="mt-1 truncate text-sm text-slate-500">
              <span className="font-medium text-slate-700">{fromLabel}</span>
              {' → '}
              <span className="font-medium text-slate-700">{toLabel}</span>
              {fileLabel ? ` · ${fileLabel}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4 sm:px-6">
          <p className="mb-3 text-xs font-medium text-slate-500">
            Showing {rows.length} of {totalRows} converted rows
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {headers.map((h) => (
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
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    {headers.map((h) => (
                      <td
                        key={h}
                        className="whitespace-nowrap px-3 py-2.5 text-slate-700"
                      >
                        {row[h] || <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onDownload}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            <Download className="h-4 w-4" />
            Download{fileLabel ? ` ${fileLabel}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
