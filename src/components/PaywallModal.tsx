import { Check, Loader2, X } from 'lucide-react';

const FEATURES = [
  'Unlimited file conversions',
  'All bank, payment & CRM formats',
  'Files stay in your browser',
  'Clean CSV downloads ready for import',
  'Billed yearly — cancel anytime',
];

type PaywallModalProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onGetStarted: () => void;
};

export default function PaywallModal({
  open,
  loading,
  onClose,
  onGetStarted,
}: PaywallModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close paywall"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-sm font-medium text-teal-700">ReadyMyFile Premium</p>
        <h2
          id="paywall-title"
          className="mt-1 font-display text-3xl tracking-tight text-slate-900"
        >
          Unlock conversions
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Convert and download your files with a yearly plan.
        </p>

        <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
          $49
          <span className="ml-1 text-sm font-medium text-slate-500">/ year</span>
        </p>

        <ul className="mt-5 space-y-2.5">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={loading}
          onClick={onGetStarted}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening Stripe…
            </>
          ) : (
            'Get started'
          )}
        </button>
      </div>
    </div>
  );
}
