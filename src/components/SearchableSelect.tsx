import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface SelectOption {
  id: string;
  label: string;
  group: string;
  badge?: string;
  searchAliases?: string[];
}

interface SearchableSelectProps {
  label: string;
  placeholder: string;
  value: string | null;
  options: SelectOption[];
  groups: string[];
  onChange: (id: string | null) => void;
  /** Return false to block opening (e.g. redirect to login). */
  onBeforeOpen?: () => boolean;
}

/** Fuzzy-friendly score: higher is better. Returns -1 if no match. */
function fuzzyScore(option: SelectOption, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;

  const label = option.label.toLowerCase();
  const id = option.id.toLowerCase();
  const group = option.group.toLowerCase();
  const badge = (option.badge ?? '').toLowerCase();
  const aliases = (option.searchAliases ?? []).map((a) => a.toLowerCase());
  const compactLabel = label.replace(/[^a-z0-9]/g, '');
  const compactId = id.replace(/-/g, '');
  const compactQ = q.replace(/[^a-z0-9]/g, '');

  if (label === q || id === q || aliases.includes(q)) return 100;
  if (aliases.some((a) => a === q)) return 95;
  if (id.startsWith(q) || compactId.startsWith(compactQ)) return 90;
  if (label.startsWith(q) || compactLabel.startsWith(compactQ)) return 85;

  // Acronym / initials: "qb" → QuickBooks, "ing" stays exact-ish via includes
  const words = label.split(/[^a-z0-9]+/).filter(Boolean);
  const initials = words.map((w) => w[0]).join('');
  if (initials.startsWith(q) || initials === q) return 80;
  if (words.some((w) => w.startsWith(q))) return 75;

  if (aliases.some((a) => a.includes(q) || q.includes(a))) return 70;
  if (label.includes(q) || compactLabel.includes(compactQ)) return 60;
  if (id.includes(q) || compactId.includes(compactQ)) return 55;
  if (badge.includes(q) || group.includes(q)) return 40;

  // Subsequence fuzzy: q chars appear in order inside label
  let li = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const idx = label.indexOf(q[qi], li);
    if (idx === -1) return -1;
    li = idx + 1;
  }
  return 20;
}

export default function SearchableSelect({
  label,
  placeholder,
  value,
  options,
  groups,
  onChange,
  onBeforeOpen,
}: SearchableSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => o.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options
      .map((o) => ({ o, score: fuzzyScore(o, q) }))
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.o);
  }, [options, query]);

  const grouped = useMemo(() => {
    const q = query.trim();
    // When searching, preserve score order within each group by filtering the already-sorted list
    if (q) {
      return groups
        .map((g) => ({
          group: g,
          items: filtered.filter((o) => o.group === g),
        }))
        .filter((g) => g.items.length > 0);
    }
    return groups
      .map((g) => ({
        group: g,
        items: filtered.filter((o) => o.group === g),
      }))
      .filter((g) => g.items.length > 0);
  }, [filtered, groups, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (open) {
            setOpen(false);
            setQuery('');
            return;
          }
          if (onBeforeOpen && !onBeforeOpen()) return;
          setOpen(true);
          setQuery('');
        }}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm shadow-sm transition hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      >
        <span className={`min-w-0 truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
          {selected ? (
            <span className="inline-flex max-w-full items-center gap-2">
              <span className="truncate">{selected.label}</span>
              {selected.badge && (
                <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  {selected.badge}
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-40 mt-1.5 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 rounded-t-lg border-b border-slate-100 bg-white px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search… (qb, ing, exact…)"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              aria-autocomplete="list"
              aria-controls={listId}
            />
          </div>
          <div
            id={listId}
            role="listbox"
            className="max-h-72 overflow-y-auto overscroll-contain rounded-b-lg"
          >
            {grouped.length === 0 && (
              <div className="px-3 py-2.5 text-sm text-slate-500">No matches</div>
            )}
            {grouped.map(({ group, items }) => (
              <div key={group} role="group" aria-label={group}>
                <div className="sticky top-0 z-10 bg-slate-50/95 px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 backdrop-blur-sm">
                  {group}
                </div>
                {items.map((item) => {
                  const isSelected = item.id === value;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(item.id);
                        setOpen(false);
                        setQuery('');
                      }}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition ${
                        isSelected
                          ? 'bg-teal-50 font-medium text-teal-800'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="min-w-0 truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                            isSelected
                              ? 'bg-teal-100/80 text-teal-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
