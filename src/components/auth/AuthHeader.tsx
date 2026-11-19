import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { CreditCard, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AuthHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [open, setOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const refreshPremium = async (userId: string) => {
    const { data } = await supabase
      .from('premium_users')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    setIsPremium(Boolean(data));
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      setReady(true);
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
      setReady(true);
      if (!session) {
        setIsPremium(false);
        return;
      }
      void refreshPremium(session.user.id);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        window.location.href = '/auth/login';
        return;
      }

      const res = await fetch('/api/create-billing-portal-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const payload = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !payload.url) {
        setPortalLoading(false);
        return;
      }
      window.location.href = payload.url;
    } catch {
      setPortalLoading(false);
    }
  };

  if (!ready) {
    return <div className="h-9 w-9 shrink-0" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <a
        href="/auth/login"
        className="shrink-0 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        Log in
      </a>
    );
  }

  const email = user.email ?? 'Account';
  const initial = (email.trim()[0] ?? 'U').toUpperCase();
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === 'string'
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata?.picture === 'string'
        ? user.user_metadata.picture
        : null;

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="border-b border-slate-100 px-3.5 py-3">
            <p className="truncate text-sm font-medium text-slate-900">{email}</p>
            {isPremium ? (
              <p className="mt-0.5 text-xs font-medium text-teal-700">Premium</p>
            ) : null}
          </div>

          {isPremium ? (
            <button
              type="button"
              role="menuitem"
              disabled={portalLoading}
              onClick={() => {
                void handleManageSubscription();
              }}
              className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
            >
              <CreditCard className="h-4 w-4 shrink-0 text-slate-400" />
              {portalLoading ? 'Opening…' : 'Manage subscription'}
            </button>
          ) : null}

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 border-t border-slate-100 px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4 shrink-0 text-slate-400" />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
